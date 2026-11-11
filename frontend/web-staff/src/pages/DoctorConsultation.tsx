import React, { useState } from 'react';
import { Stethoscope, PlusCircle, CheckCircle2, FileText, Pill, ShieldAlert, Sparkles } from 'lucide-react';
import { ExamService } from '../types';

interface DoctorConsultationProps {
  availableServices: ExamService[];
  onOrderServices: (visitId: string, serviceIds: string[]) => Promise<void>;
}

export const DoctorConsultation: React.FC<DoctorConsultationProps> = ({
  availableServices,
  onOrderServices,
}) => {
  const [selectedVisitId, setSelectedVisitId] = useState<string>('VK-20261111-001');
  const [patientName, setPatientName] = useState<string>('Lê Văn Hùng (35T, Nam)');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<string>('Viêm đường hô hấp trên / Theo dõi trào ngược dạ dày thực quản');
  const [prescription, setPrescription] = useState<string>('1. Paracetamol 500mg - 2 viên/ngày khi sốt\n2. Omeprazole 20mg - 1 viên trước ăn sáng 30p');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddOrders = async () => {
    if (selectedServiceIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 dịch vụ để chỉ định.');
      return;
    }
    setErrorMsg(null);
    try {
      await onOrderServices(selectedVisitId, selectedServiceIds);
      setIsSuccess(true);
      setSelectedServiceIds([]);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner chức năng Bác sĩ */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-200" />
            <h2 className="text-xl font-bold">Phân Hệ Khám & Chỉ Định Chuyên Khoa</h2>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Đặc quyền tạo chỉ định dịch vụ lâm sàng & cận lâm sàng. Hệ thống sẽ tự động cập nhật và tính lại lộ trình tối ưu cho bệnh nhân.
          </p>
        </div>
        <div className="bg-emerald-800/40 px-3 py-1.5 rounded-lg border border-emerald-400/30 text-xs font-mono">
          QUYỀN HẠN: DOCTOR ONLY
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>Đã ghi nhận chỉ định dịch vụ thành công! Hệ thống AI đang cập nhật lộ trình khám mới.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thông tin bệnh nhân đang khám */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <span>Hồ Sơ Lượt Khám Đang Xử Lý</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Mã Lượt Khám (Visit Code)</label>
            <input
              type="text"
              value={selectedVisitId}
              onChange={(e) => setSelectedVisitId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-primary-500"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Bệnh Nhân</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Chỉ định dịch vụ bổ sung */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Chỉ Định Dịch Vụ Cận Lâm Sàng & Xét Nghiệm Bổ Sung</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Chọn các xét nghiệm hoặc chẩn đoán hình ảnh cần thực hiện thêm</p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            Đã chọn: {selectedServiceIds.length} dịch vụ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {availableServices.map((es) => {
            const isChecked = selectedServiceIds.includes(es.id);
            return (
              <div
                key={es.id}
                onClick={() => handleToggleService(es.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-400 shadow-sm'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-800">{es.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Mã: {es.code} | Nhóm: {es.category}
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                    isChecked
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isChecked && <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleAddOrders}
          disabled={selectedServiceIds.length === 0}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Xác Nhận Chỉ Định & Kích Hoạt Tính Lại Lộ Trình</span>
        </button>
      </div>

      {/* Kết luận & Kê đơn thuốc */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-sm font-bold text-slate-800 block flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary-600" />
            <span>Chẩn Đoán Lâm Sàng & Kết Luận</span>
          </label>
          <textarea
            rows={4}
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500"
            placeholder="Nhập chẩn đoán và hướng dẫn dặn dò..."
          />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-sm font-bold text-slate-800 block flex items-center gap-2">
            <Pill className="w-4 h-4 text-indigo-600" />
            <span>Đơn Thuốc Điện Tử</span>
          </label>
          <textarea
            rows={4}
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl text-sm font-mono outline-none focus:border-primary-500"
            placeholder="Liều lượng, hàm lượng, cách dùng..."
          />
        </div>
      </div>
    </div>
  );
};
