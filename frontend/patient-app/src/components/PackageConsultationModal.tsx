import React, { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  Layers,
  Check,
  Info
} from 'lucide-react';
import { PackageDetail } from '../types';

export interface PatientBasicInfo {
  fullName: string;
  phone: string;
  age: number;
  gender: string;
  insuranceCard?: string;
  initialNotes?: string;
  selectedDiseases?: string[];
  medicalHistoryDetail?: string;
  maritalStatus?: string;
  purpose?: string;
}

export interface CorporateBasicInfo {
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail?: string;
  employeeScale: string;
  maleEmployees?: number;
  femaleEmployees?: number;
  totalEmployees?: number;
  workEnvironment: string;
  corporatePackageNeed: string;
  corporateNotes?: string;
}

interface PackageConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType?: 'INDIVIDUAL' | 'CORPORATE';
  patientInfo?: PatientBasicInfo;
  corporateInfo?: CorporateBasicInfo;
  onProceedToBooking: (pkg: PackageDetail) => void;
  mockPackages: Record<string, PackageDetail>;
}

// 5 gói khám phổ biến nhất cho Cá nhân
const individualPopularKeys = [
  'basic-general',
  'male-general',
  'female-general',
  'digestive-gastro',
  'senior-comprehensive'
];

// 5 gói khám phổ biến nhất cho Doanh nghiệp
const corporatePopularKeys = [
  'corp-std',
  'corp-occupational',
  'corp-office',
  'corp-adv',
  'corp-vip'
];

export const PackageConsultationModal: React.FC<PackageConsultationModalProps> = ({
  isOpen,
  onClose,
  targetType = 'INDIVIDUAL',
  patientInfo,
  corporateInfo,
  onProceedToBooking,
  mockPackages,
}) => {
  // Trạng thái bật gợi ý gói khám phù hợp từ AI
  const [isAiSuggestedActive, setIsAiSuggestedActive] = useState<boolean>(false);

  // Gói khám đang được chọn
  const [selectedPkgId, setSelectedPkgId] = useState<string>('male-general');

  // Xem chi tiết danh mục dịch vụ của gói nào
  const [expandedPkgId, setExpandedPkgId] = useState<string | null>(null);

  // Tính toán gói gợi ý dựa trên thông tin đã điền ở phiếu khám trước đó
  const getRecommendation = () => {
    if (targetType === 'CORPORATE') {
      const need = corporateInfo?.corporatePackageNeed || '';
      const env = corporateInfo?.workEnvironment || '';

      if (need === 'VIP_EXECUTIVE') {
        return {
          key: 'corp-vip',
          reason: `Gói VIP chuyên biệt cho cấp Lãnh đạo & Quản lý của ${corporateInfo?.companyName || 'doanh nghiệp'} với phòng chờ riêng và tầm soát chuyên sâu.`
        };
      }
      if (env === 'FACTORY' || env === 'LOGISTICS') {
        return {
          key: 'corp-occupational',
          reason: `Phù hợp môi trường sản xuất / cơ khí / kho vận, tích hợp đo thính lực và đo chức năng hô hấp tầm soát bệnh nghề nghiệp.`
        };
      }
      if (env === 'OFFICE' || need === 'OFFICE_TECH') {
        return {
          key: 'corp-office',
          reason: `Tối ưu cho nhân sự văn phòng & IT, tầm soát cột sống cổ, thắt lưng, thị lực và mỡ máu cao do ngồi nhiều.`
        };
      }
      if (corporateInfo?.employeeScale === 'Trên 500 nhân sự' || need === 'TT32_STANDARD') {
        return {
          key: 'corp-std',
          reason: `Đáp ứng trọn vẹn 100% tiêu chuẩn Thông tư 32/2023/TT-BYT của Bộ Y Tế cho doanh nghiệp (${corporateInfo?.employeeScale || 'quy mô lớn'}).`
        };
      }
      return {
        key: 'corp-adv',
        reason: 'Gói khám toàn diện nâng cao bổ sung siêu âm tuyến giáp và tầm soát ung thư sớm, được nhiều doanh nghiệp lựa chọn.'
      };
    }

    // Khám Cá Nhân
    const pInfo = patientInfo || { fullName: '', phone: '', age: 38, gender: 'MALE' };
    const diseases = pInfo.selectedDiseases || [];
    const hasGastro = diseases.includes('Đau dạ dày / Tiêu hóa');
    const hasCardio = diseases.some((d) => ['Tăng huyết áp', 'Bệnh tim mạch', 'Đái tháo đường'].includes(d));

    if (pInfo.age >= 50 || hasCardio) {
      return {
        key: 'senior-comprehensive',
        reason: `Dựa trên ${
          pInfo.age >= 50 ? `độ tuổi (${pInfo.age} tuổi)` : 'tiền sử tim mạch / huyết áp'
        }, hệ thống ưu tiên gói tầm soát chuyên sâu tim mạch & đột quỵ.`
      };
    }
    if (hasGastro) {
      return {
        key: 'digestive-gastro',
        reason: 'Dựa trên tiền sử đau dạ dày / tiêu hóa đã điền, hệ thống đề xuất gói tầm soát tiêu hóa & test vi khuẩn HP hơi thở.'
      };
    }
    if (pInfo.gender === 'FEMALE') {
      return {
        key: 'female-general',
        reason: `Dành cho Nữ giới (${pInfo.age} tuổi), tích hợp tầm soát phụ khoa, tuyến vú và các chỉ số sinh hóa chuyên sâu.`
      };
    }
    if (pInfo.gender === 'MALE') {
      return {
        key: 'male-general',
        reason: `Dành cho Nam giới (${pInfo.age} tuổi), tầm soát chức năng gan thận, mỡ máu, phổi và bệnh chuyển hóa.`
      };
    }
    return {
      key: 'basic-general',
      reason: 'Gói khám sức khỏe tổng quát cơ bản, chi phí tiết kiệm và nhận kết quả nhanh chóng.'
    };
  };

  const recommendation = getRecommendation();

  // Reset khi mở modal
  React.useEffect(() => {
    if (isOpen) {
      const rec = getRecommendation();
      setSelectedPkgId(rec.key);
      setIsAiSuggestedActive(false);
      setExpandedPkgId(rec.key);
    }
  }, [isOpen, patientInfo, corporateInfo, targetType]);

  if (!isOpen) return null;

  // Xử lý khi nhấn nút nhỏ: "Gợi ý gói khám phù hợp"
  const handleTriggerAiRecommendation = () => {
    setIsAiSuggestedActive(true);
    setSelectedPkgId(recommendation.key);
    setExpandedPkgId(recommendation.key);
  };

  // Lấy danh sách 5 gói khám phổ biến tương ứng với loại khám
  const popularKeys = targetType === 'CORPORATE' ? corporatePopularKeys : individualPopularKeys;
  const packagesList: PackageDetail[] = popularKeys
    .map((k) => mockPackages[k])
    .filter(Boolean);

  const activePackage = mockPackages[selectedPkgId] || packagesList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header Cửa Sổ: Đã bỏ toàn bộ thông tin trùng lặp (Tên, SĐT, BHYT) */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50/90 via-white to-indigo-50/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-600" />
                <span>
                  {targetType === 'CORPORATE'
                    ? 'Cửa Sổ Chọn Gói Khám Doanh Nghiệp'
                    : 'Cửa Sổ Chọn Gói Khám Cá Nhân'}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Smart OPD</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
              {targetType === 'CORPORATE'
                ? '5 Gói Khám Doanh Nghiệp Phổ Biến Nhất Hiện Nay'
                : '5 Gói Khám Sức Khỏe Phổ Biến Nhất Hiện Nay'}
            </h3>
            <p className="text-xs text-slate-500">
              {targetType === 'CORPORATE'
                ? `Doanh nghiệp: ${corporateInfo?.companyName || ''} • Quy mô khám: Nam: ${corporateInfo?.maleEmployees ?? 60} ; Nữ: ${corporateInfo?.femaleEmployees ?? 40} (Tổng: ${corporateInfo?.totalEmployees ?? 100} người)`
                : 'Chọn gói khám phù hợp hoặc bấm nút gợi ý để AI đối chiếu theo thông tin bạn đã điền.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh công cụ: Cảnh báo y khoa & Nút nhỏ Gợi Ý Gói Khám */}
        <div className="p-3 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
          {/* Cảnh báo y khoa bắt buộc */}
          <div className="flex items-center gap-2 text-amber-900 leading-tight">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-[11px]">
              <strong>Lưu ý:</strong> Gợi ý gói khám mang tính chất tham khảo, không thay thế chẩn đoán của Bác sĩ.
            </span>
          </div>

          {/* NÚT NHỎ GỢI Ý GÓI KHÁM PHÙ HỢP THEO YÊU CẦU */}
          <button
            type="button"
            onClick={handleTriggerAiRecommendation}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer shrink-0 ${
              isAiSuggestedActive
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20 ring-2 ring-amber-300'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/15 hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
            <span>Gợi Ý Gói Khám Phù Hợp</span>
            {isAiSuggestedActive && (
              <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full ml-0.5">
                Đang bật
              </span>
            )}
          </button>
        </div>

        {/* Thân Cửa Sổ: Danh sách 5 gói khám phổ biến */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5">
          
          {/* Thông báo khi bấm Gợi ý gói khám */}
          {isAiSuggestedActive && (
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-orange-50 border-2 border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900 animate-in fade-in duration-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>
                    {targetType === 'CORPORATE'
                      ? 'Hệ thống đã phân tích hồ sơ doanh nghiệp của bạn:'
                      : 'Hệ thống đã nhận diện hồ sơ của bạn:'}
                  </strong>{' '}
                  Gói được gợi ý đang hiển thị với{' '}
                  <strong className="text-amber-700 underline decoration-amber-400">màu vàng kim nổi bật riêng biệt</strong> phía dưới.
                </span>
              </div>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-lg shrink-0">
                AI Match 98%
              </span>
            </div>
          )}

          {/* Danh sách 5 gói khám */}
          <div className="space-y-3">
            {packagesList.map((pkg, idx) => {
              const isSelected = selectedPkgId === pkg.id;
              const isRecommended = isAiSuggestedActive && pkg.id === mockPackages[recommendation.key]?.id;
              const isExpanded = expandedPkgId === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPkgId(pkg.id)}
                  className={`rounded-2xl transition-all cursor-pointer relative overflow-hidden ${
                    isRecommended
                      ? /* MÀU RIÊNG BIỆT CHO GÓI ĐƯỢC GỢI Ý */
                        'border-2 border-amber-500 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10 bg-gradient-to-br from-amber-50/90 via-amber-100/30 to-yellow-50'
                      : isSelected
                      ? 'border-2 border-blue-500 shadow-md shadow-blue-500/10 bg-blue-50/40'
                      : 'border border-slate-200 hover:border-blue-300 bg-white hover:bg-slate-50/70 shadow-xs'
                  }`}
                >
                  {/* Dải huy hiệu màu riêng biệt cho gói được AI gợi ý */}
                  {isRecommended && (
                    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-[10px] font-black px-3.5 py-1 flex items-center justify-between uppercase tracking-wider shadow-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                        <span>
                          {targetType === 'CORPORATE'
                            ? 'Gói Khám Đề Xuất Tối Ưu Cho Doanh Nghiệp (AI Khuyến Nghị)'
                            : 'Gói Khám Phù Hợp Nhất Với Hồ Sơ Của Bạn (AI Đề Xuất)'}
                        </span>
                      </div>
                      <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded font-mono">
                        Ưu tiên hàng đầu
                      </span>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      {/* Tiêu đề & Mã gói */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-400">#{idx + 1}</span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                              isRecommended
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}
                          >
                            {pkg.code}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {pkg.targetAudienceText}
                          </span>
                        </div>
                        <h4
                          className={`text-base font-extrabold ${
                            isRecommended ? 'text-amber-950 font-black' : 'text-slate-900'
                          }`}
                        >
                          {pkg.name}
                        </h4>
                      </div>

                      {/* Giá tiền & Chỉ thị chọn gói */}
                      <div className="flex items-center justify-between sm:justify-end gap-3.5 sm:shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="sm:text-right">
                          <div
                            className={`text-lg sm:text-xl font-black ${
                              isRecommended ? 'text-amber-600' : 'text-blue-600'
                            }`}
                          >
                            {pkg.basePrice.toLocaleString('vi-VN')} VNĐ
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {pkg.priceUnitText || (targetType === 'CORPORATE' ? '/ nhân sự' : '/ người')}
                          </div>
                        </div>

                        {/* Vòng tròn chỉ thị chọn gói */}
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all shrink-0 ${
                            isSelected
                              ? isRecommended
                                ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                                : 'border-blue-600 bg-blue-600 text-white shadow-xs'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Mô tả ngắn */}
                    <p
                      className={`text-xs leading-relaxed line-clamp-2 ${
                        isRecommended ? 'text-amber-900/90 font-medium' : 'text-slate-600'
                      }`}
                    >
                      {pkg.description}
                    </p>

                    {/* Dòng lý do đề xuất riêng biệt nếu là gói AI gợi ý */}
                    {isRecommended && (
                      <div className="p-2.5 bg-white/80 rounded-xl border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Lý do AI đề xuất:</strong> {recommendation.reason}
                        </div>
                      </div>
                    )}

                    {/* Nút bấm xem danh mục dịch vụ chi tiết của gói */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPkgId(isExpanded ? null : pkg.id);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>
                          {isExpanded ? 'Thu gọn danh mục dịch vụ ▲' : 'Xem chi tiết các dịch vụ trong gói ▼'}
                        </span>
                      </button>

                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Bao gồm khám, X-quang, siêu âm & xét nghiệm</span>
                      </div>
                    </div>

                    {/* Khung chi tiết danh mục dịch vụ khi mở rộng */}
                    {isExpanded && (
                      <div className="pt-2.5 space-y-2 text-xs animate-in fade-in duration-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto pr-1">
                          {[
                            ...pkg.clinicalServices,
                            ...pkg.imagingServices,
                            ...pkg.laboratoryServices,
                            ...pkg.functionalServices
                          ].map((srv, srvIdx) => (
                            <div
                              key={srvIdx}
                              className="p-2 bg-white rounded-xl border border-slate-200/90 flex items-center gap-2 text-[11px]"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="text-slate-800 font-medium truncate">{srv}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Cửa Sổ: Tinh gọn chỉ có nút Đăng Ký Gói Khám */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={() => {
              onProceedToBooking(activePackage);
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01]"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>
              {targetType === 'CORPORATE'
                ? 'Đăng Ký Gói Khám Doanh Nghiệp'
                : 'Đăng Ký Gói Khám'}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
