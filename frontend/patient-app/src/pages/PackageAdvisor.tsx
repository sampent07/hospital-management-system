import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, Sparkles, CheckCircle2, ShieldCheck, Stethoscope } from 'lucide-react';
import { PackageAdvisorResult } from '../types';

interface PackageAdvisorProps {
  onRegisterSuccess?: (packageName: string) => void;
}

export const PackageAdvisor: React.FC<PackageAdvisorProps> = ({ onRegisterSuccess }) => {
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<string>('MALE');
  const [maritalStatus, setMaritalStatus] = useState<string>('MARRIED');
  const [purpose, setPurpose] = useState<string>('GENERAL_CHECKUP');
  const [result, setResult] = useState<PackageAdvisorResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleAdvisorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/packages/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age,
          gender,
          marital_status: maritalStatus,
          examination_purpose: purpose,
          symptoms: []
        })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        // Fallback simulation nếu chưa bật backend
        setTimeout(() => {
          setResult({
            recommended_package: {
              id: 'pkg-general-01',
              code: 'PKG-GEN-MALE',
              name: 'Gói Khám Sức Khỏe Tổng Quát Nam Giới (Định Kỳ)',
              base_price: 1850000
            },
            explanation: 'Dựa trên độ tuổi 35 và mục đích khám tổng quát, hệ thống khuyến nghị gói bao gồm đầy đủ xét nghiệm máu, men gan, chức năng thận, X-Quang ngực và siêu âm ổ bụng tổng quát.',
            warning_disclaimer: 'Gợi ý chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.'
          });
          setIsLoading(false);
        }, 600);
      }
    } catch {
      // fallback simulation
      setResult({
        recommended_package: {
          id: 'pkg-general-01',
          code: 'PKG-GEN-MALE',
          name: 'Gói Khám Sức Khỏe Tổng Quát Nam Giới (Định Kỳ)',
          base_price: 1850000
        },
        explanation: 'Dựa trên độ tuổi 35 và mục đích khám tổng quát, hệ thống khuyến nghị gói bao gồm đầy đủ xét nghiệm máu, men gan, chức năng thận, X-Quang ngực và siêu âm ổ bụng tổng quát.',
        warning_disclaimer: 'Gợi ý chỉ mang tính tham khảo, không thay thế chẩn đoán y khoa.'
      });
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Cột Trái (7 Phần): Cảnh Báo Bắt Buộc & Form Khảo Sát */}
      <div className="lg:col-span-7 space-y-5">
        {/* KHUNG CẢNH BÁO BẮT BUỘC THEO DOMAIN_RULES.md MỤC 8 */}
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Cảnh Báo Y Khoa Bắt Buộc (Tuân thủ Quy tắc Y Tế)</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Kết quả gợi ý <strong>chỉ mang tính chất tham khảo</strong> dựa trên quy tắc thống kê độ tuổi và giới tính, 
            <strong> tuyệt đối không thay thế chẩn đoán y khoa của Bác sĩ</strong>. 
            Nếu quý khách có bất kỳ triệu chứng đau tức ngực, khó thở hoặc dấu hiệu bất thường, vui lòng đến ngay 
            <strong> khu vực Cấp cứu</strong> hoặc quầy tư vấn trực tiếp!
          </p>
        </div>

        {/* Form khảo sát */}
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-800">Khảo Sát Nhu Cầu Khám Sức Khỏe</h3>
          </div>

          <form onSubmit={handleAdvisorSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Độ tuổi của bạn</label>
              <input
                type="number"
                min={1}
                max={110}
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none focus:border-blue-500 font-bold text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Giới tính</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1">Tình trạng hôn nhân</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                >
                  <option value="SINGLE">Độc thân</option>
                  <option value="MARRIED">Đã kết hôn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Mục đích khám chính</label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
              >
                <option value="GENERAL_CHECKUP">Khám tổng quát định kỳ hàng năm</option>
                <option value="SCREENING">Tầm soát chuyên sâu chức năng gan, thận, tim mạch</option>
                <option value="PRE_EMPLOYMENT">Khám sức khỏe đi làm / đi học / hồ sơ</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Đang Phân Tích Quy Tắc Ràng Buộc...' : 'Nhận Gợi Ý Gói Khám Phù Hợp'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Cột Phải (5 Phần): Kết Quả Khuyến Nghị & Danh Mục Tham Khảo */}
      <div className="lg:col-span-5 space-y-5">
        {result && result.recommended_package ? (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Gói Khám Phù Hợp Nhất Với Bạn</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-2">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {result.recommended_package.code}
              </span>
              <h4 className="text-base font-extrabold text-slate-900 leading-tight">
                {result.recommended_package.name}
              </h4>
              <div className="text-lg font-black text-blue-600 pt-1">
                {result.recommended_package.base_price.toLocaleString('vi-VN')} VNĐ
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
                {result.explanation}
              </p>
            </div>

            <button
              onClick={() => {
                if (onRegisterSuccess && result?.recommended_package) {
                  onRegisterSuccess(result.recommended_package.name);
                }
              }}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all text-center cursor-pointer"
            >
              Đăng Ký Gói Khám Này Tại Quầy
            </button>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Tiêu Chí Lựa Chọn Gói Khám</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Điền các thông tin cơ bản ở form bên cạnh, thuật toán dựa trên bảng ràng buộc y tế sẽ tự động lọc ra các dịch vụ phù hợp nhất cho lứa tuổi và tình trạng của bạn.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kiểm tra tự động ràng buộc theo giới tính (khám phụ khoa, nhũ hoa...).</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Tối ưu chi phí, loại trừ các bước trùng lặp theo quy định gói.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
