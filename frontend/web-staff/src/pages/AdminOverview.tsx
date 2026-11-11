import React from 'react';
import { LayoutDashboard, Users, Clock, Building2, CheckCircle2 } from 'lucide-react';
import { ServicePointQueueSummary } from '../types';
import { formatDurationMinutes } from '../utils/formatTime';

interface AdminOverviewProps {
  allQueues: ServicePointQueueSummary[];
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ allQueues }) => {
  const totalWaiting = allQueues.reduce((acc, q) => acc + q.waitingCount, 0);
  const totalInProgress = allQueues.reduce((acc, q) => acc + q.inProgressCount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* 4 Thẻ KPI Tổng Thể Bệnh Viện */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Điểm Khám Hoạt Động</span>
            <Building2 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">{allQueues.length} Phòng</div>
          <span className="text-xs text-emerald-600 font-medium">100% Sẵn sàng tiếp nhận</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Đang Thực Hiện</span>
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalInProgress} Bệnh nhân</div>
          <span className="text-xs text-slate-500">Đang phục vụ tại bàn</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Hàng Đợi Chờ Khám</span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600">{totalWaiting} Người</div>
          <span className="text-xs text-slate-500">Toàn viện</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Lưu Viện Trung Bình</span>
            <CheckCircle2 className="w-5 h-5 text-primary-600" />
          </div>
          <div className="text-2xl font-black text-slate-800">42 phút</div>
          <span className="text-xs text-emerald-600 font-medium">Giảm 38% nhờ AI Routing</span>
        </div>
      </div>

      {/* Bảng Giám Sát Hàng Đợi Toàn Bộ Điểm Dịch Vụ (Realtime) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Giám Sát Tải Thời Gian Thực Tại Các Điểm Dịch Vụ</h3>
            <p className="text-xs text-slate-500">Tự động đồng bộ mỗi 2 giây qua WebSocket theo DOMAIN_RULES</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
            Trạng Thái: Trực Tiếp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="p-3.5">Mã Phòng</th>
                <th className="p-3.5">Tên Điểm Dịch Vụ</th>
                <th className="p-3.5">Số Nguồn Lực (Bàn)</th>
                <th className="p-3.5">Đang Khám</th>
                <th className="p-3.5">Đang Chờ</th>
                <th className="p-3.5">Sức Chứa</th>
                <th className="p-3.5">TG Chờ Ước Tính</th>
                <th className="p-3.5 text-right">Mức Độ Tải</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {allQueues.map((q) => {
                const loadPercent = Math.min(100, Math.round((q.waitingCount / q.queueCapacity) * 100));
                return (
                  <tr key={q.servicePointId} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      {q.roomNumber || q.servicePointCode}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{q.servicePointName}</td>
                    <td className="p-3.5 font-semibold">{q.resourceCount} Bàn</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                        {q.inProgressCount}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-primary-100 text-primary-800 px-2 py-0.5 rounded font-bold">
                        {q.waitingCount}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{q.queueCapacity}</td>
                    <td className="p-3.5 font-bold text-primary-600">
                      {formatDurationMinutes(q.estimatedWaitSeconds)}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              loadPercent > 80 ? 'bg-rose-500' : loadPercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${loadPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] font-bold">{loadPercent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
