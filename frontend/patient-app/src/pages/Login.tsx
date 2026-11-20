import React, { useState } from 'react';
import {
  Activity,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Phone,
  UserPlus,
  LogIn,
  CheckCircle2
} from 'lucide-react';
import { PatientUser, PatientProfile } from '../types';
import { defaultPatientProfilesList } from '../utils/mockImagingData';

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
  // Chế độ: 'LOGIN' (Đăng Nhập) hoặc 'REGISTER' (Đăng Ký Tài Khoản Mới)
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // State cho Form Đăng Nhập
  const [username, setUsername] = useState<string>('patient');
  const [password, setPassword] = useState<string>('Patient@123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // State cho Form Đăng Ký Tài Khoản
  const [regFullName, setRegFullName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAge, setRegAge] = useState<number>(30);
  const [regGender, setRegGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [regIdCard, setRegIdCard] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('TP. Hồ Chí Minh');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [showRegPassword, setShowRegPassword] = useState<boolean>(false);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Xử lý Đăng Nhập
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      // Kiểm tra tài khoản mẫu
      const matched = mockPatients.find(
        (p) =>
          p.username.toLowerCase() === username.trim().toLowerCase() ||
          p.fullName.toLowerCase() === username.trim().toLowerCase()
      );

      if (matched && password === 'Patient@123') {
        onLoginSuccess(matched);
      } else if (username.trim() && password.trim()) {
        // Cho phép đăng nhập linh hoạt nếu nhập tài khoản khác
        const dynamicUser: PatientUser = {
          id: `pat-${Date.now()}`,
          username: username.trim(),
          fullName: username.trim() === 'patient' ? 'Lê Văn Hùng' : username.trim(),
          patientCode: 'BN-20261111',
          visitId: 'VK-20261111-001',
          queueNumber: '#001',
          gender: 'Nam',
          age: 38
        };
        onLoginSuccess(dynamicUser);
      } else {
        setError('Tên đăng nhập hoặc mật khẩu không chính xác!');
      }
      setIsLoading(false);
    }, 400);
  };

  // Xử lý Đăng Ký Tài Khoản Mới
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Kiểm tra dữ liệu hợp lệ
    if (!regFullName.trim()) {
      setError('Vui lòng nhập họ và tên bệnh nhân!');
      return;
    }
    if (!regPhone.trim()) {
      setError('Vui lòng nhập số điện thoại liên hệ!');
      return;
    }
    if (!regAge || regAge <= 0 || regAge > 120) {
      setError('Vui lòng nhập độ tuổi hợp lệ!');
      return;
    }
    if (regPassword.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự!');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Mật khẩu xác nhận không khớp! Vui lòng kiểm tra lại.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const generatedCode = `BN-${Date.now().toString().slice(-8)}`;
      const generatedQueue = `#${Math.floor(100 + Math.random() * 900)}`;

      const newUser: PatientUser = {
        id: `pat-${Date.now()}`,
        username: regPhone.trim(),
        fullName: regFullName.trim(),
        patientCode: generatedCode,
        visitId: `VK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`,
        queueNumber: generatedQueue,
        gender: regGender === 'FEMALE' ? 'Nữ' : 'Nam',
        age: Number(regAge)
      };

      // Tạo hồ sơ bệnh nhân mặc định cho tài khoản vừa đăng ký
      const newProfile: PatientProfile = {
        id: `prof-self-${Date.now()}`,
        relationship: 'SELF',
        relationshipLabel: 'Bản thân',
        isDefault: true,
        fullName: regFullName.trim(),
        phone: regPhone.trim(),
        age: Number(regAge),
        gender: regGender,
        insuranceCard: regIdCard.trim() || 'DN 4 79 20261111',
        idCardNumber: regIdCard.trim(),
        selectedDiseases: [],
        medicalHistoryDetail: '',
        maritalStatus: 'MARRIED',
        address: regAddress.trim() || 'TP. Hồ Chí Minh',
        personalNotes: ''
      };

      try {
        localStorage.setItem('smart_opd_patient_user', JSON.stringify(newUser));
        localStorage.setItem('smart_opd_patient_profile', JSON.stringify(newProfile));

        // Cập nhật vào danh sách các hồ sơ gia đình
        const currentProfilesJson = localStorage.getItem('smart_opd_patient_profiles_list');
        const profilesList: PatientProfile[] = currentProfilesJson ? JSON.parse(currentProfilesJson) : defaultPatientProfilesList;
        const updatedProfiles = [newProfile, ...profilesList.filter(p => !p.isDefault)];
        localStorage.setItem('smart_opd_patient_profiles_list', JSON.stringify(updatedProfiles));
      } catch {
        // ignore
      }

      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển hướng vào hệ thống...');
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(newUser);
      }, 700);
    }, 600);
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
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Cổng Bệnh Nhân Smart OPD
          </h1>
          <p className="text-xs text-slate-500">
            Điều phối khám ngoại trú & tối ưu thời gian chờ theo thời gian thực
          </p>
        </div>

        {/* Khung Xác Thực Chính */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-200 shadow-xl space-y-5">
          {/* Nút chuyển đổi Đăng Nhập / Đăng Ký Tài Khoản */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'LOGIN'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('REGISTER');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'REGISTER'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Đăng Ký Tài Khoản</span>
            </button>
          </div>

          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              {authMode === 'LOGIN' ? 'Đăng Nhập Khám Bệnh' : 'Đăng Ký Tài Khoản Bệnh Nhân Mới'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {authMode === 'LOGIN'
                ? 'Đăng nhập để theo dõi lộ trình và thứ tự gọi số của bạn'
                : 'Tạo tài khoản hồ sơ y tế để đặt lịch khám và tra cứu kết quả'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ================= FORM 1: ĐĂNG NHẬP ================= */}
          {authMode === 'LOGIN' ? (
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
                    placeholder="Ví dụ: patient hoặc 0909 123 456"
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
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
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

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Chưa có tài khoản khám bệnh? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setError(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Đăng ký ngay
                </button>
              </div>

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
                      className="w-full p-2.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl flex items-center justify-between text-left transition-all group cursor-pointer"
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
            </form>
          ) : (
            /* ================= FORM 2: ĐĂNG KÝ TÀI KHOẢN MỚI ================= */
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Họ và Tên Bệnh Nhân <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số Điện Thoại Liên Hệ (Tên Đăng Nhập) <span className="text-rose-500">*</span>:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="Ví dụ: 0987 654 321"
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Độ tuổi & Giới tính */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Độ Tuổi <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={regAge}
                    onChange={(e) => setRegAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Giới Tính:</label>
                  <select
                    value={regGender}
                    onChange={(e) => setRegGender(e.target.value as 'MALE' | 'FEMALE')}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white cursor-pointer"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                  </select>
                </div>
              </div>

              {/* Số CCCD / CMND hoặc BHYT */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Số CCCD / CMND hoặc Thẻ BHYT:
                </label>
                <input
                  type="text"
                  value={regIdCard}
                  onChange={(e) => setRegIdCard(e.target.value)}
                  placeholder="079095012345 hoặc mã BHYT"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Địa chỉ nơi cư trú */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Địa Chỉ Nơi Cư Trú:
                </label>
                <input
                  type="text"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Ví dụ: Phường 11, Quận 5, TP. Hồ Chí Minh"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>

              {/* Mật khẩu & Xác nhận mật khẩu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Mật Khẩu <span className="text-rose-500">*</span>:
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Xác Nhận Mật Khẩu <span className="text-rose-500">*</span>:
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] px-1">
                <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-slate-600">
                  <input
                    type="checkbox"
                    checked={showRegPassword}
                    onChange={(e) => setShowRegPassword(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span>Hiển thị mật khẩu</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isLoading ? 'Đang tạo tài khoản...' : 'Hoàn Tất Đăng Ký Tài Khoản'}</span>
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">Đã có tài khoản? </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('LOGIN');
                    setError(null);
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  Đăng nhập ngay
                </button>
              </div>
            </form>
          )}
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
