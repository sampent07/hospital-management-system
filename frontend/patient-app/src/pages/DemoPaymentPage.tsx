import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, CreditCard, RotateCw } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { patientApi } from '../services/api';
import type { PatientPackageRegistration } from '../types/api';
import { vi } from '../i18n/vi';
import type { PatientPage } from '../types/navigation';
import { formatFacilityDateTime } from '../utils/facilityTime';

export function DemoPaymentPage({ token, facilityTimezone, onNavigate }: {
  token: string; facilityTimezone: string; onNavigate: (page: PatientPage) => void;
}) {
  const [registrations, setRegistrations] = useState<PatientPackageRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setRegistrations(await patientApi.registrations(token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { setLoading(true); void load(); }, [load]);

  async function pay(registrationId: string) {
    setBusyId(registrationId);
    setError(null);
    setNotice(null);
    try {
      await patientApi.payDemo(token, registrationId);
      setNotice(vi.demoPaymentSuccess);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusyId(null); }
  }

  const payable = registrations.filter((registration) => registration.status === 'APPROVED');
  const paid = registrations.filter((registration) => registration.status === 'PAID');

  return (
    <section className="space-y-5">
      <header><p className="section-eyebrow">{vi.demo}</p><h1 className="page-heading mt-1">{vi.menuHospitalFees}</h1><p className="page-subtitle mt-1">{vi.demoPaymentDescription}</p></header>
      <div role="note" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{vi.demoPaymentDisclaimer}</div>
      {error && (registrations.length === 0 ? <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} /> : <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>)}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      <div className="flex items-center justify-between"><h2 className="text-base font-extrabold text-slate-900">{vi.demoPaymentDue}</h2><button onClick={() => { setLoading(true); void load(); }} aria-label={vi.refresh} className="icon-button"><RotateCw size={16} /></button></div>
      {loading ? <LoadingState /> : payable.length === 0 ? <div className="space-y-3"><EmptyState message={vi.demoNoPaymentDue} /><button onClick={() => onNavigate('packages')} className="secondary-button w-full">{vi.openPackages}<ArrowRight size={16} /></button></div> : <div className="space-y-3">{payable.map((registration) => <article key={registration.id} className="surface-card p-4">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-extrabold text-slate-900">{registration.package_name}</h3><p className="mt-1 text-xs text-slate-500">{vi.demoRegistrationId}: {registration.id.slice(0, 8).toUpperCase()}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{vi.approved}</span></div>
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-3"><span className="text-sm text-slate-500">{vi.priceSnapshot}</span><strong className="text-lg text-slate-900">{Number(registration.price_snapshot).toLocaleString('vi-VN')} VNĐ</strong></div>
        <button onClick={() => void pay(registration.id)} disabled={busyId !== null} className="primary-button mt-4 w-full"><CreditCard size={17} />{busyId === registration.id ? vi.loading : vi.demoPayNow}</button>
      </article>)}</div>}
      {!loading && paid.length > 0 && <section className="surface-card p-4"><div className="flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-slate-900">{vi.demoPaidTitle}</h2><p className="mt-1 text-xs text-slate-500">{paid.length} {vi.demoPaidCount}</p></div><button onClick={() => onNavigate('invoices')} className="inline-flex items-center gap-1 text-sm font-bold text-blue-700">{vi.menuInvoices}<ArrowRight size={15} /></button></div></section>}
      {paid.map((registration) => <article key={registration.id} className="surface-card p-4">
        <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-900">{registration.package_name}</h3><p className="mt-1 text-xs text-slate-500">{registration.paid_at ? formatFacilityDateTime(registration.paid_at, facilityTimezone) : vi.paid}</p></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{vi.paid}</span></div>
        <p className="mt-3 text-right text-lg font-black text-slate-900">{Number(registration.price_snapshot).toLocaleString('vi-VN')} VNĐ</p>
      </article>)}
    </section>
  );
}
