/**
 * HÀM ĐỊNH DẠNG THỜI GIAN DUY NHẤT TOÀN FRONTEND
 * Tuân thủ nghiêm ngặt DOMAIN_RULES.md Mục 2 & FRONTEND.md:
 * Backend trả UTC (ISO 8601) -> Frontend hiển thị theo múi giờ cơ sở Asia/Ho_Chi_Minh.
 */
export function formatFacilityDateTime(utcIsoString?: string | null): string {
  if (!utcIsoString) return '--:--';
  try {
    const date = new Date(utcIsoString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  } catch {
    return '--:--';
  }
}

export function formatFacilityTimeOnly(utcIsoString?: string | null): string {
  if (!utcIsoString) return '--:--';
  try {
    const date = new Date(utcIsoString);
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  } catch {
    return '--:--';
  }
}

export function formatDurationMinutes(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins} phút`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}p`;
}
