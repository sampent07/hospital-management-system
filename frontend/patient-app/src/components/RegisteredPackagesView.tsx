import React, { useState, useMemo } from 'react';
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
  Building2,
  Users,
  Wallet,
  QrCode
} from 'lucide-react';
import { BookingAppointment, Route, PatientProfile } from '../types';
import { defaultPatientProfilesList } from '../utils/mockImagingData';
import { LiveJourney } from '../pages/LiveJourney';

interface RegisteredPackagesViewProps {
  registeredBookings: BookingAppointment[];
  selectedBooking: BookingAppointment | null;
  onSelectBooking: (booking: BookingAppointment) => void;
  onBackToList: () => void;
  onGoToAdvisor: () => void;
  onGoToAdvisorWithProfile?: (profile: PatientProfile) => void;
  onGoToResults?: () => void;
  onDeleteBooking?: (bookingCode: string) => void;
  currentRoute: Route | null;
  queueNumber?: string;
  profiles?: PatientProfile[];
}

export const RegisteredPackagesView: React.FC<RegisteredPackagesViewProps> = ({
  registeredBookings,
  selectedBooking,
  onSelectBooking,
  onBackToList,
  onGoToAdvisor,
  onGoToAdvisorWithProfile,
  onGoToResults,
  onDeleteBooking,
  currentRoute,
  queueNumber,
  profiles = defaultPatientProfilesList
}) => {
  // Sắp xếp danh sách hồ sơ: Hồ sơ được đánh dấu là Mặc Định (isDefault: true) LUÔN ĐƯỢC XẾP ĐẦU TIÊN
  const sortedProfiles = useMemo(() => {
    const list = profiles && profiles.length > 0 ? [...profiles] : defaultPatientProfilesList;
    return [...list].sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return 0;
    });
  }, [profiles]);

  // ID hồ sơ bệnh nhân đang được chọn để lọc xem gói khám (mặc định chọn hồ sơ mặc định đầu tiên)
  const [selectedProfileFilterId, setSelectedProfileFilterId] = useState<string>(() => {
    return sortedProfiles[0]?.id || 'prof-self';
  });

  // Hồ sơ bệnh nhân đang kích hoạt xem
  const activeProfile = sortedProfiles.find((p) => p.id === selectedProfileFilterId);

  // Đếm số lượng gói khám tương ứng của từng hồ sơ
  const getBookingsCountForProfile = (p: PatientProfile) => {
    return registeredBookings.filter((b) => {
      if (b.profileId) return b.profileId === p.id;
      return b.contactName.trim().toLowerCase() === p.fullName.trim().toLowerCase();
    }).length;
  };

  // Danh sách các gói khám sau khi lọc theo hồ sơ đã chọn
  const displayedBookings = useMemo(() => {
    if (selectedProfileFilterId === 'ALL') {
      return registeredBookings;
    }
    return registeredBookings.filter((b) => {
      if (b.profileId) {
        return b.profileId === selectedProfileFilterId;
      }
      if (activeProfile) {
        return b.contactName.trim().toLowerCase() === activeProfile.fullName.trim().toLowerCase();
      }
      return true;
    });
  }, [registeredBookings, selectedProfileFilterId, activeProfile]);

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

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. KHU VỰC BẮT BUỘC: CHỌN HỒ SƠ ĐỂ XEM GÓI KHÁM (HỒ SƠ MẶC ĐỊNH XẾP ĐẦU TIÊN) */}
      <div className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Chọn Hồ Sơ Bệnh Nhân Để Xem Các Gói Khám</span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {sortedProfiles.length} hồ sơ trong tài khoản
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Hồ sơ mặc định được xếp ưu tiên đầu tiên. Nhấp vào từng thành viên để xem danh sách gói khám & lộ trình tương ứng:
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (activeProfile && onGoToAdvisorWithProfile) {
                onGoToAdvisorWithProfile(activeProfile);
              } else {
                onGoToAdvisor();
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer shrink-0 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Đăng Ký Thêm Gói Mới</span>
          </button>
        </div>

        {/* Danh sách thẻ hồ sơ bệnh nhân dạng ngang (Hồ sơ mặc định xếp đầu tiên) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sortedProfiles.map((p) => {
            const isSelected = p.id === selectedProfileFilterId;
            const count = getBookingsCountForProfile(p);

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProfileFilterId(p.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.gender === 'FEMALE' ? '👩' : '👨'}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-xs font-black text-slate-900 truncate">{p.fullName}</div>
                    {p.isDefault && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-600 text-white shrink-0">
                        ★ Mặc Định
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    <span className="font-semibold text-blue-800">
                      {p.relationshipLabel || (p.relationship === 'SELF' ? 'Bản thân' : 'Người thân')}
                    </span>
                    <span>•</span>
                    <span>{p.age}t</span>
                    <span>•</span>
                    <span>{p.gender === 'FEMALE' ? 'Nữ' : 'Nam'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-bold">
                      {count > 0 ? (
                        <span className="text-blue-900">{count} gói đăng ký</span>
                      ) : (
                        <span className="text-slate-400 font-normal">Chưa có gói</span>
                      )}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200 shadow-2xs">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Đang Xem
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Thẻ Lọc: Tất Cả Thành Viên */}
          <div
            onClick={() => setSelectedProfileFilterId('ALL')}
            className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex items-center gap-3 ${
              selectedProfileFilterId === 'ALL'
                ? 'border-indigo-600 bg-indigo-50/70 shadow-md ring-2 ring-indigo-500/20'
                : 'border-slate-200 bg-slate-50/70 hover:border-slate-300 hover:bg-white'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
                selectedProfileFilterId === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              📑
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black text-slate-900">Tất Cả Thành Viên</div>
              <div className="text-[11px] text-slate-500 font-medium">Toàn bộ hồ sơ gia đình</div>
              <div className="text-xs font-bold text-indigo-700 mt-0.5">
                {registeredBookings.length} gói khám
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THANH TRẠNG THÁI HỒ SƠ ĐANG CHỌN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <span>
              {selectedProfileFilterId === 'ALL'
                ? 'Tất Cả Các Gói Khám Đã Đăng Ký'
                : `Danh Sách Gói Khám Của: ${activeProfile?.fullName} (${activeProfile?.relationshipLabel || 'Bản thân'})`}
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {displayedBookings.length} gói
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhấn vào gói khám bên dưới để xem lộ trình di chuyển và thứ tự các phòng khám tương ứng.
          </p>
        </div>
      </div>

      {/* 3. DANH SÁCH CÁC GÓI KHÁM ĐÃ ĐĂNG KÝ (ĐÃ LỌC THEO HỒ SƠ) */}
      {displayedBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-12 text-center space-y-4 border-2 border-dashed border-slate-200 shadow-sm max-w-2xl mx-auto my-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-black text-slate-800">
              Chưa Có Gói Khám Nào Cho Hồ Sơ "{activeProfile?.fullName || 'thành viên này'}"
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Thành viên này hiện chưa đăng ký gói khám hay dịch vụ lẻ nào. Bạn có thể nhấn nút bên dưới để chọn gói khám sức khỏe phù hợp cho người thân.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (activeProfile && onGoToAdvisorWithProfile) {
                  onGoToAdvisorWithProfile(activeProfile);
                } else {
                  onGoToAdvisor();
                }
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Đăng Ký Khám Cho {activeProfile?.fullName || 'Thành Viên Này'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedBookings.map((booking) => {
            const isCorporate = booking.targetType === 'CORPORATE';
            const isSingle = booking.examMode === 'SINGLE';
            const isCompleted = booking.status === 'COMPLETED';

            // Tìm hồ sơ tương ứng của booking để lấy quan hệ chính xác
            const matchedProfile = profiles.find((p) => {
              if (booking.profileId) return p.id === booking.profileId;
              return p.fullName.trim().toLowerCase() === booking.contactName.trim().toLowerCase();
            });

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

                      {/* Huy hiệu phương thức thanh toán */}
                      {booking.paymentStatus === 'PAID_QR' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1">
                          <QrCode className="w-3 h-3 text-teal-600" />
                          <span>Đã TT VietQR</span>
                        </span>
                      )}
                      {booking.paymentStatus === 'PAY_AT_COUNTER' && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Wallet className="w-3 h-3 text-amber-600" />
                          <span>TT Tại Quầy</span>
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
                          className="text-slate-300 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
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
                      <span className="text-slate-400">
                        {booking.targetType === 'CORPORATE' ? 'Đại diện liên hệ:' : 'Người khám:'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <strong className="text-slate-800">{booking.contactName}</strong>
                        {matchedProfile && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            matchedProfile.relationship === 'SELF'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {matchedProfile.relationshipLabel || (matchedProfile.relationship === 'SELF' ? 'Bản thân' : 'Người thân')}
                          </span>
                        )}
                      </div>
                    </div>

                    {booking.targetType === 'CORPORATE' && (booking.maleEmployees !== undefined || booking.femaleEmployees !== undefined) && (
                      <div className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <span className="text-slate-500">Thành viên khám:</span>
                        <strong className="text-blue-900">
                          Nam: {booking.maleEmployees || 0} ; Nữ: {booking.femaleEmployees || 0}
                          {booking.totalEmployees ? ` (Tổng: ${booking.totalEmployees})` : ''}
                        </strong>
                      </div>
                    )}

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
      )}
    </div>
  );
};
