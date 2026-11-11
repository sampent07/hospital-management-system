import React, { useState } from 'react';
import { HelpCircle, AlertTriangle, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { PackageAdvisorResult } from '../types';

export const PackageAdvisor: React.FC = () => {
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
      }
    } catch {
      // error fallback
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* KHUNG CẢNH BÁO BẮT BUỘC THEO DOMAIN_RULES.md MỤC 8 */}
      <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-2 shadow-sm">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Cảnh Báo Y Khoa Bắt Buộc</span>
        </div>
        <p className="text-xs text-amber-800 leading-relaxed">
          Kết quả gợi ý <strong>chỉ mang tính chất tham khảo</strong> dựa trên quy tắc thống kê, 
          <strong> không thay thế chẩn đoán y khoa của Bác sĩ</strong>. 
          Nếu quý khách có bất kỳ triệu chứng nguy hiểm hoặc bất thường, vui lòng đến ngay 
          <strong> khu vực Cấp cứu</strong> hoặc quầy tư vấn trực tiếp!
        </p>
      </div>

      {/* Form khảo sát */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Khảo Sát Nhu Cầu Khám Sức Khỏe</h3>
        </div>

        <form onSubmit={handleAdvisorSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">Độ tuổi của bạn</label>
            <input
              type="number"
              min={1}
              max={110}
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:border-blue-500 font-bold"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none bg-white"
            >
              <option value="GENERAL_CHECKUP">Khám tổng quát định kỳ</option>
              <option value="SCREENING">Tầm soát chuyên sâu</option>
              <option value="PRE_EMPLOYMENT">Khám sức khỏe đi làm / đi học</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-blue-200" />
            <span>{isLoading ? 'Đang Phân Tích Quy Tắc...' : 'Nhận Gợi Ý Gói Khám Phù Hợp'}</span>
          </button>
        </form>
      </div>

      {/* Kết quả gợi ý */}
      {result && result.recommended_package && (
        <div className="bg-emerald-50 border border-emerald-300 p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Gói Khám Phù Hợp Nhất Với Bạn</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200">
            <h4 className="text-base font-bold text-slate-900">{result.recommended_package.name}</h4>
            <div className="text-sm font-extrabold text-blue-600 mt-1">
              Giá tham khảo: {result.recommended_package.base_price.toLocaleString('vi-VN')} VNĐ
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {result.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
