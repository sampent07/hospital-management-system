import React, { useState } from 'react';
import {
  User,
  Phone,
  ShieldCheck,
  HeartPulse,
  Save,
  CheckCircle2,
  MapPin,
  FileCheck,
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { PatientProfile } from '../types';

interface PatientProfileViewProps {
  profiles: PatientProfile[];
  onUpdateProfiles: (profiles: PatientProfile[]) => void;
  onGoToAdvisorWithProfile?: (profile: PatientProfile) => void;
  onGoToResultsWithProfile?: (profileId: string) => void;
}

const relationshipOptions = [
  { value: 'SELF', label: 'Bản thân' },
  { value: 'FATHER', label: 'Ba' },
  { value: 'MOTHER', label: 'Mẹ' },
  { value: 'GRANDFATHER', label: 'Ông' },
  { value: 'GRANDMOTHER', label: 'Bà' },
  { value: 'SPOUSE', label: 'Vợ / Chồng' },
  { value: 'CHILD', label: 'Con' },
  { value: 'OTHER', label: 'Người thân khác' }
];

const commonDiseasesList = [
  'Tăng huyết áp',
  'Đái tháo đường',
  'Bệnh tim mạch',
  'Viêm gan B/C',
  'Đau dạ dày / Tiêu hóa',
  'Dị ứng kháng sinh / Thuốc',
  'Cơ xương khớp / Cột sống'
];

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  profiles,
  onUpdateProfiles,
  onGoToAdvisorWithProfile,
  onGoToResultsWithProfile
}) => {
  // Modal Thêm / Chỉnh Sửa hồ sơ
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);

  // Form state
  const [formRelationship, setFormRelationship] = useState<string>('OTHER');
  const [formFullName, setFormFullName] = useState<string>('');
  const [formPhone, setFormPhone] = useState<string>('');
  const [formAge, setFormAge] = useState<number>(30);
  const [formGender, setFormGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [formInsuranceCard, setFormInsuranceCard] = useState<string>('');
  const [formIdCard, setFormIdCard] = useState<string>('');
  const [formSelectedDiseases, setFormSelectedDiseases] = useState<string[]>([]);
  const [formMedicalHistoryDetail, setFormMedicalHistoryDetail] = useState<string>('');
  const [formMaritalStatus, setFormMaritalStatus] = useState<string>('MARRIED');
  const [formAddress, setFormAddress] = useState<string>('');
  const [formPersonalNotes, setFormPersonalNotes] = useState<string>('');
  const [formIsDefault, setFormIsDefault] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Mở modal thêm mới hồ sơ
  const handleOpenAddModal = () => {
    setEditingProfileId(null);
    setFormRelationship('FATHER');
    setFormFullName('');
    setFormPhone('');
    setFormAge(60);
    setFormGender('MALE');
    setFormInsuranceCard('');
    setFormIdCard('');
    setFormSelectedDiseases([]);
    setFormMedicalHistoryDetail('');
    setFormMaritalStatus('MARRIED');
    setFormAddress('TP. Hồ Chí Minh');
    setFormPersonalNotes('');
    setFormIsDefault(false);
    setValidationError(null);
    setIsModalOpen(true);
  };

  // Mở modal chỉnh sửa hồ sơ
  const handleOpenEditModal = (p: PatientProfile) => {
    setEditingProfileId(p.id);
    setFormRelationship(p.relationship);
    setFormFullName(p.fullName);
    setFormPhone(p.phone);
    setFormAge(p.age);
    setFormGender((p.gender === 'FEMALE' ? 'FEMALE' : p.gender === 'OTHER' ? 'OTHER' : 'MALE'));
    setFormInsuranceCard(p.insuranceCard || '');
    setFormIdCard(p.idCardNumber || '');
    setFormSelectedDiseases([...(p.selectedDiseases || [])]);
    setFormMedicalHistoryDetail(p.medicalHistoryDetail || '');
    setFormMaritalStatus(p.maritalStatus || 'MARRIED');
    setFormAddress(p.address || '');
    setFormPersonalNotes(p.personalNotes || '');
    setFormIsDefault(Boolean(p.isDefault));
    setValidationError(null);
    setIsModalOpen(true);
  };

  const toggleDisease = (disease: string) => {
    setFormSelectedDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease]
    );
  };

  // Lưu hồ sơ (Thêm mới hoặc Cập nhật)
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim()) {
      setValidationError('Vui lòng nhập Họ và Tên thành viên!');
      return;
    }
    if (!formPhone.trim()) {
      setValidationError('Vui lòng nhập Số điện thoại liên hệ!');
      return;
    }
    if (formAge <= 0 || isNaN(formAge)) {
      setValidationError('Vui lòng nhập Độ tuổi hợp lệ!');
      return;
    }

    const relObj = relationshipOptions.find((r) => r.value === formRelationship);
    const relLabel = relObj ? relObj.label : 'Người thân';

    if (editingProfileId) {
      // Cập nhật hồ sơ hiện có
      const updated = profiles.map((p) => {
        if (p.id === editingProfileId) {
          return {
            ...p,
            relationship: formRelationship,
            relationshipLabel: relLabel,
            fullName: formFullName.trim(),
            phone: formPhone.trim(),
            age: formAge,
            gender: formGender,
            insuranceCard: formInsuranceCard.trim(),
            idCardNumber: formIdCard.trim(),
            selectedDiseases: formSelectedDiseases,
            medicalHistoryDetail: formMedicalHistoryDetail.trim(),
            maritalStatus: formMaritalStatus,
            address: formAddress.trim(),
            personalNotes: formPersonalNotes.trim(),
            isDefault: formIsDefault
          };
        }
        // Nếu hồ sơ này được đặt làm mặc định -> bỏ mặc định của các hồ sơ khác
        if (formIsDefault) {
          return { ...p, isDefault: false };
        }
        return p;
      });

      onUpdateProfiles(updated);
      setSuccessToast(`Đã cập nhật thông tin hồ sơ "${formFullName}" thành công!`);
    } else {
      // Thêm hồ sơ mới
      const newId = `prof-${Date.now()}`;
      const newProf: PatientProfile = {
        id: newId,
        relationship: formRelationship,
        relationshipLabel: relLabel,
        isDefault: formIsDefault || profiles.length === 0,
        fullName: formFullName.trim(),
        phone: formPhone.trim(),
        age: formAge,
        gender: formGender,
        insuranceCard: formInsuranceCard.trim(),
        idCardNumber: formIdCard.trim(),
        selectedDiseases: formSelectedDiseases,
        medicalHistoryDetail: formMedicalHistoryDetail.trim(),
        maritalStatus: formMaritalStatus,
        address: formAddress.trim(),
        personalNotes: formPersonalNotes.trim()
      };

      let updated = [...profiles];
      if (formIsDefault) {
        updated = updated.map((p) => ({ ...p, isDefault: false }));
      }
      updated.push(newProf);
      onUpdateProfiles(updated);
      setSuccessToast(`Đã thêm hồ sơ mới cho "${formFullName} (${relLabel})" thành công!`);
    }

    setIsModalOpen(false);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3500);
  };

  // Thiết lập hồ sơ làm mặc định
  const handleSetDefault = (profileId: string) => {
    const updated = profiles.map((p) => ({
      ...p,
      isDefault: p.id === profileId
    }));
    onUpdateProfiles(updated);
    const target = profiles.find((p) => p.id === profileId);
    setSuccessToast(`Đã đặt hồ sơ "${target?.fullName}" làm hồ sơ mặc định!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Xóa hồ sơ
  const handleDeleteProfile = (profileId: string, name: string) => {
    if (profiles.length <= 1) {
      alert('Tài khoản cần có ít nhất một hồ sơ.');
      return;
    }
    if (window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ của "${name}" không?`)) {
      const updated = profiles.filter((p) => p.id !== profileId);
      // Nếu xóa hồ sơ mặc định, chọn hồ sơ đầu tiên làm mặc định
      if (updated.length > 0 && !updated.some((p) => p.isDefault)) {
        updated[0].isDefault = true;
      }
      onUpdateProfiles(updated);
      setSuccessToast(`Đã xóa hồ sơ "${name}".`);
      setTimeout(() => {
        setSuccessToast(null);
      }, 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full space-y-5 font-sans animate-in fade-in duration-300">
      {/* Toast thông báo lưu thành công */}
      {successToast && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 p-4 rounded-2xl flex items-center justify-between gap-3 text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs sm:text-sm font-bold">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Quản Lý Sổ Hồ Sơ (Phong cách sổ địa chỉ Shopee) */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-blue-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Sổ Hồ Sơ Khám Bệnh Gia Đình
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {profiles.length} hồ sơ
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý hồ sơ của bản thân và người thân (ba, mẹ, ông, bà, con...) để tiện lợi khi đăng ký khám và tra cứu kết quả
            </p>
          </div>
        </div>

        {/* NÚT TẠO HỒ SƠ MỚI (NHƯ THÊM ĐỊA CHỈ TRÊN SHOPEE) */}
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-[1.02] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Hồ Sơ Mới</span>
        </button>
      </div>

      {/* DANH SÁCH CÁC THẺ HỒ SƠ THÀNH VIÊN TRONG TÀI KHOẢN (SHOPEE STYLE) */}
      <div className="space-y-4">
        {profiles.map((p) => {
          const isSelf = p.relationship === 'SELF';
          return (
            <div
              key={p.id}
              className={`bg-white rounded-3xl border-2 p-5 sm:p-6 shadow-sm transition-all relative overflow-hidden ${
                p.isDefault
                  ? 'border-blue-400 bg-gradient-to-br from-white via-white to-blue-50/20 ring-2 ring-blue-100'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Dải màu góc trên thẻ mặc định */}
              {p.isDefault && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
              )}

              <div className="space-y-4">
                {/* Dòng 1: Họ tên, Quan hệ, Huy hiệu mặc định & Nút Thao tác */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-slate-900">
                      {p.fullName}
                    </span>

                    {/* Huy hiệu quan hệ (Ba, Mẹ, Bản thân, Con...) */}
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                        isSelf
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>{p.relationshipLabel || (isSelf ? 'Bản thân' : 'Người thân')}</span>
                    </span>

                    {/* Huy hiệu mặc định (như Shopee) */}
                    {p.isDefault && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200 uppercase tracking-wide">
                        Mặc Định
                      </span>
                    )}

                    {p.insuranceCard && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>BHYT: {p.insuranceCard}</span>
                      </span>
                    )}
                  </div>

                  {/* Nút Chỉnh sửa & Xóa */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(p)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer"
                      title="Chỉnh sửa thông tin hồ sơ này"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>

                    {!isSelf && (
                      <button
                        type="button"
                        onClick={() => handleDeleteProfile(p.id, p.fullName)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-all cursor-pointer"
                        title="Xóa hồ sơ người thân này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Dòng 2: Chi tiết thông tin định danh y tế */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Số điện thoại:</span>
                    <strong className="text-slate-800 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{p.phone}</span>
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Độ tuổi & Giới tính:</span>
                    <strong className="text-slate-800">
                      {p.age} tuổi • {p.gender === 'FEMALE' ? 'Nữ' : p.gender === 'OTHER' ? 'Khác' : 'Nam'}
                    </strong>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] text-slate-400 block font-medium">Số CCCD / Định danh:</span>
                    <strong className="text-slate-700 font-mono">
                      {p.idCardNumber || 'Chưa cập nhật'}
                    </strong>
                  </div>
                </div>

                {/* Địa chỉ cư trú */}
                {p.address && (
                  <div className="text-xs text-slate-600 flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{p.address}</span>
                  </div>
                )}

                {/* Tiền sử bệnh lý & Dị ứng thuốc nếu có */}
                {((p.selectedDiseases && p.selectedDiseases.length > 0) || p.medicalHistoryDetail) && (
                  <div className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 space-y-1 text-xs">
                    <span className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                      <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                      <span>Tiền sử bệnh lý & Dị ứng:</span>
                    </span>
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {p.selectedDiseases?.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] font-semibold bg-white text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200"
                        >
                          {d}
                        </span>
                      ))}
                      {p.medicalHistoryDetail && (
                        <span className="text-[11px] text-slate-700 ml-1">
                          {p.medicalHistoryDetail}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Footer của Thẻ: Đặt mặc định & Hành động Đặt Lịch / Xem Kết Quả */}
                <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    {!p.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(p.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-700 p-1 hover:underline cursor-pointer"
                      >
                        Thiết lập làm hồ sơ mặc định
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-medium">
                        Hồ sơ này sẽ được ưu tiên tự động điền khi đăng ký khám
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {onGoToResultsWithProfile && (
                      <button
                        type="button"
                        onClick={() => onGoToResultsWithProfile(p.id)}
                        className="px-3.5 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-blue-200 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Xem Kết Quả Khám</span>
                      </button>
                    )}

                    {onGoToAdvisorWithProfile && (
                      <button
                        type="button"
                        onClick={() => onGoToAdvisorWithProfile(p)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Đăng Ký Khám Cho {p.relationshipLabel || p.fullName}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL THÊM MỚI / CHỈNH SỬA HỒ SƠ THÀNH VIÊN GIA ĐÌNH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border-2 border-blue-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 font-sans">
            {/* Header Modal */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-gradient-to-r from-blue-50 via-white to-indigo-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingProfileId ? 'Chỉnh Sửa Hồ Sơ Thành Viên' : 'Tạo Hồ Sơ Thành Viên Mới'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Điền thông tin người thân để đăng ký khám bệnh và lưu trữ bệnh án điện tử
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form nội dung */}
            <form onSubmit={handleSaveModal} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {validationError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* 1. CHỌN MỐI QUAN HỆ (BA, MẸ, ÔNG, BÀ, CON...) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                  Mối quan hệ với chủ tài khoản *:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {relationshipOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFormRelationship(opt.value)}
                      className={`p-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer text-center ${
                        formRelationship === opt.value
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. THÔNG TIN CƠ BẢN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Họ và Tên <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    placeholder="Ví dụ: Lê Văn Ba"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
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
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="0913 888 999"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Độ Tuổi <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={formAge}
                    onChange={(e) => setFormAge(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Giới Tính:</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Số BHYT:</label>
                  <input
                    type="text"
                    value={formInsuranceCard}
                    onChange={(e) => setFormInsuranceCard(e.target.value)}
                    placeholder="HT 2 79..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Số CCCD / CMND:</label>
                  <input
                    type="text"
                    value={formIdCard}
                    onChange={(e) => setFormIdCard(e.target.value)}
                    placeholder="079058000123"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tình Trạng Hôn Nhân:</label>
                  <select
                    value={formMaritalStatus}
                    onChange={(e) => setFormMaritalStatus(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="MARRIED">Đã kết hôn</option>
                    <option value="SINGLE">Độc thân</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Địa Chỉ Thường Trú / Tạm Trú:</label>
                <input
                  type="text"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder="Ví dụ: Số 45 Lê Lợi, P. Bến Nghé, Quận 1, TP.HCM"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* 3. TIỀN SỬ BỆNH LÝ & DỊ ỨNG */}
              <div className="p-3.5 bg-rose-50/50 rounded-2xl border border-rose-200 space-y-2">
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <HeartPulse className="w-4 h-4 text-rose-500" />
                  <span>Tiền sử bệnh lý & Dị ứng thuốc (chọn nếu có):</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {commonDiseasesList.map((disease) => {
                    const isChecked = formSelectedDiseases.includes(disease);
                    return (
                      <button
                        key={disease}
                        type="button"
                        onClick={() => toggleDisease(disease)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                          isChecked
                            ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '}
                        {disease}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formMedicalHistoryDetail}
                  onChange={(e) => setFormMedicalHistoryDetail(e.target.value)}
                  placeholder="Chi tiết tiền sử phẫu thuật, thuốc đang uống hàng ngày..."
                  className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-400 mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi Chú Y Khoa Riêng:</label>
                <input
                  type="text"
                  value={formPersonalNotes}
                  onChange={(e) => setFormPersonalNotes(e.target.value)}
                  placeholder="Ví dụ: Người cao tuổi cần hỗ trợ xe lăn, khó nghe..."
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              {/* Checkbox Đặt làm mặc định */}
              <div className="pt-1">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsDefault}
                    onChange={(e) => setFormIsDefault(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">
                    Đặt làm hồ sơ mặc định của tài khoản
                  </span>
                </label>
              </div>

              {/* Nút lưu & hủy */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingProfileId ? 'Lưu Thay Đổi' : 'Thêm Vào Sổ Hồ Sơ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
