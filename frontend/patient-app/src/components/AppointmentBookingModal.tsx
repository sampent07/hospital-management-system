import React, { useState } from 'react';
import { X, Clock, MapPin, CheckCircle2, AlertCircle, Info, CalendarCheck } from 'lucide-react';
import { PackageDetail, BookingAppointment } from '../types';

interface AppointmentBookingModalProps {
  packageData: PackageDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (booking: BookingAppointment) => void;
  initialContactName?: string;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onConfirmBooking,
  initialContactName = 'Lê Văn Hùng',
}) => {
  const [facility, setFacility] = useState<'CS1' | 'CS2'>('CS1');
  
  // Mặc định chọn ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('08:30 - 10:00');
  const [contactName, setContactName] = useState<string>(initialContactName);
  const [contactPhone, setContactPhone] = useState<string>('0909 123 456');
  const [companyName, setCompanyName] = useState<string>('Công ty Cổ phần Công nghệ Smart OPD');
  const [estimatedEmployees, setEstimatedEmployees] = useState<string>('50 - 200 nhân sự');
  const [notes, setNotes] = useState<string>('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen || !packageData) return null;

  const isCorporate = packageData.targetType === 'CORPORATE';

  // Kiểm tra nếu chọn ngày rơi vào Thứ 7 hoặc Chủ Nhật
  const selectedDay = new Date(appointmentDate).getDay(); // 0: Chủ Nhật, 6: Thứ 7
  const isWeekend = selectedDay === 0 || selectedDay === 6;

  const morningSlots = ['07:00 - 08:30', '08:30 - 10:00', '10:00 - 11:30'];
  const afternoonSlots = ['13:30 - 15:00', '15:00 - 16:30'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorNotice(null);

    if (!appointmentDate) {
      setErrorNotice('Vui lòng chọn ngày khám!');
      return;
    }

    if (isWeekend && afternoonSlots.includes(timeSlot)) {
      setErrorNotice('Bệnh viện chỉ nhận khám Thứ 7 - Chủ Nhật vào buổi sáng (07:30 - 12:00). Vui lòng chọn khung giờ sáng!');
      return;
    }

    const facilityDetails = {
      CS1: {
        name: 'Cơ sở 1 (Quận 7) - Trung tâm Chẩn đoán Kỹ thuật cao',
        address: '116 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP.HCM'
      },
      CS2: {
        name: 'Cơ sở 2 (Quận 3) - Bệnh viện Đa khoa Trung tâm',
        address: '215 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP.HCM'
      }
    };

    const newBooking: BookingAppointment = {
      packageId: packageData.id,
      packageName: packageData.name,
      targetType: packageData.targetType,
      facilityId: facility,
      facilityName: facilityDetails[facility].name,
      facilityAddress: facilityDetails[facility].address,
      appointmentDate,
      timeSlot,
      contactName,
      contactPhone,
      companyName: isCorporate ? companyName : undefined,
      estimatedEmployees: isCorporate ? estimatedEmployees : undefined,
      notes: notes.trim() || undefined,
      bookingCode: `DK-${Math.floor(100000 + Math.random() * 900000)}`
    };

    onConfirmBooking(newBooking);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CalendarCheck className="w-3 h-3" />
                Đăng Ký Khám Bệnh
              </span>
              <span className="text-xs text-slate-500 font-medium">{packageData.code}</span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
              Chọn Cơ Sở & Thời Gian Khám
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">
              Gói khám: <strong className="text-blue-700">{packageData.name}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Đóng bảng chọn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung Form cuộn được */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
          
          {errorNotice && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorNotice}</span>
            </div>
          )}

          {/* 1. BẢNG THỜI GIAN HOẠT ĐỘNG CỦA BỆNH VIỆN */}
          <div className="bg-gradient-to-r from-blue-50/70 to-indigo-50/70 p-4 rounded-2xl border-2 border-blue-200 space-y-2.5">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wide">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Bảng Thời Gian Hoạt Động Của Bệnh Viện</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-sm space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Thứ 2 – Thứ 6:</span>
                  <span className="text-blue-600 font-black">07:00 – 17:00</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Tiếp nhận đầy đủ tất cả chuyên khoa, xét nghiệm & CĐHA cả ngày. (Nghỉ trưa: 12:00 – 13:00)
                </p>
              </div>

              <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-sm space-y-1">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Thứ 7 – Chủ Nhật:</span>
                  <span className="text-emerald-700 font-black">07:30 – 12:00</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Khám sức khỏe tổng quát, tầm soát định kỳ & xét nghiệm nhanh. Buổi chiều trực cấp cứu 24/7.
                </p>
              </div>
            </div>
          </div>

          {/* 2. LỰA CHỌN CƠ SỞ BỆNH VIỆN */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>Chọn Cơ Sở Bệnh Viện Thực Hiện Khám</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Cơ sở 1: Quận 7 */}
              <div
                onClick={() => setFacility('CS1')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  facility === 'CS1'
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider bg-blue-100/80 px-2 py-0.5 rounded-md">
                      Cơ Sở 1 (Quận 7)
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      Trung tâm Chẩn đoán Kỹ thuật cao
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      116 Nguyễn Thị Thập, P. Tân Hưng, Quận 7, TP.HCM
                    </p>
                  </div>
                  {facility === 'CS1' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md inline-block w-fit">
                  ✓ Bãi đỗ xe ô tô rộng rãi
                </div>
              </div>

              {/* Cơ sở 2: Quận 3 */}
              <div
                onClick={() => setFacility('CS2')}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  facility === 'CS2'
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      Cơ Sở 2 (Quận 3)
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 mt-1">
                      Bệnh viện Đa khoa Trung tâm
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      215 Điện Biên Phủ, Phường Võ Thị Sáu, Quận 3, TP.HCM
                    </p>
                  </div>
                  {facility === 'CS2' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
                  )}
                </div>
                <div className="text-[10px] text-blue-700 font-medium bg-blue-50 px-2 py-0.5 rounded-md inline-block w-fit">
                  ✓ Vị trí trung tâm thành phố
                </div>
              </div>
            </div>
          </div>

          {/* 3. LỰA CHỌN THỜI GIAN KHÁM (NGÀY & KHUNG GIỜ) */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Chọn Ngày Khám Dự Kiến:
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={appointmentDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                    required
                  />
                </div>
                {isWeekend && (
                  <span className="text-[10px] text-amber-700 font-medium mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Ngày cuối tuần: Bệnh viện chỉ nhận khám sáng (07:30 - 12:00)
                  </span>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Khung Giờ Đón Tiếp:
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                >
                  <optgroup label="Buổi Sáng (07:00 - 11:30)">
                    {morningSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot} {slot === '08:30 - 10:00' ? '(Khuyến nghị)' : ''}
                      </option>
                    ))}
                  </optgroup>
                  {!isWeekend && (
                    <optgroup label="Buổi Chiều (13:30 - 16:30)">
                      {afternoonSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>
          </div>

          {/* 4. THÔNG TIN LIÊN HỆ ĐĂNG KÝ */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="font-bold text-slate-800 text-xs">
              {isCorporate ? 'Thông Tin Đại Diện Doanh Nghiệp' : 'Thông Tin Bệnh Nhân Đăng Ký'}
            </div>

            {isCorporate ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Tên Doanh Nghiệp</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Quy Mô Nhân Sự</label>
                    <select
                      value={estimatedEmployees}
                      onChange={(e) => setEstimatedEmployees(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                    >
                      <option value="Dưới 50 nhân sự">Dưới 50 nhân sự</option>
                      <option value="50 - 200 nhân sự">50 - 200 nhân sự</option>
                      <option value="200 - 500 nhân sự">200 - 500 nhân sự</option>
                      <option value="Trên 500 nhân sự">Trên 500 nhân sự</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Người Liên Hệ (HR / Quản lý)</label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Họ và Tên Bệnh Nhân</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Số Điện Thoại Liên Hệ</label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] font-medium text-slate-600 block mb-1">Ghi Chú Y Khoa / Yêu Cầu Riêng (nếu có)</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Cần hỗ trợ xe lăn, khám theo đoàn, hoặc có tiền sử tim mạch..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Footer nút xác nhận */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Quay Lại
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận Đăng Ký Lịch Khám</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
