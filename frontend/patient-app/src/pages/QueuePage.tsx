import { useCallback, useEffect, useState } from 'react';
import { Clock3, RotateCw, Users } from 'lucide-react';
import { patientApi } from '../services/api';
import type { PatientQueueSummary } from '../types/api';
import { vi } from '../i18n/vi';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { PageTitle } from './ProfilePage';
import { formatDurationMinutes } from '../utils/formatTime';
import { usePatientWebSocket } from '../hooks/usePatientWebSocket';

export function QueuePage({ token, visitId }: { token: string; visitId: string | null }) {
  const [queues, setQueues] = useState<PatientQueueSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setQueues(await patientApi.queues(token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { setLoading(true); void load(); }, [load]);
  const { isConnected } = usePatientWebSocket(token, visitId, load);

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-3"><PageTitle title={vi.queues} subtitle={vi.queueSubtitle} /><span className={`mt-1 shrink-0 rounded-full px-3 py-1 text-[11px] font-bold ${isConnected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>{isConnected ? vi.connected : vi.disconnected}</span></div>
      {error && (queues.length === 0 ? <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} /> : <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>)}
      <button onClick={() => { setLoading(true); void load(); }} aria-label={vi.refresh} className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"><RotateCw size={15} />{vi.refresh}</button>
      {loading ? <LoadingState /> : queues.length === 0 ? <EmptyState /> : <div className="space-y-3">
        {queues.map((queue) => <article key={queue.service_point_id} className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="min-w-0"><h3 className="font-bold text-slate-900">{queue.service_point_name}</h3><p className="mt-1 text-xs text-slate-500">{queue.room_number ?? queue.service_point_code}</p><p className="mt-2 text-xs text-slate-500">{queue.in_progress_count} {vi.inProgress.toLowerCase()}</p></div>
          <div className="shrink-0 text-right"><p className="flex items-center justify-end gap-1 text-sm font-extrabold text-slate-900"><Users size={15} />{queue.waiting_count} {vi.waiting}</p><p className="mt-1 flex items-center justify-end gap-1 text-xs text-slate-600"><Clock3 size={14} />{vi.estimated}: {formatDurationMinutes(queue.estimated_wait_seconds)}</p>{queue.is_full && <span className="mt-2 inline-block rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-900">{vi.queueFull}</span>}</div>
        </article>)}
      </div>}
    </section>
  );
}
