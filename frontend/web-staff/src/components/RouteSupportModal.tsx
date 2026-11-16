import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, RotateCcw, Clock, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react';
import { Route } from '../types';
import { formatDurationMinutes } from '../utils/formatTime';

interface RouteSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitId: string;
  patientName: string;
  onSuccessRefresh?: () => void;
}

export const RouteSupportModal: React.FC<RouteSupportModalProps> = ({
  isOpen,
  onClose,
  visitId,
  patientName,
  onSuccessRefresh,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [proposedRoute, setProposedRoute] = useState<Route | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestRecalculate = async () => {
    setIsCalculating(true);
    setActionMessage(null);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/routes/visits/${visitId}/recalculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          force_fallback: false,
          is_proxy_action: true // Ghi nhận cờ thao tác hộ
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi yêu cầu AI tính lại lộ trình.');
      }

      const routeData = await res.json();
      setProposedRoute(routeData);

      if (!routeData.is_better) {
        setActionMessage(routeData.message || 'Lộ trình hiện tại của bệnh nhân đã là tối ưu nhất.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg('Lỗi không xác định.');
    } finally {
      setIsCalculating(false);
    }
  };

  const handleDecision = async (decisionType: 'ACCEPTED_NEW' | 'KEPT_EXISTING') => {
    if (!proposedRoute) return;
    try {
      const res = await fetch(`/api/v1/routes/${proposedRoute.id}/decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          decision_type: decisionType,
          is_proxy_action: true // Thư ký thao tác hộ bệnh nhân
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Không thể ghi nhận quyết định.');
      }

      setActionMessage(
        decisionType === 'ACCEPTED_NEW'
          ? 'Đã áp dụng lộ trình mới cho bệnh nhân thành công (Ghi nhận Thao tác hộ)!'
          : 'Đã giữ nguyên lộ trình hiện tại theo yêu cầu.'
      );
      if (onSuccessRefresh) onSuccessRefresh();
      setTimeout(() => {
        onClose();
        setProposedRoute(null);
        setActionMessage(null);
      }, 2500);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary-200" />
            <div>
              <h3 className="font-bold text-base">Hỗ Trợ Lộ Trình Khám Thông Minh (Thao Tác Hộ)</h3>
              <p className="text-xs text-primary-100">Bệnh nhân: <strong>{patientName}</strong> | Mã lượt: {visitId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Quy tắc nghiệp vụ (STAFF-12):</strong> Thư ký / Điều phối viên hỗ trợ bệnh nhân tính lại lộ trình và quyết định thay mặt bệnh nhân. Mọi hành động được hệ thống gắn cờ <code>is_proxy_action: true</code> và ghi nhật ký bất biến.
            </div>
          </div>

          {actionMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{actionMessage}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!proposedRoute ? (
            <div className="text-center py-8 space-y-4">
              <Clock className="w-12 h-12 text-primary-400 mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Yêu Cầu Mô Hình AI Tối Ưu Lại Lộ Trình</h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Hệ thống sẽ dựa trên trạng thái hàng đợi thời gian thực của toàn viện để tìm lộ trình có tổng thời gian chờ ngắn nhất.
                </p>
              </div>
              <button
                onClick={handleRequestRecalculate}
                disabled={isCalculating}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 mx-auto"
              >
                <Sparkles className="w-4 h-4 text-primary-200 animate-spin" />
                <span>{isCalculating ? 'Đang tính toán với AI Service...' : 'Tính Lại Lộ Trình Ngay'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* So sánh lộ trình */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500 block">Ước tính thời gian lộ trình mới</span>
                  <span className="text-xl font-black text-primary-600">
                    {formatDurationMinutes(proposedRoute.estimatedTotalDurationSeconds)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 block">Đánh giá cải thiện</span>
                  {proposedRoute.isBetter ? (
                    <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      Tiết kiệm ~{proposedRoute.improvementMinutes || 3} phút
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-600 bg-slate-200 px-2.5 py-1 rounded-full">
                      Đã tối ưu (Không đổi)
                    </span>
                  )}
                </div>
              </div>

              {/* Danh sách các bước lộ trình đề xuất */}
              <div>
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Thứ tự phòng khám đề xuất ({proposedRoute.steps?.length || 0} dịch vụ)
                </h5>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {proposedRoute.steps?.map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800">{step.serviceName}</div>
                          <div className="text-slate-500">{step.servicePointName} ({step.roomNumber || 'Bàn khám'})</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-600 font-medium">Chờ ~{formatDurationMinutes(step.estimatedWaitSeconds)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nút quyết định thay mặt bệnh nhân */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDecision('KEPT_EXISTING')}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Giữ Lộ Trình Cũ</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDecision('ACCEPTED_NEW')}
                  className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Chấp Nhận Lộ Trình Mới (Hộ Bệnh Nhân)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
