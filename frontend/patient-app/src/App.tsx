import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, Bell, CircleUserRound, Home, LogOut, Shapes } from 'lucide-react';
import { AuthPage } from './pages/AuthPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { BookingPage } from './pages/BookingPage';
import { BookingHistoryPage } from './pages/BookingHistoryPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { DemoInvoicesPage } from './pages/DemoInvoicesPage';
import { DemoPaymentPage } from './pages/DemoPaymentPage';
import { FeaturePreviewPage } from './pages/FeaturePreviewPage';
import { GuidePage } from './pages/GuidePage';
import { HomePage } from './pages/HomePage';
import { JourneyPage } from './pages/JourneyPage';
import { PackagesPage } from './pages/PackagesPage';
import { ProfilePage } from './pages/ProfilePage';
import { QueuePage } from './pages/QueuePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { clearSession, patientApi, readSession, saveSession } from './services/api';
import type { AuthSession, PatientVisit } from './types/api';
import type { PatientPage, PreviewFeature } from './types/navigation';
import { vi } from './i18n/vi';
import { DEFAULT_FACILITY_TIMEZONE } from './utils/facilityTime';

/** Các trang gốc (root) không có trang cha — bấm Back trên chúng sẽ về home */
const ROOT_PAGES: ReadonlySet<PatientPage> = new Set(['home', 'features', 'notifications', 'profile']);

export function App() {
  const [session, setSession] = useState<AuthSession | null>(() => readSession());
  const [page, setPage] = useState<PatientPage>('home');
  const [previewFeature, setPreviewFeature] = useState<PreviewFeature>('healthRecord');
  const [activeVisitId, setActiveVisitId] = useState<string | null>(null);
  const [signedOut, setSignedOut] = useState(false);
  const [facilityTimezone, setFacilityTimezone] = useState(DEFAULT_FACILITY_TIMEZONE);

  // ─── Navigation history stack ───
  // Lưu lại chuỗi các trang đã đi qua để nút Back luôn quay về trang ngay trước đó
  const pageHistoryRef = useRef<PatientPage[]>([]);

  const navigateTo = useCallback((nextPage: PatientPage) => {
    setPage((currentPage) => {
      // Khi bấm vào tab thanh điều hướng dưới (root pages) → reset lịch sử
      if (ROOT_PAGES.has(nextPage)) {
        pageHistoryRef.current = [];
      } else {
        // Đẩy trang hiện tại vào lịch sử (tránh trùng lặp liên tiếp)
        const history = pageHistoryRef.current;
        if (history.length === 0 || history[history.length - 1] !== currentPage) {
          history.push(currentPage);
        }
        // Giới hạn stack tối đa 20 để tránh rò bộ nhớ
        if (history.length > 20) history.shift();
      }
      return nextPage;
    });
  }, []);

  const goBack = useCallback(() => {
    const history = pageHistoryRef.current;
    const previousPage = history.pop() ?? 'home';
    setPage(previousPage);
  }, []);

  useEffect(() => {
    void patientApi.publicConfig().then((config) => setFacilityTimezone(config.facility_timezone)).catch(() => undefined);
  }, []);

  // Lắng nghe sự kiện token hết hạn hoặc không hợp lệ -> tự động đăng xuất an toàn
  useEffect(() => {
    const handleUnauthorized = () => {
      clearSession();
      setSession(null);
      setActiveVisitId(null);
      setPage('home');
      pageHistoryRef.current = [];
      setSignedOut(true);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (!session) return;
    void patientApi.visits(session.access_token).then((visits) => {
      if (visits[0]) setActiveVisitId((current) => current ?? visits[0].id);
    }).catch(() => undefined);
  }, [session]);

  const authenticate = useCallback((nextSession: AuthSession) => {
    if (nextSession.role !== 'PATIENT') return;
    saveSession(nextSession);
    setSession(nextSession);
    setPage('home');
    pageHistoryRef.current = [];
    setSignedOut(false);
  }, []);

  const selectVisit = useCallback((visitId: string) => setActiveVisitId(visitId), []);
  const checkedIn = useCallback((visit: PatientVisit) => {
    setActiveVisitId(visit.id);
    navigateTo('journey');
  }, [navigateTo]);

  const preview = useCallback((feature: PreviewFeature) => {
    setPreviewFeature(feature);
    navigateTo('featurePreview');
  }, [navigateTo]);

  if (!session) return <><AuthPage onAuthenticated={authenticate} facilityTimezone={facilityTimezone} />{signedOut && <p className="sr-only" role="status">{vi.signOutConfirm}</p>}</>;

  function signOut() {
    clearSession();
    setSession(null);
    setActiveVisitId(null);
    setPage('home');
    pageHistoryRef.current = [];
    setSignedOut(true);
  }

  // Phân bổ activeTab cho thanh điều hướng dưới
  const activeTab: PatientPage =
    page === 'features' ? 'features' :
    page === 'notifications' ? 'notifications' :
    page === 'profile' ? 'profile' :
    'home';

  // Xác định nhãn cho nút Back dựa trên trang trước đó
  const prevPage = pageHistoryRef.current.length > 0
    ? pageHistoryRef.current[pageHistoryRef.current.length - 1]
    : 'home';
  const backLabel = prevPage === 'features' ? vi.backToFunctions : vi.backToHome;

  return (
    <div className="app-backdrop min-h-screen text-slate-900">
      <div className="app-shell min-h-screen bg-[#f7f9fc] pb-[calc(5.4rem+env(safe-area-inset-bottom))]">
        {page !== 'home' && <header className="app-header sticky top-0 z-30 px-5 pb-3 pt-[calc(env(safe-area-inset-top)+.8rem)]">
          <div className="flex items-center gap-3">
            <button onClick={goBack} aria-label={backLabel} title={backLabel} className="icon-button">
              <ArrowLeft size={19} aria-hidden="true" />
            </button>
            <img src="/icons/smart-opd.svg" alt="" className="h-10 w-10 rounded-2xl shadow-sm" />
            <div className="min-w-0 flex-1">
              <strong className="block text-[15px] font-extrabold tracking-tight text-slate-950">{vi.hospitalDemoName}</strong>
              <span className="block truncate text-[11px] font-medium text-slate-500">{vi.appName} · {vi.patientPortal}</span>
            </div>
            <button onClick={signOut} aria-label={vi.logout} title={vi.logout} className="icon-button">
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>}

        <main className="mx-auto max-w-[28rem] px-5 pb-6 pt-5">
          {page === 'home' && <HomePage onNavigate={navigateTo} onPreview={preview} onSignOut={signOut} />}
          {page === 'booking' && <BookingPage token={session.access_token} facilityTimezone={facilityTimezone} onNavigate={navigateTo} />}
          {page === 'bookingHistory' && <BookingHistoryPage token={session.access_token} facilityTimezone={facilityTimezone} onNavigate={navigateTo} />}
          {page === 'features' && <FeaturesPage onNavigate={navigateTo} onPreview={preview} />}
          {page === 'notifications' && <NotificationsPage />}
          {page === 'hospitalFees' && <DemoPaymentPage token={session.access_token} facilityTimezone={facilityTimezone} onNavigate={navigateTo} />}
          {page === 'invoices' && <DemoInvoicesPage token={session.access_token} facilityTimezone={facilityTimezone} onNavigate={navigateTo} />}
          {page === 'packages' && <PackagesPage token={session.access_token} facilityTimezone={facilityTimezone} onNavigate={navigateTo} />}
          {page === 'appointments' && <AppointmentsPage token={session.access_token} facilityTimezone={facilityTimezone} onCheckIn={checkedIn} onNavigate={navigateTo} />}
          {page === 'journey' && <JourneyPage token={session.access_token} facilityTimezone={facilityTimezone} selectedVisitId={activeVisitId} onSelectVisit={selectVisit} />}
          {page === 'queues' && <QueuePage token={session.access_token} visitId={activeVisitId} />}
          {page === 'profile' && <ProfilePage token={session.access_token} />}
          {page === 'guide' && <GuidePage onNavigate={navigateTo} />}
          {page === 'featurePreview' && <FeaturePreviewPage feature={previewFeature} />}
        </main>

        <nav aria-label={vi.patientNavigation} className="bottom-navigation">
          <NavItem page="home" active={activeTab} onClick={navigateTo} icon={<Home />} label={vi.navHome} />
          <NavItem page="notifications" active={activeTab} onClick={navigateTo} icon={<Bell />} label={vi.navNotifications} />
          <NavItem page="features" active={activeTab} onClick={navigateTo} icon={<Shapes />} label={vi.navFeatures} />
          <NavItem page="profile" active={activeTab} onClick={navigateTo} icon={<CircleUserRound />} label={vi.navProfile} />
        </nav>
      </div>
    </div>
  );
}

function NavItem({ page, active, onClick, icon, label }: {
  page: PatientPage; active: PatientPage; onClick: (page: PatientPage) => void; icon: ReactNode; label: string;
}) {
  const isActive = page === active;
  return (
    <button onClick={() => onClick(page)} aria-current={isActive ? 'page' : undefined} className={`nav-item ${isActive ? 'nav-item-active' : ''}`}>
      <span className="nav-icon">{icon}</span><span>{label}</span>
    </button>
  );
}
