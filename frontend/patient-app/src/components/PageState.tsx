import { AlertCircle, LoaderCircle } from 'lucide-react';
import { vi } from '../i18n/vi';

export function LoadingState() {
  return <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} />{vi.loading}</div>;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"><div className="flex items-center gap-2"><AlertCircle size={17} />{message}</div><button onClick={onRetry} className="mt-3 rounded-lg bg-white px-3 py-2 font-semibold text-rose-800">{vi.retry}</button></div>;
}

export function EmptyState({ message = vi.noData }: { message?: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">{message}</div>;
}
