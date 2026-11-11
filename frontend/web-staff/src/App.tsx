import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MyServicePoint } from './pages/MyServicePoint';
import { DoctorConsultation } from './pages/DoctorConsultation';
import { Reception } from './pages/Reception';
import { AdminOverview } from './pages/AdminOverview';
import { Account, ServicePoint, ServicePointQueueSummary, ExamService, Package } from './types';
import { useWebSocket } from './hooks/useWebSocket';

export const App: React.FC = () => {
  const [currentAccount, setCurrentAccount] = useState<Account>({
    id: 'acc-03-doctor',
    username: 'doctor',
    fullName: 'BS. CK1 Nguyễn Văn An',
    role: 'DOCTOR',
    employeeCode: 'NV-DOC-01',
    assignedServicePointId: 'sp-02-internal'
  });

  const [currentTab, setCurrentTab] = useState<string>('my-service-point');
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [selectedServicePointId, setSelectedServicePointId] = useState<string>('sp-02-internal');
  const [allQueues, setAllQueues] = useState<ServicePointQueueSummary[]>([]);
  const [availableServices, setAvailableServices] = useState<ExamService[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Lấy dữ liệu ban đầu từ REST API
  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [queuesRes, packagesRes] = await Promise.all([
        fetch('/api/v1/queues').then((r) => (r.ok ? r.json() : [])),
        fetch('/api/v1/packages').then((r) => (r.ok ? r.json() : []))
      ]);

      setAllQueues(queuesRes);
      setPackages(packagesRes);

      // Trích xuất danh sách ServicePoints và ExamServices từ kết quả
      if (queuesRes.length > 0) {
        const sps: ServicePoint[] = queuesRes.map((q: ServicePointQueueSummary) => ({
          id: q.servicePointId,
          code: q.servicePointCode,
          name: q.servicePointName,
          roomNumber: q.roomNumber,
          resourceCount: q.resourceCount,
          avgServiceDurationSeconds: q.avgServiceDurationSeconds,
          queueCapacity: q.queueCapacity
        }));
        setServicePoints(sps);
        if (!selectedServicePointId && sps.length > 0) {
          setSelectedServicePointId(sps[0].id);
        }
      }

      // Trích xuất danh mục dịch vụ khám
      const servicesMap = new Map<string, ExamService>();
      packagesRes.forEach((pkg: Package) => {
        pkg.services.forEach((s) => {
          servicesMap.set(s.id, s);
        });
      });
      setAvailableServices(Array.from(servicesMap.values()));
    } catch {
      // API fallback
    } finally {
      setIsLoading(false);
    }
  }, [selectedServicePointId]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Hook WebSocket tự động làm mới hàng đợi khi có sự kiện
  const handleWebSocketEvent = useCallback((event: { event_type: string }) => {
    if (event.event_type.startsWith('queue.') || event.event_type.startsWith('visit_progress.')) {
      fetch('/api/v1/queues')
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => setAllQueues(data))
        .catch(() => {});
    }
  }, []);

  const { isConnected } = useWebSocket(handleWebSocketEvent);

  const selectedQueue =
    allQueues.find((q) => q.servicePointId === selectedServicePointId) ||
    allQueues[0] ||
    null;

  // Cập nhật trạng thái dịch vụ (Vòng đời: NOT_STARTED -> WAITING -> IN_PROGRESS -> COMPLETED)
  const handleUpdateStatus = async (progressId: string, newStatus: string, expectedVersion: number) => {
    const res = await fetch(`/api/v1/visits/progress/${progressId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock-token` // Phân quyền kiểm tra ở Backend
      },
      body: JSON.stringify({
        new_status: newStatus,
        expected_version: expectedVersion
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi cập nhật trạng thái.');
    }

    // Refresh queues
    const updated = await fetch('/api/v1/queues').then((r) => r.json());
    setAllQueues(updated);
  };

  // Hoàn tác trong 60 giây
  const handleUndoStatus = async (progressId: string) => {
    const res = await fetch(`/api/v1/visits/progress/${progressId}/undo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock-token`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Không thể hoàn tác thao tác.');
    }

    const updated = await fetch('/api/v1/queues').then((r) => r.json());
    setAllQueues(updated);
  };

  // Chỉ định dịch vụ bổ sung (Doctor Only)
  const handleOrderServices = async (visitId: string, serviceIds: string[]) => {
    const res = await fetch(`/api/v1/service-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock-token`
      },
      body: JSON.stringify({
        visit_id: visitId,
        service_ids: serviceIds
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi khi tạo chỉ định.');
    }

    const updated = await fetch('/api/v1/queues').then((r) => r.json());
    setAllQueues(updated);
  };

  // Tiếp nhận bệnh nhân
  const handleCreateVisit = async (patientId: string, packageId?: string, isPriority?: boolean) => {
    const res = await fetch(`/api/v1/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer mock-token`
      },
      body: JSON.stringify({
        patient_id: patientId,
        package_id: packageId,
        is_priority: isPriority,
        reception_channel: 'COUNTER'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Lỗi tiếp nhận bệnh nhân.');
    }

    const updated = await fetch('/api/v1/queues').then((r) => r.json());
    setAllQueues(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        currentAccount={currentAccount}
        onRoleSwitch={(role) => setCurrentAccount({ ...currentAccount, role })}
        servicePoints={servicePoints}
        selectedServicePointId={selectedServicePointId}
        onSelectServicePoint={setSelectedServicePointId}
        isWsConnected={isConnected}
      />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          userRole={currentAccount.role}
        />

        <main className="flex-1 bg-slate-100/60 pb-12">
          {currentTab === 'my-service-point' && (
            <MyServicePoint
              queueSummary={selectedQueue}
              onUpdateStatus={handleUpdateStatus}
              onUndoStatus={handleUndoStatus}
              isLoading={isLoading}
            />
          )}

          {currentTab === 'doctor-consultation' && (
            <DoctorConsultation
              availableServices={availableServices}
              onOrderServices={handleOrderServices}
            />
          )}

          {currentTab === 'reception' && (
            <Reception
              packages={packages}
              onCreateVisit={handleCreateVisit}
            />
          )}

          {currentTab === 'admin-overview' && (
            <AdminOverview allQueues={allQueues} />
          )}
        </main>
      </div>
    </div>
  );
};
