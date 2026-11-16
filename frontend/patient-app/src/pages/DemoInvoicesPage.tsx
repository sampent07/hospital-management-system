import { useCallback, useEffect, useState } from 'react';
import { ArrowRight, FileText, RotateCw } from 'lucide-react';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { patientApi } from '../services/api';
import type { PatientPackageRegistration } from '../types/api';
import { vi } from '../i18n/vi';
import type { PatientPage } from '../types/navigation';
import { formatFacilityDateTime } from '../utils/facilityTime';

export function DemoInvoicesPage({ token, facilityTimezone, onNavigate }: {
  token: string; facilityTimezone: string; onNavigate: (page: PatientPage) => void;
}) {
  const [registrations, setRegistrations] = useState<PatientPackageRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try { setRegistrations(await patientApi.registrations(token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { setLoading(true); void load(); }, [load]);
  const invoices = registrations.filter((registration) => registration.status === 'PAID');

  return (
    <section className="space-y-5">
      <header><p className="section-eyebrow">{vi.demo}</p><h1 className="page-heading mt-1">{vi.menuInvoices}</h1><p className="page-subtitle mt-1">{vi.demoInvoicesDescription}</p></header>
      <div role="note" className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">{vi.demoInvoiceDisclaimer}</div>
      {error && (registrations.length === 0 ? <ErrorState message={error} onRetry={() => { setLoading(true); void load(); }} /> : <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>)}
      <div className="flex items-center justify-between"><h2 className="text-base font-extrabold text-slate-900">{vi.demoInvoiceList}</h2><button onClick={() => { setLoading(true); void load(); }} aria-label={vi.refresh} className="icon-button"><RotateCw size={16} /></button></div>
      {loading ? <LoadingState /> : invoices.length === 0 ? <div className="space-y-3"><EmptyState message={vi.demoNoInvoices} /><button onClick={() => onNavigate('hospitalFees')} className="secondary-button w-full">{vi.menuHospitalFees}<ArrowRight size={16} /></button></div> : <div className="space-y-3">{invoices.map((registration) => <article key={registration.id} className="surface-card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-200 bg-slate-50/70 p-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700"><FileText size={20} /></span><div><p className="text-xs font-semibold text-slate-500">{vi.demoInvoiceNumber}</p><p className="font-mono text-sm font-extrabold text-slate-900">HD-DEMO-{registration.id.slice(0, 8).toUpperCase()}</p></div></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">{vi.paid}</span></div>
        <div className="space-y-3 p-4"><div><p className="text-xs text-slate-500">{vi.demoInvoiceItem}</p><p className="mt-1 font-bold text-slate-900">{registration.package_name}</p></div><div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm"><span className="text-slate-500">{vi.demoInvoiceTotal}</span><strong className="text-lg text-slate-900">{Number(registration.price_snapshot).toLocaleString('vi-VN')} VNĐ</strong></div><p className="text-xs text-slate-500">{vi.demoInvoicePaidAt}: {registration.paid_at ? formatFacilityDateTime(registration.paid_at, facilityTimezone) : vi.paid}</p></div>
      </article>)}</div>}
    </section>
  );
}
