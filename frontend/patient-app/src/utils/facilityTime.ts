export const DEFAULT_FACILITY_TIMEZONE = 'Asia/Ho_Chi_Minh';

export function parseUtcDate(value: string): Date {
  if (!value) return new Date();
  const trimmed = value.trim();
  if (trimmed.endsWith('Z') || /[+-]\d{2}:?\d{2}$/.test(trimmed)) {
    return new Date(trimmed);
  }
  return new Date(`${trimmed.replace(' ', 'T')}Z`);
}

export function formatFacilityDateTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parseUtcDate(value));
}

export function formatFacilityDate(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('vi-VN', { timeZone, dateStyle: 'full' }).format(parseUtcDate(value));
}

export function facilityDateStartToUtc(value: string, timeZone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error('Invalid facility date.');
  return facilityLocalInputToUtc(`${value}T00:00`, timeZone);
}

export function formatFacilityTime(value: string, timeZone: string): string {
  return new Intl.DateTimeFormat('vi-VN', { timeZone, timeStyle: 'short' }).format(parseUtcDate(value));
}

export function facilityLocalInputToUtc(value: string, timeZone: string): string {
  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) throw new Error('Vui lòng chọn ngày giờ hẹn hợp lệ.');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute] = timePart.split(':').map(Number);
  const expectedUtc = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = expectedUtc;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  });
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = formatter.formatToParts(new Date(candidate));
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    const shownUtc = Date.UTC(
      Number(values.year), Number(values.month) - 1, Number(values.day),
      Number(values.hour), Number(values.minute), Number(values.second),
    );
    const difference = expectedUtc - shownUtc;
    candidate += difference;
    if (difference === 0) break;
  }
  return new Date(candidate).toISOString();
}
