import { ChevronLeft, ChevronRight, Clock, AlertCircle, CheckCircle2, User } from 'lucide-react';
import type { DayAvailability, DoctorScheduleSlot } from '../types/api';

interface ScheduleCalendarProps {
  packageId: string;
  monthString: string; // YYYY-MM
  days: DayAvailability[];
  selectedDate: string; // YYYY-MM-DD
  selectedSlotId: string | null;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: DoctorScheduleSlot) => void;
  onChangeMonth: (offset: number) => void;
}

export function ScheduleCalendar({
  monthString,
  days,
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
  onChangeMonth,
}: ScheduleCalendarProps) {
  const [year, month] = monthString.split('-').map(Number);
  const displayTitle = `Tháng ${month} / ${year}`;

  // Tính thứ của ngày 1 trong tháng (0 = CN, 1 = T2, ..., 6 = T7)
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  // Điều chỉnh để bắt đầu từ Thứ 2 (0 = T2, ..., 6 = CN)
  const startCol = (firstDayOfMonth + 6) % 7;

  // Lấy các slot của ngày được chọn
  const currentDayData = days.find((d) => d.date === selectedDate);
  const availableSlots = currentDayData?.slots || [];

  return (
    <div className="space-y-4">
      {/* Bộ điều hướng tháng */}
      <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-2.5 border border-slate-200">
        <button
          type="button"
          onClick={() => onChangeMonth(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm hover:bg-slate-100"
          title="Tháng trước"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm font-black text-blue-950 uppercase tracking-wide">
          {displayTitle}
        </span>
        <button
          type="button"
          onClick={() => onChangeMonth(1)}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm hover:bg-slate-100"
          title="Tháng sau"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Chú thích màu sắc (Legend) */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-emerald-500 shadow-sm" />
          <span className="text-emerald-950">Còn chỗ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-amber-400 shadow-sm" />
          <span className="text-amber-950">Hết chỗ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-md bg-slate-200" />
          <span className="text-slate-500">Không khả dụng</span>
        </div>
      </div>

      {/* Lưới Lịch (Calendar Grid) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        {/* Tiêu đề các thứ trong tuần */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-extrabold text-slate-400 pb-2 border-b border-slate-100">
          <span>T2</span>
          <span>T3</span>
          <span>T4</span>
          <span>T5</span>
          <span>T6</span>
          <span className="text-blue-600">T7</span>
          <span className="text-rose-500">CN</span>
        </div>

        {/* Các ô ngày */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {/* Khoảng trống trước ngày 1 */}
          {Array.from({ length: startCol }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-11 rounded-xl" />
          ))}

          {/* Danh sách ngày trong tháng */}
          {days.map((dayItem) => {
            const dayNum = parseInt(dayItem.date.split('-')[2], 10);
            const isSelected = dayItem.date === selectedDate;
            const isAvailable = dayItem.status === 'AVAILABLE';
            const isFull = dayItem.status === 'FULL';

            // Định dạng class cho 3 trạng thái chuẩn màu
            let colorClasses = 'bg-slate-100/70 text-slate-400 cursor-not-allowed border-transparent'; // Xám
            let badgeText = '';

            if (isAvailable) {
              // Xanh lá khả dụng
              colorClasses = isSelected
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
                : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300 cursor-pointer font-semibold';
              badgeText = `${dayItem.remaining_slots} chỗ`;
            } else if (isFull) {
              // Vàng hết chỗ
              colorClasses = 'bg-amber-50 text-amber-900 border-amber-200 opacity-90 cursor-not-allowed font-medium';
              badgeText = 'Hết chỗ';
            }

            return (
              <button
                key={dayItem.date}
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelectDate(dayItem.date)}
                className={`relative flex flex-col items-center justify-center rounded-xl p-1 transition border text-center h-12 ${colorClasses}`}
              >
                <span className="text-xs leading-none">{dayNum}</span>
                {badgeText && (
                  <span
                    className={`mt-1 text-[9px] leading-none px-1 rounded font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : isAvailable
                        ? 'text-emerald-700'
                        : 'text-amber-800'
                    }`}
                  >
                    {badgeText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Danh sách Khung giờ & Bác sĩ của ngày được chọn */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Clock size={15} className="text-blue-600" />
            <span>Khung giờ khám ngày: <strong>{selectedDate}</strong></span>
          </h4>
          {currentDayData?.status === 'FULL' && (
            <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 flex items-center gap-1">
              <AlertCircle size={12} />
              Đã kín lịch
            </span>
          )}
        </div>

        {availableSlots.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-xs text-slate-500">
            Không có khung giờ khám khả dụng trong ngày này. Vui lòng chọn ngày có ô màu xanh.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {availableSlots.map((slot) => {
              const isSlotSelected = slot.id === selectedSlotId;
              const isSlotFull = slot.remaining_slots <= 0;

              return (
                <div
                  key={slot.id}
                  onClick={() => {
                    if (!isSlotFull) onSelectSlot(slot);
                  }}
                  className={`rounded-2xl border-2 p-3 transition flex items-start justify-between gap-2 ${
                    isSlotFull
                      ? 'border-amber-200 bg-amber-50/50 opacity-75 cursor-not-allowed'
                      : isSlotSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm cursor-pointer'
                      : 'border-slate-200 bg-white hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-blue-950">
                        {slot.start_time} - {slot.end_time}
                      </span>
                      {isSlotFull ? (
                        <span className="rounded bg-amber-200 px-1.5 py-0.2 text-[9px] font-bold text-amber-900">
                          Hết chỗ
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                          Còn {slot.remaining_slots} chỗ
                        </span>
                      )}
                    </div>

                    {/* Bác sĩ phụ trách */}
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-700">
                      <User size={12} className="text-blue-600 shrink-0" />
                      <span className="font-semibold truncate">{slot.doctor_name}</span>
                    </div>

                    {/* Phòng khám */}
                    {slot.room_number && (
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {slot.room_name} ({slot.room_number})
                      </p>
                    )}
                  </div>

                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 mt-0.5 ${
                      isSlotSelected
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : isSlotFull
                        ? 'border-amber-300 bg-amber-100'
                        : 'border-slate-300'
                    }`}
                  >
                    {isSlotSelected && <CheckCircle2 size={13} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
