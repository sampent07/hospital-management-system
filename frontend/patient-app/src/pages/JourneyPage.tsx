import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, MapPin, RotateCw } from 'lucide-react';
import { ApiError, patientApi } from '../services/api';
import type { PatientRoute, PatientVisit, VisitProgress } from '../types/api';
import { vi } from '../i18n/vi';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { PageTitle } from './ProfilePage';
import { formatDurationMinutes } from '../utils/formatTime';
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';
import { formatFacilityDateTime } from '../utils/facilityTime';

export function JourneyPage({ token, facilityTimezone, selectedVisitId, onSelectVisit }: {
  token: string; facilityTimezone: string; selectedVisitId: string | null; onSelectVisit: (visitId: string) => void;
}) {
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [route, setRoute] = useState<PatientRoute | null>(null);
  const [proposedRoute, setProposedRoute] = useState<PatientRoute | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadVisits = useCallback(async () => {
    const result = await patientApi.visits(token);
    setVisits(result);
    const current = result.find((visit) => visit.id === selectedVisitId) ?? result[0];
    if (current && current.id !== selectedVisitId) onSelectVisit(current.id);
    return current?.id ?? null;
  }, [onSelectVisit, selectedVisitId, token]);

  const load = useCallback(async () => {
    setError(null);
    try {
      const visitId = await loadVisits();
      if (!visitId) { setRoute(null); setProposedRoute(null); return; }
      try {
        setRoute(await patientApi.route(token, visitId));
      } catch (reason) {
        if (reason instanceof ApiError && reason.status === 404) setRoute(await patientApi.startRoute(token, visitId));
        else throw reason;
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : vi.networkIssue);
    } finally { setLoading(false); }
  }, [loadVisits, token]);

  useEffect(() => { setLoading(true); void load(); }, [load]);
  const selectedVisit = visits.find((visit) => visit.id === selectedVisitId) ?? visits[0] ?? null;
  const refreshRealtime = useCallback(() => { void load(); }, [load]);
  const { isConnected } = usePatientWebSocket(token, selectedVisit?.id ?? null, refreshRealtime);

  async function recalculate() {
    if (!selectedVisit) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const result = await patientApi.recalculateRoute(token, selectedVisit.id);
      if (result.is_better && result.id !== route?.id) setProposedRoute(result);
      else setNotice(result.message ?? vi.routeRecalculated);
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusy(false); }
  }

  async function decide(decision: 'ACCEPTED_NEW' | 'KEPT_EXISTING') {
    if (!proposedRoute) return;
    setBusy(true);
    setError(null);
    try {
      await patientApi.decideRoute(token, proposedRoute.id, decision);
      setProposedRoute(null);
      setNotice(decision === 'ACCEPTED_NEW' ? vi.routeAccepted : vi.routeKept);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusy(false); }
  }

  if (loading) return <LoadingState />;
  if (error && visits.length === 0) return <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} />;
  if (visits.length === 0) return <EmptyState message={vi.noVisits} />;

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3"><PageTitle title={vi.progress} subtitle={vi.routeSubtitle} /><span className={`mt-1 shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{isConnected ? vi.connected : vi.disconnected}</span></div>
      {visits.length > 1 && <label className="block text-sm font-semibold text-slate-700">{vi.selectVisit}<select value={selectedVisit?.id ?? ''} onChange={(event) => onSelectVisit(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-3">{visits.map((visit) => <option key={visit.id} value={visit.id}>{visit.visit_code} · {formatFacilityDateTime(visit.check_in_at, facilityTimezone)}</option>)}</select></label>}
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{notice}</p>}

      <div className="home-hero">
        <div className="flex items-center justify-between"><span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold">{selectedVisit?.visit_code}</span><span className="text-xs">{vi.queueNumber} #{selectedVisit?.queue_number}</span></div>
        <p className="mt-4 text-sm text-blue-100">{vi.estimatedTotal}</p><p className="text-3xl font-black">{route ? formatDurationMinutes(route.estimated_total_duration_seconds) : '—'}</p>
        {route && <p className="mt-1 text-xs text-blue-100">{vi.routeSource}: {route.suggestion_source === 'AI_RL' ? vi.aiSuggestion : vi.fallbackSuggestion} · {vi.estimated}</p>}
      </div>

      {route && <button onClick={() => void recalculate()} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-bold text-blue-800 disabled:opacity-60"><RotateCw size={17} className={busy ? 'animate-spin' : ''} />{busy ? vi.loading : vi.recalculate}</button>}
      {proposedRoute && <section className="rounded-3xl border-2 border-blue-300 bg-blue-50 p-4"><h3 className="font-extrabold text-blue-950">{vi.routeSuggestion}</h3><p className="mt-1 text-sm text-blue-900">{vi.estimated}: {formatDurationMinutes(proposedRoute.estimated_total_duration_seconds)}</p><div className="mt-3 grid grid-cols-2 gap-2"><button disabled={busy} onClick={() => void decide('ACCEPTED_NEW')} className="rounded-xl bg-blue-700 px-3 py-3 text-sm font-bold text-white">{vi.acceptRoute}</button><button disabled={busy} onClick={() => void decide('KEPT_EXISTING')} className="rounded-xl border border-blue-300 bg-white px-3 py-3 text-sm font-bold text-blue-900">{vi.keepRoute}</button></div></section>}

      <section className="surface-card p-5"><h3 className="mb-4 font-extrabold text-slate-900">{vi.allServices}</h3><div className="space-y-3">{selectedVisit?.progress_items.map((item) => <ProgressCard key={item.id} item={item} />)}</div></section>
      {route && route.steps.length > 0 && <section className="surface-card p-5"><h3 className="mb-4 font-extrabold text-slate-900">{vi.suggestedOrder}</h3><ol className="space-y-3">{route.steps.map((step) => <li key={step.id} className="flex gap-3 rounded-2xl bg-slate-50 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-800">{step.step_order}</span><div className="min-w-0"><p className="font-bold text-slate-900">{step.service_name}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-600"><MapPin size={13} />{step.service_point_name} · {step.room_number}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 size={13} />{vi.estimatedWait}: {formatDurationMinutes(step.estimated_wait_seconds)}</p></div></li>)}</ol></section>}
    </section>
  );
}

function ProgressCard({ item }: { item: VisitProgress }) {
  const labels: Record<VisitProgress['status'], string> = { NOT_STARTED: vi.notStarted, WAITING: vi.waitingStatus, IN_PROGRESS: vi.inProgressStatus, COMPLETED: vi.completed };
  const isDone = item.status === 'COMPLETED';
  return <div className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3"><span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-800'}`}>{isDone ? <CheckCircle2 size={17} /> : <Clock3 size={16} />}</span><div><p className="font-bold text-slate-900">{item.service_name ?? vi.serviceNameFallback}</p><p className="mt-1 text-xs text-slate-600">{item.service_point_name ?? vi.servicePointFallback}</p><span className="mt-2 inline-block rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">{labels[item.status]}</span></div></div>;
}
