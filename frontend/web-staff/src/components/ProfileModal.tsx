import React, { useState } from 'react';
import { X, User, Phone, Mail, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Account, ServicePoint } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: Account;
  servicePoints: ServicePoint[];
  onAccountUpdate: (updated: Account) => void;
  onSwitchAccount: (accountKey: 'doctor' | 'coordinator' | 'admin') => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  servicePoints,
  onAccountUpdate,
  onSwitchAccount,
}) => {
  const [fullName, setFullName] = useState(currentAccount.fullName);
  const [phoneNumber, setPhoneNumber] = useState(currentAccount.phoneNumber || '0901234567');
  const [email, setEmail] = useState(currentAccount.email || `${currentAccount.username}@phongkham.vn`);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSp = servicePoints.find((sp) => sp.id === currentAccount.assignedServicePointId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          full_name: fullName,
          phone_number: phoneNumber,
          email: email
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Lỗi khi cập nhật hồ sơ cá nhân.');
      }

      const updatedData = await res.json();
      onAccountUpdate({
        ...currentAccount,
        fullName: updatedData.full_name || fullName,
        phoneNumber: updatedData.phone_number || phoneNumber,
        email: updatedData.email || email
      });
      setSuccessMsg('Đã cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg('Lỗi không xác định.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-800 text-base">Hồ Sơ Nhân Viên Y Tế</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Thẻ tóm tắt chức danh */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Vai trò hệ thống:</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-700">
                {currentAccount.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Mã nhân viên:</span>
              <span className="text-xs font-mono font-bold text-slate-700">
                {currentAccount.employeeCode || 'NV-DEFAULT'}
              </span>
            </div>
            {currentAccount.specialty && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Chuyên khoa:</span>
                <span className="text-xs font-semibold text-slate-800">{currentAccount.specialty}</span>
              </div>
            )}
            {currentAccount.licenseNumber && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Chứng chỉ hành nghề:</span>
                <span className="text-xs font-mono text-slate-700">{currentAccount.licenseNumber}</span>
              </div>
            )}
            {currentSp && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Điểm phụ trách mặc định:</span>
                <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-primary-500" />
                  {currentSp.name} ({currentSp.roomNumber || currentSp.code})
                </span>
              </div>
            )}
          </div>

          {/* Form chỉnh sửa thông tin liên hệ */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Số điện thoại</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>Email</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-all shadow-sm"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
              </button>
            </div>
          </form>

          {/* Chuyển đổi nhanh tài khoản mẫu */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
              Chuyển nhanh tài khoản mẫu (Demo)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onSwitchAccount('doctor')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  currentAccount.role === 'DOCTOR'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                BS. Nguyễn Văn An
              </button>
              <button
                type="button"
                onClick={() => onSwitchAccount('coordinator')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  currentAccount.role === 'COORDINATOR'
                    ? 'border-primary-500 bg-primary-50 text-primary-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Thư ký Nguyễn Thị Mai
              </button>
              <button
                type="button"
                onClick={() => onSwitchAccount('admin')}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium border text-center transition-all ${
                  currentAccount.role === 'ADMIN'
                    ? 'border-purple-500 bg-purple-50 text-purple-800 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                Admin Hệ Thống
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
