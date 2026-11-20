import React, { useState, useEffect, useRef } from 'react';
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
  CalendarClock,
  Bell,
  BellRing,
  CheckCheck,
  AlertTriangle,
  FileCheck2
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
import {
  PatientUser,
  Route,
  BookingAppointment,
  PatientProfile,
  PatientNotificationItem
} from './types';
import { defaultPatientProfilesList } from './utils/mockImagingData';

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
  relationship: 'SELF',
  relationshipLabel: 'Bản thân',
  profileId: 'prof-self',
  patientAge: 38,
  patientGender: 'Nam',
  insuranceCardNumber: 'DN 4 79 20261111',
  medicalHistory: 'Tăng huyết áp; Đau dạ dày / Tiêu hóa',
  bookingCode: 'DK-20261015-88',
  status: 'COMPLETED',
  paymentStatus: 'PAID_QR',
  paymentMethod: 'VIETQR',
  paidAt: '2026-10-15T07:15:00Z',
  resultRecordCode: 'HSBA-20261015-88',
  notes: 'Đã hoàn tất 8/8 dịch vụ. Bác sĩ kết luận viêm trợt hang vị HP (+) và kê đơn thuốc 14 ngày.'
};

export const dadCompletedBooking: BookingAppointment = {
  packageId: 'pkg-senior-comprehensive',
  packageName: 'Gói Khám Chuyên Sâu Tim Mạch & Cơ Xương Khớp',
  targetType: 'INDIVIDUAL',
  examMode: 'PACKAGE',
  totalPrice: 3100000,
  facilityId: 'CS1',
  facilityName: 'Bệnh viện Đa Khoa Smart OPD (Cơ sở 1 - Quận 5)',
  facilityAddress: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
  appointmentDate: '2026-08-10',
  timeSlot: '08:00 - 11:00',
  contactName: 'Lê Văn Ba',
  contactPhone: '0913 888 999',
  relationship: 'FATHER',
  relationshipLabel: 'Ba',
  profileId: 'prof-dad',
  patientAge: 68,
  patientGender: 'Nam',
  insuranceCardNumber: 'HT 2 79 19580810',
  medicalHistory: 'Thoái hóa khớp gối hai bên, tăng huyết áp',
  bookingCode: 'DK-20260810-12',
  status: 'COMPLETED',
  paymentStatus: 'PAID_QR',
  paymentMethod: 'VIETQR',
  paidAt: '2026-08-10T07:45:00Z',
  resultRecordCode: 'HSBA-20260810-12',
  notes: 'Đã hoàn tất 6/6 dịch vụ. Bác sĩ kê đơn thuốc khớp và hẹn tái khám.'
};

export const momCompletedBooking: BookingAppointment = {
  packageId: 'pkg-female-general',
  packageName: 'Gói Khám Tầm Soát Đái Tháo Đường & Nội Tiết',
  targetType: 'INDIVIDUAL',
  examMode: 'PACKAGE',
  totalPrice: 2200000,
  facilityId: 'CS1',
  facilityName: 'Bệnh viện Đa Khoa Smart OPD (Cơ sở 1 - Quận 5)',
  facilityAddress: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
  appointmentDate: '2026-09-05',
  timeSlot: '07:30 - 10:00',
  contactName: 'Trần Thị Mai',
  contactPhone: '0908 654 321',
  relationship: 'MOTHER',
  relationshipLabel: 'Mẹ',
  profileId: 'prof-mom',
  patientAge: 65,
  patientGender: 'Nữ',
  insuranceCardNumber: 'HT 2 79 19610520',
  medicalHistory: 'Đái tháo đường type 2, tuyến giáp',
  bookingCode: 'DK-20260905-34',
  status: 'COMPLETED',
  paymentStatus: 'PAID_QR',
  paymentMethod: 'VIETQR',
  paidAt: '2026-09-05T07:20:00Z',
  resultRecordCode: 'HSBA-20260905-34',
  notes: 'Đã hoàn tất 7/7 dịch vụ. Đạt mục tiêu kiểm soát đường huyết.'
};

export const defaultPatientNotifications: PatientNotificationItem[] = [
  {
    id: 'notif-hp-urgent',
    title: '🚨 Cảnh Báo Chỉ Số Vi Khuẩn HP (+)',
    message: 'Kết quả nội soi & xét nghiệm C14 ngày 15/10 cho thấy dương tính vi khuẩn HP dạ dày. Vui lòng tuân thủ phác đồ tiệt trừ HP 14 ngày của BSCKII Trần Hoàng Nam.',
    time: '10 phút trước',
    type: 'URGENT',
    targetTab: 'results',
    isRead: false,
    actionLabel: 'Xem Kết Quả & Đơn Thuốc'
  },
  {
    id: 'notif-followup-app',
    title: '📅 Nhắc Lịch Hẹn Tái Khám Ngày 30/10',
    message: 'Bạn có lịch tái khám chuyên khoa Tiêu Hóa vào 08:30 ngày 30/10/2026 tại Phòng 204 (Khoa Tiêu Hóa - Tầng 2). Bác sĩ phụ trách: BSCKII. Trần Hoàng Nam.',
    time: 'Hôm nay 08:00',
    type: 'APPOINTMENT',
    targetTab: 'appointments',
    isRead: false,
    actionLabel: 'Xem Chi Tiết Lịch Hẹn'
  },
  {
    id: 'notif-results-ready',
    title: '📋 Đã Cập Nhật 3 Phim Chụp Y Khoa PACS',
    message: 'Ảnh chụp X-Quang Ngực Thẳng KTS, Siêu Âm Ổ Bụng và Nội Soi Tiêu Hóa đã được đưa lên hệ thống PACS. Bác sĩ đã hoàn tất kết luận bệnh án.',
    time: 'Hôm qua 16:45',
    type: 'RESULT',
    targetTab: 'results',
    isRead: false,
    actionLabel: 'Xem Phim Chụp Y Khoa'
  },
  {
    id: 'notif-route-optimal',
    title: '⚡ Gợi Ý Lộ Trình Di Chuyển Thông Minh',
    message: 'Hệ thống AI vừa tính toán lộ trình khám giúp giảm 22% thời gian chờ tại các phòng khám đông bệnh nhân.',
    time: '2 ngày trước',
    type: 'ROUTE',
    targetTab: 'packages',
    isRead: true,
    actionLabel: 'Xem Lộ Trình Khám'
  }
];

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<PatientUser | null>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Danh sách các hồ sơ bệnh nhân trong tài khoản (Quản lý nhiều hồ sơ: Bản thân, Ba, Mẹ, Con...) - giống sổ địa chỉ Shopee
  const [patientProfiles, setPatientProfiles] = useState<PatientProfile[]>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_profiles_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultPatientProfilesList;
  });

  // Hồ sơ bệnh nhân đang được chọn để xem kết quả khám (bắt buộc chọn hồ sơ trước khi xem)
  const [selectedProfileIdForResults, setSelectedProfileIdForResults] = useState<string>('prof-self');

  // Hồ sơ bệnh nhân được chọn sẵn khi chuyển qua trang Đăng Ký Khám
  const [selectedProfileForAdvisor, setSelectedProfileForAdvisor] = useState<PatientProfile | null>(null);

  // Hồ sơ mặc định hiện tại
  const patientProfile = patientProfiles.find((p) => p.isDefault) || patientProfiles[0] || defaultPatientProfilesList[0];

  // Tab đang hoạt động: 'profile' (Hồ Sơ Cá Nhân), 'packages' (Các Gói Khám Đã Đăng Ký), 'advisor' (Đăng Ký Gói Khám), 'results' (Kết Quả Khám), 'appointments' (Hẹn Tái Khám), 'queues' (Bảng Chờ Viện)
  const [activeTab, setActiveTab] = useState<'profile' | 'packages' | 'advisor' | 'results' | 'appointments' | 'queues'>('packages');

  // Danh sách các gói khám / dịch vụ lẻ đã đăng ký thành công
  // Khởi tạo sẵn các gói mẫu đồng bộ với các hồ sơ trong tài khoản (Bản thân, Ba, Mẹ)
  const [registeredBookings, setRegisteredBookings] = useState<BookingAppointment[]>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_bookings');
      let list: BookingAppointment[] = saved ? JSON.parse(saved) : [];

      const initialDefaults = [pastCompletedBooking, dadCompletedBooking, momCompletedBooking];
      for (const defB of initialDefaults) {
        if (!list.some((b) => b.bookingCode === defB.bookingCode)) {
          list.push(defB);
        }
      }

      // Đảm bảo gán profileId và relationshipLabel nếu thiếu
      list = list.map((b) => {
        if (!b.profileId) {
          if (b.contactName === 'Lê Văn Ba') return { ...b, profileId: 'prof-dad', relationship: 'FATHER', relationshipLabel: 'Ba' };
          if (b.contactName === 'Trần Thị Mai') return { ...b, profileId: 'prof-mom', relationship: 'MOTHER', relationshipLabel: 'Mẹ' };
          return { ...b, profileId: 'prof-self', relationship: 'SELF', relationshipLabel: 'Bản thân' };
        }
        return b;
      });

      localStorage.setItem('smart_opd_patient_bookings', JSON.stringify(list));
      return list;
    } catch {
      return [pastCompletedBooking, dadCompletedBooking, momCompletedBooking];
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

  // Danh sách thông báo cho bệnh nhân (Lịch hẹn, kết quả, cảnh báo khẩn cấp, lộ trình)
  const [notifications, setNotifications] = useState<PatientNotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_opd_patient_notifications');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultPatientNotifications;
  });

  const [isNotifDropdownOpen, setIsNotifDropdownOpen] = useState<boolean>(false);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  // Đếm số lượng thông báo chưa đọc
  const unreadNotifCount = notifications.filter((n) => !n.isRead).length;

  // Lắng nghe click bên ngoài để đóng dropdown thông báo
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setIsNotifDropdownOpen(false);
      }
    };
    if (isNotifDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotifDropdownOpen]);

  // Đánh dấu 1 thông báo là đã đọc và chuyển trực tiếp đến tab tương ứng
  const handleNotificationClick = (notif: PatientNotificationItem) => {
    const updated = notifications.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n));
    setNotifications(updated);
    try {
      localStorage.setItem('smart_opd_patient_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setIsNotifDropdownOpen(false);
    setActiveTab(notif.targetTab);
    showToast(`Đã chuyển đến: ${notif.title}`, 'Thông Báo');
  };

  // Đánh dấu tất cả thông báo là đã đọc
  const handleMarkAllNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    try {
      localStorage.setItem('smart_opd_patient_notifications', JSON.stringify(updated));
    } catch {
      // ignore
    }
    showToast('Đã đánh dấu tất cả thông báo là đã đọc.', 'Thông Báo');
  };

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

  // Cập nhật và lưu danh sách hồ sơ người thân (giống sổ địa chỉ Shopee)
  const handleUpdateProfiles = (newList: PatientProfile[]) => {
    setPatientProfiles(newList);
    try {
      localStorage.setItem('smart_opd_patient_profiles_list', JSON.stringify(newList));
    } catch {
      // ignore
    }

    const defaultP = newList.find((p) => p.isDefault) || newList[0];
    if (defaultP && currentUser) {
      const updatedUser: PatientUser = {
        ...currentUser,
        fullName: defaultP.fullName,
        age: defaultP.age,
        gender: defaultP.gender === 'FEMALE' ? 'Nữ' : 'Nam'
      };
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('smart_opd_patient_user', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    }
  };

  const handleGoToAdvisorWithProfile = (profile: PatientProfile) => {
    setSelectedProfileForAdvisor(profile);
    setActiveTab('advisor');
  };

  const handleGoToResultsWithProfile = (profileId: string) => {
    setSelectedProfileIdForResults(profileId);
    setActiveTab('results');
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
          {/* NÚT CHUÔNG THÔNG BÁO (ĐẶT NGAY PHÍA TRƯỚC TÊN TÀI KHOẢN) */}
          <div className="relative" ref={notifDropdownRef}>
            <button
              type="button"
              onClick={() => setIsNotifDropdownOpen((prev) => !prev)}
              className={`relative p-2 rounded-2xl transition-all cursor-pointer flex items-center justify-center ${
                isNotifDropdownOpen
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-400'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300'
              }`}
              title="Thông báo lịch hẹn & cảnh báo y tế"
            >
              {unreadNotifCount > 0 ? (
                <BellRing className="w-5 h-5 text-blue-600 animate-pulse" />
              ) : (
                <Bell className="w-5 h-5" />
              )}

              {/* Huy hiệu đánh số trên chuông thông báo */}
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md shadow-rose-600/30 ring-2 ring-white">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              )}
            </button>

            {/* Menu Popover Thông Báo Khi Nhấn Vào Chuông */}
            {isNotifDropdownOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 sm:w-96 bg-white rounded-3xl border-2 border-blue-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Header Menu */}
                <div className="p-3.5 bg-gradient-to-r from-blue-50/90 to-indigo-50/90 border-b border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-600 text-white rounded-xl">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-900">Thông Báo Của Bạn</h4>
                      <p className="text-[10px] text-slate-500">
                        {unreadNotifCount > 0 ? `${unreadNotifCount} thông báo chưa đọc` : 'Đã đọc tất cả thông báo'}
                      </p>
                    </div>
                  </div>

                  {unreadNotifCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllNotificationsAsRead}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Đọc tất cả</span>
                    </button>
                  )}
                </div>

                {/* Danh sách thông báo */}
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      Hiện tại bạn không có thông báo nào.
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const isUnread = !notif.isRead;
                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                            isUnread ? 'bg-blue-50/60 hover:bg-blue-100/70' : 'bg-white hover:bg-slate-50'
                          }`}
                        >
                          {/* Icon theo loại thông báo */}
                          <div className="shrink-0 mt-0.5">
                            {notif.type === 'URGENT' && (
                              <div className="p-1.5 bg-rose-100 text-rose-700 rounded-xl">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === 'APPOINTMENT' && (
                              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-xl">
                                <CalendarClock className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === 'RESULT' && (
                              <div className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
                                <FileCheck2 className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === 'ROUTE' && (
                              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                                <Sparkles className="w-4 h-4" />
                              </div>
                            )}
                            {notif.type === 'SYSTEM' && (
                              <div className="p-1.5 bg-slate-100 text-slate-700 rounded-xl">
                                <Bell className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Nội dung thông báo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <h5
                                className={`text-xs leading-snug line-clamp-1 ${
                                  isUnread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'
                                }`}
                              >
                                {notif.title}
                              </h5>
                              {isUnread && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" title="Chưa đọc" />
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-slate-100/60 text-[10px]">
                              <span className="text-slate-400 font-medium">{notif.time}</span>
                              <span className="font-bold text-blue-600 flex items-center gap-0.5 hover:underline">
                                {notif.actionLabel || 'Xem chi tiết'} →
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer Popover */}
                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-500">
                  Nhấn vào thông báo để chuyển trực tiếp đến mục liên quan
                </div>
              </div>
            )}
          </div>

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
              profiles={patientProfiles}
              onUpdateProfiles={handleUpdateProfiles}
              onGoToAdvisorWithProfile={handleGoToAdvisorWithProfile}
              onGoToResultsWithProfile={handleGoToResultsWithProfile}
            />
          )}

          {activeTab === 'packages' && (
            <RegisteredPackagesView
              registeredBookings={registeredBookings}
              selectedBooking={selectedBooking}
              onSelectBooking={handleSelectBooking}
              onBackToList={() => setSelectedBooking(null)}
              onGoToAdvisor={() => setActiveTab('advisor')}
              onGoToAdvisorWithProfile={handleGoToAdvisorWithProfile}
              onGoToResults={() => setActiveTab('results')}
              onDeleteBooking={handleDeleteBooking}
              currentRoute={currentRoute}
              queueNumber={currentUser.queueNumber}
              profiles={patientProfiles}
            />
          )}

          {activeTab === 'advisor' && (
            <PackageAdvisor
              currentUser={currentUser}
              patientProfile={patientProfile}
              patientProfiles={patientProfiles}
              initialSelectedProfile={selectedProfileForAdvisor}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}

          {activeTab === 'results' && (
            <MedicalResultsView
              profiles={patientProfiles}
              selectedProfileId={selectedProfileIdForResults}
              onSelectProfile={(profId) => setSelectedProfileIdForResults(profId)}
              onGoToProfileView={() => setActiveTab('profile')}
            />
          )}

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
