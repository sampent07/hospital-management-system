import React from 'react';
import { Activity, Wifi, WifiOff, User, Building2 } from 'lucide-react';
import { Account, ServicePoint } from '../types';

interface HeaderProps {
  currentAccount: Account;
  onRoleSwitch: (role: Account['role']) => void;
  servicePoints: ServicePoint[];
  selectedServicePointId: string;
  onSelectServicePoint: (id: string) => void;
  isWsConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentAccount,
  onRoleSwitch,
  servicePoints,
  selectedServicePointId,
  onSelectServicePoint,
  isWsConnected,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className="bg-primary-600 text-white p-2 rounded-xl shadow-md flex items-center justify-center">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2">
            Smart OPD Orchestrator
            <span className="text-xs bg-primary-100 text-primary-700 font-semibold px-2 py-0.5 rounded-full border border-primary-200">
              Vận Hành Phòng Khám
            </span>
          </h1>
          <p className="text-xs text-slate-500">Giảm thiểu thời gian chờ & tối ưu lộ trình thông minh</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Điểm dịch vụ phụ trách */}
        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-sm">
          <Building2 className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">Bàn khám:</span>
          <select
            value={selectedServicePointId}
            onChange={(e) => onSelectServicePoint(e.target.value)}
            className="bg-transparent font-semibold text-slate-700 outline-none text-xs cursor-pointer"
          >
            {servicePoints.map((sp) => (
              <option key={sp.id} value={sp.id}>
                {sp.name} ({sp.roomNumber || sp.code})
              </option>
            ))}
          </select>
        </div>

        {/* Trạng thái Realtime WebSocket */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
            isWsConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
          }`}
        >
          {isWsConnected ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Realtime: Kết nối</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Realtime: Đang thử lại...</span>
            </>
          )}
        </div>

        {/* Hồ sơ nhân viên & Role switcher */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="text-right">
            <div className="text-xs font-bold text-slate-800">{currentAccount.fullName}</div>
            <div className="text-[11px] text-slate-500 flex items-center justify-end gap-1">
              <span>Vai trò:</span>
              <select
                value={currentAccount.role}
                onChange={(e) => onRoleSwitch(e.target.value as Account['role'])}
                className="font-semibold text-primary-600 bg-transparent outline-none cursor-pointer"
              >
                <option value="DOCTOR">DOCTOR (Bác sĩ)</option>
                <option value="COORDINATOR">COORDINATOR (Thư ký/Điều phối)</option>
                <option value="ADMIN">ADMIN (Quản trị)</option>
              </select>
            </div>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm border-2 border-white shadow-sm">
            <User className="w-5 h-5 text-slate-600" />
          </div>
        </div>
      </div>
    </header>
  );
};
