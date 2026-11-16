import { useMemo } from 'react';
import { createAppointmentQr } from '../utils/qrCode';
import { vi } from '../i18n/vi';

export function AppointmentQr({ value }: { value: string }) {
  const matrix = useMemo(() => createAppointmentQr(value), [value]);
  const quietZone = 4;
  const viewSize = matrix.length + quietZone * 2;
  const modules = matrix.flatMap((row, y) => row.map((dark, x) => dark ? `${x + quietZone},${y + quietZone}` : null).filter((item): item is string => item !== null));
  return (
    <svg role="img" aria-label={`${vi.appointmentQr}: ${value}`} viewBox={`0 0 ${viewSize} ${viewSize}`} className="h-40 w-40 rounded-xl bg-white p-2">
      <rect width={viewSize} height={viewSize} fill="white" />
      {modules.map((coordinate) => {
        const [x, y] = coordinate.split(',').map(Number);
        return <rect key={coordinate} x={x} y={y} width="1" height="1" fill="#0f172a" />;
      })}
    </svg>
  );
}
