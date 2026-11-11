import React, { useState, useEffect } from 'react';
import { Users, Clock, Building2 } from 'lucide-react';
import { formatDurationMinutes } from '../utils/formatTime';

interface QueueItem {
  servicePointId: string;
  servicePointCode: string;
  servicePointName: string;
  roomNumber?: string;
  waitingCount: number;
  estimatedWaitSeconds: number;
}

export const QueueBoard: React.FC = () => {
  const [queues, setQueues] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch('/api/v1/queues')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setQueues(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Tình Trạng Hàng Đợi Toàn Viện</h3>
          <p className="text-[11px] text-slate-500">Giúp bạn nắm bắt tình hình trước khi di chuyển</p>
        </div>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs">Đang tải bảng hàng đợi...</div>
      ) : (
        <div className="space-y-3">
          {queues.map((q) => (
            <div key={q.servicePointId} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{q.servicePointName}</div>
                <div className="text-xs text-blue-600 font-medium">{q.roomNumber || q.servicePointCode}</div>
              </div>

              <div className="text-right">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-end gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{q.waitingCount} người chờ</span>
                </div>
                <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>Ước tính: {formatDurationMinutes(q.estimatedWaitSeconds)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
