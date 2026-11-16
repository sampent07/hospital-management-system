import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Plus, CheckCircle2, Clock, XCircle, Search, UserCheck, AlertCircle } from 'lucide-react';
import { Appointment, Package } from '../types';
import { formatFacilityDateTime } from '../utils/formatTime';

interface AppointmentsProps {
  packages: Package[];
  onDirectCheckIn?: (patientId: string, packageId?: string) => Promise<void>;
}

export const Appointments: React.FC<AppointmentsProps> = ({ packages, onDirectCheckIn }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form tạo lịch hẹn mới
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [patientId, setPatientId] = useState<string>('pat-01-hung');
  const [packageId, setPackageId] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  );
  const [appointmentType, setAppointmentType] = useState<'FIRST_VISIT' | 'FOLLOW_UP' | 'PERIODIC'>('FIRST_VISIT');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const url = statusFilter === 'ALL'
        ? '/api/v1/appointments'
        : `/api/v1/appointments?status=${statusFilter}`;
      const res = await fetch(url, {
        headers: { Authorization: 'Bearer mock-token' }
      });
      if (!res.ok) throw new Error('Không thể tải danh sách lịch hẹn.');
      const data: Appointment[] = await res.json();
      setAppointments(data);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/appointments/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Không thể cập nhật trạng thái lịch hẹn.');
      setSuccessMsg(`Đã cập nhật trạng thái lịch hẹn thành '${newStatus}'!`);
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAppointments();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  const handleCheckInNow = async (appt: Appointment) => {
    if (onDirectCheckIn) {
      try {
        await onDirectCheckIn(appt.patientId, appt.packageId);
        await handleUpdateStatus(appt.id, 'CHECKED_IN');
      } catch (err: unknown) {
        if (err instanceof Error) setErrorMsg(err.message);
      }
    } else {
      await handleUpdateStatus(appt.id, 'CHECKED_IN');
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          patient_id: patientId,
          package_id: packageId || null,
          appointment_time: new Date(appointmentTime).toISOString(),
          appointment_type: appointmentType,
          notes: notes
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi đặt lịch hẹn.');
      }

      setShowCreateModal(false);
      setNotes('');
      setSuccessMsg('Đã đặt lịch hẹn / lịch tái khám thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
      fetchAppointments();
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.patientName.toLowerCase().includes(q) ||
      a.patientPhone.includes(q) ||
      a.patientId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-slate-900">Quản Lý Lịch Hẹn &amp; Đặt Lịch Tái Khám</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi danh sách bệnh nhân hẹn trước và thiết lập lịch tái khám sau điều trị.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt Lịch Hẹn / Tái Khám Mới</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Bộ lọc và thanh tìm kiếm */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
          <div className="flex rounded-lg bg-slate-100 p-0.5 text-xs font-medium">
            {['ALL', 'SCHEDULED', 'CONFIRMED', 'CHECKED_IN', 'CANCELLED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === st ? 'bg-white font-bold text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'ALL' ? 'Tất cả' : st === 'SCHEDULED' ? 'Chờ xác nhận' : st === 'CONFIRMED' ? 'Đã xác nhận' : st === 'CHECKED_IN' ? 'Đã khám' : 'Đã hủy'}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm tên, SĐT bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500"
          />
        </div>
      </div>

      {/* Danh sách lịch hẹn */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm flex items-center justify-center gap-2">
            <Clock className="w-5 h-5 animate-spin text-primary-600" />
            <span>Đang tải danh sách lịch hẹn...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            Không tìm thấy lịch hẹn nào phù hợp điều kiện lọc.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="p-3.5">Thời Gian Hẹn</th>
                  <th className="p-3.5">Bệnh Nhân</th>
                  <th className="p-3.5">Loại Lịch Hẹn</th>
                  <th className="p-3.5">Gói Khám</th>
                  <th className="p-3.5">Ghi Chú</th>
                  <th className="p-3.5">Trạng Thái</th>
                  <th className="p-3.5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-bold text-slate-800">
                      {formatFacilityDateTime(appt.appointmentTime)}
                    </td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{appt.patientName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{appt.patientPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        appt.appointmentType === 'FOLLOW_UP'
                          ? 'bg-purple-100 text-purple-700'
                          : appt.appointmentType === 'PERIODIC'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {appt.appointmentType === 'FOLLOW_UP' ? 'Tái khám' : appt.appointmentType === 'PERIODIC' ? 'Định kỳ' : 'Khám mới'}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      {appt.packageName || <span className="italic text-slate-400">Khám thông thường</span>}
                    </td>
                    <td className="p-3.5 text-slate-500 max-w-xs truncate">
                      {appt.notes || '—'}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        appt.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'CHECKED_IN'
                          ? 'bg-blue-100 text-blue-800'
                          : appt.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appt.status === 'CONFIRMED' ? 'Đã xác nhận' : appt.status === 'CHECKED_IN' ? 'Đã tiếp nhận' : appt.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ xác nhận'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                      {appt.status === 'SCHEDULED' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CONFIRMED')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold"
                        >
                          Xác nhận
                        </button>
                      )}
                      {appt.status !== 'CHECKED_IN' && appt.status !== 'CANCELLED' && (
                        <button
                          onClick={() => handleCheckInNow(appt)}
                          className="px-2.5 py-1 bg-primary-600 text-white hover:bg-primary-700 rounded-lg text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Tiếp nhận</span>
                        </button>
                      )}
                      {appt.status !== 'CANCELLED' && appt.status !== 'CHECKED_IN' && (
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'CANCELLED')}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Hủy lịch hẹn"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal đặt lịch hẹn mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">Đặt Lịch Hẹn / Lập Lịch Tái Khám</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Mã bệnh nhân (ID)</label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Gói khám (Tùy chọn)</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500 bg-white"
                >
                  <option value="">-- Không chọn gói (Khám theo yêu cầu / tái khám) --</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.basePrice.toLocaleString('vi-VN')} đ)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Thời gian hẹn</label>
                  <input
                    type="datetime-local"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Loại lịch hẹn</label>
                  <select
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value as 'FIRST_VISIT' | 'FOLLOW_UP' | 'PERIODIC')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500 bg-white"
                  >
                    <option value="FIRST_VISIT">Khám lần đầu</option>
                    <option value="FOLLOW_UP">Tái khám theo chỉ định</option>
                    <option value="PERIODIC">Khám sức khỏe định kỳ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi chú &amp; Lời dặn tái khám</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú triệu chứng, kết quả tái khám mong đợi..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Xác Nhận Đặt Lịch Hẹn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
