import { useState, type FormEvent } from 'react';
import { Activity, ArrowLeft, LoaderCircle } from 'lucide-react';
import type { AuthSession, DemoRegistration } from '../types/api';
import { ApiError, patientApi } from '../services/api';
import { vi } from '../i18n/vi';
import { formatFacilityTime } from '../utils/facilityTime';

interface AuthPageProps {
  onAuthenticated: (session: AuthSession) => void;
  facilityTimezone: string;
}

type Mode = 'login' | 'register' | 'verify';

export function AuthPage({ onAuthenticated, facilityTimezone }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>('login');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<DemoRegistration | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await patientApi.login(username, password);
      if (session.role !== 'PATIENT') throw new Error('Tài khoản này không thuộc cổng bệnh nhân.');
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : vi.networkIssue);
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const values: Record<string, string> = {
        username: String(form.get('username') ?? ''),
        password: String(form.get('password') ?? ''),
        full_name: String(form.get('full_name') ?? ''),
        date_of_birth: String(form.get('date_of_birth') ?? ''),
        gender: String(form.get('gender') ?? 'OTHER'),
        marital_status: String(form.get('marital_status') ?? 'SINGLE'),
        phone_number: String(form.get('phone_number') ?? ''),
        address: String(form.get('address') ?? ''),
      };
      const email = String(form.get('email') ?? '').trim();
      if (email) values.email = email;
      const response = await patientApi.register(values);
      setRegistration(response);
      setUsername(response.username);
      setPassword('');
      setCode(response.demo_verification_code);
      setMode('verify');
    } catch (reason) {
      setError(reason instanceof ApiError ? reason.message : reason instanceof Error ? reason.message : vi.networkIssue);
    } finally {
      setBusy(false);
    }
  }

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const session = await patientApi.verify(username, code);
      onAuthenticated(session);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : vi.networkIssue);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl shadow-slate-200/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <Activity aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{vi.appName}</h1>
            <p className="text-sm text-slate-500">{vi.patientPortal}</p>
          </div>
        </div>

        {mode === 'verify' ? (
          <form className="space-y-4" onSubmit={handleVerify}>
            <button type="button" onClick={() => setMode('register')} className="flex items-center gap-1 text-sm font-semibold text-blue-700">
              <ArrowLeft size={16} /> {vi.backToRegistration}
            </button>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{vi.verify}</h2>
              <p className="mt-1 text-sm text-slate-600">{vi.demoCodeNote}</p>
              {registration && <p className="mt-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-900">{vi.demoCode}: <strong>{registration.demo_verification_code}</strong></p>}
              <p className="mt-2 text-xs text-slate-500">{vi.demoCodeExpires} {registration ? formatFacilityTime(registration.expires_at, facilityTimezone) : ''}</p>
            </div>
            <label className="block text-sm font-medium text-slate-700">
              {vi.demoCode}
              <input value={code} onChange={(event) => setCode(event.target.value)} inputMode="numeric" maxLength={6} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" />
            </label>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <SubmitButton busy={busy} label={vi.verify} />
          </form>
        ) : mode === 'login' ? (
          <form className="space-y-4" onSubmit={handleLogin}>
            <h2 className="text-lg font-bold text-slate-900">{vi.login}</h2>
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3 text-xs text-blue-900">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block font-semibold">Tài khoản demo: <strong>patient</strong></span>
                  <span className="text-[11px] text-blue-700">Mật khẩu: Patient@123</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setUsername('patient');
                    setPassword('Patient@123');
                    setError(null);
                  }}
                  className="rounded-lg bg-blue-600 px-2.5 py-1.5 font-bold text-white hover:bg-blue-700 shadow-sm transition"
                >
                  Điền nhanh
                </button>
              </div>
            </div>
            <Field label={vi.username} value={username} onChange={setUsername} autoComplete="username" />
            <Field label={vi.password} value={password} onChange={setPassword} type="password" autoComplete="current-password" />
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <SubmitButton busy={busy} label={vi.login} />
            <button type="button" onClick={() => { setMode('register'); setError(null); }} className="w-full py-2 text-sm font-semibold text-blue-700">{vi.register}</button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleRegister}>
            <button type="button" onClick={() => { setMode('login'); setError(null); }} className="flex items-center gap-1 text-sm font-semibold text-blue-700">
              <ArrowLeft size={16} /> {vi.backToLogin}
            </button>
            <h2 className="text-lg font-bold text-slate-900">{vi.register}</h2>
            <div className="grid grid-cols-2 gap-3">
              <FormField name="username" label={vi.username} autoComplete="username" minLength={3} />
              <FormField name="password" label={vi.password} type="password" autoComplete="new-password" minLength={8} />
              <FormField name="full_name" label={vi.fullName} className="col-span-2" />
              <FormField name="date_of_birth" label={vi.dateOfBirth} type="date" />
              <FormField name="phone_number" label={vi.phone} type="tel" />
              <SelectField name="gender" label={vi.gender} values={[["MALE", vi.male], ["FEMALE", vi.female], ["OTHER", vi.other]]} />
              <SelectField name="marital_status" label={vi.maritalStatus} values={[["SINGLE", vi.single], ["MARRIED", vi.married], ["DIVORCED", vi.divorced]]} />
              <FormField name="email" label={vi.email} type="email" className="col-span-2" />
              <FormField name="address" label={vi.address} className="col-span-2" />
            </div>
            <p className="text-xs text-slate-500">{vi.demoCodeNote}</p>
            {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
            <SubmitButton busy={busy} label={vi.register} />
          </form>
        )}
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = 'text', autoComplete }: {
  label: string; value: string; onChange: (value: string) => void; type?: string; autoComplete?: string;
}) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} required className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-3" /></label>;
}

function FormField({ name, label, type = 'text', autoComplete, minLength, className = '' }: {
  name: string; label: string; type?: string; autoComplete?: string; minLength?: number; className?: string;
}) {
  return <label className={`block text-xs font-medium text-slate-700 ${className}`}>{label}<input name={name} type={type} autoComplete={autoComplete} minLength={minLength} required={name !== 'email' && name !== 'address'} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>;
}

function SelectField({ name, label, values }: { name: string; label: string; values: [string, string][] }) {
  return <label className="block text-xs font-medium text-slate-700">{label}<select name={name} className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">{values.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-60">{busy && <LoaderCircle size={17} className="animate-spin" />}{busy ? vi.loading : label}</button>;
}
