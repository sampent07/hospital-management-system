import { useCallback, useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  History,
  RotateCw,
  Stethoscope,
  User,
  XCircle,
} from 'lucide-react';
import { patientApi } from '../services/api';
import type { PatientAppointment } from '../types/api';
import { ErrorState, LoadingState } from '../components/PageState';
import { PageTitle } from './ProfilePage';
import { formatFacilityDate, formatFacilityTime } from '../utils/facilityTime';

interface BookingHistoryPageProps {
  token: string;
  facilityTimezone: string;
  onNavigate: (page: 'booking' | 'packages') => void;
}

export function BookingHistoryPage({
  token,
  facilityTimezone,
  onNavigate,
}: BookingHistoryPageProps) {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CHECKED_IN' | 'EXPIRED' | 'CONFIRMED'>('ALL');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await patientApi.appointments(token);
      setAppointments(items);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể tải lịch sử đặt khám');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Lọc theo trạng thái
  const filteredAppointments = appointments.filter((item) => {
    if (filterStatus === 'ALL') return true;
    return item.status === filterStatus;
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <PageTitle
          title="Lịch sử đặt khám"
          subtitle="Ghi nhận nhật ký các ca khám và gói dịch vụ đã đăng ký"
        />
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm hover:bg-slate-50"
          title="Làm mới"
        >
          <RotateCw size={17} />
        </button>
      </div>

      {/* Bộ lọc trạng thái (Tabs) */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs font-bold scrollbar-none">
        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`rounded-xl px-3 py-2 whitespace-nowrap transition ${
            filterStatus === 'ALL'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả ({appointments.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('CHECKED_IN')}
          className={`rounded-xl px-3 py-2 whitespace-nowrap transition ${
            filterStatus === 'CHECKED_IN'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
          }`}
        >
          Đã sử dụng ({appointments.filter((a) => a.status === 'CHECKED_IN').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('EXPIRED')}
          className={`rounded-xl px-3 py-2 whitespace-nowrap transition ${
            filterStatus === 'EXPIRED'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Hết hạn ({appointments.filter((a) => a.status === 'EXPIRED').length})
        </button>
        <button
          type="button"
          onClick={() => setFilterStatus('CONFIRMED')}
          className={`rounded-xl px-3 py-2 whitespace-nowrap transition ${
            filterStatus === 'CONFIRMED'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-white text-blue-800 border border-blue-200 hover:bg-blue-50'
          }`}
        >
          Chờ khám ({appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'SCHEDULED').length})
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void loadData()} />
      ) : filteredAppointments.length === 0 ? (
        <div className="surface-card p-6 text-center space-y-3">
          <History size={36} className="mx-auto text-slate-300" />
          <p className="text-sm font-semibold text-slate-700">Chưa có bản ghi lịch sử đặt khám nào.</p>
          <button
            type="button"
            onClick={() => onNavigate('booking')}
            className="primary-button mx-auto"
          >
            Đặt lịch khám ngay
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((item) => {
            const isUsed = item.status === 'CHECKED_IN';
            const isExpired = item.status === 'EXPIRED';
            const isPending = item.status === 'CONFIRMED' || item.status === 'SCHEDULED';

            return (
              <article
                key={item.id}
                className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm space-y-3 transition hover:shadow-md"
              >
                {/* Header Card: Tên gói & Trạng thái rõ ràng */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Gói dịch vụ đã đăng ký
                    </span>
                    <h3 className="mt-0.5 text-sm font-extrabold text-slate-900 truncate">
                      {item.package_name || 'Khám chuyên khoa theo yêu cầu'}
                    </h3>
                  </div>

                  {/* Badge trạng thái chuẩn UX: ĐÃ DÙNG / HẾT HẠN / CHỜ KHÁM */}
                  <div>
                    {isUsed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-800 border border-emerald-200">
                        <CheckCircle2 size={13} />
                        Đã sử dụng
                      </span>
                    )}
                    {isExpired && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 border border-slate-200">
                        <XCircle size={13} />
                        Hết hạn
                      </span>
                    )}
                    {isPending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-900 border border-blue-200">
                        <Clock size={13} />
                        Chờ khám
                      </span>
                    )}
                  </div>
                </div>

                {/* Thông tin Bác sĩ phụ trách & Người bệnh */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Bác sĩ phụ trách</p>
                    <p className="mt-0.5 font-bold text-slate-800 truncate flex items-center gap-1">
                      <Stethoscope size={13} className="text-blue-600 shrink-0" />
                      <span>{item.doctor_name || 'BS. Chuyên khoa'}</span>
                    </p>
                    {item.room_name && (
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                        {item.room_name} ({item.room_number})
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-2.5 border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Người khám</p>
                    <p className="mt-0.5 font-bold text-slate-800 truncate flex items-center gap-1">
                      <User size={13} className="text-blue-600 shrink-0" />
                      <span>{item.patient_name || 'Hồ sơ người bệnh'}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                      {item.appointment_type}
                    </p>
                  </div>
                </div>

                {/* Thời gian đăng ký / hẹn */}
                <div className="flex items-center justify-between rounded-2xl bg-blue-50/60 p-2.5 text-xs border border-blue-100">
                  <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <Calendar size={14} className="text-blue-700" />
                    <span>Ngày đăng ký khám:</span>
                  </div>
                  <strong className="font-mono text-blue-950 font-bold">
                    {formatFacilityDate(item.appointment_time, facilityTimezone)} ({formatFacilityTime(item.appointment_time, facilityTimezone)})
                  </strong>
                </div>

                {/* Chú thích rõ ràng không dùng QR để tránh nhầm lẫn với phiếu khám hiện tại */}
                <p className="text-[10px] text-slate-400 italic text-right">
                  * Bản ghi nhật ký lưu trữ — Không có mã QR tiếp nhận tại quầy.
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
