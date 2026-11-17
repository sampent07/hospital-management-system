import React from 'react';
import { CheckCircle2, Clock, MapPin, Navigation, Info, ShieldAlert } from 'lucide-react';
import { Route } from '../types';
import { formatDurationMinutes } from '../utils/formatTime';

interface LiveJourneyProps {
  currentRoute: Route | null;
  queueNumber?: string;
}

export const LiveJourney: React.FC<LiveJourneyProps> = ({
  currentRoute,
  queueNumber,
}) => {
  if (!currentRoute || currentRoute.steps.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-slate-200 shadow-sm">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Chưa Khởi Tạo Lộ Trình</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Vui lòng quét mã tiếp nhận tại Kiosk hoặc liên hệ quầy Lễ Tân (Tầng 1) để nhận lộ trình khám tối ưu bằng thuật toán điều phối.
        </p>
      </div>
    );
  }

  const completedSteps = currentRoute.steps.filter((s) => s.status === 'COMPLETED');
  const activeStep = currentRoute.steps.find((s) => s.status === 'IN_PROGRESS' || s.status === 'WAITING') || currentRoute.steps[0];
  const isOptimized = currentRoute.version > 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Cột Trái (7 Phần): Thẻ Lộ Trình & Timeline Tiến Độ */}
      <div className="lg:col-span-7 space-y-5">
        {/* Thẻ Lộ Trình Tổng Quan (Viền ngoài màu xanh đồng bộ như ô Điểm Đến) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
              {isOptimized ? 'Lộ Trình Khám Đã Tối Ưu' : 'Lộ Trình Khám'}
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              Phiên Bản #{currentRoute.version}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 space-y-1">
            <div className="text-xs text-blue-700 font-semibold">
              Tổng Thời Gian Dự Kiến Toàn Bộ Lộ Trình (Ước lượng)
            </div>
            <div className="text-3xl sm:text-4xl font-black text-blue-600 tracking-tight">
              {formatDurationMinutes(currentRoute.estimatedTotalDurationSeconds)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">Tiến Độ Dịch Vụ</div>
              <div className="text-base font-extrabold text-slate-800 mt-0.5">
                {completedSteps.length} / {currentRoute.steps.length} đã xong
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">Bước Kế Tiếp</div>
              <div className="text-base font-extrabold text-blue-600 mt-0.5">
                Bước #{activeStep.stepOrder}
              </div>
            </div>
          </div>
        </div>

        {/* Dòng Thời Gian Các Bước Khám (Timeline) */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Hành Trình Khám Chi Tiết Của Bạn
            </h4>
            <span className="text-xs text-slate-400 font-medium">{currentRoute.steps.length} dịch vụ được chỉ định</span>
          </div>

          <div className="space-y-4 relative before:absolute before:left-3.5 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {currentRoute.steps.map((st) => {
              const isCompleted = st.status === 'COMPLETED';
              const isCurrent = st.id === activeStep.id;

              return (
                <div key={st.id} className="relative flex items-start gap-4 pl-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-bold z-10 shadow-sm ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : st.stepOrder}
                  </div>

                  <div
                    className={`flex-1 p-4 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-blue-50/60 border-blue-300 shadow-sm'
                        : isCompleted
                        ? 'bg-slate-50/60 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-sm font-bold text-slate-900">{st.serviceName}</div>
                        <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{st.servicePointName} • <strong>{st.roomNumber || 'Phòng khám'}</strong></span>
                        </div>
                      </div>
                      {isCurrent ? (
                        <span className="text-[10px] bg-blue-600 text-white font-bold px-2.5 py-1 rounded-full shrink-0 shadow-sm">
                          Đang Đến
                        </span>
                      ) : isCompleted ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-0.5 rounded-full shrink-0">
                          Đã xong
                        </span>
                      ) : (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full shrink-0">
                          Chờ sau
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Chờ ước tính: <strong className="text-slate-800">{formatDurationMinutes(st.estimatedWaitSeconds)}</strong>
                      </span>
                      <span>Thời gian khám: ~<strong>{formatDurationMinutes(st.estimatedServiceSeconds)}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cột Phải (5 Phần): Spotlight Phòng Hiện Tại & Chỉ Dẫn Y Tế (Khắc phục hoàn toàn sự trống vắng) */}
      <div className="lg:col-span-5 space-y-5">
        {/* Điểm Đến Kế Tiếp Spotlight */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-blue-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Navigation className="w-4 h-4 text-blue-600" />
              Điểm Khám Bạn Cần Đến Ngay
            </span>
            <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-full">
              Bước #{activeStep.stepOrder}
            </span>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100 space-y-1">
            <div className="text-base font-extrabold text-slate-900">{activeStep.serviceName}</div>
            <div className="text-xs text-blue-700 font-semibold flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-blue-600" />
              {activeStep.servicePointName} ({activeStep.roomNumber || 'Phòng khám'})
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">Thời Gian Chờ Ước Tính</div>
              <div className="text-lg font-black text-blue-600 mt-0.5">
                {formatDurationMinutes(activeStep.estimatedWaitSeconds)}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] text-slate-400 font-medium">Thời Lượng Khám</div>
              <div className="text-lg font-black text-slate-700 mt-0.5">
                ~{formatDurationMinutes(activeStep.estimatedServiceSeconds)}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-900 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              Hướng Dẫn Khi Đến Phòng:
            </div>
            <p className="text-[11px] text-blue-800 leading-relaxed">
              Bạn hãy di chuyển đến cửa phòng <strong>{activeStep.roomNumber || activeStep.servicePointName}</strong>, ngồi tại hàng ghế chờ và chú ý màn hình gọi số thứ tự <strong>{queueNumber || '#001'}</strong>.
            </p>
          </div>
        </div>

        {/* Hướng Dẫn Y Khoa Bệnh Nhân */}
        <div className="bg-white rounded-3xl p-5 border-2 border-blue-200 shadow-sm space-y-3.5">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Lưu Ý Chuẩn Bị Khi Khám</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Xét nghiệm máu (CBC):</strong>
              Giữ trạng thái nhịn ăn từ 6 - 8 tiếng trước khi lấy mẫu để đảm bảo chỉ số sinh hóa chính xác.
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <strong className="text-slate-800 block mb-0.5">Chụp X-Quang ngực:</strong>
              Tháo bỏ vòng cổ, trang sức kim loại và áo có cúc kim loại trước khi bước vào phòng chiếu xạ.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
