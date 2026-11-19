import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  Layers,
  Sparkles,
  Users,
  Activity,
  ChevronRight,
  RotateCw,
  X,
  CheckCircle2,
  LogOut,
  FileText,
  CalendarClock
} from 'lucide-react';
import { PackageAdvisor } from './pages/PackageAdvisor';
import { QueueBoard } from './pages/QueueBoard';
import { Login } from './pages/Login';
import { RouteDecisionModal } from './components/RouteDecisionModal';
import { RegisteredPackagesView } from './components/RegisteredPackagesView';
import { PatientProfileView } from './components/PatientProfileView';
import { MedicalResultsView } from './components/MedicalResultsView';
import { FollowUpAppointmentsView } from './components/FollowUpAppointmentsView';
import { buildRouteForBooking } from './utils/routeGenerator';
import { PatientUser, Route, BookingAppointment, PatientProfile } from './types';

export const pastCompletedBooking: BookingAppointment = {
  packageId: 'pkg-digestive-general',
  packageName: 'Gói Khám Tổng Quát Định Kỳ & Chuyên Sâu Tiêu Hóa',
  targetType: 'INDIVIDUAL',
  examMode: 'PACKAGE',
  totalPrice: 2450000,
  facilityId: 'CS1',
  facilityName: 'Bệnh viện Đa Khoa Smart OPD (Cơ sở 1 - Quận 5)',
  facilityAddress: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
  appointmentDate: '2026-10-15',
  timeSlot: '07:30 - 10:30',
  contactName: 'Lê Văn Hùng',
  contactPhone: '0909 123 456',
  patientAge: 38,
  patientGender: 'Nam',
  insuranceCardNumber: 'DN 4 79 20261111',
  medicalHistory: 'Tăng huyết áp; Đau dạ dày / Tiêu hóa',
  bookingCode: 'DK-20261015-88',
  status: 'COMPLETED',
  resultRecordCode: 'HSBA-20261015-88',
  notes: 'Đã hoàn tất 8/8 dịch vụ. Bác sĩ kết luận viêm trợt hang vị HP (+) và kê đơn thuốc 14 ngày.'
};

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<PatientUser | null>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Hồ sơ cá nhân của bệnh nhân (Lưu vào localStorage để dùng tự động đồng bộ khi đăng ký khám)
  const [patientProfile, setPatientProfile] = useState<PatientProfile>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_profile');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      fullName: currentUser?.fullName || 'Lê Văn Hùng',
      phone: '0909 123 456',
      age: currentUser?.age || 38,
      gender: currentUser?.gender === 'Nữ' ? 'FEMALE' : 'MALE',
      insuranceCard: 'DN 4 79 20261111',
      idCardNumber: '079088012345',
      selectedDiseases: [],
      medicalHistoryDetail: '',
      maritalStatus: 'MARRIED',
      address: 'Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      personalNotes: ''
    };
  });

  // Tab đang hoạt động: 'profile' (Hồ Sơ Cá Nhân), 'packages' (Các Gói Khám Đã Đăng Ký), 'advisor' (Đăng Ký Gói Khám), 'results' (Kết Quả Khám), 'appointments' (Hẹn Tái Khám), 'queues' (Bảng Chờ Viện)
  const [activeTab, setActiveTab] = useState<'profile' | 'packages' | 'advisor' | 'results' | 'appointments' | 'queues'>('packages');

  // Danh sách các gói khám / dịch vụ lẻ đã đăng ký thành công
  // Bao gồm gói khám trong quá khứ đã hoàn thành (15/10/2026) đồng bộ với mục Kết Quả Khám
  const [registeredBookings, setRegisteredBookings] = useState<BookingAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_bookings');
      let list: BookingAppointment[] = saved ? JSON.parse(saved) : [];
      const hasPast = list.some((b) => b.bookingCode === pastCompletedBooking.bookingCode);
      if (!hasPast) {
        list = [...list, pastCompletedBooking];
        localStorage.setItem('smart_opd_patient_bookings', JSON.stringify(list));
      } else {
        list = list.map((b) =>
          b.bookingCode === pastCompletedBooking.bookingCode
            ? { ...pastCompletedBooking, ...b, status: 'COMPLETED' }
            : b
        );
      }
      return list;
    } catch {
      return [pastCompletedBooking];
    }
  });

  // Gói khám đã chọn để xem chi tiết lộ trình di chuyển (null thì xem danh sách các gói)
  const [selectedBooking, setSelectedBooking] = useState<BookingAppointment | null>(null);

  // Lộ trình hiện tại tương ứng với gói đã đăng ký
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [proposedRoute, setProposedRoute] = useState<Route | null>(null);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [toastNotice, setToastNotice] = useState<{ title: string; message: string } | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  const showToast = (message: string, title: string = 'Thông Báo') => {
    setToastNotice({ title, message });
  };

  const handleLoginSuccess = (user: PatientUser) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('smart_opd_patient_user', JSON.stringify(user));
    } catch {
      // ignore
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('smart_opd_patient_user');
    } catch {
      // ignore
    }
  };

  // Mẫu lượt khám của bệnh nhân đăng nhập
  const visitId = currentUser?.visitId || 'VK-20261111-001';

  // Tự động đóng thông báo sau 3.5 giây
  useEffect(() => {
    if (toastNotice) {
      const timer = setTimeout(() => {
        setToastNotice(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastNotice]);

  // Cập nhật và lưu hồ sơ cá nhân
  const handleSaveProfile = (newProfile: PatientProfile) => {
    setPatientProfile(newProfile);
    try {
      localStorage.setItem('smart_opd_patient_profile', JSON.stringify(newProfile));
    } catch {
      // ignore
    }

    if (currentUser) {
      const updatedUser: PatientUser = {
        ...currentUser,
        fullName: newProfile.fullName,
        age: newProfile.age,
        gender: newProfile.gender === 'FEMALE' ? 'Nữ' : 'Nam'
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('smart_opd_patient_user', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    }

    showToast('Đã lưu hồ sơ cá nhân thành công! Dữ liệu sẵn sàng tự động điền khi đăng ký.', 'Hồ Sơ Cá Nhân');
  };

  // Xử lý khi bệnh nhân đăng ký thành công một gói khám hoặc khám lẻ mới
  const handleRegisterSuccess = (booking: BookingAppointment) => {
    const updated = [booking, ...registeredBookings.filter((b) => b.bookingCode !== booking.bookingCode)];
    setRegisteredBookings(updated);
    try {
      localStorage.setItem('smart_opd_patient_bookings', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Tự động chọn gói vừa đăng ký và sinh lộ trình tương ứng
    setSelectedBooking(booking);
    const newRoute = buildRouteForBooking(booking, visitId);
    setCurrentRoute(newRoute);
    setActiveTab('packages');

    showToast(
      `Đã đăng ký thành công "${booking.packageName}" (#${booking.bookingCode}) vào ${booking.timeSlot}, ngày ${booking.appointmentDate}. Lộ trình khám đã được khởi tạo!`,
      'Đăng Ký Thành Công'
    );
  };

  // Khi nhấn vào một gói khám trong danh sách đã đăng ký -> Mở lộ trình tương ứng
  const handleSelectBooking = (booking: BookingAppointment) => {
    setSelectedBooking(booking);
    const route = buildRouteForBooking(booking, visitId);
    setCurrentRoute(route);
  };

  // Hủy / xóa một gói đã đăng ký
  const handleDeleteBooking = (bookingCode: string) => {
    const updated = registeredBookings.filter((b) => b.bookingCode !== bookingCode);
    setRegisteredBookings(updated);
    try {
      localStorage.setItem('smart_opd_patient_bookings', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (selectedBooking?.bookingCode === bookingCode) {
      setSelectedBooking(null);
      setCurrentRoute(null);
    }
    showToast(`Đã xóa gói khám #${bookingCode}.`, 'Thông Báo');
  };

  // Yêu cầu tính lại lộ trình tối ưu hơn
  const handleRecalculate = async () => {
    setActiveTab('packages');

    let activeBooking = selectedBooking;
    if (!activeBooking) {
      if (registeredBookings.length > 0) {
        activeBooking = registeredBookings[0];
        setSelectedBooking(activeBooking);
        const r = buildRouteForBooking(activeBooking, visitId);
        setCurrentRoute(r);
      } else {
        showToast('Bạn chưa có gói khám nào đã đăng ký để tìm phương án tối ưu.', 'Lộ Trình Tối Ưu Hơn');
        return;
      }
    }

    setIsRecalculating(true);
    setToastNotice(null);

    try {
      const res = await fetch(`/api/v1/routes/visits/${visitId}/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token`
        },
        body: JSON.stringify({ is_proxy_action: false })
      });

      if (res.ok) {
        const data: Route = await res.json();
        if (data.isBetter && data.steps.length > 0) {
          setProposedRoute(data);
        } else {
          showToast(data.message || 'Lộ trình hiện tại đã tối ưu, bạn không cần thay đổi.');
        }
      } else {
        // Mô phỏng thuật toán AI điều phối tối ưu lại thứ tự phòng khám thực tế
        setTimeout(() => {
          if (currentRoute && currentRoute.steps.length > 0) {
            const reorderedSteps = [...currentRoute.steps];
            if (reorderedSteps.length >= 3) {
              const temp = reorderedSteps[1];
              reorderedSteps[1] = {
                ...reorderedSteps[2],
                stepOrder: 2,
                estimatedWaitSeconds: Math.max(120, Math.floor(reorderedSteps[2].estimatedWaitSeconds * 0.55))
              };
              reorderedSteps[2] = {
                ...temp,
                stepOrder: 3,
                estimatedWaitSeconds: Math.max(180, Math.floor(temp.estimatedWaitSeconds * 0.7))
              };
            }
            const improvedRoute: Route = {
              ...currentRoute,
              id: `route-recalc-${Date.now()}`,
              version: (currentRoute.version || 1) + 1,
              creationReason: 'RECALC_REQUEST',
              suggestionSource: 'AI_RL',
              estimatedTotalDurationSeconds: Math.floor(currentRoute.estimatedTotalDurationSeconds * 0.78),
              steps: reorderedSteps
            };
            setProposedRoute(improvedRoute);
          }
          setIsRecalculating(false);
        }, 1100);
      }
    } catch {
      setIsRecalculating(false);
    }
  };

  // Bệnh nhân chấp nhận lộ trình mới
  const handleAcceptRoute = async (routeId: string) => {
    setIsSubmittingDecision(true);
    try {
      await fetch(`/api/v1/routes/${routeId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token`
        },
        body: JSON.stringify({ decision_type: 'ACCEPTED_NEW', is_proxy_action: false })
      });
    } catch {
      // ignore
    } finally {
      if (proposedRoute) {
        setCurrentRoute(proposedRoute);
      }
      setProposedRoute(null);
      setIsSubmittingDecision(false);
      showToast('Đã áp dụng lộ trình mới thành công! Chúc bạn có trải nghiệm khám thuận tiện.');
    }
  };

  // Bệnh nhân từ chối, giữ lộ trình cũ
  const handleRejectRoute = async (routeId: string) => {
    setIsSubmittingDecision(true);
    try {
      await fetch(`/api/v1/routes/${routeId}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token`
        },
        body: JSON.stringify({ decision_type: 'KEPT_EXISTING', is_proxy_action: false })
      });
    } catch {
      // ignore
    } finally {
      setProposedRoute(null);
      setIsSubmittingDecision(false);
      showToast('Đã giữ nguyên lộ trình hiện tại của bạn.');
    }
  };

  // CÁC MỤC CHÍNH Ở SIDEBAR
  const navItems = [
    {
      id: 'profile' as const,
      name: 'Hồ Sơ Cá Nhân',
      desc: 'Thông tin cá nhân & tiền sử bệnh',
      icon: UserCircle
    },
    {
      id: 'packages' as const,
      name: 'Các Gói Khám Đã Đăng Ký',
      desc: 'Danh sách gói & xem lộ trình',
      icon: Layers,
      badge: registeredBookings.length > 0 ? `${registeredBookings.length} gói` : undefined
    },
    {
      id: 'advisor' as const,
      name: 'Đăng Ký Gói Khám',
      desc: 'Khám cá nhân & doanh nghiệp',
      icon: Sparkles
    },
    {
      id: 'results' as const,
      name: 'Kết Quả Khám',
      desc: 'Ghi ngày tháng & kết quả đợt khám',
      icon: FileText
    },
    {
      id: 'appointments' as const,
      name: 'Hẹn Tái Khám',
      desc: 'Lịch hẹn do bác sĩ chỉ định',
      icon: CalendarClock,
      badge: '1 lịch'
    },
    {
      id: 'queues' as const,
      name: 'Bảng Chờ Viện',
      desc: 'Tình trạng tải các điểm khám',
      icon: Users
    }
  ];

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight">Cổng Bệnh Nhân Smart OPD</h1>
            <p className="text-xs text-slate-500 hidden sm:block">Điều phối khám ngoại trú & tối ưu thời gian chờ</p>
          </div>
        </div>

        {/* Thông tin nhanh bệnh nhân trên Header & Đăng Xuất */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{currentUser.fullName}</div>
            <div className="text-[11px] text-slate-500 font-mono">
              Mã BN: {currentUser.patientCode} • {currentUser.gender}, {currentUser.age} tuổi
            </div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-3 py-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-blue-700">STT Khám:</span>
            <span className="text-sm font-black text-blue-900">{currentUser.queueNumber}</span>
          </div>
          <button
            onClick={handleLogout}
            title="Đăng xuất tài khoản"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-2xl transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Container: Bố cục 2 Cột (Sidebar Trái Xếp Dọc + Nội Dung Phải Rộng Rãi) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Bên Trái: Menu Điều Hướng (Đã bỏ hoàn toàn ô hồ sơ bệnh nhân rườm rà phía dưới) */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-5">
          <div className="bg-white p-3 rounded-3xl border-2 border-blue-200 shadow-sm space-y-1.5">
            <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Chức Năng Chính
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'packages' && activeTab === 'packages') {
                      setSelectedBooking(null); // Click lại vào nút để quay về danh sách nếu đang xem lộ trình
                    }
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm leading-tight">{item.name}</div>
                      <div className={`text-[11px] leading-tight mt-0.5 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                  </div>
                </button>
              );
            })}

            {/* Mục Thứ 5: Lộ Trình Tối Ưu Hơn */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all hover:bg-slate-100 text-slate-700 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-slate-100 text-slate-600 ${
                      isRecalculating ? 'animate-spin text-blue-600' : ''
                    }`}
                  >
                    <RotateCw className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold leading-tight text-slate-800">Lộ Trình Tối Ưu Hơn</div>
                    <div className="text-[11px] leading-tight mt-0.5 text-slate-400">
                      {isRecalculating ? 'Đang phân tích lưu lượng...' : 'Tìm phương án nhanh hơn'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Cột Phải: Nội Dung Chính */}
        <main className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <PatientProfileView
              initialProfile={patientProfile}
              onSaveProfile={handleSaveProfile}
              onGoToAdvisor={() => setActiveTab('advisor')}
            />
          )}

          {activeTab === 'packages' && (
            <RegisteredPackagesView
              registeredBookings={registeredBookings}
              selectedBooking={selectedBooking}
              onSelectBooking={handleSelectBooking}
              onBackToList={() => setSelectedBooking(null)}
              onGoToAdvisor={() => setActiveTab('advisor')}
              onGoToResults={() => setActiveTab('results')}
              onDeleteBooking={handleDeleteBooking}
              currentRoute={currentRoute}
              queueNumber={currentUser.queueNumber}
            />
          )}

          {activeTab === 'advisor' && (
            <PackageAdvisor
              currentUser={currentUser}
              patientProfile={patientProfile}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {activeTab === 'results' && <MedicalResultsView />}

          {activeTab === 'appointments' && <FollowUpAppointmentsView />}

          {activeTab === 'queues' && <QueueBoard />}
        </main>
      </div>

      {/* Cửa Sổ Nhỏ Thông Báo Nổi (Toast Notification) */}
      {toastNotice && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-white border-2 border-emerald-300 rounded-3xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              {toastNotice.title}
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toastNotice.message}</p>
          </div>
          <button
            onClick={() => setToastNotice(null)}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
            title="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Popup Bắt Buộc: Bệnh Nhân Quyết Định Chấp Nhận Hoặc Giữ Cũ */}
      {proposedRoute && (
        <RouteDecisionModal
          proposedRoute={proposedRoute}
          currentRoute={currentRoute}
          onAccept={handleAcceptRoute}
          onReject={handleRejectRoute}
          isSubmitting={isSubmittingDecision}
        />
      )}
    </div>
  );
};
