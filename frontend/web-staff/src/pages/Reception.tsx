import React, { useState } from 'react';
import { UserCheck, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Package } from '../types';

interface ReceptionProps {
  packages: Package[];
  onCreateVisit: (patientId: string, packageId?: string, isPriority?: boolean) => Promise<void>;
}

export const Reception: React.FC<ReceptionProps> = ({ packages, onCreateVisit }) => {
  const [patientId, setPatientId] = useState<string>('pat-01-hung');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-02-std');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [createdInfo, setCreatedInfo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateVisit(patientId, selectedPackageId, isPriority);
      setIsCreated(true);
      setCreatedInfo(`Tiếp nhận thành công! Lượt khám đã được tạo và kích hoạt lộ trình khởi tạo.`);
      setTimeout(() => setIsCreated(false), 5000);
    } catch {
      // error
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quầy Tiếp Nhận & Tạo Lượt Khám Mới</h2>
            <p className="text-xs text-slate-500">Đăng ký lượt khám tại quầy lễ tân hoặc xác nhận từ Kiosk</p>
          </div>
        </div>

        {isCreated && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{createdInfo}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Mã Bệnh Nhân (ID hoặc CCCD)</label>
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500 font-mono"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Chọn Gói Khám Khởi Tạo</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500 bg-white"
            >
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} — {pkg.basePrice.toLocaleString('vi-VN')} VNĐ ({pkg.services.length} dịch vụ)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl flex items-center gap-3">
            <input
              type="checkbox"
              id="priorityCheck"
              checked={isPriority}
              onChange={(e) => setIsPriority(e.target.checked)}
              className="w-4 h-4 text-primary-600 rounded cursor-pointer"
            />
            <label htmlFor="priorityCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
              <strong>Đánh dấu Bệnh Nhân Ưu Tiên:</strong> Người cao tuổi (&gt;75t), trẻ sơ sinh, phụ nữ mang thai hoặc cần trợ giúp đặc biệt.
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary-200" />
            <span>Xác Nhận Tiếp Nhận & Khởi Tạo Lộ Trình Khám Thông Minh</span>
          </button>
        </form>
      </div>
    </div>
  );
};
