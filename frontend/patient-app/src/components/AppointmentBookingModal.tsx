import React, { useState } from 'react';
import { X, Clock, MapPin, CheckCircle2, AlertCircle, Info, CalendarCheck, User, Building2, ShieldCheck, HeartPulse, Stethoscope } from 'lucide-react';
import { PackageDetail, BookingAppointment, SingleServiceItem } from '../types';

export interface RegistrationInfo {
  contactName: string;
  contactPhone: string;
  age?: number;
  gender?: string;
  insuranceCardNumber?: string;
  medicalHistory?: string;
  companyName?: string;
  employeeScale?: string;
  workEnvironment?: string;
  email?: string;
  notes?: string;
}

interface AppointmentBookingModalProps {
  packageData: PackageDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (booking: BookingAppointment) => void;
  registrationInfo: RegistrationInfo;
  examMode?: 'PACKAGE' | 'SINGLE';
  selectedServices?: SingleServiceItem[];
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onConfirmBooking,
  registrationInfo,
  examMode = 'PACKAGE',
  selectedServices = [],
}) => {
  const [facility, setFacility] = useState<'CS1' | 'CS2'>('CS1');

  // Mặc định chọn ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('08:30 - 10:00');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSingle = examMode === 'SINGLE';
  const isCorporate = !isSingle && packageData?.targetType === 'CORPORATE';

  const singleTotalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);

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
      packageId: isSingle ? undefined : packageData?.id,
      packageName: isSingle
        ? `Khám Lẻ (${selectedServices.length} dịch vụ)`
        : packageData?.name || 'Gói Khám Sức Khỏe',
      targetType: isCorporate ? 'CORPORATE' : 'INDIVIDUAL',
      examMode: examMode,
      selectedServices: isSingle ? selectedServices : undefined,
      totalPrice: isSingle ? singleTotalPrice : packageData?.basePrice,
      facilityId: facility,
      facilityName: facilityDetails[facility].name,
      facilityAddress: facilityDetails[facility].address,
      appointmentDate,
      timeSlot,
      contactName: registrationInfo.contactName,
      contactPhone: registrationInfo.contactPhone,
      patientAge: registrationInfo.age,
      patientGender: registrationInfo.gender,
      insuranceCardNumber: registrationInfo.insuranceCardNumber,
      medicalHistory: registrationInfo.medicalHistory,
      companyName: isCorporate ? registrationInfo.companyName : undefined,
      estimatedEmployees: isCorporate ? registrationInfo.employeeScale : undefined,
      email: registrationInfo.email,
      notes: registrationInfo.notes,
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
                {isSingle ? 'Đặt Lịch Khám Lẻ' : 'Đặt Lịch Khám Bệnh'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isSingle ? `${selectedServices.length} dịch vụ đã chọn` : packageData?.code}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
              Chọn Cơ Sở & Thời Gian Khám
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">
              {isSingle ? (
                <span>
                  Tổng chi phí: <strong className="text-blue-700">{singleTotalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                </span>
              ) : (
                <span>
                  Gói khám: <strong className="text-blue-700">{packageData?.name}</strong>
                </span>
              )}
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

          {/* 4. TÓM TẮT THÔNG TIN ĐÃ ĐĂNG KÝ (KHÔNG CẦN NHẬP LẠI) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                {isCorporate ? <Building2 className="w-4 h-4 text-blue-600" /> : <User className="w-4 h-4 text-blue-600" />}
                <span>{isCorporate ? 'Thông Tin Doanh Nghiệp Đăng Ký' : 'Thông Tin Người Khám Đăng Ký'}</span>
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                ✓ Đã lưu từ bước đăng ký
              </span>
            </div>

            {/* Nếu là Khám Lẻ: Liệt kê các dịch vụ đã chọn */}
            {isSingle && selectedServices.length > 0 && (
              <div className="p-3 bg-white rounded-xl border border-blue-100 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-slate-900">
                  <span className="flex items-center gap-1 text-blue-700">
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>Dịch vụ khám lẻ đã chọn ({selectedServices.length}):</span>
                  </span>
                  <span className="text-blue-600 font-black">{singleTotalPrice.toLocaleString('vi-VN')} VNĐ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {selectedServices.map((srv) => (
                    <div key={srv.id} className="p-2 bg-slate-50 rounded-lg flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5 min-w-0 pr-2">
                        {(srv.categoryName || srv.category) && (
                          <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded shrink-0">
                            {srv.categoryName || srv.category}
                          </span>
                        )}
                        <span className="font-medium text-slate-700 truncate">{srv.name}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">{srv.price.toLocaleString('vi-VN')} đ</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isCorporate ? (
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tên Doanh Nghiệp:</span>
                  <strong className="text-slate-800">{registrationInfo.companyName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Người Liên Hệ (HR):</span>
                  <span className="text-slate-800 font-medium">{registrationInfo.contactName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Điện Thoại:</span>
                  <span className="text-blue-700 font-semibold">{registrationInfo.contactPhone}</span>
                </div>
                {registrationInfo.email && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Email:</span>
                    <span className="text-slate-700">{registrationInfo.email}</span>
                  </div>
                )}
                {registrationInfo.employeeScale && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quy Mô Nhân Sự:</span>
                    <span className="text-slate-700">{registrationInfo.employeeScale}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hình Thức Khám:</span>
                  <strong className="text-blue-700">{isSingle ? 'Khám Lẻ Từng Dịch Vụ' : 'Khám Theo Gói'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Họ và Tên Người Khám:</span>
                  <strong className="text-slate-800">{registrationInfo.contactName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Độ Tuổi & Giới Tính:</span>
                  <span className="text-slate-800 font-medium">
                    {registrationInfo.age} tuổi • {registrationInfo.gender === 'FEMALE' ? 'Nữ' : 'Nam'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Số Điện Thoại:</span>
                  <span className="text-blue-700 font-semibold">{registrationInfo.contactPhone}</span>
                </div>
                {registrationInfo.insuranceCardNumber && (
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Mã BHYT / CCCD:
                    </span>
                    <span className="font-mono font-bold text-slate-800">{registrationInfo.insuranceCardNumber}</span>
                  </div>
                )}
                {registrationInfo.medicalHistory && (
                  <div className="flex justify-between items-start gap-2 pt-1 border-t border-slate-100">
                    <span className="text-slate-400 shrink-0 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                      Tiền Sử Bệnh Lý:
                    </span>
                    <span className="text-slate-800 text-right font-medium">{registrationInfo.medicalHistory}</span>
                  </div>
                )}
              </div>
            )}

            {registrationInfo.notes && (
              <div className="pt-1.5 border-t border-slate-100 text-[11px] text-slate-500">
                <span className="text-slate-400">Ghi chú:</span> {registrationInfo.notes}
              </div>
            )}
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
