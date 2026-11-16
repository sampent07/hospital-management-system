import { useMemo, useState } from 'react';
import {
  BookOpen, CalendarCheck2, ClipboardList, CreditCard, FileText, HeartPulse,
  History, Map, Search, Stethoscope, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { vi } from '../i18n/vi';
import type { PatientPage, PreviewFeature } from '../types/navigation';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  destination?: PatientPage;
  preview?: PreviewFeature;
  demo?: boolean;
}

const featureItems: FeatureItem[] = [
  { id: 'book', title: vi.menuBookVisit, description: vi.menuBookVisitDescription, icon: Stethoscope, destination: 'booking' },
  { id: 'history', title: vi.menuBookingHistory, description: vi.menuBookingHistoryDescription, icon: History, destination: 'bookingHistory' },
  { id: 'fees', title: vi.menuHospitalFees, description: vi.menuHospitalFeesDescription, icon: CreditCard, destination: 'hospitalFees', demo: true },
  { id: 'invoice', title: vi.menuInvoices, description: vi.menuInvoicesDescription, icon: FileText, destination: 'invoices', demo: true },
  { id: 'health', title: vi.menuHealthRecord, description: vi.menuHealthRecordDescription, icon: HeartPulse, preview: 'healthRecord' },
  { id: 'results', title: vi.menuResults, description: vi.menuResultsDescription, icon: ClipboardList, preview: 'results' },
  { id: 'schedule', title: vi.menuAppointments, description: vi.menuAppointmentsDescription, icon: CalendarCheck2, destination: 'appointments' },
  { id: 'guide', title: vi.menuGuide, description: vi.menuGuideDescription, icon: BookOpen, destination: 'guide', demo: true },
  { id: 'journey', title: vi.menuJourney, description: vi.menuJourneyDescription, icon: Map, destination: 'journey' },
];

export function FeatureMenu({ onNavigate, onPreview }: {
  onNavigate: (page: PatientPage) => void;
  onPreview: (feature: PreviewFeature) => void;
}) {
  const [query, setQuery] = useState('');
  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi');
    if (!normalizedQuery) return featureItems;
    return featureItems.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('vi').includes(normalizedQuery));
  }, [query]);

  return (
    <section className="space-y-5">
      <label className="function-search">
        <Search size={19} aria-hidden="true" />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={vi.menuSearchPlaceholder} aria-label={vi.menuSearchPlaceholder} />
        {query && <button type="button" onClick={() => setQuery('')} aria-label={vi.clearSearch}><X size={15} /></button>}
      </label>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">{vi.menuSectionTitle}</h2>
        <span className="text-xs font-medium text-slate-500">{vi.menuSectionCaption}</span>
      </div>
      {visibleItems.length === 0 ? <p className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500">{vi.menuNoResults}</p> : (
        <div className="feature-grid">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return <button key={item.id} onClick={() => item.preview ? onPreview(item.preview) : item.destination && onNavigate(item.destination)} className="feature-tile">
              <span className="feature-tile-icon"><Icon size={27} strokeWidth={1.8} aria-hidden="true" /></span>
              <span className="feature-tile-title">{item.title}</span>
              {item.preview && <span className="feature-tile-badge">{vi.menuPreviewOnly}</span>}
              {item.demo && <span className="feature-tile-badge feature-tile-badge-demo">{vi.demo}</span>}
            </button>;
          })}
        </div>
      )}
    </section>
  );
}
