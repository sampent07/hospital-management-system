import React, { useState } from 'react';
import { Play, CheckCircle2, RotateCcw, AlertTriangle, Clock, User, Award, ShieldAlert } from 'lucide-react';
import { ServicePointQueueSummary, QueuePatient } from '../types';
import { formatFacilityTimeOnly, formatDurationMinutes } from '../utils/formatTime';

interface MyServicePointProps {
  queueSummary: ServicePointQueueSummary | null;
  onUpdateStatus: (progressId: string, newStatus: string, expectedVersion: number) => Promise<void>;
  onUndoStatus: (progressId: string) => Promise<void>;
  isLoading: boolean;
}

export const MyServicePoint: React.FC<MyServicePointProps> = ({
  queueSummary,
  onUpdateStatus,
  onUndoStatus,
  isLoading,
}) => {
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center text-slate-500 gap-2">
        <Clock className="w-5 h-5 animate-spin text-primary-600" />
        <span>Đang đồng bộ dữ liệu hàng đợi...</span>
      </div>
    );
  }

  if (!queueSummary) {
    return (
      <div className="p-8 text-center text-slate-500">
        Không tìm thấy thông tin điểm dịch vụ được chọn.
      </div>
    );
  }

  const handleStart = async (p: QueuePatient) => {
    setActionError(null);
    try {
      await onUpdateStatus(p.progressId, 'IN_PROGRESS', p.version);
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message);
    }
  };

  const handleComplete = async (p: QueuePatient) => {
    setActionError(null);
    try {
      await onUpdateStatus(p.progressId, 'COMPLETED', p.version);
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message);
    }
  };

  const handleUndo = async (progressId: string) => {
    setActionError(null);
    try {
      await onUndoStatus(progressId);
    } catch (err: unknown) {
      if (err instanceof Error) setActionError(err.message);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header chỉ số điểm dịch vụ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">{queueSummary.servicePointName}</h2>
            <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-mono font-bold">
              {queueSummary.roomNumber || queueSummary.servicePointCode}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thời gian phục vụ trung bình: <strong>{formatDurationMinutes(queueSummary.avgServiceDurationSeconds)}</strong> | Sức chứa tối đa: <strong>{queueSummary.queueCapacity} người</strong>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Thời gian chờ ước tính</span>
            <span className="text-2xl font-black text-primary-600">
              {formatDurationMinutes(queueSummary.estimatedWaitSeconds)}
            </span>
          </div>
          <div className="text-right border-l border-slate-200 pl-6">
            <span className="text-xs text-slate-500 block">Số người đang chờ</span>
            <span className={`text-2xl font-black ${queueSummary.isFull ? 'text-rose-600' : 'text-slate-800'}`}>
              {queueSummary.waitingCount} / {queueSummary.queueCapacity}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* 3 KHỐI NGHIỆP VỤ BẮT BUỘC: ĐANG THỰC HIỆN - ĐANG CHỜ - VỪA HOÀN THÀNH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KHỐI 1: ĐANG THỰC HIỆN */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>1. Đang Thực Hiện</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
              {queueSummary.inProgressPatients.length} / {queueSummary.resourceCount}
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {queueSummary.inProgressPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Hiện chưa có bệnh nhân nào đang thực hiện.
              </div>
            ) : (
              queueSummary.inProgressPatients.map((p) => (
                <div key={p.progressId} className="p-4 bg-emerald-50/30 border border-emerald-200 rounded-xl space-y-3 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">{p.patientName}</span>
                        {p.isPriority && (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Award className="w-3 h-3" /> Ưu tiên
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 font-mono">Mã khám: {p.visitCode}</span>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-1 rounded border border-slate-200">
                      STT: #{p.queueNumber}
                    </span>
                  </div>

                  <button
                    onClick={() => handleComplete(p)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hoàn Thành Khám (1-Chạm)</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KHỐI 2: ĐANG CHỜ (Hàng đợi) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-primary-50/50 rounded-t-2xl">
            <div className="flex items-center gap-2 text-primary-800 font-bold text-sm">
              <Clock className="w-4 h-4 text-primary-600" />
              <span>2. Đang Chờ Tại Bàn</span>
            </div>
            <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
              {queueSummary.waitingPatients.length}
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {queueSummary.waitingPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Hàng đợi đang trống.
              </div>
            ) : (
              queueSummary.waitingPatients.map((p, idx) => (
                <div
                  key={p.progressId}
                  className={`p-3.5 border rounded-xl space-y-2.5 transition-all ${
                    p.isPriority
                      ? 'bg-amber-50/40 border-amber-300'
                      : 'bg-slate-50/50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 1}</span>
                        <span className="text-sm font-bold text-slate-800">{p.patientName}</span>
                        {p.isPriority && (
                          <span className="bg-amber-200/60 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Ưu tiên
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Giờ vào hàng: {formatFacilityTimeOnly(p.queuedAt)}
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      STT {p.queueNumber}
                    </span>
                  </div>

                  <button
                    onClick={() => handleStart(p)}
                    className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mời Bệnh Nhân / Bắt Đầu</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* KHỐI 3: VỪA HOÀN THÀNH (Có nút Hoàn tác trong 60s) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              <span>3. Vừa Hoàn Thành</span>
            </div>
            <span className="text-xs text-slate-500">Cho phép hoàn tác (60s)</span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[500px]">
            {queueSummary.recentlyCompletedPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                Chưa có lượt khám nào vừa hoàn thành gần đây.
              </div>
            ) : (
              queueSummary.recentlyCompletedPatients.map((p) => (
                <div key={p.progressId} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{p.patientName}</div>
                    <div className="text-[11px] text-slate-500">Mã: {p.visitCode} (STT #{p.queueNumber})</div>
                  </div>

                  <button
                    onClick={() => handleUndo(p.progressId)}
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md text-xs transition-all flex items-center gap-1 border border-slate-300"
                    title="Hoàn tác thao tác nếu bấm nhầm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Hoàn tác</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
