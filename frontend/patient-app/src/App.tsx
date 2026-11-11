import React, { useState, useEffect } from 'react';
import { Route as RouteIcon, Sparkles, Users, Activity } from 'lucide-react';
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
          // Xuất hiện modal để bệnh nhân tự quyết định!
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
            estimatedTotalDurationDuration: 2400,
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans pb-20">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800">Cổng Bệnh Nhân Smart OPD</h1>
            <span className="text-[11px] text-slate-500 font-mono">Bệnh nhân: Lê Văn Hùng</span>
          </div>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-1 rounded-full border border-blue-200">
          STT: #001
        </span>
      </header>

      {/* Main Screen Content */}
      <main className="flex-1">
        {activeTab === 'journey' && (
          <LiveJourney
            currentRoute={currentRoute}
            onRecalculateRequest={handleRecalculate}
            isRecalculating={isRecalculating}
            recalcNotice={recalcNotice}
          />
        )}
        {activeTab === 'advisor' && <PackageAdvisor />}
        {activeTab === 'queues' && <QueueBoard />}
      </main>

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

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-2 px-6 flex items-center justify-around z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('journey')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'journey' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <RouteIcon className="w-5 h-5" />
          <span className="text-[10px]">Lộ Trình Khám</span>
        </button>

        <button
          onClick={() => setActiveTab('advisor')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'advisor' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px]">Gợi Ý Gói Khám</span>
        </button>

        <button
          onClick={() => setActiveTab('queues')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'queues' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Bảng Chờ Viện</span>
        </button>
      </nav>
    </div>
  );
};
