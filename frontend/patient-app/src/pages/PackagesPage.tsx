import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, PackageCheck, RotateCw, X } from 'lucide-react';
import { patientApi } from '../services/api';
import type { PackageSummary, PatientPackageRegistration } from '../types/api';
import { vi } from '../i18n/vi';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { PageTitle } from './ProfilePage';
import { formatFacilityDateTime } from '../utils/facilityTime';

export function PackagesPage({ token, facilityTimezone, onNavigate }: { token: string; facilityTimezone: string; onNavigate: (page: 'appointments') => void }) {
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [registrations, setRegistrations] = useState<PatientPackageRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<PackageSummary | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [packageItems, registrationItems] = await Promise.all([
        patientApi.packages(), patientApi.registrations(token),
      ]);
      setPackages(packageItems.filter((item) => item.package_type === 'INDIVIDUAL'));
      setRegistrations(registrationItems);
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [token]);

  async function register(packageId: string) {
    setBusyId(packageId);
    setError(null);
    setNotice(null);
    try {
      await patientApi.registerPackage(token, packageId);
      setNotice(vi.pendingApproval);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusyId(null); }
  }

  async function pay(registrationId: string) {
    setBusyId(registrationId);
    setError(null);
    setNotice(null);
    try {
      await patientApi.payDemo(token, registrationId);
      setNotice(vi.paid);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusyId(null); }
  }

  return (
    <section className="space-y-5">
      <PageTitle title={vi.packageCatalog} subtitle={vi.packageDescription} />
      <div role="note" className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{vi.packageWarning}</div>
      <p className="rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">{vi.coordinatorApprovalNote}</p>
      {error && (packages.length === 0 && registrations.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>)}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {loading ? <LoadingState /> : packages.length === 0 ? <EmptyState message={vi.noPackages} /> : (
        <div className="grid gap-3 lg:grid-cols-2">
          {packages.map((item) => (
            <article key={item.id} className={`surface-card p-5 transition ${selectedPackage?.id === item.id ? 'border-blue-400 ring-2 ring-blue-100' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div><span className="text-xs font-bold uppercase tracking-wide text-blue-700">{item.tier_name ?? item.code}</span><h3 className="mt-1 text-lg font-extrabold text-slate-900">{item.name}</h3></div>
                <PackageCheck className="shrink-0 text-blue-600" />
              </div>
              <p className="mt-2 text-sm text-slate-600">{item.description ?? item.target_group}</p>
              <p className="mt-4 text-xl font-black text-slate-900">{item.base_price.toLocaleString('vi-VN')} <span className="text-sm font-semibold">VNĐ</span></p>
              <details className="mt-4 rounded-xl bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">{vi.packageServices} ({item.services.length})</summary>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">{item.services.map((service) => <li key={service.id}>• {service.name} · {service.service_point_name}</li>)}</ul>
              </details>
              <button onClick={() => setSelectedPackage(item)} disabled={busyId !== null} className="secondary-button mt-4 w-full"><CheckCircle2 size={17} />{vi.packageDetails}</button>
            </article>
          ))}
        </div>
      )}

      {selectedPackage && <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="package-confirm-title">
        <section className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
          <div className="flex items-start justify-between gap-3"><div><p className="section-eyebrow">{vi.packageDetails}</p><h3 id="package-confirm-title" className="mt-1 text-xl font-extrabold text-slate-900">{selectedPackage.name}</h3></div><button onClick={() => setSelectedPackage(null)} className="icon-button" aria-label={vi.close}><X size={17} /></button></div>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">{selectedPackage.description ?? selectedPackage.target_group}</p>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4"><p className="text-xs font-semibold text-slate-500">{vi.packageServices} ({selectedPackage.services.length})</p><ul className="mt-2 space-y-2">{selectedPackage.services.map((service) => <li key={service.id} className="flex gap-2 text-sm text-slate-700"><span className="text-blue-600">•</span><span>{service.name}<span className="block text-xs text-slate-500">{service.service_point_name}</span></span></li>)}</ul></div>
          <p className="mt-4 text-lg font-black text-slate-900">{selectedPackage.base_price.toLocaleString('vi-VN')} VNĐ</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500">{vi.coordinatorApprovalNote}</p>
          <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setSelectedPackage(null)} className="secondary-button">{vi.cancel}</button><button onClick={() => { const id = selectedPackage.id; setSelectedPackage(null); void register(id); }} disabled={busyId !== null} className="primary-button"><CheckCircle2 size={17} />{vi.packageConfirm}</button></div>
        </section>
      </div>}

      <div className="space-y-3">
        <div className="flex items-center justify-between"><h3 className="text-lg font-extrabold text-slate-900">{vi.registrations}</h3><button onClick={() => void load()} className="rounded-lg p-2 text-slate-600" aria-label={vi.refresh}><RotateCw size={17} /></button></div>
        {loading ? null : registrations.length === 0 ? <EmptyState /> : registrations.map((registration) => (
          <article key={registration.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><h4 className="font-bold text-slate-900">{registration.package_name}</h4><p className="mt-1 text-xs text-slate-500">{formatFacilityDateTime(registration.requested_at, facilityTimezone)}</p></div><StatusBadge status={registration.status} /></div>
            <div className="mt-2 flex items-center justify-between text-sm"><span className="text-slate-500">{vi.priceSnapshot}</span><strong>{Number(registration.price_snapshot).toLocaleString('vi-VN')} VNĐ</strong></div>
            {registration.status === 'APPROVED' && <button onClick={() => void pay(registration.id)} disabled={busyId !== null} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white disabled:opacity-60"><CreditCard size={17} />{busyId === registration.id ? vi.loading : vi.payDemo}</button>}
            {registration.status === 'PAID' && <div className="mt-3 space-y-2"><p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{vi.paymentNote}</p><button onClick={() => onNavigate('appointments')} className="secondary-button w-full">{vi.bookingStepDate}</button></div>}
          </article>
        ))}
      </div>
    </section>
  );
}

function StatusBadge({ status }: { status: PatientPackageRegistration['status'] }) {
  const labels: Record<PatientPackageRegistration['status'], string> = {
    PENDING_APPROVAL: vi.pendingApproval,
    APPROVED: vi.approved,
    PAID: vi.paid,
    REJECTED: vi.rejected,
  };
  const colors: Record<PatientPackageRegistration['status'], string> = {
    PENDING_APPROVAL: 'bg-amber-100 text-amber-900',
    APPROVED: 'bg-blue-100 text-blue-900',
    PAID: 'bg-emerald-100 text-emerald-900',
    REJECTED: 'bg-rose-100 text-rose-900',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[status]}`}>{labels[status]}</span>;
}
