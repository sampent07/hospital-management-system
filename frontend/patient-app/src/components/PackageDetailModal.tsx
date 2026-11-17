import React from 'react';
import { X, CheckCircle2, ShieldCheck, Stethoscope, Droplets, Scan, HeartPulse, Sparkles, CalendarCheck, Building2, User } from 'lucide-react';
import { PackageDetail } from '../types';

interface PackageDetailModalProps {
  packageData: PackageDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedToBooking: (pkg: PackageDetail) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageData,
  isOpen,
  onClose,
  onProceedToBooking,
}) => {
  if (!isOpen || !packageData) return null;

  const isCorporate = packageData.targetType === 'CORPORATE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between gap-4 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                  isCorporate
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}
              >
                {isCorporate ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                {isCorporate ? 'Gói Khám Doanh Nghiệp' : 'Gói Khám Cá Nhân'}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {packageData.code}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
              {packageData.name}
            </h3>
            <p className="text-xs text-slate-500">
              Đối tượng: <strong className="text-slate-700">{packageData.targetAudienceText}</strong>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
            title="Đóng chi tiết"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung chi tiết cuộn được */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-xs">
          {/* Khung Giá Gói & Ưu Đãi */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 sm:p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs text-blue-100 font-medium">Chi Phí Gói Khám</div>
              <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                {packageData.basePrice.toLocaleString('vi-VN')} VNĐ
                {packageData.priceUnitText && (
                  <span className="text-xs font-normal text-blue-200 ml-1.5">{packageData.priceUnitText}</span>
                )}
              </div>
            </div>
            {packageData.discountNote && (
              <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{packageData.discountNote}</span>
              </div>
            )}
          </div>

          {/* Mô tả tóm tắt */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 leading-relaxed">
            {packageData.description}
          </div>

          {/* 1. Khám Lâm Sàng */}
          {packageData.clinicalServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <span>1. Khám Lâm Sàng & Khám Thể Lực</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packageData.clinicalServices.map((service, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Chẩn Đoán Hình Ảnh */}
          {packageData.imagingServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Scan className="w-3.5 h-3.5" />
                </div>
                <span>2. Chẩn Đoán Hình Ảnh (CĐHA)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packageData.imagingServices.map((service, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Xét Nghiệm Chuyên Sâu */}
          {packageData.laboratoryServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                  <Droplets className="w-3.5 h-3.5" />
                </div>
                <span>3. Xét Nghiệm Huyết Học, Sinh Hóa & Nước Tiểu</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packageData.laboratoryServices.map((service, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Thăm Dò Chức Năng */}
          {packageData.functionalServices.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
                <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center">
                  <HeartPulse className="w-3.5 h-3.5" />
                </div>
                <span>4. Thăm Dò Chức Năng</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {packageData.functionalServices.map((service, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quyền Lợi Đi Kèm */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-2">
            <div className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Đặc Quyền Của Gói Khám</span>
            </div>
            <ul className="space-y-1.5 pl-1">
              {packageData.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer: Nút Đăng Ký Gói Khám & Đóng */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-600 hover:bg-slate-200 font-semibold text-xs transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={() => onProceedToBooking(packageData)}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Đăng Ký Gói Khám Này</span>
          </button>
        </div>
      </div>
    </div>
  );
};
