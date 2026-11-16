import { Construction } from 'lucide-react';
import { vi } from '../i18n/vi';
import type { PreviewFeature } from '../types/navigation';

const previewCopy: Record<PreviewFeature, { title: string; description: string }> = {
  healthRecord: { title: vi.menuHealthRecord, description: vi.previewHealthRecord },
  results: { title: vi.menuResults, description: vi.previewResults },
};

export function FeaturePreviewPage({ feature }: { feature: PreviewFeature }) {
  const copy = previewCopy[feature];
  return (
    <section className="space-y-5">
      <div className="surface-card flex min-h-72 flex-col items-center justify-center p-7 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-50 text-amber-700"><Construction size={28} aria-hidden="true" /></span>
        <h1 className="mt-4 text-xl font-extrabold text-slate-900">{copy.title}</h1>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-600">{copy.description}</p>
        <span className="mt-5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">{vi.menuPreviewOnly}</span>
      </div>
    </section>
  );
}
