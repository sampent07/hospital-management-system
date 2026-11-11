import React from 'react';
import { Sparkles, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';
import { Route } from '../types';
import { formatDurationMinutes } from '../utils/formatTime';

interface RouteDecisionModalProps {
  proposedRoute: Route;
  currentRoute: Route | null;
  onAccept: (routeId: string) => void;
  onReject: (routeId: string) => void;
  isSubmitting: boolean;
}

export const RouteDecisionModal: React.FC<RouteDecisionModalProps> = ({
  proposedRoute,
  currentRoute,
  onAccept,
  onReject,
  isSubmitting,
}) => {
  const currentTotal = currentRoute?.estimatedTotalDurationSeconds || 0;
  const newTotal = proposedRoute.estimatedTotalDurationSeconds;
  const savedMinutes = Math.max(0, Math.round((currentTotal - newTotal) / 60));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold">Đề Xuất Lộ Trình Tối Ưu Mới</h3>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            Hệ thống vừa phân tích lưu lượng thực tế và tìm thấy phương án giúp bạn giảm thời gian chờ đợi.
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* So sánh thời gian */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Thời gian ước lượng cũ</span>
              <span className="text-base font-bold text-slate-700 line-through">
                {formatDurationMinutes(currentTotal)}
              </span>
            </div>
            <ArrowRight className="w-5 h-5 text-blue-500" />
            <div className="text-right">
              <span className="text-xs text-blue-600 font-semibold block">Phương án mới (Ước lượng)</span>
              <span className="text-xl font-black text-emerald-600">
                {formatDurationMinutes(newTotal)}
              </span>
            </div>
          </div>

          {savedMinutes > 0 && (
            <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl text-center border border-emerald-200">
              Tiết kiệm khoảng <strong>{savedMinutes} phút</strong> thời gian chờ của bạn!
            </div>
          )}

          {/* Các bước thứ tự mới */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Thứ Tự Khám Mới Đề Xuất:
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {proposedRoute.steps.map((st) => (
                <div key={st.id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {st.stepOrder}
                    </span>
                    <div>
                      <span className="font-bold text-slate-800">{st.serviceName}</span>
                      <span className="text-slate-500 block text-[11px]">{st.servicePointName} ({st.roomNumber})</span>
                    </div>
                  </div>
                  <span className="text-slate-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    Chờ: {formatDurationMinutes(st.estimatedWaitSeconds)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 italic text-center">
            * Thời gian trên chỉ là ước tính dựa trên tốc độ khám thực tế tại các phòng.
          </div>
        </div>

        {/* 2 Nút lựa chọn: BỆNH NHÂN LÀ NGƯỜI QUYẾT ĐỊNH */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button
            onClick={() => onReject(proposedRoute.id)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-300 transition-all flex items-center justify-center gap-1.5"
          >
            <XCircle className="w-4 h-4 text-slate-400" />
            <span>Giữ Lộ Trình Cũ</span>
          </button>

          <button
            onClick={() => onAccept(proposedRoute.id)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Chấp Nhận Lộ Trình Mới</span>
          </button>
        </div>
      </div>
    </div>
  );
};
