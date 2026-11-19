import React, { useState } from 'react';
import {
  CalendarClock,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  QrCode,
  Printer,
  Calendar,
  Building2,
  FileText,
  ShieldCheck,
  Info
} from 'lucide-react';
import { DoctorFollowUpAppointment } from '../types';

// Danh sách lịch hẹn tái khám mẫu do Bác sĩ chỉ định
const mockFollowUpAppointments: DoctorFollowUpAppointment[] = [
  {
    id: 'apt-001',
    appointmentCode: 'TH-20261125-0101',
    appointmentDate: '25/11/2026',
    appointmentTime: '08:30',
    dayOfWeek: 'Thứ Hai',
    doctorName: 'BSCKII. Trần Hoàng Nam',
    doctorTitle: 'Trưởng khoa Nội Tiêu Hóa',
    department: 'Khoa Khám Bệnh & Nội Tiêu Hóa',
    roomNumber: 'Phòng 101 - Tầng 1 (Khu Chuyên Khoa)',
    facilityName: 'Bệnh viện Đa Khoa Smart OPD (Cơ sở 1)',
    facilityAddress: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
    purpose: 'Tái khám đánh giá tiệt trừ vi khuẩn HP bằng test hơi thở C14 và kiểm tra niêm mạc hang vị sau 4 tuần dùng thuốc.',
    originalExamDate: '15/10/2026',
    originalRecordCode: 'HSBA-20261015-88',
    preparationInstructions: [
      'Nhịn ăn và nhịn uống sữa, nước ngọt từ 22:00 tối hôm trước (được uống một ít nước lọc).',
      'Ngừng uống thuốc dạ dày (kháng sinh, giảm tiết acid) trước ngày xét nghiệm theo đúng chỉ dẫn của bác sĩ.',
      'Mang theo đơn thuốc cũ và vỏ các vỉ thuốc đã uống hết để bác sĩ đối chiếu.',
      'Mang theo Thẻ BHYT và CCCD gắn chip để được tiếp đón theo luồng ưu tiên tại Kiosk.'
    ],
    status: 'UPCOMING',
    isDoctorAssignedOnly: true,
    notes: 'Bệnh nhân có tiền sử đau dạ dày khi đói, cần ưu tiên làm test hơi thở sớm trong khung giờ 08:30 - 09:15.'
  },
  {
    id: 'apt-002',
    appointmentCode: 'TH-20260820-0084',
    appointmentDate: '20/08/2026',
    appointmentTime: '09:00',
    dayOfWeek: 'Thứ Năm',
    doctorName: 'BSCKI. Nguyễn Thị Mai',
    doctorTitle: 'Bác sĩ chuyên khoa Tim Mạch & Nội Tiết',
    department: 'Khoa Nội Tim Mạch',
    roomNumber: 'Phòng 102 - Tầng 1',
    facilityName: 'Bệnh viện Đa Khoa Smart OPD (Cơ sở 1)',
    facilityAddress: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
    purpose: 'Tái khám định kỳ theo dõi chỉ số huyết áp và lipid máu sau 3 tháng điều chỉnh chế độ ăn.',
    originalExamDate: '22/05/2026',
    originalRecordCode: 'HSBA-20260522-42',
    preparationInstructions: [
      'Nhịn ăn sáng để lấy mẫu xét nghiệm mỡ máu và đường huyết.',
      'Nghỉ ngơi yên tĩnh 15 phút trước khi vào phòng đo huyết áp.'
    ],
    status: 'COMPLETED',
    isDoctorAssignedOnly: true,
    notes: 'Đã hoàn tất khám, huyết áp 120/78 mmHg ổn định.'
  }
];

export const FollowUpAppointmentsView: React.FC = () => {
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorFollowUpAppointment>(
    mockFollowUpAppointments[0]
  );
  const [showQrModal, setShowQrModal] = useState(false);

  const upcomingAppointments = mockFollowUpAppointments.filter((a) => a.status === 'UPCOMING');
  const pastAppointments = mockFollowUpAppointments.filter((a) => a.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* 1. Header Trang Hẹn Tái Khám */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-xl mb-2 border border-blue-200">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>Chỉ Định Y Khoa Từ Bác Sĩ</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Lịch Hẹn Tái Khám
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Danh sách các lịch hẹn tái khám được Bác sĩ điều trị thiết lập theo phác đồ theo dõi bệnh
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 bg-blue-600 text-white rounded-xl shadow-sm">
            {upcomingAppointments.length} Lịch Hẹn Sắp Tới
          </span>
        </div>
      </div>

      {/* 2. CẢNH BÁO QUY TẮC Y TẾ: BÁC SĨ ĐẶT LỊCH, BỆNH NHÂN KHÔNG TỰ ĐẶT ĐƯỢC */}
      <div className="p-4 md:p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-3xl shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Quy Định Về Lịch Hẹn Tái Khám:</span>
        </div>
        <p className="text-xs md:text-sm text-amber-900 leading-relaxed">
          <strong>Lịch hẹn tái khám do Bác sĩ điều trị trực tiếp chỉ định</strong> sau khi kết thúc đợt khám bệnh để theo dõi hiệu quả dùng thuốc và đáp ứng phác đồ y khoa.
          <span className="block mt-1 text-xs text-amber-800">
            (*) <em>Bệnh nhân không thể tự ý tạo lịch hẹn hay chọn bác sĩ tại mục này.</em> Quý khách vui lòng đến đúng ngày giờ và tuân thủ các bước chuẩn bị bên dưới để kết quả kiểm tra chính xác nhất.
          </span>
        </p>
      </div>

      {/* 3. Lịch Hẹn Tái Khám Sắp Tới Nổi Bật */}
      {upcomingAppointments.length > 0 ? (
        <div className="bg-white rounded-3xl border-2 border-blue-300 shadow-md shadow-blue-500/5 overflow-hidden">
          {/* Header Card Hẹn */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 md:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                  Lịch Tái Khám Đã Xác Nhận
                </span>
                <h2 className="text-lg md:text-xl font-black">
                  {selectedAppointment.appointmentTime} • {selectedAppointment.dayOfWeek}, {selectedAppointment.appointmentDate}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className="text-xs font-mono font-bold bg-white text-blue-800 px-3 py-1.5 rounded-xl shadow-xs">
                Mã Phiếu: {selectedAppointment.appointmentCode}
              </span>
              <button
                onClick={() => setShowQrModal(true)}
                title="Xem mã QR tiếp nhận"
                className="p-2 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors cursor-pointer text-white"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-5 md:p-6 space-y-6">
            {/* Hàng Thông Tin Bác Sĩ & Phòng Khám */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Bác sĩ phụ trách:</span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  <span>{selectedAppointment.doctorName}</span>
                </div>
                <div className="text-xs text-slate-500">{selectedAppointment.doctorTitle}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Địa điểm & Phòng khám:</span>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>{selectedAppointment.roomNumber}</span>
                </div>
                <div className="text-xs text-slate-500">{selectedAppointment.facilityName}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 block">Đợt khám gốc liên quan:</span>
                <div className="text-sm font-bold text-blue-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Khám ngày {selectedAppointment.originalExamDate}</span>
                </div>
                <div className="text-xs font-mono text-slate-500">Mã BA: {selectedAppointment.originalRecordCode}</div>
              </div>
            </div>

            {/* Mục Đích Tái Khám */}
            <div className="p-4 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Nội Dung & Mục Đích Tái Khám Do Bác Sĩ Chỉ Định</span>
              </div>
              <p className="text-xs md:text-sm text-slate-800 font-medium leading-relaxed">
                {selectedAppointment.purpose}
              </p>
              {selectedAppointment.notes && (
                <div className="text-xs text-slate-600 italic pt-1">
                  * Ghi chú y tế: {selectedAppointment.notes}
                </div>
              )}
            </div>

            {/* Hướng Dẫn Chuẩn Bị Trước Khi Đến (Checklist) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Hướng Dẫn Chuẩn Bị Y Tế Trước Khi Đến Tái Khám:</span>
              </h3>

              <div className="space-y-2">
                {selectedAppointment.preparationInstructions.map((instruction, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200/80 flex items-start gap-2.5 text-xs text-slate-800"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{instruction}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nút In Phiếu Hẹn */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Đến quầy tiếp nhận trước 15 phút để lấy số thứ tự ưu tiên</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQrModal(true)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-slate-600" />
                  <span>Mã QR Tiếp Nhận</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu Hẹn Tái Khám</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 space-y-2">
          <Clock className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">Không có lịch hẹn tái khám nào đang chờ</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Khi kết thúc đợt khám, nếu cần theo dõi thêm, Bác sĩ điều trị sẽ trực tiếp tạo lịch hẹn và hệ thống sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      {/* 4. Lịch Sử Các Lần Tái Khám Đã Hoàn Thành */}
      {pastAppointments.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Lịch Tái Khám Đã Hoàn Thành Trước Đây
          </h3>

          <div className="space-y-2.5">
            {pastAppointments.map((past) => (
              <div
                key={past.id}
                onClick={() => setSelectedAppointment(past)}
                className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  selectedAppointment.id === past.id ? 'border-blue-400 ring-1 ring-blue-300' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">
                      {past.appointmentDate} • {past.appointmentTime}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Bác sĩ: {past.doctorName} ({past.department})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-[11px] text-slate-600 italic line-clamp-1 max-w-xs">
                    {past.purpose}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    ✓ Đã hoàn tất
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Modal Xem Mã QR Check-in Tái Khám Nhanh Tại Kiosk */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-5 text-center">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">
                Tiếp Nhận Thông Minh Kiosk
              </span>
              <h3 className="text-base font-black text-slate-800 mt-0.5">
                Mã QR Hẹn Tái Khám
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quét mã này tại cây Kiosk hoặc quầy Lễ tân để nhận ngay số thứ tự ưu tiên
              </p>
            </div>

            {/* QR Mockup */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block shadow-inner">
              <div className="w-44 h-44 bg-white border border-slate-300 rounded-xl flex flex-col items-center justify-center gap-2 p-2">
                <QrCode className="w-32 h-32 text-slate-900" />
                <span className="text-[10px] font-mono font-bold text-slate-600">
                  {selectedAppointment.appointmentCode}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1">
              <div><strong>Bệnh nhân:</strong> Lê Văn Hùng</div>
              <div><strong>Thời gian:</strong> {selectedAppointment.appointmentTime} - {selectedAppointment.appointmentDate}</div>
              <div><strong>Bác sĩ:</strong> {selectedAppointment.doctorName}</div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
