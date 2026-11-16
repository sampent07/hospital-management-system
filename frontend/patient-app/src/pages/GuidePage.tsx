import { useState } from 'react';
import { ArrowRight, BookOpen, Check } from 'lucide-react';
import { vi } from '../i18n/vi';
import type { PatientPage } from '../types/navigation';

const guideSteps = [
  { title: vi.guideStep1Title, description: vi.guideStep1Description, destination: 'packages' as const },
  { title: vi.guideStep2Title, description: vi.guideStep2Description, destination: 'appointments' as const },
  { title: vi.guideStep3Title, description: vi.guideStep3Description, destination: 'journey' as const },
];

export function GuidePage({ onNavigate }: { onNavigate: (page: PatientPage) => void }) {
  const [stepIndex, setStepIndex] = useState(0);
  const step = guideSteps[stepIndex];
  const isLastStep = stepIndex === guideSteps.length - 1;
  return (
    <section className="space-y-5">
      <header><p className="section-eyebrow">{vi.demo}</p><h1 className="page-heading mt-1">{vi.menuGuide}</h1><p className="page-subtitle mt-1">{vi.guideSubtitle}</p></header>
      <div className="surface-card min-h-72 p-6">
        <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700"><BookOpen size={23} /></span><span className="text-sm font-bold text-slate-500">{stepIndex + 1} / {guideSteps.length}</span></div>
        <div className="mt-7 flex gap-3"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700"><Check size={16} /></span><div><h2 className="text-lg font-extrabold text-slate-900">{step.title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-600">{step.description}</p></div></div>
        <div className="mt-8 flex items-center justify-between gap-3"><button onClick={() => setStepIndex((current) => Math.max(current - 1, 0))} disabled={stepIndex === 0} className="secondary-button disabled:opacity-40">{vi.guidePrevious}</button>{isLastStep ? <button onClick={() => onNavigate(step.destination)} className="primary-button">{vi.guideTryNow}<ArrowRight size={17} /></button> : <button onClick={() => setStepIndex((current) => Math.min(current + 1, guideSteps.length - 1))} className="primary-button">{vi.guideNext}<ArrowRight size={17} /></button>}</div>
      </div>
    </section>
  );
}
