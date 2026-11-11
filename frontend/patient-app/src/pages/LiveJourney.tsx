import React from 'react';
import { RotateCw, CheckCircle2, Clock, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { Route, RouteStep } from '../types';
import { formatDurationMinutes } from '../utils/formatTime';

interface LiveJourneyProps {
  currentRoute: Route | null;
  onRecalculateRequest: () => Promise<void>;
  isRecalculating: boolean;
  recalcNotice?: string | null;
}

export const LiveJourney: React.FC<LiveJourneyProps> = ({
  currentRoute,
  onRecalculateRequest,
  isRecalculating,
  recalcNotice,
}) => {
  if (!currentRoute || currentRoute.steps.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Chưa Khởi Tạo Lộ Trình</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Vui lòng quét mã tiếp nhận tại Kiosk hoặc liên hệ quầy Lễ Tân để nhận lộ trình khám tối ưu.
        </p>
      </div>
    );
  }

  const completedSteps = currentRoute.steps.filter((s) => s.status === 'COMPLETED');
  const activeStep = currentRoute.steps.find((s) => s.status === 'IN_PROGRESS' || s.status === 'WAITING') || currentRoute.steps[0];

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Thẻ Lộ Trình Tổng Quan */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full font-semibold">
              Phiên Bản #{currentRoute.version}
            </span>
            <span className="text-[11px] text-blue-100 italic">
              Nguồn: {currentRoute.suggestionSource === 'AI_RL' ? 'AI Tối Ưu' : 'Dự Phòng'}
            </span>
          </div>

          <div>
            <div className="text-xs text-blue-100 font-medium">Tổng Thời Gian Dự Kiến (Ước lượng)</div>
            <div className="text-3xl font-black tracking-tight">
              {formatDurationMinutes(currentRoute.estimatedTotalDurationSeconds)}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-blue-100 pt-2 border-t border-white/10">
            <span>Tiến độ: {completedSteps.length} / {currentRoute.steps.length} dịch vụ</span>
            <span>Bước hiện tại: {activeStep.stepOrder}</span>
          </div>
        </div>
      </div>

      {recalcNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{recalcNotice}</span>
        </div>
      )}

      {/* Nút Yêu Cầu Tính Lại Lộ Trình */}
      <button
        onClick={onRecalculateRequest}
        disabled={isRecalculating}
        className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-blue-600 font-bold rounded-2xl border border-blue-200 shadow-sm transition-all flex items-center justify-center gap-2 text-xs"
      >
        <RotateCw className={`w-4 h-4 ${isRecalculating ? 'animate-spin' : ''}`} />
        <span>{isRecalculating ? 'Đang Phân Tích Lưu Lượng...' : 'Yêu Cầu Tính Lại Lộ Trình (Nếu Đông)'}</span>
      </button>

      {/* Dòng Thời Gian Các Bước Khám (Timeline) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Hành Trình Khám Chi Tiết
        </h4>

        <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {currentRoute.steps.map((st) => {
            const isCompleted = st.status === 'COMPLETED';
            const isCurrent = st.id === activeStep.id;

            return (
              <div key={st.id} className="relative flex items-start gap-4 pl-1">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold z-10 ${
                    isCompleted
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : st.stepOrder}
                </div>

                <div
                  className={`flex-1 p-3.5 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-50/60 border-slate-200 opacity-70'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{st.serviceName}</div>
                      <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        <span>{st.servicePointName} ({st.roomNumber || 'Phòng khám'})</span>
                      </div>
                    </div>
                    {isCurrent && (
                      <span className="text-[10px] bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">
                        Đang Đến
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Chờ ước tính: <strong>{formatDurationMinutes(st.estimatedWaitSeconds)}</strong>
                    </span>
                    <span>Khám: ~{formatDurationMinutes(st.estimatedServiceSeconds)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
