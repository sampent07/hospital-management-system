import React from 'react';
import { LayoutDashboard, Stethoscope, UserCheck, ShieldCheck, HeartPulse, Calendar, Key } from 'lucide-react';
import { Role } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole: Role;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, userRole }) => {
  const isDoctor = userRole === 'DOCTOR';
  const isCoordinator = userRole === 'COORDINATOR';
  const isAdmin = userRole === 'ADMIN';

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)]">
      <div className="p-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
        Phân Hệ Nghiệp Vụ
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {/* Điểm dịch vụ của tôi (Cho Doctor & Coordinator) */}
        {(isDoctor || isCoordinator) && (
          <button
            onClick={() => onSelectTab('my-service-point')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'my-service-point'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Điểm Dịch Vụ Của Tôi</span>
          </button>
        )}

        {/* Tiếp nhận bệnh nhân (Coordinator & Doctor) */}
        {(isDoctor || isCoordinator) && (
          <button
            onClick={() => onSelectTab('reception')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'reception'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Quầy Tiếp Nhận &amp; Hồ Sơ</span>
          </button>
        )}

        {/* Khám & Chỉ định (Chỉ hiển thị nút cho Bác sĩ theo FRONTEND.md) */}
        {isDoctor && (
          <button
            onClick={() => onSelectTab('doctor-consultation')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'doctor-consultation'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Stethoscope className="w-4 h-4 text-emerald-400" />
            <span className="flex-1 text-left">Khám &amp; Chỉ Định</span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">
              BS
            </span>
          </button>
        )}

        {/* Quản lý lịch hẹn & Đặt lịch tái khám (Doctor & Coordinator) */}
        {(isDoctor || isCoordinator) && (
          <button
            onClick={() => onSelectTab('appointments')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'appointments'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            <span>Lịch Hẹn &amp; Tái Khám</span>
          </button>
        )}

        {/* Ủy quyền công việc giữa Bác sĩ và Thư ký */}
        {(isDoctor || isCoordinator) && (
          <button
            onClick={() => onSelectTab('authorization')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'authorization'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4 text-amber-400" />
            <span>Ủy Quyền Nghiệp Vụ</span>
          </button>
        )}

        {/* Quản trị & Dashboard (Admin) */}
        {isAdmin && (
          <button
            onClick={() => onSelectTab('admin-overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentTab === 'admin-overview'
                ? 'bg-primary-600 text-white shadow-md'
                : 'hover:bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Giám Sát &amp; Dashboard</span>
          </button>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-4 h-4 text-primary-400" />
          <span className="text-slate-400 font-medium">Bảo Mật &amp; Phân Quyền</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Phân quyền kiểm tra tại Backend qua Role Matrix. Mọi cập nhật trạng thái được lưu nhật ký bất biến.
        </p>
      </div>
    </aside>
  );
};
