import React, { useState } from 'react';
import { UserCheck, Sparkles, CheckCircle2, Search, Plus, User, FileText, HeartPulse } from 'lucide-react';
import { Package, Patient } from '../types';
import { PatientDetailModal } from '../components/PatientDetailModal';
import { RouteSupportModal } from '../components/RouteSupportModal';

interface ReceptionProps {
  packages: Package[];
  onCreateVisit: (patientId: string, packageId?: string, isPriority?: boolean) => Promise<void>;
}

export const Reception: React.FC<ReceptionProps> = ({ packages, onCreateVisit }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [patientId, setPatientId] = useState<string>('pat-01-hung');
  const [patientName, setPatientName] = useState<string>('Lê Văn Hùng');
  const [selectedPackageId, setSelectedPackageId] = useState<string>('pkg-02-std');
  const [isPriority, setIsPriority] = useState<boolean>(false);
  const [isCreated, setIsCreated] = useState<boolean>(false);
  const [createdInfo, setCreatedInfo] = useState<string | null>(null);
  const [lastCreatedVisitId, setLastCreatedVisitId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);

  // Modal hồ sơ bệnh nhân
  const [selectedPatientForModal, setSelectedPatientForModal] = useState<string | null>(null);

  // Modal hỗ trợ lộ trình
  const [showRouteSupport, setShowRouteSupport] = useState<boolean>(false);

  // Form tạo bệnh nhân mới
  const [showNewPatientForm, setShowNewPatientForm] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newDob, setNewDob] = useState<string>('1990-01-01');
  const [newGender, setNewGender] = useState<string>('MALE');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newCccd, setNewCccd] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [isCreatingPatient, setIsCreatingPatient] = useState<boolean>(false);

  // Tìm kiếm bệnh nhân theo SĐT hoặc CCCD
  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/v1/patients?q=${encodeURIComponent(searchQuery)}`, {
        headers: { Authorization: 'Bearer mock-token' }
      });
      if (res.ok) {
        const data: Patient[] = await res.json();
        setSearchResults(data);
        if (data.length > 0) {
          setPatientId(data[0].id);
          setPatientName(data[0].fullName);
        }
      }
    } catch {
      // ignore
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (p: Patient) => {
    setPatientId(p.id);
    setPatientName(p.fullName);
    setSearchResults([]);
  };

  // Tạo hồ sơ bệnh nhân mới nhanh
  const handleCreateNewPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingPatient(true);
    try {
      const res = await fetch('/api/v1/patients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          full_name: newFullName,
          date_of_birth: newDob,
          gender: newGender,
          phone_number: newPhone,
          id_card_number: newCccd,
          address: newAddress,
          marital_status: 'SINGLE'
        })
      });

      if (!res.ok) throw new Error('Không thể tạo hồ sơ bệnh nhân mới.');
      const createdPatient: Patient = await res.json();
      setPatientId(createdPatient.id);
      setPatientName(createdPatient.fullName);
      setShowNewPatientForm(false);
      setCreatedInfo(`Đã tạo hồ sơ bệnh nhân mới: ${createdPatient.fullName}!`);
      setIsCreated(true);
      setTimeout(() => setIsCreated(false), 4000);
    } catch {
      // error
    } finally {
      setIsCreatingPatient(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onCreateVisit(patientId, selectedPackageId || undefined, isPriority);
      setIsCreated(true);
      const generatedCode = `VK-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-001`;
      setLastCreatedVisitId(generatedCode);
      setCreatedInfo(`Tiếp nhận thành công! Lượt khám đã được tạo và kích hoạt lộ trình khám thông minh.`);
      setTimeout(() => setIsCreated(false), 5000);
    } catch {
      // error
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Khối tìm kiếm bệnh nhân */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary-600" />
            <h2 className="text-base font-bold text-slate-800">Tra Cứu Hồ Sơ Bệnh Nhân (STAFF-04, 05)</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowNewPatientForm(!showNewPatientForm)}
            className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>{showNewPatientForm ? 'Đóng form thêm mới' : 'Đăng ký bệnh nhân mới'}</span>
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <form onSubmit={handleSearchPatient} className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập Số điện thoại, CCCD hoặc Họ tên bệnh nhân..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all"
          >
            {isSearching ? 'Đang tìm...' : 'Tìm Kiếm'}
          </button>
        </form>

        {/* Kết quả tìm kiếm */}
        {searchResults.length > 0 && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Kết quả tìm kiếm ({searchResults.length} người)
            </span>
            <div className="divide-y divide-slate-200">
              {searchResults.map((p) => (
                <div
                  key={p.id}
                  className="py-2 flex items-center justify-between text-xs cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
                >
                  <div>
                    <span className="font-bold text-slate-800">{p.fullName}</span> ({p.gender === 'MALE' ? 'Nam' : 'Nữ'}, {p.dateOfBirth})
                    <span className="text-slate-500 font-mono ml-2">SĐT: {p.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedPatientForModal(p.id)}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg text-xs"
                    >
                      Xem hồ sơ
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPatient(p)}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg text-xs"
                    >
                      Chọn
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Form đăng ký bệnh nhân mới nhanh */}
        {showNewPatientForm && (
          <form onSubmit={handleCreateNewPatient} className="p-4 bg-primary-50/50 border border-primary-200 rounded-xl space-y-3">
            <div className="text-xs font-bold text-primary-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-primary-600" />
              <span>Đăng Ký Hồ Sơ Bệnh Nhân Mới (Lễ Tân Tiếp Nhận)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Nam"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngày sinh</label>
                <input
                  type="date"
                  required
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Giới tính</label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số điện thoại</label>
                <input
                  type="text"
                  required
                  placeholder="09..."
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số CCCD / CMND</label>
                <input
                  type="text"
                  placeholder="079..."
                  value={newCccd}
                  onChange={(e) => setNewCccd(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ thường trú</label>
                <input
                  type="text"
                  placeholder="Địa chỉ..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg outline-none focus:border-primary-500 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingPatient}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
            >
              {isCreatingPatient ? 'Đang tạo...' : 'Lưu Hồ Sơ Bệnh Nhân Mới'}
            </button>
          </form>
        )}
      </div>

      {/* Quầy tiếp nhận & Tạo lượt khám */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Quầy Tiếp Nhận &amp; Cấp Số Thứ Tự Khám (STAFF-04)</h2>
            <p className="text-xs text-slate-500">Đăng ký lượt khám tại quầy lễ tân hoặc kích hoạt từ Kiosk tự động</p>
          </div>
        </div>

        {isCreated && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{createdInfo}</span>
            </div>
            {lastCreatedVisitId && (
              <button
                type="button"
                onClick={() => setShowRouteSupport(true)}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition-all shadow-sm flex items-center gap-1.5"
              >
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Xem &amp; Hỗ Trợ Lộ Trình</span>
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mã Bệnh Nhân (ID hoặc CCCD)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="flex-1 px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setSelectedPatientForModal(patientId)}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1"
                  title="Xem chi tiết hồ sơ bệnh án"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Hồ Sơ</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên Bệnh Nhân Đang Chọn</label>
              <input
                type="text"
                value={patientName}
                readOnly
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Chọn Gói Khám Khởi Tạo (Hoặc để trống)</label>
            <select
              value={selectedPackageId}
              onChange={(e) => setSelectedPackageId(e.target.value)}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:border-primary-500 bg-white"
            >
              <option value="">-- Không theo gói (Khám theo chỉ định của bác sĩ) --</option>
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
              <strong>Đánh dấu Bệnh Nhân Ưu Tiên:</strong> Người cao tuổi (&gt;75t), trẻ sơ sinh, phụ nữ mang thai hoặc cần trợ giúp đặc biệt. Hệ thống sẽ ưu tiên số thứ tự trong hàng đợi theo quy định.
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-primary-200" />
            <span>Xác Nhận Tiếp Nhận &amp; Khởi Tạo Lộ Trình Khám Thông Minh</span>
          </button>
        </form>
      </div>

      {/* Modal chi tiết hồ sơ bệnh nhân */}
      {selectedPatientForModal && (
        <PatientDetailModal
          isOpen={true}
          onClose={() => setSelectedPatientForModal(null)}
          patientId={selectedPatientForModal}
        />
      )}

      {/* Modal hỗ trợ lộ trình khám */}
      {showRouteSupport && lastCreatedVisitId && (
        <RouteSupportModal
          isOpen={true}
          onClose={() => setShowRouteSupport(false)}
          visitId={lastCreatedVisitId}
          patientName={patientName}
        />
      )}
    </div>
  );
};
