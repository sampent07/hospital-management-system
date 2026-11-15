import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Sparkles, Users, Activity, User, PhoneCall, ShieldCheck, ChevronRight, RotateCw, X, CheckCircle2 } from 'lucide-react';
import { LiveJourney } from './pages/LiveJourney';
import { PackageAdvisor } from './pages/PackageAdvisor';
import { QueueBoard } from './pages/QueueBoard';
import { RouteDecisionModal } from './components/RouteDecisionModal';
import { Route } from './types';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'journey' | 'advisor' | 'queues'>('journey');
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null);
  const [proposedRoute, setProposedRoute] = useState<Route | null>(null);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [recalcNotice, setRecalcNotice] = useState<string | null>(null);
  const [isSubmittingDecision, setIsSubmittingDecision] = useState<boolean>(false);

  // Mẫu lượt khám ban đầu để demo mượt mà
  const visitId = 'VK-20261111-001';

  // Tự động đóng thông báo sau 3 giây
  useEffect(() => {
    if (recalcNotice) {
      const timer = setTimeout(() => {
        setRecalcNotice(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [recalcNotice]);

  // Khởi tạo lộ trình mẫu
  useEffect(() => {
    // Tạo lộ trình mẫu ban đầu
    const mockRoute: Route = {
      id: 'route-initial-01',
      visitId: visitId,
      version: 1,
      creationReason: 'INITIAL',
      status: 'ACTIVE',
      suggestionSource: 'AI_RL',
      estimatedTotalDurationSeconds: 3120, // 52 phút
      steps: [
        {
          id: 'step-01',
          stepOrder: 1,
          serviceId: 'es-01-kham-noi',
          serviceName: 'Khám Nội Tổng Quát',
          servicePointId: 'sp-02-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-02',
          stepOrder: 2,
          serviceId: 'es-05-xn-mau',
          serviceName: 'Tổng Phân Tích Tế Bào Máu (CBC)',
          servicePointId: 'sp-06-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 480,
          estimatedServiceSeconds: 240
        },
        {
          id: 'step-03',
          stepOrder: 3,
          serviceId: 'es-04-xq-nguc',
          serviceName: 'Chụp X-Quang Ngực Thẳng',
          servicePointId: 'sp-05-xray',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 900,
          estimatedServiceSeconds: 360
        }
      ]
    };
    setCurrentRoute(mockRoute);
  }, []);

  // Yêu cầu tính lại lộ trình
  const handleRecalculate = async () => {
    setActiveTab('journey');
    setIsRecalculating(true);
    setRecalcNotice(null);

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
          setRecalcNotice(data.message || 'Lộ trình hiện tại đã tối ưu, bạn không cần thay đổi.');
        }
      } else {
        // Mô phỏng phương án tối ưu nếu API chưa có visit này
        setTimeout(() => {
          const improvedRoute: Route = {
            id: 'route-recalc-02',
            visitId: visitId,
            version: (currentRoute?.version || 1) + 1,
            creationReason: 'RECALC_REQUEST',
            status: 'ACTIVE',
            suggestionSource: 'AI_RL',
            estimatedTotalDurationSeconds: 2400, // 40 phút (tiết kiệm 12 phút!)
            steps: [
              {
                id: 'step-new-01',
                stepOrder: 1,
                serviceId: 'es-01-kham-noi',
                serviceName: 'Khám Nội Tổng Quát',
                servicePointId: 'sp-02-internal',
                servicePointName: 'Phòng Khám Nội',
                roomNumber: 'Phòng 101',
                status: 'IN_PROGRESS',
                estimatedWaitSeconds: 300,
                estimatedServiceSeconds: 600
              },
              {
                id: 'step-new-02',
                stepOrder: 2,
                serviceId: 'es-04-xq-nguc',
                serviceName: 'Chụp X-Quang Ngực Thẳng',
                servicePointId: 'sp-05-xray',
                servicePointName: 'Phòng Chụp X-Quang (Đang vắng)',
                roomNumber: 'Phòng CĐHA-01',
                status: 'NOT_STARTED',
                estimatedWaitSeconds: 180,
                estimatedServiceSeconds: 360
              },
              {
                id: 'step-new-03',
                stepOrder: 3,
                serviceId: 'es-05-xn-mau',
                serviceName: 'Tổng Phân Tích Tế Bào Máu (CBC)',
                servicePointId: 'sp-06-lab',
                servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
                roomNumber: 'Phòng XN-02',
                status: 'NOT_STARTED',
                estimatedWaitSeconds: 420,
                estimatedServiceSeconds: 240
              }
            ]
          };
          setProposedRoute(improvedRoute);
          setIsRecalculating(false);
        }, 1200);
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
      setRecalcNotice('Đã áp dụng lộ trình mới thành công! Chúc bạn có trải nghiệm khám thuận tiện.');
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
      setRecalcNotice('Đã giữ nguyên lộ trình hiện tại của bạn.');
    }
  };

  const navItems = [
    {
      id: 'journey' as const,
      name: 'Lộ Trình Khám',
      desc: 'Hành trình & thứ tự phòng khám',
      icon: RouteIcon,
      badge: currentRoute ? `${currentRoute.steps.filter((s) => s.status === 'COMPLETED').length}/${currentRoute.steps.length}` : undefined
    },
    {
      id: 'advisor' as const,
      name: 'Gợi Ý Gói Khám',
      desc: 'Khảo sát nhu cầu sức khỏe',
      icon: Sparkles
    },
    {
      id: 'queues' as const,
      name: 'Bảng Chờ Viện',
      desc: 'Tình trạng tải các điểm khám',
      icon: Users
    }
  ];

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

        {/* Thông tin nhanh bệnh nhân trên Header */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">Lê Văn Hùng</div>
            <div className="text-[11px] text-slate-500 font-mono">Mã BN: BN-20261111 • Nam, 38 tuổi</div>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-2xl px-3 py-1.5 shadow-sm">
            <span className="text-[11px] font-semibold text-blue-700">STT Khám:</span>
            <span className="text-sm font-black text-blue-900">#001</span>
          </div>
        </div>
      </header>

      {/* Main Container: Bố cục 2 Cột (Sidebar Trái Xếp Dọc 3 Mục + Nội Dung Phải Rộng Rãi) */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        {/* Sidebar Bên Trái: Xếp 3 mục theo hàng dọc, liên tiếp nhau */}
        <aside className="w-full md:w-72 lg:w-80 shrink-0 space-y-5">
          {/* Menu Điều Hướng Dọc 4 Mục */}
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
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all ${
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

            {/* Mục Thứ 4: Lộ Trình Tối Ưu Hơn */}
            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={handleRecalculate}
                disabled={isRecalculating}
                className="w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all hover:bg-slate-100 text-slate-700 group"
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

          {/* Thẻ Thông Tin Bệnh Nhân Chi Tiết (Khắc phục cảm giác trống vắng) */}
          <div className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4 hidden md:block">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Hồ Sơ Bệnh Nhân</div>
                <div className="text-sm font-bold text-slate-800">Lê Văn Hùng</div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Mã Lượt Khám:</span>
                <span className="font-mono font-bold text-slate-800">{visitId}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Trạng Thái:</span>
                <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Đang Khám
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>BHYT / CCCD:</span>
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Đã Xác Thực
                </span>
              </div>
            </div>

            {/* Trợ giúp nhanh */}
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-1.5">
              <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Hỗ Trợ Bệnh Nhân</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-snug">
                Nếu cần điều phối viên hỗ trợ di chuyển, vui lòng liên hệ <strong>Quầy Lễ Tân (Tầng 1)</strong> hoặc hotline <strong>1900 8899</strong>.
              </p>
            </div>
          </div>
        </aside>

        {/* Cột Phải: Nội Dung Chính Mở Rộng Rộng Rãi */}
        <main className="flex-1 min-w-0">
          {activeTab === 'journey' && (
            <LiveJourney
              currentRoute={currentRoute}
            />
          )}
          {activeTab === 'advisor' && <PackageAdvisor />}
          {activeTab === 'queues' && <QueueBoard />}
        </main>
      </div>

      {/* Cửa Sổ Nhỏ Thông Báo Nổi (Toast Notification) - Có Nút Đóng & Tự Biến Mất */}
      {recalcNotice && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-sm w-full bg-white border border-emerald-200 rounded-3xl shadow-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-900">
              Thông Báo Lộ Trình
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{recalcNotice}</p>
          </div>
          <button
            onClick={() => setRecalcNotice(null)}
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
