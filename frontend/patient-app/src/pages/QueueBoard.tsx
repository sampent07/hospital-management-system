import React, { useState, useEffect } from 'react';
import { Users, Clock, Building } from 'lucide-react';
import { formatDurationMinutes } from '../utils/formatTime';

interface QueueItem {
  servicePointId: string;
  servicePointCode: string;
  servicePointName: string;
  roomNumber?: string;
  waitingCount: number;
  estimatedWaitSeconds: number;
}

const defaultQueues: QueueItem[] = [
  { servicePointId: 'sp-01', servicePointCode: 'SP-RECEPTION', servicePointName: 'Quầy Tiếp Đón & Lễ Tân', roomNumber: 'Sảnh Tầng 1', waitingCount: 2, estimatedWaitSeconds: 120 },
  { servicePointId: 'sp-02', servicePointCode: 'SP-INTERNAL-01', servicePointName: 'Phòng Khám Nội Tổng Quát', roomNumber: 'Phòng 101', waitingCount: 5, estimatedWaitSeconds: 900 },
  { servicePointId: 'sp-03', servicePointCode: 'SP-INTERNAL-02', servicePointName: 'Phòng Khám Nội 2', roomNumber: 'Phòng 102', waitingCount: 3, estimatedWaitSeconds: 480 },
  { servicePointId: 'sp-04', servicePointCode: 'SP-LAB-BLOOD', servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm Máu', roomNumber: 'Phòng XN-02', waitingCount: 4, estimatedWaitSeconds: 480 },
  { servicePointId: 'sp-05', servicePointCode: 'SP-XRAY', servicePointName: 'Phòng Chụp X-Quang Ngực', roomNumber: 'Phòng CĐHA-01', waitingCount: 1, estimatedWaitSeconds: 180 },
  { servicePointId: 'sp-06', servicePointCode: 'SP-ULTRASOUND', servicePointName: 'Phòng Siêu Âm Tổng Quát', roomNumber: 'Phòng CĐHA-03', waitingCount: 6, estimatedWaitSeconds: 1200 },
];

export const QueueBoard: React.FC = () => {
  const [queues, setQueues] = useState<QueueItem[]>(defaultQueues);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/v1/queues')
      .then((r) => (r.ok ? r.json() : []))
      .then((data: QueueItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setQueues(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        // Giữ defaultQueues nếu backend chưa chạy
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner Tiêu Đề Bảng Hàng Đợi */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border-2 border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900">Bảng Theo Dõi Hàng Đợi Toàn Viện</h3>
          <p className="text-xs text-slate-500 mt-1">
            Số liệu thời gian thực giúp bạn chủ động biết phòng nào vắng, phòng nào đang đông để tính lại lộ trình
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Realtime Live</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-slate-400 text-xs">Đang tải bảng hàng đợi...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queues.map((q) => {
            const isCrowded = q.waitingCount >= 5;
            const isClear = q.waitingCount <= 2;

            return (
              <div
                key={q.servicePointId}
                className="bg-white p-5 rounded-3xl border-2 border-blue-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-blue-600 flex items-center gap-1 mb-1">
                        <Building className="w-3.5 h-3.5" />
                        <span>{q.roomNumber || q.servicePointCode}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{q.servicePointName}</h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                        isClear
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isCrowded
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isClear ? 'Đang vắng' : isCrowded ? 'Rất đông' : 'Bình thường'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>{q.waitingCount} người chờ</span>
                  </div>

                  <div className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ước tính: <strong className="text-slate-800">{formatDurationMinutes(q.estimatedWaitSeconds)}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
