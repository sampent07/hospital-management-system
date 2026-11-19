import React, { useState } from 'react';
import {
  User,
  Phone,
  ShieldCheck,
  HeartPulse,
  Save,
  CheckCircle2,
  Sparkles,
  MapPin,
  FileCheck
} from 'lucide-react';
import { PatientProfile } from '../types';

interface PatientProfileViewProps {
  initialProfile: PatientProfile;
  onSaveProfile: (profile: PatientProfile) => void;
  onGoToAdvisor: () => void;
}

const commonDiseasesList = [
  'Tăng huyết áp',
  'Đái tháo đường',
  'Bệnh tim mạch',
  'Viêm gan B/C',
  'Đau dạ dày / Tiêu hóa',
  'Dị ứng kháng sinh / Thuốc'
];

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  initialProfile,
  onSaveProfile,
  onGoToAdvisor
}) => {
  const [profile, setProfile] = useState<PatientProfile>(initialProfile);
  const [isSavedNotice, setIsSavedNotice] = useState<boolean>(false);

  const toggleDisease = (disease: string) => {
    setProfile((prev) => ({
      ...prev,
      selectedDiseases: prev.selectedDiseases.includes(disease)
        ? prev.selectedDiseases.filter((d) => d !== disease)
        : [...prev.selectedDiseases, disease]
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(profile);
    setIsSavedNotice(true);
    setTimeout(() => {
      setIsSavedNotice(false);
    }, 4000);
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-5 font-sans animate-in fade-in duration-300">
      {/* Thông Báo Lưu Thành Công */}
      {isSavedNotice && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs sm:text-sm">
              <strong className="block">Đã lưu hồ sơ cá nhân thành công!</strong>
              <span className="text-emerald-700 text-xs">
                Khi đăng ký khám, bạn chỉ cần bấm <strong>"⚡ Lấy Dữ Liệu Từ Hồ Sơ Cá Nhân"</strong> là thông tin sẽ tự động điền mà không cần gõ lại.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onGoToAdvisor}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all shrink-0 cursor-pointer shadow-sm"
          >
            Đăng Ký Khám Ngay →
          </button>
        </div>
      )}

      {/* Form Hồ Sơ Cá Nhân */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-sm space-y-6">
        {/* Header Hồ Sơ */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Hồ Sơ Cá Nhân Của Bạn
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin này sẽ được lưu cố định và dùng để tự động điền khi bạn đăng ký khám sức khỏe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Đã Liên Kết BHYT</span>
            </span>
          </div>
        </div>

        {/* PHẦN 1: THÔNG TIN CƠ BẢN VÀ LIÊN HỆ */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700">
            <FileCheck className="w-4 h-4" />
            <span>1. Thông Tin Định Danh & Liên Hệ Cơ Bản</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Họ và Tên <span className="text-rose-500">*</span>:
              </label>
              <input
                type="text"
                value={profile.fullName}
                onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                placeholder="Ví dụ: Lê Văn Hùng"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>:
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="0909 123 456"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Độ Tuổi <span className="text-rose-500">*</span>:
              </label>
              <input
                type="number"
                min={1}
                max={110}
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Giới Tính:</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Số Thẻ BHYT / CCCD:</span>
              </label>
              <input
                type="text"
                value={profile.insuranceCard}
                onChange={(e) => setProfile({ ...profile, insuranceCard: e.target.value })}
                placeholder="DN 4 79 20261111"
                className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tình Trạng Hôn Nhân:</label>
              <select
                value={profile.maritalStatus}
                onChange={(e) => setProfile({ ...profile, maritalStatus: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
              >
                <option value="SINGLE">Độc thân</option>
                <option value="MARRIED">Đã kết hôn</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Địa Chỉ / Nơi Ở:</label>
              <div className="relative">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={profile.address || ''}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="Ví dụ: Phường Bến Nghé, Quận 1, TP. HCM"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHẦN 2: TIỀN SỬ BỆNH LÝ & DỊ ỨNG */}
        <div className="p-4 sm:p-5 bg-rose-50/40 rounded-3xl border border-rose-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>2. Tiền Sử Bệnh Lý & Dị Ứng Thuốc (Chọn nhanh nếu có):</span>
            </label>
            <span className="text-[10px] text-slate-400">Giúp AI đối chiếu gợi ý gói</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {commonDiseasesList.map((disease) => {
              const isSelected = profile.selectedDiseases.includes(disease);
              return (
                <button
                  key={disease}
                  type="button"
                  onClick={() => toggleDisease(disease)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-rose-600 text-white shadow-xs scale-[1.02]'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-rose-300 hover:bg-rose-50/50'
                  }`}
                >
                  {isSelected ? `✓ ${disease}` : `+ ${disease}`}
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs text-slate-600 block mb-1">
              Ghi chú thêm tiền sử y khoa (đang uống thuốc gì, dị ứng gì, phẫu thuật trước đây):
            </label>
            <input
              type="text"
              value={profile.medicalHistoryDetail}
              onChange={(e) => setProfile({ ...profile, medicalHistoryDetail: e.target.value })}
              placeholder="Ví dụ: Đang uống thuốc huyết áp Amlodipine hàng ngày, dị ứng kháng sinh nhóm Penicillin..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-rose-400 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* PHẦN 3: GHI CHÚ RIÊNG */}
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Ghi Chú Riêng Khi Đến Khám (nếu có):
          </label>
          <input
            type="text"
            value={profile.personalNotes || ''}
            onChange={(e) => setProfile({ ...profile, personalNotes: e.target.value })}
            placeholder="Ví dụ: Thường cần hỗ trợ xe lăn, sợ lấy máu, chỉ rảnh buổi sáng sớm..."
            className="w-full px-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-2xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
          />
        </div>

        {/* NÚT LƯU HỒ SƠ */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Dữ liệu được bảo mật an toàn trên thiết bị của bạn.
          </p>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Hồ Sơ Cá Nhân</span>
            </button>

            <button
              type="button"
              onClick={onGoToAdvisor}
              className="flex-1 sm:flex-none px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Đi Tới Đăng Ký Khám</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
