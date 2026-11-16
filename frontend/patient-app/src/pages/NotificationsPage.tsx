import { Bell, BellRing } from 'lucide-react';
import { vi } from '../i18n/vi';

export function NotificationsPage() {
  return (
    <section className="space-y-5">
      <header><p className="section-eyebrow">{vi.patientPortal}</p><h1 className="page-heading mt-1">{vi.navNotifications}</h1><p className="page-subtitle mt-1">{vi.notificationsDescription}</p></header>
      <div className="surface-card flex min-h-64 flex-col items-center justify-center p-7 text-center">
        <span className="grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-blue-700"><BellRing size={28} aria-hidden="true" /></span>
        <h2 className="mt-4 text-base font-extrabold text-slate-900">{vi.notificationsEmptyTitle}</h2>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{vi.notificationsEmptyDescription}</p>
        <Bell className="mt-5 text-slate-300" size={18} aria-hidden="true" />
      </div>
    </section>
  );
}
