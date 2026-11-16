import { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  CheckCircle2,
  FileSearch,
  Info,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { vi } from '../i18n/vi';
import { patientApi } from '../services/api';
import type { CreateProfileRequest, PatientProfile } from '../types/api';
import { QrScanner } from './QrScanner';
import { parseCccdQr } from '../utils/cccdParser';

interface AddNewProfileModalProps {
  token: string;
  onClose: () => void;
  onProfileAdded: (profile: PatientProfile) => void;
}

type ModalView = 'choose' | 'alreadyVisited' | 'neverVisited';
type AlreadyVisitedTab = 'byCode' | 'forgot';

export function AddNewProfileModal({ token, onClose, onProfileAdded }: AddNewProfileModalProps) {
  const [view, setView] = useState<ModalView>('choose');
  const [tab, setTab] = useState<AlreadyVisitedTab>('byCode');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Nhập mã
  const [patientCode, setPatientCode] = useState('');

  // Quên hồ sơ
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [country, setCountry] = useState('Việt Nam');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [lookupResults, setLookupResults] = useState<PatientProfile[] | null>(null);

  // Tạo hồ sơ mới
  const [newFullName, setNewFullName] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newGender, setNewGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newIdCard, setNewIdCard] = useState('');

  // Scanner modal
  const [showScanner, setShowScanner] = useState(false);

  // Xử lý quét CCCD
  function handleCccdScan(rawQr: string) {
    setShowScanner(false);
    const parsed = parseCccdQr(rawQr);
    if (!parsed) {
      setError('Mã QR không đúng định dạng CCCD gắn chip. Vui lòng quét lại.');
      return;
    }
    setError(null);
    setNotice(vi.scanCccdSuccess);
    if (view === 'alreadyVisited') {
      setLastName(parsed.lastName);
      setFirstName(parsed.firstName);
      setGender(parsed.gender);
      setIdCardNumber(parsed.idCardNumber);
    } else if (view === 'neverVisited') {
      setNewFullName(parsed.fullName);
      setNewDob(parsed.dateOfBirth);
      setNewGender(parsed.gender);
      setNewIdCard(parsed.idCardNumber);
      setNewAddress(parsed.address);
    }
  }

  // Liên kết bằng mã
  async function handleLinkByCode() {
    if (!patientCode.trim()) {
      setError('Vui lòng nhập mã người bệnh');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const profile = await patientApi.linkByCode(token, patientCode.trim());
      onProfileAdded(profile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không tìm thấy hồ sơ với mã này');
    } finally {
      setBusy(false);
    }
  }

  // Tìm kiếm hồ sơ
  async function handleLookup() {
    if (!phone.trim()) {
      setError('Vui lòng nhập số điện thoại');
      return;
    }
    setBusy(true);
    setError(null);
    setLookupResults(null);
    try {
      const results = await patientApi.lookupProfiles(token, {
        last_name: lastName.trim() || undefined,
        first_name: firstName.trim() || undefined,
        phone_number: phone.trim(),
        gender,
        country,
        id_card_number: idCardNumber.trim() || undefined,
      });
      setLookupResults(results);
      if (results.length === 0) {
        setError(vi.noLookupResults);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Có lỗi khi tra cứu hồ sơ');
    } finally {
      setBusy(false);
    }
  }

  // Chọn hồ sơ từ kết quả tra cứu
  async function handleSelectLookupResult(result: PatientProfile) {
    setBusy(true);
    setError(null);
    try {
      const linked = await patientApi.linkByCode(token, result.patient_code);
      onProfileAdded(linked);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Lỗi khi liên kết hồ sơ');
    } finally {
      setBusy(false);
    }
  }

  // Tạo hồ sơ mới
  async function handleCreateNewProfile() {
    if (!newFullName.trim() || !newDob || !newPhone.trim()) {
      setError('Vui lòng điền đầy đủ Họ tên, Ngày sinh và Số điện thoại');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload: CreateProfileRequest = {
        full_name: newFullName.trim(),
        date_of_birth: newDob,
        gender: newGender,
        phone_number: newPhone.trim(),
        id_card_number: newIdCard.trim() || null,
        address: newAddress.trim() || null,
        country: 'Việt Nam',
      };
      const created = await patientApi.createProfile(token, payload);
      onProfileAdded(created);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Lỗi khi tạo hồ sơ');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            {view !== 'choose' && (
              <button
                type="button"
                onClick={() => {
                  setView('choose');
                  setError(null);
                  setNotice(null);
                }}
                className="rounded-full p-1 text-slate-500 hover:bg-slate-100"
                aria-label={vi.backStep}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h2 className="text-lg font-extrabold text-blue-950">
              {view === 'choose'
                ? vi.chooseProfileModalTitle
                : view === 'alreadyVisited'
                  ? vi.optionAlreadyVisited
                  : vi.optionNeverVisited}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label={vi.close}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thông báo lỗi / thành công */}
        {error && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-800">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <p>{error}</p>
          </div>
        )}
        {notice && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-emerald-600" />
            <p>{notice}</p>
          </div>
        )}

        {/* 1. Màn hình chọn 2 Options */}
        {view === 'choose' && (
          <div className="mt-5 space-y-3">
            <p className="text-xs text-slate-500">
              Vui lòng chọn tình trạng khám của người bệnh để tiếp tục:
            </p>

            <button
              type="button"
              onClick={() => {
                setView('alreadyVisited');
                setError(null);
              }}
              className="group flex w-full items-start gap-4 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-4 text-left transition hover:border-blue-600 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <UserCheck size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  {vi.optionAlreadyVisited}
                </strong>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {vi.optionAlreadyVisitedDesc}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setView('neverVisited');
                setError(null);
              }}
              className="group flex w-full items-start gap-4 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition hover:border-blue-600 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700">
                <UserPlus size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm font-bold text-slate-900 group-hover:text-blue-700">
                  {vi.optionNeverVisited}
                </strong>
                <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                  {vi.optionNeverVisitedDesc}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* 2. Màn hình "Đã từng khám" với 2 Tab */}
        {view === 'alreadyVisited' && (
          <div className="mt-4 space-y-4">
            {/* Tabs */}
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setTab('byCode');
                  setError(null);
                }}
                className={`rounded-lg py-2 transition ${
                  tab === 'byCode' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {vi.tabInputCode}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('forgot');
                  setError(null);
                }}
                className={`rounded-lg py-2 transition ${
                  tab === 'forgot' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {vi.tabForgotCode}
              </button>
            </div>

            {/* TAB 1: NHẬP MÃ NGƯỜI BỆNH */}
            {tab === 'byCode' && (
              <div className="space-y-4">
                {/* Hướng dẫn trực quan vị trí mã */}
                <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Info size={16} className="text-blue-700 shrink-0" />
                    <span>{vi.patientCodeGuideTitle}</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-slate-700">
                    {vi.patientCodeGuideDesc}
                  </p>

                  {/* Minh họa mẫu phiếu khám bệnh */}
                  <div className="mt-3 rounded-xl border border-dashed border-blue-300 bg-white p-3 shadow-inner">
                    <div className="text-center text-[10px] font-semibold text-slate-500">
                      BỆNH VIỆN ĐẠI HỌC Y DƯỢC TP. HỒ CHÍ MINH
                    </div>
                    <div className="text-center text-xs font-extrabold text-blue-950">
                      PHIẾU KHÁM BỆNH
                    </div>
                    <div className="mt-2 space-y-1 text-[11px] border-t border-slate-100 pt-2">
                      <div className="flex justify-between text-slate-500">
                        <span>Họ và tên: NGUYỄN VĂN AN</span>
                        <span>Giới tính: Nam</span>
                      </div>
                      <div className="flex items-center justify-between rounded-lg bg-amber-100/80 px-2 py-1 font-bold text-amber-950 ring-1 ring-amber-300">
                        <span>Mã người bệnh:</span>
                        <span className="font-mono text-xs text-blue-900">N19-016832</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <span>Mã phiếu: U26062</span>
                        <span>Ngày khám: Hôm nay</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Input mã */}
                <div>
                  <label className="block text-xs font-bold text-slate-700">
                    {vi.patientCodeLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientCode}
                    onChange={(e) => setPatientCode(e.target.value.toUpperCase())}
                    placeholder={vi.patientCodePlaceholder}
                    className="form-control mt-1 font-mono uppercase tracking-wider"
                  />
                </div>

                <button
                  type="button"
                  disabled={busy || !patientCode.trim()}
                  onClick={() => void handleLinkByCode()}
                  className="primary-button w-full"
                >
                  <CheckCircle2 size={18} />
                  {busy ? vi.loading : vi.btnLinkCode}
                </button>
              </div>
            )}

            {/* TAB 2: QUÊN HỒ SƠ (TÌM KIẾM BẰNG THÔNG TIN CÁ NHÂN) */}
            {tab === 'forgot' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      {vi.lastNameLabel}
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Nguyễn Văn"
                      className="form-control mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      {vi.firstNameLabel} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="An"
                      className="form-control mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700">
                    {vi.phoneLabel} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="form-control mt-1 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      {vi.genderLabel}
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="form-control mt-1 text-xs"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700">
                      {vi.countryLabel}
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="form-control mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* Kết quả tra cứu */}
                {lookupResults && lookupResults.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                    <p className="text-xs font-bold text-slate-900">{vi.lookupResultsTitle}:</p>
                    {lookupResults.map((res) => (
                      <div
                        key={res.id}
                        className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50/50 p-2.5"
                      >
                        <div>
                          <p className="text-xs font-bold text-blue-950">{res.full_name}</p>
                          <p className="text-[11px] font-mono text-slate-600">
                            {res.patient_code} · {res.phone_number}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => void handleSelectLookupResult(res)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-blue-700"
                        >
                          {vi.btnSelectThisProfile}
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Hàng nút dưới cùng: Quét CCCD (bên trái) và Tìm hồ sơ (bên phải màu xanh) */}
                <div className="mt-4 flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowScanner(true)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-blue-600 bg-blue-50 px-3 py-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    <Camera size={16} />
                    <span>{vi.btnScanCccd}</span>
                  </button>

                  <button
                    type="button"
                    disabled={busy || !phone.trim()}
                    onClick={() => void handleLookup()}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-3 py-3 text-xs font-bold text-white shadow transition hover:bg-blue-700 disabled:opacity-50"
                  >
                    <FileSearch size={16} />
                    <span>{busy ? vi.loading : vi.btnSearchProfile}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. Màn hình "Chưa từng khám" (Tạo hồ sơ mới) */}
        {view === 'neverVisited' && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="flex items-center gap-1.5 rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100"
              >
                <Camera size={14} />
                <span>{vi.btnScanCccd} điền tự động</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Họ và tên <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={newFullName}
                onChange={(e) => setNewFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className="form-control mt-1 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Ngày sinh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDob}
                  onChange={(e) => setNewDob(e.target.value)}
                  className="form-control mt-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Giới tính <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value as any)}
                  className="form-control mt-1 text-xs"
                >
                  <option value="MALE">Nam</option>
                  <option value="FEMALE">Nữ</option>
                  <option value="OTHER">Khác</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="0901234567"
                className="form-control mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Số CCCD/CMND</label>
              <input
                type="text"
                value={newIdCard}
                onChange={(e) => setNewIdCard(e.target.value)}
                placeholder="079198000123"
                className="form-control mt-1 text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700">Địa chỉ</label>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
                className="form-control mt-1 text-xs"
              />
            </div>

            <button
              type="button"
              disabled={busy || !newFullName.trim() || !newDob || !newPhone.trim()}
              onClick={() => void handleCreateNewProfile()}
              className="primary-button mt-4 w-full"
            >
              <CheckCircle2 size={18} />
              {busy ? vi.loading : vi.btnConfirmCreateProfile}
            </button>
          </div>
        )}
      </div>

      {/* Modal Scanner QR CCCD */}
      {showScanner && (
        <QrScanner onScan={handleCccdScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
