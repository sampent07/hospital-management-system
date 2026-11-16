import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { CalendarClock, QrCode, RotateCw } from 'lucide-react';
import { patientApi } from '../services/api';
import type { PatientAppointment, PatientPackageRegistration, PatientVisit } from '../types/api';
import { vi } from '../i18n/vi';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { PageTitle } from './ProfilePage';
import { QrScanner } from '../components/QrScanner';
import { AppointmentQr } from '../components/AppointmentQr';
import { facilityDateStartToUtc, formatFacilityDate } from '../utils/facilityTime';

export function AppointmentsPage({ token, facilityTimezone, onCheckIn, onNavigate }: { token: string; facilityTimezone: string; onCheckIn: (visit: PatientVisit) => void; onNavigate: (page: 'packages') => void }) {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [registrations, setRegistrations] = useState<PatientPackageRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [appointmentItems, registrationItems] = await Promise.all([
        patientApi.appointments(token), patientApi.registrations(token),
      ]);
      setAppointments(appointmentItems);
      setRegistrations(registrationItems);
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const availableRegistrations = registrations.filter((registration) =>
    registration.status === 'PAID' && !appointments.some((appointment) => appointment.package_registration_id === registration.id),
  );
  const hasRegistration = registrations.length > 0;
  const hasPaidRegistration = registrations.some((registration) => registration.status === 'PAID');
  const hasAppointment = appointments.some((appointment) => appointment.status !== 'CANCELLED');

  async function createAppointment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const registrationId = String(form.get('registration_id') ?? '');
    const localDate = String(form.get('appointment_date') ?? '');
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await patientApi.createAppointment(token, registrationId, facilityDateStartToUtc(localDate, facilityTimezone));
      setNotice(vi.appointmentCreated);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusy(false); }
  }

  const checkIn = useCallback(async (appointmentCode: string) => {
    setBusy(true);
    setError(null);
    setNotice(null);
    setShowScanner(false);
    try {
      const visit = await patientApi.checkIn(token, appointmentCode.trim());
      setNotice(vi.checkInSuccess);
      onCheckIn(visit);
      await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setBusy(false); }
  }, [load, onCheckIn, token]);

  function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void checkIn(code);
  }

  const handleScan = useCallback((value: string) => { void checkIn(value); }, [checkIn]);

  return (
    <section className="space-y-5">
      <PageTitle title={vi.navAppointments} subtitle={vi.appointmentInstructions} />
      <div className="booking-steps" aria-label={vi.bookingFlow}><span className={`booking-step ${hasRegistration ? 'booking-step-done' : 'booking-step-current'}`} aria-current={!hasRegistration ? 'step' : undefined}>1<span>{vi.bookingStepPackage}</span></span><span className={`booking-step ${hasPaidRegistration ? 'booking-step-done' : hasRegistration ? 'booking-step-current' : ''}`} aria-current={hasRegistration && !hasPaidRegistration ? 'step' : undefined}>2<span>{vi.bookingStepApproval}</span></span><span className={`booking-step ${hasAppointment ? 'booking-step-done' : hasPaidRegistration ? 'booking-step-current' : ''}`} aria-current={hasPaidRegistration && !hasAppointment ? 'step' : undefined}>3<span>{vi.bookingStepDate}</span></span></div>
      {registrations.length === 0 && <div className="surface-card p-4"><p className="text-sm font-semibold text-slate-800">{vi.bookingChoosePackage}</p><button onClick={() => onNavigate('packages')} className="secondary-button mt-3 w-full">{vi.openPackages}</button></div>}
      {availableRegistrations.length === 0 && registrations.some((registration) => registration.status === 'PENDING_APPROVAL') && <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">{vi.bookingWaitingApproval}</p>}
      {availableRegistrations.length === 0 && registrations.some((registration) => registration.status === 'APPROVED') && <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">{vi.bookingWaitingPayment}<button onClick={() => onNavigate('packages')} className="secondary-button mt-3 w-full">{vi.packageCatalog}</button></div>}
      {error && (appointments.length === 0 && registrations.length === 0 ? <ErrorState message={error} onRetry={() => void load()} /> : <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>)}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      {availableRegistrations.length > 0 && <form onSubmit={createAppointment} className="surface-card space-y-4 border-blue-100 bg-gradient-to-br from-white to-blue-50 p-5">
        <div><p className="section-eyebrow">{vi.bookingStepDate}</p><h3 className="mt-1 text-lg font-extrabold text-slate-900">{vi.appointmentCreate}</h3><p className="mt-1 text-xs leading-relaxed text-slate-600">{vi.bookingDateNote}</p></div>
        <label className="block text-sm font-semibold text-slate-700">{vi.packageRegistration}<select name="registration_id" required className="form-control mt-1">{availableRegistrations.map((registration) => <option key={registration.id} value={registration.id}>{registration.package_name}</option>)}</select></label>
        <label className="block text-sm font-semibold text-slate-700">{vi.bookingDate}<span className="ml-2 text-xs font-normal text-slate-500">({facilityTimezone})</span><input name="appointment_date" type="date" required min={new Date().toLocaleDateString('en-CA', { timeZone: facilityTimezone })} className="form-control mt-1" /></label>
        <button disabled={busy} className="primary-button w-full"><CalendarClock size={17} />{busy ? vi.loading : vi.bookingConfirm}</button>
      </form>}

      <div className="flex items-center justify-between"><h3 className="text-lg font-extrabold text-slate-900">{vi.appointmentList}</h3><button onClick={() => void load()} aria-label={vi.refresh} className="rounded-lg p-2 text-slate-600"><RotateCw size={17} /></button></div>
      {loading ? <LoadingState /> : appointments.length === 0 ? <EmptyState message={vi.noAppointments} /> : <div className="space-y-3">
        {appointments.map((appointment) => (
          <article key={appointment.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><p className="section-eyebrow">{vi.appointmentDay}</p><p className="mt-1 text-xl font-black text-slate-900">{formatFacilityDate(appointment.appointment_time, facilityTimezone)}</p><h4 className="mt-1 text-sm font-semibold text-slate-600">{appointment.package_id ? vi.packageAppointment : vi.generalAppointment}</h4></div><AppointmentStatus status={appointment.status} /></div>
            <div className="mt-4 flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-4 sm:flex-row"><AppointmentQr value={appointment.qr_payload} /><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{vi.appointmentCode}</p><p className="mt-1 break-all font-mono text-lg font-black tracking-wider text-slate-900">{appointment.appointment_code}</p><p className="mt-2 text-xs leading-relaxed text-slate-600">{vi.qrNote}</p></div></div>
            {appointment.status === 'CONFIRMED' && <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button onClick={() => setShowScanner(true)} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3 py-3 text-sm font-bold text-blue-800"><QrCode size={17} />{vi.scanQr}</button>
              <form onSubmit={submitCode} className="flex gap-2"><input value={code} onChange={(event) => setCode(event.target.value)} aria-label={vi.enterCode} placeholder={vi.enterCode} className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm" /><button disabled={busy || !code.trim()} className="rounded-xl bg-blue-600 px-4 text-sm font-bold text-white disabled:opacity-50">{vi.checkIn}</button></form>
            </div>}
          </article>
        ))}
      </div>}
      {showScanner && <QrScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}
      <p className="text-xs leading-relaxed text-slate-500">{vi.demoQrSource}</p>
    </section>
  );
}

function AppointmentStatus({ status }: { status: PatientAppointment['status'] }) {
  const labels: Record<PatientAppointment['status'], string> = {
    SCHEDULED: vi.scheduled,
    CONFIRMED: vi.confirmed,
    CHECKED_IN: vi.checkedIn,
    EXPIRED: 'Hết hạn',
    CANCELLED: vi.cancelled,
  };
  const colors: Record<PatientAppointment['status'], string> = {
    SCHEDULED: 'bg-slate-100 text-slate-800',
    CONFIRMED: 'bg-blue-100 text-blue-900',
    CHECKED_IN: 'bg-emerald-100 text-emerald-900',
    EXPIRED: 'bg-slate-200 text-slate-600',
    CANCELLED: 'bg-rose-100 text-rose-900',
  };
  return <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors[status]}`}>{labels[status]}</span>;
}
