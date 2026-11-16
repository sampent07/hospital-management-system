import { Building2, LogOut } from 'lucide-react';
import { FeatureMenu } from '../components/FeatureMenu';
import { vi } from '../i18n/vi';
import type { PatientPage, PreviewFeature } from '../types/navigation';

export function HomePage({ onNavigate, onPreview, onSignOut }: {
  onNavigate: (page: PatientPage) => void;
  onPreview: (feature: PreviewFeature) => void;
  onSignOut: () => void;
}) {
  return (
    <section className="space-y-5">
      <header className="hospital-brand-card">
        <div className="flex min-w-0 items-center gap-3">
          <span className="hospital-brand-icon"><Building2 size={24} aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-blue-950">{vi.hospitalDemoName}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-blue-700"><img src="/icons/smart-opd.svg" alt="" className="h-4 w-4" />{vi.appName} · {vi.patientPortal}</p>
          </div>
          <button onClick={onSignOut} className="hospital-signout" aria-label={vi.logout} title={vi.logout}><LogOut size={17} /></button>
        </div>
        <h1 className="mt-5 text-2xl font-black tracking-tight text-blue-800">{vi.homeWelcomeTitle}</h1>
        <p className="mt-1 text-sm leading-relaxed text-slate-600">{vi.homeWelcome}</p>
      </header>
      <FeatureMenu onNavigate={onNavigate} onPreview={onPreview} />
    </section>
  );
}
