import React, { useState } from 'react';
import { Activity, User, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';
import { PatientUser } from '../types';

interface LoginProps {
  onLoginSuccess: (user: PatientUser) => void;
}

const mockPatients: PatientUser[] = [
  {
    id: 'pat-01-hung',
    username: 'patient',
    fullName: 'Lê Văn Hùng',
    patientCode: 'BN-20261111',
    visitId: 'VK-20261111-001',
    queueNumber: '#001',
    gender: 'Nam',
    age: 38
  },
  {
    id: 'pat-02-lan',
    username: 'pat-02',
    fullName: 'Phạm Thị Lan',
    patientCode: 'BN-20261112',
    visitId: 'VK-20261111-002',
    queueNumber: '#002',
    gender: 'Nữ',
    age: 28
  }
];

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState<string>('patient');
  const [password, setPassword] = useState<string>('Patient@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Kiểm tra tài khoản mẫu
      const matched = mockPatients.find(
        (p) => p.username.toLowerCase() === username.trim().toLowerCase() || p.fullName.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched && password === 'Patient@123') {
        onLoginSuccess(matched);
      } else if (username.trim() && password.trim()) {
        // Cho phép đăng nhập linh hoạt nếu nhập tài khoản khác
        onLoginSuccess({
          id: `pat-${Date.now()}`,
          username: username.trim(),
          fullName: username.trim() === 'patient' ? 'Lê Văn Hùng' : username.trim(),
          patientCode: 'BN-20261111',
          visitId: 'VK-20261111-001',
          queueNumber: '#001',
          gender: 'Nam',
          age: 38
        });
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
      setIsLoading(false);
    }, 400);
  };

  const handleQuickLogin = (patient: PatientUser) => {
    setUsername(patient.username);
    setPassword('Patient@123');
    setError(null);
    onLoginSuccess(patient);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/20">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Cổng Bệnh Nhân Smart OPD
          </h1>
          <p className="text-xs text-slate-500">
            Điều phối khám ngoại trú & tối ưu thời gian chờ thời gian thực
          </p>
        </div>

        {/* Khung Đăng Nhập Chính (Đồng bộ viền xanh như các ô trong hệ thống) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-slate-900">Đăng Nhập Khám Bệnh</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Đăng nhập để theo dõi lộ trình và thứ tự gọi số của bạn
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Tên đăng nhập / Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ví dụ: patient"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng Nhập Vào Hệ Thống'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Khối Tài Khoản Mẫu Nhanh (1-Click Demo Login) */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Tài Khoản Mẫu Thử Nghiệm
              </span>
              <span className="text-[10px] text-blue-600 font-medium">Bấm để đăng nhập ngay</span>
            </div>

            <div className="space-y-2">
              {mockPatients.map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handleQuickLogin(patient)}
                  className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {patient.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                        {patient.fullName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        User: {patient.username} • MK: Patient@123
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">
                    {patient.queueNumber}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer bảo mật */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Hệ thống bảo mật tài khoản và quyền riêng tư bệnh nhân</span>
        </div>
      </div>
    </div>
  );
};