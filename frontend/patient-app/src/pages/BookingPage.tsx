import { useCallback, useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Home,
  Plus,
  ShieldCheck,
  Stethoscope,
  User,
} from 'lucide-react';
import { vi } from '../i18n/vi';
import { patientApi } from '../services/api';
import type {
  DoctorScheduleSlot,
  PackageAvailableSchedules,
  PackageSummary,
  PatientAppointment,
  PatientProfile,
} from '../types/api';
import type { PatientPage } from '../types/navigation';
import { EmptyState, ErrorState, LoadingState } from '../components/PageState';
import { AddNewProfileModal } from '../components/AddNewProfileModal';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { facilityLocalInputToUtc } from '../utils/facilityTime';

interface BookingPageProps {
  token: string;
  facilityTimezone: string;
  onNavigate: (page: PatientPage) => void;
}

type BookingStep = 1 | 2 | 3 | 4; // 1: Hồ sơ, 2: Gói khám, 3: Lịch hẹn & Xác nhận, 4: Phiếu khám hoàn tất

export function BookingPage({ token, facilityTimezone, onNavigate }: BookingPageProps) {
  const [step, setStep] = useState<BookingStep>(1);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dữ liệu
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [packages, setPackages] = useState<PackageSummary[]>([]);

  // Lựa chọn của người dùng
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [currentMonthString, setCurrentMonthString] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [schedulesData, setSchedulesData] = useState<PackageAvailableSchedules | null>(null);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<DoctorScheduleSlot | null>(null);
  const [hasBhyt, setHasBhyt] = useState(false);
  const [hasPrivateInsurance, setHasPrivateInsurance] = useState(false);

  // Modal thêm hồ sơ
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);

  // Kết quả sau khi đặt khám thành công
  const [createdAppointment, setCreatedAppointment] = useState<PatientAppointment | null>(null);

  // Load danh sách hồ sơ và gói khám
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let profilesRes: PatientProfile[] = [];
      try {
        profilesRes = await patientApi.profiles(token);
      } catch {
        try {
          const single = await patientApi.profile(token);
          if (single) profilesRes = [single];
        } catch {
          profilesRes = [];
        }
      }

      let packagesRes: PackageSummary[] = [];
      try {
        packagesRes = await patientApi.packages();
      } catch (err) {
        console.warn('Lỗi tải danh mục gói khám:', err);
      }

      setProfiles(profilesRes);
      setPackages(packagesRes);
      if (profilesRes.length > 0 && !selectedProfileId) {
        setSelectedProfileId(profilesRes[0].id);
      }
      if (packagesRes.length > 0 && !selectedPackageId) {
        setSelectedPackageId(packagesRes[0].id);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : vi.networkIssue);
    } finally {
      setLoading(false);
    }
  }, [selectedPackageId, selectedProfileId, token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Tải lịch khám khả dụng của bác sĩ theo gói đã chọn và tháng
  const loadSchedules = useCallback(async (pkgId: string, monthStr: string) => {
    setLoadingSchedules(true);
    try {
      const data = await patientApi.packageSchedules(pkgId, monthStr);
      setSchedulesData(data);
      // Tìm ngày đầu tiên có trạng thái AVAILABLE
      const firstAvail = data.days.find((d) => d.status === 'AVAILABLE');
      if (firstAvail) {
        setSelectedDate(firstAvail.date);
        if (firstAvail.slots.length > 0) {
          const firstSlot = firstAvail.slots.find((s) => s.remaining_slots > 0) || firstAvail.slots[0];
          setSelectedSlot(firstSlot);
        } else {
          setSelectedSlot(null);
        }
      } else {
        setSelectedDate('');
        setSelectedSlot(null);
      }
    } catch (err) {
      console.warn('Lỗi tải lịch khám khả dụng:', err);
    } finally {
      setLoadingSchedules(false);
    }
  }, []);

  useEffect(() => {
    if (selectedPackageId) {
      void loadSchedules(selectedPackageId, currentMonthString);
    }
  }, [currentMonthString, loadSchedules, selectedPackageId]);

  function handleChangeMonth(offset: number) {
    const [y, m] = currentMonthString.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    const nextMonthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonthString(nextMonthStr);
  }

  function handleSelectDate(dateStr: string) {
    setSelectedDate(dateStr);
    const dayData = schedulesData?.days.find((d) => d.date === dateStr);
    if (dayData && dayData.slots.length > 0) {
      const firstSlot = dayData.slots.find((s) => s.remaining_slots > 0) || dayData.slots[0];
      setSelectedSlot(firstSlot);
    } else {
      setSelectedSlot(null);
    }
  }

  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0] || null;
  const selectedPackage = packages.find((p) => p.id === selectedPackageId) || packages[0] || null;

  function handleProfileAdded(newProfile: PatientProfile) {
    setProfiles((prev) => [...prev.filter((p) => p.id !== newProfile.id), newProfile]);
    setSelectedProfileId(newProfile.id);
    setShowAddProfileModal(false);
  }

  // Xác nhận đặt khám
  async function handleConfirmBooking() {
    if (!selectedProfile || !selectedPackage || !selectedDate || !selectedSlot) {
      setError('Vui lòng chọn ngày khám và khung giờ khả dụng');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const combinedDateTimeStr = `${selectedDate}T${selectedSlot.start_time}`;
      const utcIsoTime = facilityLocalInputToUtc(combinedDateTimeStr, facilityTimezone);

      const appointment = await patientApi.createAppointment(token, {
        patient_id: selectedProfile.id,
        package_id: selectedPackage.id,
        doctor_schedule_id: selectedSlot.id,
        appointment_time: utcIsoTime,
        notes: `BHYT: ${hasBhyt ? 'Có' : 'Không'}, Bảo hiểm tư nhân: ${hasPrivateInsurance ? 'Có' : 'Không'}, Bác sĩ: ${selectedSlot.doctor_name}`,
      });

      setCreatedAppointment(appointment);
      setStep(4); // Sang màn hình Phiếu khám
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Lỗi khi đặt lịch khám');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState />;
  if (error && profiles.length === 0 && packages.length === 0) {
    return <ErrorState message={error} onRetry={() => void loadData()} />;
  }

  return (
    <section className="space-y-4">
      {/* Bước điều hướng (Step indicator) - Chỉ hiện từ bước 1 tới bước 3 */}
      {step !== 4 && (
        <div>
          <div className="flex items-center justify-between pb-2">
            <h1 className="text-xl font-black text-blue-950">{vi.bookingTitle}</h1>
            <span className="text-xs font-bold text-blue-600">Bước {step}/3</span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
            <div
              className={`rounded-xl py-2 px-1 transition ${
                step === 1
                  ? 'bg-blue-600 text-white shadow'
                  : step > 1
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              1. {vi.bookingStepProfile}
            </div>
            <div
              className={`rounded-xl py-2 px-1 transition ${
                step === 2
                  ? 'bg-blue-600 text-white shadow'
                  : step > 2
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-500'
              }`}
            >
              2. {vi.bookingStepChoosePackage}
            </div>
            <div
              className={`rounded-xl py-2 px-1 transition ${
                step === 3
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              3. {vi.bookingStepSchedule}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700">
          {error}
        </p>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 1: HỒ SƠ NGƯỜI BỆNH */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{vi.patientProfilesTitle}</h2>
              <p className="text-xs text-slate-500">{vi.patientProfilesSubtitle}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddProfileModal(true)}
              className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
            >
              <Plus size={16} />
              <span>{vi.addNewProfile}</span>
            </button>
          </div>

          {profiles.length === 0 ? (
            <div className="surface-card p-6 text-center space-y-3">
              <User size={36} className="mx-auto text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">{vi.noPatientProfiles}</p>
              <button
                type="button"
                onClick={() => setShowAddProfileModal(true)}
                className="primary-button mx-auto"
              >
                <Plus size={17} />
                <span>{vi.addNewProfile}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {profiles.map((profile) => {
                const isSelected = profile.id === selectedProfileId;
                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <User size={22} />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900">{profile.full_name}</h3>
                          <p className="text-xs font-mono font-bold text-blue-700">
                            {profile.patient_code}
                          </p>
                          <p className="text-xs text-slate-500">
                            {profile.phone_number} · {profile.gender === 'MALE' ? 'Nam' : profile.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                disabled={!selectedProfileId}
                onClick={() => setStep(2)}
                className="primary-button mt-4 w-full"
              >
                <span>{vi.nextStep}</span>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 2: CHỌN GÓI KHÁM */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-4">
          {/* Cảnh báo bắt buộc theo DOMAIN_RULES */}
          <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-950">
            <AlertTriangle size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <p>{vi.packageWarning}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">{vi.step2ChoosePackageTitle}</h2>
              <p className="text-xs text-slate-500">Người bệnh: <strong>{selectedProfile?.full_name}</strong></p>
            </div>
          </div>

          {packages.length === 0 ? (
            <EmptyState message={vi.noPackages} />
          ) : (
            <div className="space-y-3">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPackageId;
                const formattedPrice = Number(pkg.base_price).toLocaleString('vi-VN') + ' đ';
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                            {pkg.tier_name || 'Tiêu chuẩn'}
                          </span>
                          <span className="text-[11px] text-slate-500">{pkg.target_group}</span>
                        </div>
                        <h3 className="mt-1.5 font-bold text-slate-900">{pkg.name}</h3>
                        <p className="mt-2 text-base font-black text-blue-700">{formattedPrice}</p>
                      </div>
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <CheckCircle2 size={16} />}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="secondary-button flex-1"
                >
                  <ArrowLeft size={17} />
                  <span>{vi.backStep}</span>
                </button>
                <button
                  type="button"
                  disabled={!selectedPackageId}
                  onClick={() => setStep(3)}
                  className="primary-button flex-1"
                >
                  <span>{vi.nextStep}</span>
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 3: LỊCH HẸN & XÁC NHẬN (Matches Thong_tin_dat_kham.png & Thong_tin_kham.png) */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-4">
          <p className="text-xs text-slate-600 leading-relaxed">{vi.bookingSubtitle}</p>

          {/* Card Thông tin đặt khám */}
          <div className="surface-card p-4 space-y-4 border-blue-100">
            {/* Hồ sơ người bệnh card */}
            <div className="rounded-2xl bg-blue-50/70 p-3.5 border border-blue-200">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <User size={16} className="text-blue-700" />
                <span>{vi.bookingStepProfile}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <strong className="text-sm font-black text-slate-900">{selectedProfile?.full_name}</strong>
                <span className="font-mono text-blue-800 font-bold">{selectedProfile?.patient_code}</span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{selectedProfile?.phone_number}</p>
            </div>

            {/* Chuyên khoa / Gói khám đã chọn */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <Stethoscope size={18} className="text-blue-700" />
                  <strong className="text-sm font-bold text-blue-950 uppercase">{selectedPackage?.name}</strong>
                </div>
              </div>

              {/* Bảng Lịch Khám Khả Dụng theo Bác Sĩ & Gói Khám */}
              {loadingSchedules ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  Đang tải lịch khám khả dụng của bác sĩ...
                </div>
              ) : schedulesData ? (
                <ScheduleCalendar
                  packageId={selectedPackage?.id || ''}
                  monthString={currentMonthString}
                  days={schedulesData.days}
                  selectedDate={selectedDate}
                  selectedSlotId={selectedSlot?.id || null}
                  onSelectDate={handleSelectDate}
                  onSelectSlot={(slot) => setSelectedSlot(slot)}
                  onChangeMonth={handleChangeMonth}
                />
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Không thể tải lịch khám. Vui lòng thử lại.
                </div>
              )}

              {/* Tùy chọn BHYT */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="font-semibold text-slate-700">{vi.bhytLabel}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bhyt"
                      checked={hasBhyt}
                      onChange={() => setHasBhyt(true)}
                    />
                    <span>{vi.insuranceYes}</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="bhyt"
                      checked={!hasBhyt}
                      onChange={() => setHasBhyt(false)}
                    />
                    <span>{vi.insuranceNo}</span>
                  </label>
                </div>
              </div>

              {/* Tùy chọn Bảo hiểm tư nhân */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                <span className="font-semibold text-slate-700">{vi.privateInsuranceLabel}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="privateInsurance"
                      checked={hasPrivateInsurance}
                      onChange={() => setHasPrivateInsurance(true)}
                    />
                    <span>{vi.insuranceYes}</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="privateInsurance"
                      checked={!hasPrivateInsurance}
                      onChange={() => setHasPrivateInsurance(false)}
                    />
                    <span>{vi.insuranceNo}</span>
                  </label>
                </div>
              </div>

              {/* Tiền khám */}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-xs font-bold text-slate-600">{vi.examinationFee}</span>
                <span className="text-base font-black text-blue-700">
                  {selectedPackage ? Number(selectedPackage.base_price).toLocaleString('vi-VN') + ' đ' : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setStep(2)}
              className="secondary-button flex-1"
            >
              <ArrowLeft size={17} />
              <span>{vi.backStep}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleConfirmBooking()}
              className="primary-button flex-1"
            >
              <ShieldCheck size={18} />
              <span>{busy ? vi.loading : vi.btnConfirmBooking}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BƯỚC 4: THÔNG TIN PHIẾU KHÁM (Matches Thong_tin_phieu_kham.png) */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-blue-950">{vi.bookingSuccessTitle}</h1>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="rounded-full p-2 text-blue-700 hover:bg-blue-50"
              aria-label={vi.btnBackHome}
            >
              <Home size={20} />
            </button>
          </div>

          {/* Phiếu khám bệnh Container */}
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-lg space-y-4">
            {/* Header bệnh viện */}
            <div className="text-center space-y-0.5">
              <h3 className="text-xs font-extrabold text-slate-800">
                Bệnh viện Đại học Y Dược TP. Hồ Chí Minh
              </h3>
              <p className="text-[10px] text-slate-500">
                215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh
              </p>
            </div>

            <div className="border-t border-dashed border-slate-300 pt-3 text-center">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                {vi.examinationSlipTitle}
              </span>
              <h2 className="mt-0.5 text-sm font-black text-slate-900 uppercase">
                {selectedPackage?.name}
              </h2>
              <p className="mt-1 text-sm font-black text-emerald-700">
                {selectedSlot ? `${selectedSlot.room_name} (${selectedSlot.room_number})` : 'Phòng khám tổng quát'}
              </p>
              {selectedSlot && (
                <p className="text-xs font-bold text-blue-900 mt-0.5">
                  BS. {selectedSlot.doctor_name}
                </p>
              )}
            </div>

            {/* Số thứ tự tròn to màu xanh */}
            <div className="flex flex-col items-center justify-center py-2">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-emerald-500 bg-emerald-50 text-3xl font-black text-emerald-700 shadow-inner">
                {Math.floor(Math.random() * 50) + 10}
              </div>
              <span className="mt-1 text-[11px] font-bold text-slate-600">{vi.queueNumberBadge}</span>
            </div>

            {/* Ngày khám & Giờ dự kiến */}
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-blue-50/70 p-3 text-center border border-blue-100">
              <div>
                <p className="text-[10px] font-semibold text-slate-500">{vi.appointmentDateLabel}</p>
                <p className="text-xs font-bold text-blue-950 mt-0.5">{selectedDate}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold text-slate-500">{vi.expectedTimeLabel}</p>
                <p className="text-xs font-bold text-blue-950 mt-0.5">
                  {selectedSlot ? `${selectedSlot.start_time} - ${selectedSlot.end_time}` : '08:00'}
                </p>
              </div>
            </div>

            {/* Thông tin hành chính bệnh nhân */}
            <div className="space-y-1.5 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Họ tên:</span>
                <strong className="text-slate-900">{selectedProfile?.full_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Giới tính:</span>
                <span className="text-slate-800">
                  {selectedProfile?.gender === 'MALE' ? 'Nam' : selectedProfile?.gender === 'FEMALE' ? 'Nữ' : 'Khác'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{vi.patientCodeShort}:</span>
                <span className="font-mono font-bold text-blue-800">{selectedProfile?.patient_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{vi.appointmentCodeLabel}:</span>
                <span className="font-mono font-bold text-slate-900">
                  {createdAppointment?.appointment_code || 'APT-DEMO'}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-500">{vi.examinationFee}:</span>
                <strong className="text-blue-700">
                  {selectedPackage ? Number(selectedPackage.base_price).toLocaleString('vi-VN') + ' đồng' : '150.000 đồng'}
                </strong>
              </div>
            </div>

            {/* Lời dặn bệnh nhân chữ đỏ */}
            <div className="rounded-xl bg-rose-50 p-3 text-center">
              <p className="text-xs font-extrabold text-rose-700">
                {vi.patientNoticeToRoom}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {vi.queueNoteForDay}
              </p>
            </div>

            {/* Nút hành động */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => onNavigate('appointments')}
                className="primary-button w-full"
              >
                <span>{vi.btnViewAppointments}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
                className="secondary-button w-full"
              >
                <span>{vi.btnBackHome}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm hồ sơ người bệnh */}
      {showAddProfileModal && (
        <AddNewProfileModal
          token={token}
          onClose={() => setShowAddProfileModal(false)}
          onProfileAdded={handleProfileAdded}
        />
      )}
    </section>
  );
}
