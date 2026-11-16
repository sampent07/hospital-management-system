import React, { useState } from 'react';
import {
  Stethoscope,
  PlusCircle,
  CheckCircle2,
  FileText,
  Pill,
  ShieldAlert,
  Sparkles,
  Printer,
  Trash2,
  Clock
} from 'lucide-react';
import { ExamService, PrescriptionItem, VisitSummary } from '../types';
import { PrintVisitModal } from '../components/PrintVisitModal';

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
  
  // Chẩn đoán
  const [icd10Code, setIcd10Code] = useState<string>('J06.9');
  const [diagnosisDesc, setDiagnosisDesc] = useState<string>(
    'Nhiễm khuẩn đường hô hấp trên cấp tính / Theo dõi viêm mũi họng'
  );

  // Đơn thuốc nhiều dòng
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    {
      drugName: 'Paracetamol 500mg',
      dosage: '500mg',
      unit: 'viên',
      quantity: 10,
      usageInstructions: 'Uống 1 viên khi sốt trên 38.5 độ C, cách ít nhất 4-6 giờ'
    },
    {
      drugName: 'Augmentin 1g',
      dosage: '1000mg',
      unit: 'viên',
      quantity: 14,
      usageInstructions: 'Uống 1 viên x 2 lần/ngày sau bữa ăn chính'
    }
  ]);
  const [doctorAdvice, setDoctorAdvice] = useState<string>(
    'Nghỉ ngơi, uống nhiều nước ấm, súc họng bằng nước muối sinh lý hàng ngày.'
  );

  // Kế hoạch điều trị & Tái khám
  const [treatmentPlan, setTreatmentPlan] = useState<string>(
    'Điều trị ngoại trú bằng thuốc kháng sinh và hạ sốt trong 7 ngày.'
  );
  const [durationDays, setDurationDays] = useState<number>(7);

  // Kết luận
  const [conclusionText, setConclusionText] = useState<string>(
    'Bệnh nhân tỉnh táo, viêm họng sung huyết mức độ vừa, không suy hô hấp.'
  );
  const [doctorRecommendation, setDoctorRecommendation] = useState<string>(
    'Tái khám sau 5-7 ngày hoặc ngay khi có dấu hiệu khó thở, sốt cao liên tục.'
  );

  // Trạng thái thao tác
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Modal in phiếu khám
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [visitSummary, setVisitSummary] = useState<VisitSummary | null>(null);

  const handleToggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // STAFF-08: Chỉ định dịch vụ bổ sung (Doctor Only)
  const handleAddOrders = async () => {
    if (selectedServiceIds.length === 0) {
      setErrorMsg('Vui lòng chọn ít nhất 1 dịch vụ để chỉ định.');
      return;
    }
    setErrorMsg(null);
    try {
      await onOrderServices(selectedVisitId, selectedServiceIds);
      setIsSuccess(true);
      setSuccessInfo('Đã ghi nhận chỉ định dịch vụ! Hệ thống AI đang cập nhật lại lộ trình.');
      setSelectedServiceIds([]);
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    }
  };

  // Thêm dòng thuốc
  const handleAddPrescriptionItem = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        drugName: '',
        dosage: '',
        unit: 'viên',
        quantity: 10,
        usageInstructions: 'Uống sau ăn'
      }
    ]);
  };

  const handleRemovePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PrescriptionItem, val: string | number) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: val };
    setPrescriptionItems(updated);
  };

  // STAFF-09, 10, 11: Lưu chẩn đoán, đơn thuốc, kế hoạch, kết luận
  const handleSaveFullConsultation = async () => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // 1. Gửi chẩn đoán
      if (diagnosisDesc.trim()) {
        await fetch('/api/v1/clinical/diagnoses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token'
          },
          body: JSON.stringify({
            visit_id: selectedVisitId,
            icd10_code: icd10Code || null,
            diagnosis_description: diagnosisDesc
          })
        });
      }

      // 2. Kê đơn thuốc nếu có thuốc
      const validItems = prescriptionItems.filter((it) => it.drugName.trim() !== '');
      if (validItems.length > 0) {
        await fetch('/api/v1/clinical/prescriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token'
          },
          body: JSON.stringify({
            visit_id: selectedVisitId,
            doctor_advice: doctorAdvice,
            items: validItems
          })
        });
      }

      // 3. Kế hoạch điều trị
      if (treatmentPlan.trim()) {
        await fetch('/api/v1/clinical/treatment-plans', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token'
          },
          body: JSON.stringify({
            visit_id: selectedVisitId,
            plan_content: treatmentPlan,
            estimated_duration_days: durationDays
          })
        });
      }

      // 4. Kết luận khám bệnh & Hoàn tất lượt khám
      if (conclusionText.trim()) {
        await fetch('/api/v1/clinical/conclusions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token'
          },
          body: JSON.stringify({
            visit_id: selectedVisitId,
            conclusion_text: conclusionText,
            doctor_recommendation: doctorRecommendation
          })
        });
      }

      setIsSuccess(true);
      setSuccessInfo('Đã lưu chẩn đoán, đơn thuốc và kết luận khám thành công!');
      setTimeout(() => setIsSuccess(false), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // STAFF-11: Lấy dữ liệu tóm tắt và mở Modal In Phiếu Khám
  const handleOpenPrintPreview = async () => {
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/v1/clinical/visits/${selectedVisitId}/summary`, {
        headers: { Authorization: 'Bearer mock-token' }
      });
      if (!res.ok) throw new Error('Không thể tải dữ liệu phiếu khám của lượt này.');
      const data: VisitSummary = await res.json();
      setVisitSummary(data);
      setShowPrintModal(true);
    } catch (err: unknown) {
      // Fallback preview nếu chưa gọi summary API
      const fallbackSummary: VisitSummary = {
        visitId: selectedVisitId,
        visitCode: selectedVisitId,
        checkInAt: new Date().toISOString(),
        patientName: patientName,
        patientDob: '1991-05-15',
        patientGender: 'MALE',
        patientPhone: '0901234567',
        patientAddress: '123 Nguyễn Trãi, Quận 5, TP. HCM',
        packageName: 'Gói khám Tiêu chuẩn & Chỉ định BS',
        doctorName: 'BS. CK1 Nguyễn Văn An',
        services: [],
        diagnoses: [
          {
            id: 'd1',
            visitId: selectedVisitId,
            doctorId: 'acc-03-doctor',
            icd10Code: icd10Code,
            diagnosisDescription: diagnosisDesc,
            diagnosedAt: new Date().toISOString()
          }
        ],
        prescriptions: [
          {
            id: 'p1',
            visitId: selectedVisitId,
            doctorId: 'acc-03-doctor',
            prescribedAt: new Date().toISOString(),
            doctorAdvice: doctorAdvice,
            items: prescriptionItems
          }
        ],
        treatmentPlans: [
          {
            id: 'tp1',
            visitId: selectedVisitId,
            doctorId: 'acc-03-doctor',
            planContent: treatmentPlan,
            startedAt: new Date().toISOString(),
            estimatedDurationDays: durationDays,
            status: 'ACTIVE'
          }
        ],
        conclusion: {
          id: 'c1',
          visitId: selectedVisitId,
          doctorId: 'acc-03-doctor',
          conclusionText: conclusionText,
          doctorRecommendation: doctorRecommendation,
          concludedAt: new Date().toISOString()
        }
      };
      setVisitSummary(fallbackSummary);
      setShowPrintModal(true);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Banner Bác Sĩ */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-200" />
            <h2 className="text-xl font-bold">Phân Hệ Khám Chuyên Khoa, Chỉ Định &amp; Đơn Thuốc</h2>
          </div>
          <p className="text-emerald-100 text-xs mt-1">
            Chỉ định cận lâm sàng, ghi nhận chẩn đoán ICD-10, kê toa thuốc và lập kết luận khám bệnh theo quy chuẩn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenPrintPreview}
            className="px-3.5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20"
          >
            <Printer className="w-4 h-4 text-emerald-100" />
            <span>In Phiếu Khám</span>
          </button>
          <div className="bg-emerald-800/40 px-3 py-1.5 rounded-lg border border-emerald-400/30 text-xs font-mono">
            VAI TRÒ: BÁC SĨ (DOCTOR)
          </div>
        </div>
      </div>

      {isSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successInfo}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Thông tin lượt khám đang xử lý */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <span>Lượt Khám Đang Tiếp Xúc</span>
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
            <label className="text-xs text-slate-500 font-medium block mb-1">Họ tên Bệnh Nhân</label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* STAFF-08: Chỉ định dịch vụ cận lâm sàng & xét nghiệm bổ sung */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>Chỉ Định Thêm Xét Nghiệm &amp; Cận Lâm Sàng (STAFF-08)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đặc quyền Doctor. Hệ thống sẽ tự kiểm tra ràng buộc và kích hoạt tính lại lộ trình tối ưu cho bệnh nhân.
            </p>
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
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Ban Hành Chỉ Định &amp; Kích Hoạt Tối Ưu Lộ Trình</span>
        </button>
      </div>

      {/* STAFF-09: Chẩn đoán lâm sàng ICD-10 */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <span>Chẩn Đoán Bệnh Theo Mã Quốc Tế (ICD-10)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-xs text-slate-500 font-medium block mb-1">Mã ICD-10</label>
            <input
              type="text"
              value={icd10Code}
              onChange={(e) => setIcd10Code(e.target.value)}
              placeholder="Ví dụ: J06.9, K21..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-primary-500 uppercase"
            />
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs text-slate-500 font-medium block mb-1">Mô tả Chẩn Đoán Xác Định</label>
            <input
              type="text"
              value={diagnosisDesc}
              onChange={(e) => setDiagnosisDesc(e.target.value)}
              placeholder="Mô tả chẩn đoán bệnh..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </div>

      {/* STAFF-10: Đơn thuốc điện tử nhiều dòng */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
            <Pill className="w-4 h-4 text-indigo-600" />
            <span>Kê Đơn Thuốc Điện Tử (STAFF-10)</span>
          </h3>
          <button
            type="button"
            onClick={handleAddPrescriptionItem}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Thêm Thuốc</span>
          </button>
        </div>

        <div className="space-y-3">
          {prescriptionItems.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
            >
              <div className="sm:col-span-4">
                <label className="text-[10px] text-slate-400 block sm:hidden">Tên thuốc</label>
                <input
                  type="text"
                  placeholder="Tên thuốc..."
                  value={item.drugName}
                  onChange={(e) => handleItemChange(idx, 'drugName', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  placeholder="Hàm lượng"
                  value={item.dosage}
                  onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="number"
                  placeholder="SL"
                  value={item.quantity}
                  min={1}
                  onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 bg-white text-center"
                />
              </div>
              <div className="sm:col-span-1">
                <input
                  type="text"
                  placeholder="ĐVT"
                  value={item.unit}
                  onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 bg-white text-center"
                />
              </div>
              <div className="sm:col-span-3">
                <input
                  type="text"
                  placeholder="Cách dùng..."
                  value={item.usageInstructions}
                  onChange={(e) => handleItemChange(idx, 'usageInstructions', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500 bg-white"
                />
              </div>
              <div className="sm:col-span-1 text-right">
                <button
                  type="button"
                  onClick={() => handleRemovePrescriptionItem(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                  title="Xóa dòng thuốc"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="text-xs text-slate-500 font-medium block mb-1">Lời dặn của Bác sĩ</label>
          <input
            type="text"
            value={doctorAdvice}
            onChange={(e) => setDoctorAdvice(e.target.value)}
            placeholder="Lời dặn kiêng cữ, chế độ dinh dưỡng..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Kế hoạch điều trị & Kết luận */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-800 block uppercase tracking-wide flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-600" />
            <span>Kế Hoạch Điều Trị Ngoại Trú</span>
          </label>
          <textarea
            rows={3}
            value={treatmentPlan}
            onChange={(e) => setTreatmentPlan(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-primary-500"
            placeholder="Phác đồ điều trị..."
          />
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Thời gian điều trị dự kiến:</span>
            <input
              type="number"
              value={durationDays}
              onChange={(e) => setDurationDays(parseInt(e.target.value) || 0)}
              className="w-16 px-2 py-1 border border-slate-300 rounded text-center font-bold"
            />
            <span>ngày</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <label className="text-xs font-bold text-slate-800 block uppercase tracking-wide flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Kết Luận Lượt Khám &amp; Khuyến Nghị (STAFF-11)</span>
          </label>
          <textarea
            rows={3}
            value={conclusionText}
            onChange={(e) => setConclusionText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-emerald-500"
            placeholder="Tình trạng sức khỏe chung sau khám..."
          />
          <input
            type="text"
            value={doctorRecommendation}
            onChange={(e) => setDoctorRecommendation(e.target.value)}
            placeholder="Khuyến nghị theo dõi sức khỏe..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Nút lưu toàn diện & hoàn tất khám */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSaveFullConsultation}
          disabled={isSubmitting}
          className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{isSubmitting ? 'Đang lưu hồ sơ...' : 'Lưu Kết Quả Khám, Đơn Thuốc & Kết Luận'}</span>
        </button>

        <button
          onClick={handleOpenPrintPreview}
          className="py-3 px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Xem Trước &amp; In Phiếu Khám</span>
        </button>
      </div>

      {/* Modal In Phiếu Khám */}
      <PrintVisitModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        summary={visitSummary}
      />
    </div>
  );
};
