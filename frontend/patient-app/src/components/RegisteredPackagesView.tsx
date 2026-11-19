import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  PlusCircle,
  Inbox,
  Trash2,
  Navigation,
  Sparkles,
  Building2
} from 'lucide-react';
import { BookingAppointment, Route } from '../types';
import { LiveJourney } from '../pages/LiveJourney';

interface RegisteredPackagesViewProps {
  registeredBookings: BookingAppointment[];
  selectedBooking: BookingAppointment | null;
  onSelectBooking: (booking: BookingAppointment) => void;
  onBackToList: () => void;
  onGoToAdvisor: () => void;
  onGoToResults?: () => void;
  onDeleteBooking?: (bookingCode: string) => void;
  currentRoute: Route | null;
  queueNumber?: string;
}

export const RegisteredPackagesView: React.FC<RegisteredPackagesViewProps> = ({
  registeredBookings,
  selectedBooking,
  onSelectBooking,
  onBackToList,
  onGoToAdvisor,
  onGoToResults,
  onDeleteBooking,
  currentRoute,
  queueNumber
}) => {
  // NẾU ĐANG CHỌN MỘT GÓI ĐÃ ĐĂNG KÝ -> HIỂN THỊ LỘ TRÌNH KHÁM TƯƠNG ỨNG
  if (selectedBooking) {
    const isCompleted = selectedBooking.status === 'COMPLETED';

    return (
      <div className="space-y-5 animate-in fade-in duration-200">
        {/* Thanh Điều Hướng Trên Cùng Của Lộ Trình */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToList}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 text-xs font-bold transition-all cursor-pointer group shrink-0"
              title="Quay lại danh sách các gói đã đăng ký"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Quay Lại Danh Sách Gói</span>
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isCompleted ? '✓ Đã Hoàn Thành' : 'Đã Đăng Ký Thành Công'}
                </span>
                <span className="font-mono text-xs font-bold text-slate-500 truncate">
                  #{selectedBooking.bookingCode}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 truncate mt-0.5">
                {selectedBooking.packageName}
              </h2>
            </div>
          </div>

          {/* Tag Thời Gian Đã Đăng Ký Khám */}
          <div className="flex items-center gap-2 sm:gap-3 bg-blue-50 border border-blue-200 p-2.5 rounded-2xl text-xs text-blue-900 shrink-0">
            <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800">{selectedBooking.appointmentDate}</span>
              <span className="text-blue-600 font-semibold block text-[11px]">{selectedBooking.timeSlot}</span>
            </div>
          </div>
        </div>

        {/* LỘ TRÌNH KHÁM CHI TIẾT TƯƠNG ỨNG VỚI GÓI ĐÃ ĐĂNG KÝ */}
        <LiveJourney currentRoute={currentRoute} queueNumber={queueNumber} onGoToResults={onGoToResults} />
      </div>
    );
  }

  // TRƯỜNG HỢP 1: BAN ĐẦU CHƯA CÓ GÓI NÀO ĐĂNG KÝ -> HIỂN THỊ KHÔNG CÓ DỮ LIỆU
  if (registeredBookings.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-14 text-center space-y-5 border-2 border-dashed border-slate-300 shadow-sm animate-in fade-in duration-300 max-w-2xl mx-auto my-6">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Inbox className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-slate-800">
            Không Có Dữ Liệu Gói Khám Đã Đăng Ký
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
            Hiện tại bạn chưa có gói khám hoặc dịch vụ nào được đăng ký thành công.
            Vui lòng nhấn nút bên dưới để chọn gói khám sức khỏe phù hợp và hệ thống sẽ tự động tạo lộ trình khám tối ưu cho bạn!
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={onGoToAdvisor}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Đăng Ký Gói Khám Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: ĐÃ CÓ GÓI KHÁM ĐĂNG KÝ -> HIỂN THỊ DANH SÁCH CÁC GÓI KÈM THỜI GIAN ĐÃ ĐĂNG KÝ
  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Tiêu Đề Danh Sách & Nút Đăng Ký Thêm */}
      <div className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Các Gói Khám Đã Đăng Ký Thành Công
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {registeredBookings.length} gói
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Nhấn vào gói khám bên dưới để xem lộ trình di chuyển và thứ tự các phòng khám tương ứng.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToAdvisor}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-2xl border border-blue-200 text-xs transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Đăng Ký Thêm Gói Mới</span>
        </button>
      </div>

      {/* Danh Sách Các Thẻ Gói Khám Đã Đăng Ký */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {registeredBookings.map((booking) => {
          const isCorporate = booking.targetType === 'CORPORATE';
          const isSingle = booking.examMode === 'SINGLE';
          const isCompleted = booking.status === 'COMPLETED';

          return (
            <div
              key={booking.bookingCode}
              onClick={() => onSelectBooking(booking)}
              className={`bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group cursor-pointer relative overflow-hidden ${
                isCompleted
                  ? 'border-emerald-200 hover:border-emerald-400 bg-gradient-to-b from-white via-white to-emerald-50/20'
                  : 'border-blue-100 hover:border-blue-400'
              }`}
            >
              {/* Thanh màu bên cạnh */}
              <div
                className={`absolute top-0 left-0 right-0 h-1.5 ${
                  isCompleted
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                }`}
              />

              <div className="space-y-4">
                {/* Dòng Header: Huy hiệu loại khám & Mã đặt lịch */}
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                        isCorporate
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : isSingle
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isCorporate ? (
                        <>
                          <Building2 className="w-3 h-3" />
                          <span>Doanh Nghiệp</span>
                        </>
                      ) : isSingle ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Khám Lẻ Tự Chọn</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3" />
                          <span>Khám Cá Nhân</span>
                        </>
                      )}
                    </span>

                    {isCompleted ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>✓ Đã Hoàn Thành</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ✓ Đã Xác Nhận
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-xs font-bold px-2 py-0.5 rounded-lg border ${
                        isCompleted
                          ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                          : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                      }`}
                    >
                      #{booking.bookingCode}
                    </span>

                    {onDeleteBooking && !isCompleted && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Bạn có chắc muốn hủy gói khám #${booking.bookingCode}?`)) {
                            onDeleteBooking(booking.bookingCode);
                          }
                        }}
                        className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hủy lịch khám này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Tên Gói Khám */}
                <div>
                  <h3
                    className={`text-base font-extrabold transition-colors leading-snug ${
                      isCompleted ? 'text-slate-900 group-hover:text-emerald-700' : 'text-slate-900 group-hover:text-blue-700'
                    }`}
                  >
                    {booking.packageName}
                  </h3>
                  {booking.companyName && (
                    <div className="text-xs text-slate-500 mt-0.5 font-medium flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.companyName}</span>
                    </div>
                  )}
                </div>

                {/* KHUNG THỜI GIAN ĐÃ ĐĂNG KÝ KHÁM */}
                <div
                  className={`p-3.5 rounded-2xl border space-y-2 ${
                    isCompleted
                      ? 'bg-gradient-to-br from-emerald-50/70 to-teal-50/70 border-emerald-200'
                      : 'bg-gradient-to-br from-blue-50/80 to-indigo-50/80 border-blue-200'
                  }`}
                >
                  <div
                    className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isCompleted ? 'text-emerald-800' : 'text-blue-700'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Thời Gian Đã Đăng Ký Khám</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Ngày khám:</span>
                      <strong className={isCompleted ? 'text-emerald-900' : 'text-slate-900'}>
                        {booking.appointmentDate}
                      </strong>
                    </div>

                    <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[11px] text-slate-400 block mb-0.5">Khung giờ:</span>
                      <strong className={isCompleted ? 'text-emerald-700' : 'text-blue-600'}>
                        {booking.timeSlot}
                      </strong>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1 pt-0.5">
                    <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCompleted ? 'text-emerald-600' : 'text-blue-600'}`} />
                    <span className="truncate">{booking.facilityName}</span>
                  </div>
                </div>

                {/* Thông Tin Người Khám / Dịch Vụ Đi Kèm */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Người khám:</span>
                    <strong className="text-slate-800">{booking.contactName}</strong>
                  </div>

                  {booking.selectedServices && booking.selectedServices.length > 0 && (
                    <div>
                      <span className="text-slate-400 block mb-1">
                        Dịch vụ đã chọn ({booking.selectedServices.length}):
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {booking.selectedServices.slice(0, 3).map((s) => (
                          <span
                            key={s.id}
                            className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200"
                          >
                            {s.name}
                          </span>
                        ))}
                        {booking.selectedServices.length > 3 && (
                          <span className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                            +{booking.selectedServices.length - 3} dịch vụ khác
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút Bấm Xem Lộ Trình */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  {booking.totalPrice ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block">Chi phí:</span>
                      <span className="text-xs font-bold text-slate-800">
                        {booking.totalPrice.toLocaleString('vi-VN')} VNĐ
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Lộ trình đã sẵn sàng
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onSelectBooking(booking)}
                  className={`py-2.5 px-4 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      : 'bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-md group-hover:shadow-blue-500/20'
                  }`}
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Xem Lộ Trình Khám Này</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
