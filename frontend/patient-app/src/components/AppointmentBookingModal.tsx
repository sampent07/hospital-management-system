import React, { useState } from 'react';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Info,
  CalendarCheck,
  User,
  Building2,
  ShieldCheck,
  Stethoscope,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  CreditCard,
  Wallet,
  Timer
} from 'lucide-react';
import { PackageDetail, BookingAppointment, SingleServiceItem } from '../types';

export interface RegistrationInfo {
  contactName: string;
  contactPhone: string;
  relationship?: string;
  relationshipLabel?: string;
  profileId?: string;
  age?: number;
  gender?: string;
  insuranceCardNumber?: string;
  medicalHistory?: string;
  companyName?: string;
  employeeScale?: string;
  maleEmployees?: number;
  femaleEmployees?: number;
  totalEmployees?: number;
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
  selectedServices = []
}) => {
  // Bước của Modal: 'SCHEDULE' (chọn ngày giờ & cơ sở) -> 'PAYMENT' (thanh toán QR mô phỏng hoặc quầy)
  const [modalStep, setModalStep] = useState<'SCHEDULE' | 'PAYMENT'>('SCHEDULE');

  const [facility, setFacility] = useState<'CS1' | 'CS2'>('CS1');

  // Mặc định chọn ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [appointmentDate, setAppointmentDate] = useState<string>(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState<string>('08:30 - 10:00');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // State thanh toán mô phỏng
  const [paymentMethod, setPaymentMethod] = useState<'VIETQR' | 'COUNTER'>('VIETQR');
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [generatedBookingCode] = useState<string>(() => `DK-${Math.floor(100000 + Math.random() * 900000)}`);

  if (!isOpen) return null;

  const isSingle = examMode === 'SINGLE';
  const isCorporate = !isSingle && packageData?.targetType === 'CORPORATE';

  const singleTotalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const finalPrice = isSingle ? singleTotalPrice : (packageData?.basePrice || 0);

  // Kiểm tra nếu chọn ngày rơi vào Thứ 7 hoặc Chủ Nhật
  const selectedDay = new Date(appointmentDate).getDay(); // 0: Chủ Nhật, 6: Thứ 7
  const isWeekend = selectedDay === 0 || selectedDay === 6;

  const morningSlots = ['07:00 - 08:30', '08:30 - 10:00', '10:00 - 11:30'];
  const afternoonSlots = ['13:30 - 15:00', '15:00 - 16:30'];

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

  // Chuẩn hóa tên không dấu cho cú pháp chuyển khoản
  const normalizedName = registrationInfo.contactName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .trim();
  const transferContent = `${generatedBookingCode} ${normalizedName}`.trim();

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 1800);
  };

  // Bước 1: Kiểm tra lịch khám & chuyển sang bước Thanh Toán
  const handleProceedToPayment = (e: React.FormEvent) => {
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

    // Chuyển sang bước thanh toán
    setModalStep('PAYMENT');
  };

  // Bước 2: Hoàn tất thanh toán & Xác nhận đặt lịch
  const handleFinalConfirmBooking = (isPaidQr: boolean) => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const newBooking: BookingAppointment = {
        packageId: isSingle ? undefined : packageData?.id,
        packageName: isSingle
          ? `Khám Lẻ (${selectedServices.length} dịch vụ)`
          : packageData?.name || 'Gói Khám Sức Khỏe',
        targetType: isCorporate ? 'CORPORATE' : 'INDIVIDUAL',
        examMode: examMode,
        selectedServices: isSingle ? selectedServices : undefined,
        totalPrice: finalPrice,
        facilityId: facility,
        facilityName: facilityDetails[facility].name,
        facilityAddress: facilityDetails[facility].address,
        appointmentDate,
        timeSlot,
        contactName: registrationInfo.contactName,
        contactPhone: registrationInfo.contactPhone,
        relationship: registrationInfo.relationship,
        relationshipLabel: registrationInfo.relationshipLabel,
        profileId: registrationInfo.profileId,
        patientAge: registrationInfo.age,
        patientGender: registrationInfo.gender,
        insuranceCardNumber: registrationInfo.insuranceCardNumber,
        medicalHistory: registrationInfo.medicalHistory,
        companyName: isCorporate ? registrationInfo.companyName : undefined,
        estimatedEmployees: isCorporate ? registrationInfo.employeeScale : undefined,
        maleEmployees: isCorporate ? registrationInfo.maleEmployees : undefined,
        femaleEmployees: isCorporate ? registrationInfo.femaleEmployees : undefined,
        totalEmployees: isCorporate ? registrationInfo.totalEmployees : undefined,
        email: registrationInfo.email,
        notes: registrationInfo.notes,
        bookingCode: generatedBookingCode,
        status: 'CONFIRMED',
        paymentStatus: isPaidQr ? 'PAID_QR' : 'PAY_AT_COUNTER',
        paymentMethod: isPaidQr ? 'VIETQR' : 'COUNTER',
        paidAt: isPaidQr ? new Date().toISOString() : undefined
      };

      onConfirmBooking(newBooking);
    }, isPaidQr ? 900 : 300);
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
                {modalStep === 'SCHEDULE'
                  ? isSingle
                    ? 'Bước 1/2: Đặt Lịch Khám Lẻ'
                    : 'Bước 1/2: Đặt Lịch Khám Bệnh'
                  : 'Bước 2/2: Thanh Toán Viện Phí'}
              </span>
              <span className="text-xs text-slate-500 font-medium font-mono">
                #{generatedBookingCode}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">
              {modalStep === 'SCHEDULE'
                ? 'Chọn Cơ Sở & Thời Gian Khám'
                : 'Thanh Toán Viện Phí (Quét Mã QR Mô Phỏng)'}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-1">
              {isSingle ? (
                <span>
                  Khám lẻ {selectedServices.length} dịch vụ • Tổng phí:{' '}
                  <strong className="text-blue-700">{singleTotalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                </span>
              ) : (
                <span>
                  Gói khám: <strong className="text-blue-700">{packageData?.name}</strong> •{' '}
                  <strong className="text-emerald-700">{finalPrice.toLocaleString('vi-VN')} VNĐ</strong>
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

        {/* ===================== BƯỚC 1: CHỌN CƠ SỞ & LỊCH KHÁM ===================== */}
        {modalStep === 'SCHEDULE' && (
          <form onSubmit={handleProceedToPayment} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
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
                <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-xs space-y-1">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span>Thứ 2 – Thứ 6:</span>
                    <span className="text-blue-600 font-black">07:00 – 17:00</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Tiếp nhận đầy đủ tất cả chuyên khoa, xét nghiệm & CĐHA cả ngày. (Nghỉ trưa: 12:00 – 13:00)
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-blue-100 shadow-xs space-y-1">
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

            {/* 4. TÓM TẮT THÔNG TIN ĐÃ ĐĂNG KÝ */}
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
                  {(registrationInfo.maleEmployees !== undefined || registrationInfo.femaleEmployees !== undefined) && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Thành viên khám:</span>
                      <strong className="text-blue-800">
                        Nam: {registrationInfo.maleEmployees || 0} ; Nữ: {registrationInfo.femaleEmployees || 0}
                        {registrationInfo.totalEmployees ? ` (Tổng: ${registrationInfo.totalEmployees})` : ''}
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Họ và Tên Người Khám:</span>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-slate-800">{registrationInfo.contactName}</strong>
                      {registrationInfo.relationshipLabel && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                          {registrationInfo.relationshipLabel}
                        </span>
                      )}
                    </div>
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
                </div>
              )}
            </div>

            {/* Footer nút chuyển sang bước thanh toán */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Tiếp Tục: Chọn Phương Thức Thanh Toán</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* ===================== BƯỚC 2: THANH TOÁN QR MÔ PHỎNG ===================== */}
        {modalStep === 'PAYMENT' && (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-slate-700 text-xs">
            {/* Phương Thức Thanh Toán */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Chọn Hình Thức Thanh Toán Viện Phí</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Cách 1: Quét mã QR (Khuyên dùng) */}
                <div
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                    paymentMethod === 'VIETQR'
                      ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <QrCode className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-slate-900 text-xs">Quét Mã VietQR (Mô Phỏng)</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Chuyển khoản tức thì qua ứng dụng ngân hàng hoặc ví điện tử (MoMo, ZaloPay).
                      </p>
                    </div>
                    {paymentMethod === 'VIETQR' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md w-fit">
                    Khuyên dùng • Tiết kiệm thời gian
                  </span>
                </div>

                {/* Cách 2: Thanh toán tại quầy */}
                <div
                  onClick={() => setPaymentMethod('COUNTER')}
                  className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                    paymentMethod === 'COUNTER'
                      ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white hover:border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4 h-4 text-slate-700" />
                        <span className="font-bold text-slate-900 text-xs">Thanh Toán Tại Quầy Thu Ngân</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug">
                        Đóng tiền mặt hoặc quẹt thẻ POS trực tiếp tại quầy tiếp đón khi đến khám.
                      </p>
                    </div>
                    {paymentMethod === 'COUNTER' && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                  </div>
                  <span className="text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md w-fit">
                    Thanh toán khi tới bệnh viện
                  </span>
                </div>
              </div>
            </div>

            {/* Chi tiết cho phương thức VietQR */}
            {paymentMethod === 'VIETQR' && (
              <div className="p-4 sm:p-5 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/40 rounded-3xl border-2 border-blue-200 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-blue-100">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-xl">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-xs">Cổng Thanh Toán Napas 247 • VietQR</div>
                      <div className="text-[10px] text-slate-500">Mã giao dịch đặt cọc & viện phí Smart OPD</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Hiệu lực: 14:59</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                  {/* Cột Trái: Mô phỏng hình ảnh VietQR chuẩn */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-slate-200 shadow-sm space-y-2">
                    {/* Header QR */}
                    <div className="flex items-center justify-between w-full px-2 text-[10px] font-black tracking-wider text-blue-900">
                      <span>VIETQR</span>
                      <span className="text-red-600">NAPAS 247</span>
                    </div>

                    {/* Khung Mã QR SVG Trực Quan */}
                    <div className="p-2.5 bg-white border border-slate-300 rounded-xl relative group">
                      <svg
                        className="w-40 h-40 sm:w-44 sm:h-44 text-slate-900"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* 3 góc định vị chuẩn QR Code */}
                        {/* Góc trên trái */}
                        <rect x="5" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                        <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="13" width="10" height="10" rx="1.5" fill="#2563eb" />

                        {/* Góc trên phải */}
                        <rect x="69" y="5" width="26" height="26" rx="4" fill="#0f172a" />
                        <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
                        <rect x="77" y="13" width="10" height="10" rx="1.5" fill="#2563eb" />

                        {/* Góc dưới trái */}
                        <rect x="5" y="69" width="26" height="26" rx="4" fill="#0f172a" />
                        <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
                        <rect x="13" y="77" width="10" height="10" rx="1.5" fill="#2563eb" />

                        {/* Các điểm dữ liệu ma trận QR mô phỏng */}
                        <rect x="36" y="8" width="5" height="5" fill="#0f172a" />
                        <rect x="46" y="8" width="5" height="5" fill="#0f172a" />
                        <rect x="56" y="8" width="5" height="5" fill="#0f172a" />
                        <rect x="36" y="18" width="5" height="5" fill="#0f172a" />
                        <rect x="51" y="18" width="5" height="5" fill="#0f172a" />
                        <rect x="41" y="28" width="5" height="5" fill="#0f172a" />
                        <rect x="56" y="28" width="5" height="5" fill="#0f172a" />

                        {/* Đường sọc giữa */}
                        <rect x="8" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="18" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="28" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="38" y="38" width="5" height="5" fill="#2563eb" />
                        <rect x="48" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="58" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="68" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="78" y="38" width="5" height="5" fill="#0f172a" />
                        <rect x="88" y="38" width="5" height="5" fill="#0f172a" />

                        <rect x="8" y="48" width="5" height="5" fill="#0f172a" />
                        <rect x="28" y="48" width="5" height="5" fill="#0f172a" />
                        <rect x="38" y="48" width="5" height="5" fill="#0f172a" />
                        <rect x="48" y="48" width="5" height="5" fill="#2563eb" />
                        <rect x="68" y="48" width="5" height="5" fill="#0f172a" />
                        <rect x="88" y="48" width="5" height="5" fill="#0f172a" />

                        <rect x="18" y="58" width="5" height="5" fill="#0f172a" />
                        <rect x="38" y="58" width="5" height="5" fill="#0f172a" />
                        <rect x="58" y="58" width="5" height="5" fill="#0f172a" />
                        <rect x="78" y="58" width="5" height="5" fill="#0f172a" />

                        <rect x="36" y="69" width="5" height="5" fill="#0f172a" />
                        <rect x="46" y="69" width="5" height="5" fill="#0f172a" />
                        <rect x="56" y="69" width="5" height="5" fill="#0f172a" />
                        <rect x="76" y="69" width="5" height="5" fill="#0f172a" />
                        <rect x="86" y="69" width="5" height="5" fill="#0f172a" />

                        <rect x="36" y="79" width="5" height="5" fill="#0f172a" />
                        <rect x="51" y="79" width="5" height="5" fill="#0f172a" />
                        <rect x="66" y="79" width="5" height="5" fill="#0f172a" />
                        <rect x="86" y="79" width="5" height="5" fill="#0f172a" />

                        {/* Logo trung tâm Smart OPD */}
                        <circle cx="50" cy="50" r="10" fill="#2563eb" />
                        <path
                          d="M45 50 L48 50 L49 46 L51 54 L52 50 L55 50"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    <div className="text-center text-[10px] text-slate-500 font-medium">
                      Mở App Ngân hàng bất kỳ để quét
                    </div>
                  </div>

                  {/* Cột Phải: Thông tin số tài khoản & Nội dung chuyển khoản */}
                  <div className="md:col-span-7 space-y-2.5">
                    {/* Số tiền cần thanh toán */}
                    <div className="p-3 bg-white rounded-2xl border border-blue-200 shadow-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Tổng Số Tiền Cần Thanh Toán:
                      </span>
                      <div className="flex items-center justify-between">
                        <span className="text-base sm:text-lg font-black text-blue-700">
                          {finalPrice.toLocaleString('vi-VN')} VNĐ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyText(finalPrice.toString(), 'amount')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Sao chép số tiền"
                        >
                          {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'amount' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Ngân hàng & Số tài khoản */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Ngân hàng:</span>
                        <strong className="text-slate-800">Vietcombank (CN TP.HCM)</strong>
                      </div>

                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Chủ tài khoản:</span>
                        <strong className="text-slate-800 uppercase font-mono">BENH VIEN DA KHOA SMART OPD</strong>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Số tài khoản nhận:</span>
                          <span className="font-mono font-black text-sm text-slate-900">1029 3847 56</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText('1029384756', 'account')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          {copiedField === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'account' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>

                      {/* Nội dung chuyển khoản */}
                      <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                        <div className="min-w-0 pr-2">
                          <span className="text-[10px] text-slate-400 block">Nội dung CK bắt buộc:</span>
                          <span className="font-mono font-black text-xs text-blue-700 truncate block">
                            {transferContent}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyText(transferContent, 'content')}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-blue-600 px-2 py-1 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        >
                          {copiedField === 'content' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedField === 'content' ? 'Đã chép' : 'Sao chép'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-blue-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Hệ thống sẽ tự động đối soát và kích hoạt lộ trình khám ngay sau khi nhận được thông báo biến động số dư.
                  </span>
                </div>
              </div>
            )}

            {/* Chi tiết cho phương thức Thanh Toán Tại Quầy */}
            {paymentMethod === 'COUNTER' && (
              <div className="p-4 sm:p-5 bg-slate-50 rounded-3xl border border-slate-200 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-2xl shrink-0 mt-0.5">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">
                      Thanh Toán Trực Tiếp Tại Quầy Tiếp Đón / Thu Ngân Bệnh Viện
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Bạn có thể thanh toán bằng tiền mặt, thẻ ngân hàng ATM/Visa/MasterCard hoặc quét QR trực tiếp khi đến bệnh viện vào ngày{' '}
                      <strong className="text-slate-900">{appointmentDate}</strong> ({timeSlot}).
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã đặt khám giữ chỗ:</span>
                    <strong className="font-mono text-blue-700 font-bold">#{generatedBookingCode}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa điểm tiếp đón:</span>
                    <span className="text-slate-800 font-medium">{facilityDetails[facility].name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng chi phí dự kiến:</span>
                    <strong className="text-slate-900 font-black">{finalPrice.toLocaleString('vi-VN')} VNĐ</strong>
                  </div>
                </div>

                <p className="text-[11px] text-amber-700 italic">
                  * Vui lòng có mặt tại quầy lễ tân trước khung giờ khám khoảng 15 phút để hoàn tất thủ tục và nhận số thứ tự khám ưu tiên.
                </p>
              </div>
            )}

            {/* Footer nút hành động */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setModalStep('SCHEDULE')}
                className="px-4 py-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay Lại Chọn Giờ</span>
              </button>

              <div className="flex items-center gap-2">
                {paymentMethod === 'VIETQR' ? (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => handleFinalConfirmBooking(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Kiểm Tra Giao Dịch VietQR...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tôi Đã Quét Mã & Thanh Toán Thành Công</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isProcessingPayment}
                    onClick={() => handleFinalConfirmBooking(false)}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang Xác Nhận Lịch Khám...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Xác Nhận Đăng Ký (Thanh Toán Tại Quầy)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
