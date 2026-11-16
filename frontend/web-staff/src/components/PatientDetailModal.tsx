import React, { useState, useEffect } from 'react';
import { X, User, AlertCircle, FileText, PlusCircle, CheckCircle2 } from 'lucide-react';
import { Patient, MedicalRecord } from '../types';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  onUpdated?: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  isOpen,
  onClose,
  patientId,
  onUpdated,
}) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form edit admin info
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('SINGLE');

  // Form add medical record
  const [showAddMed, setShowAddMed] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [allergies, setAllergies] = useState('');

  useEffect(() => {
    if (isOpen && patientId) {
      setIsLoading(true);
      setErrorMsg(null);
      fetch(`/api/v1/patients/${patientId}`, {
        headers: { Authorization: 'Bearer mock-token' }
      })
        .then((r) => {
          if (!r.ok) throw new Error('Không thể tải thông tin bệnh nhân.');
          return r.json();
        })
        .then((data: Patient) => {
          setPatient(data);
          setPhoneNumber(data.phoneNumber || '');
          setEmail(data.email || '');
          setAddress(data.address || '');
          setMaritalStatus(data.maritalStatus || 'SINGLE');
        })
        .catch((err) => setErrorMsg(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handleUpdateAdminInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/patients/${patientId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          phone_number: phoneNumber,
          email: email,
          address: address,
          marital_status: maritalStatus
        })
      });

      if (!res.ok) throw new Error('Cập nhật thông tin thất bại.');
      const updated = await res.json();
      setPatient(updated);
      setSuccessMsg('Đã cập nhật thông tin bệnh nhân thành công!');
      if (onUpdated) onUpdated();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/patients/${patientId}/medical-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer mock-token'
        },
        body: JSON.stringify({
          medical_history: medicalHistory,
          family_history: familyHistory,
          allergies: allergies
        })
      });

      if (!res.ok) throw new Error('Không thể thêm tiền sử bệnh.');
      const newRec: MedicalRecord = await res.json();
      if (patient) {
        setPatient({
          ...patient,
          medicalRecords: [...(patient.medicalRecords || []), newRec]
        });
      }
      setShowAddMed(false);
      setMedicalHistory('');
      setFamilyHistory('');
      setAllergies('');
      setSuccessMsg('Đã thêm tiền sử bệnh án thành công!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      if (err instanceof Error) setErrorMsg(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-base">Hồ Sơ Y Tế & Tiền Sử Bệnh Nhân</h3>
              <p className="text-xs text-slate-500">Mã bệnh nhân: <span className="font-mono">{patientId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-sm">Đang tải hồ sơ bệnh nhân...</div>
          ) : !patient ? (
            <div className="py-12 text-center text-slate-500 text-sm">Không tìm thấy hồ sơ bệnh nhân.</div>
          ) : (
            <>
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

              {/* Thông tin cố định */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block">Họ và tên:</span>
                  <span className="font-bold text-slate-800 text-sm">{patient.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày sinh:</span>
                  <span className="font-semibold text-slate-700">{patient.dateOfBirth}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Giới tính:</span>
                  <span className="font-semibold text-slate-700">
                    {patient.gender === 'MALE' ? 'Nam' : patient.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Số CCCD / CMND:</span>
                  <span className="font-mono font-semibold text-slate-700">{patient.idCardNumber || 'Chưa có'}</span>
                </div>
              </div>

              {/* Chỉnh sửa thông tin hành chính */}
              <form onSubmit={handleUpdateAdminInfo} className="space-y-4">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                  <User className="w-4 h-4 text-primary-600" />
                  <span>Thông Tin Liên Hệ & Tình Trạng Hôn Nhân</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Tình trạng hôn nhân</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500 bg-white"
                    >
                      <option value="SINGLE">Độc thân</option>
                      <option value="MARRIED">Đã kết hôn</option>
                      <option value="DIVORCED">Ly hôn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Địa chỉ thường trú</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition-all shadow-sm"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Hành Chính'}
                </button>
              </form>

              {/* Tiền sử bệnh án & Dị ứng */}
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <span>Tiền Sử Bệnh Lý & Cảnh Báo Dị Ứng</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddMed(!showAddMed)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-bold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{showAddMed ? 'Đóng Form' : 'Thêm Tiền Sử'}</span>
                  </button>
                </div>

                {showAddMed && (
                  <form onSubmit={handleAddMedicalRecord} className="p-4 bg-primary-50/50 border border-primary-200 rounded-xl space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tiền sử bệnh lý bản thân</label>
                      <input
                        type="text"
                        value={medicalHistory}
                        onChange={(e) => setMedicalHistory(e.target.value)}
                        placeholder="Ví dụ: Tăng huyết áp, Đái tháo đường typ 2..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tiền sử gia đình</label>
                      <input
                        type="text"
                        value={familyHistory}
                        onChange={(e) => setFamilyHistory(e.target.value)}
                        placeholder="Ví dụ: Bố có bệnh tim mạch sớm..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-rose-700 block mb-1">Dị ứng thuốc / Thức ăn (Cực kỳ quan trọng)</label>
                      <input
                        type="text"
                        value={allergies}
                        onChange={(e) => setAllergies(e.target.value)}
                        placeholder="Ví dụ: Dị ứng kháng sinh Penicillin, Aspirin..."
                        className="w-full px-3 py-2 border border-rose-300 rounded-lg text-xs outline-none focus:border-rose-500 bg-rose-50/30"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg text-xs"
                    >
                      {isSaving ? 'Đang lưu...' : 'Ghi Nhận Tiền Sử'}
                    </button>
                  </form>
                )}

                {patient.medicalRecords && patient.medicalRecords.length > 0 ? (
                  <div className="space-y-2">
                    {patient.medicalRecords.map((rec) => (
                      <div key={rec.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                        {rec.allergies && (
                          <div className="text-rose-700 font-bold">
                            ⚠️ Dị ứng: <span className="font-normal">{rec.allergies}</span>
                          </div>
                        )}
                        {rec.medicalHistory && (
                          <div className="text-slate-700">
                            <strong>Bản thân:</strong> {rec.medicalHistory}
                          </div>
                        )}
                        {rec.familyHistory && (
                          <div className="text-slate-600">
                            <strong>Gia đình:</strong> {rec.familyHistory}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-xs text-center">
                    Chưa có ghi nhận tiền sử bệnh lý hoặc dị ứng đặc biệt.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
