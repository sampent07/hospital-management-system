import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { patientApi } from '../services/api';
import type { PatientProfile } from '../types/api';
import { vi } from '../i18n/vi';
import { ErrorState, LoadingState } from '../components/PageState';

export function ProfilePage({ token }: { token: string }) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try { setProfile(await patientApi.profile(token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, [token]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await patientApi.updateProfile(token, {
        full_name: String(form.get('full_name') ?? ''),
        date_of_birth: String(form.get('date_of_birth') ?? ''),
        gender: String(form.get('gender') ?? 'OTHER') as PatientProfile['gender'],
        marital_status: String(form.get('marital_status') ?? 'SINGLE') as NonNullable<PatientProfile['marital_status']>,
        phone_number: String(form.get('phone_number') ?? ''),
        email: String(form.get('email') ?? '') || null,
        address: String(form.get('address') ?? '') || null,
        id_card_number: String(form.get('id_card_number') ?? '') || null,
      });
      setProfile(updated);
      setNotice(vi.profileSaved);
    } catch (reason) { setError(reason instanceof Error ? reason.message : vi.networkIssue); }
    finally { setSaving(false); }
  }

  if (loading) return <LoadingState />;
  if (error && !profile) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!profile) return null;

  return (
    <section className="space-y-4">
      <PageTitle title={vi.navProfile} subtitle={vi.profileEditable} />
      {error && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      <form onSubmit={save} className="surface-card grid gap-4 p-5 sm:grid-cols-2">
        <Input name="full_name" label={vi.fullName} defaultValue={profile.full_name} required />
        <Input name="date_of_birth" label={vi.dateOfBirth} type="date" defaultValue={profile.date_of_birth} required />
        <Select name="gender" label={vi.gender} defaultValue={profile.gender} options={[["MALE", vi.male], ["FEMALE", vi.female], ["OTHER", vi.other]]} />
        <Select name="marital_status" label={vi.maritalStatus} defaultValue={profile.marital_status ?? 'SINGLE'} options={[["SINGLE", vi.single], ["MARRIED", vi.married], ["DIVORCED", vi.divorced]]} />
        <Input name="phone_number" label={vi.phone} defaultValue={profile.phone_number} required />
        <Input name="email" label={vi.email} type="email" defaultValue={profile.email ?? ''} />
        <Input name="address" label={vi.address} defaultValue={profile.address ?? ''} className="sm:col-span-2" />
        <Input name="id_card_number" label={vi.idCardNumber} defaultValue={profile.id_card_number ?? ''} />
        <button disabled={saving} className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-60 sm:col-span-2"><Save size={17} />{saving ? vi.loading : vi.save}</button>
      </form>
    </section>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div><p className="section-eyebrow">{vi.patientPortal}</p><h2 className="page-heading mt-1">{title}</h2><p className="page-subtitle mt-1">{subtitle}</p></div>;
}

function Input({ name, label, defaultValue, type = 'text', required = false, className = '' }: { name: string; label: string; defaultValue: string; type?: string; required?: boolean; className?: string }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${className}`}>{label}<input name={name} type={type} defaultValue={defaultValue} required={required} className="form-control mt-1" /></label>;
}

function Select({ name, label, defaultValue, options }: { name: string; label: string; defaultValue: string; options: [string, string][] }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}<select name={name} defaultValue={defaultValue} className="form-control mt-1">{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
}
