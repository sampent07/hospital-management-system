import { useEffect, useState } from 'react';
import {
  Award,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Clock,
  ExternalLink,
  GraduationCap,
  Info,
  Mail,
  MapPin,
  Navigation,
  Phone,
  PhoneCall,
  Search,
  Stethoscope,
  User,
  X,
} from 'lucide-react';
import { patientApi } from '../services/api';
import type { DoctorDetail, DoctorListItem } from '../types/api';
import type { PatientPage, PreviewFeature } from '../types/navigation';
import { ErrorState, LoadingState } from '../components/PageState';

interface FeaturesPageProps {
  onNavigate: (page: PatientPage) => void;
  onPreview: (feature: PreviewFeature) => void;
}

type FeatureTab = 'doctors' | 'contact';
type DoctorDetailTab = 'schedules' | 'education' | 'experience' | 'memberships';

const DAYS_OF_WEEK_OPTIONS = [
  { value: '', label: 'Tất cả các ngày (T2 - T7)' },
  { value: '2', label: 'Thứ Hai' },
  { value: '3', label: 'Thứ Ba' },
  { value: '4', label: 'Thứ Tư' },
  { value: '5', label: 'Thứ Năm' },
  { value: '6', label: 'Thứ Sáu' },
  { value: '7', label: 'Thứ Bảy (Sáng)' },
];

export function FeaturesPage({ onNavigate }: FeaturesPageProps) {
  const [activeTab, setActiveTab] = useState<FeatureTab>('doctors');

  // Doctor Directory state
  const [doctors, setDoctors] = useState<DoctorListItem[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  // Doctor Detail modal
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [doctorDetail, setDoctorDetail] = useState<DoctorDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailTab, setDoctorDetailTab] = useState<DoctorDetailTab>('schedules');

  // Load specialties and initial doctors list
  useEffect(() => {
    let mounted = true;
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [specs, docs] = await Promise.all([
          patientApi.specialties().catch(() => []),
          patientApi.doctors(),
        ]);
        if (mounted) {
          setSpecialties(specs);
          setDoctors(docs);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách bác sĩ');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter query when user changes dropdowns or search query
  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(async () => {
      try {
        const res = await patientApi.doctors({
          specialty: selectedSpecialty || undefined,
          day_of_week: selectedDay || undefined,
          q: searchQuery.trim() || undefined,
        });
        if (mounted) {
          setDoctors(res);
        }
      } catch {
        // Fallback silently if quick debounce fails
      }
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedSpecialty, selectedDay]);

  // Load doctor detail modal
  const handleOpenDoctorDetail = async (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setLoadingDetail(true);
    setDoctorDetailTab('schedules');
    try {
      const detail = await patientApi.doctor(doctorId);
      setDoctorDetail(detail);
    } catch {
      setDoctorDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDoctorDetail = () => {
    setSelectedDoctorId(null);
    setDoctorDetail(null);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedDay('');
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Segmented Navigation Tabs */}
      <div className="flex rounded-2xl bg-white p-1.5 shadow-sm border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'doctors'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Calendar size={17} />
          <span>Lịch Khám bệnh</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
            activeTab === 'contact'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <PhoneCall size={17} />
          <span>Liên Hệ & Vị Trí</span>
        </button>
      </div>

      {/* ======================================================================= */}
      {/* TAB 1: LỊCH KHÁM BÁC SĨ */}
      {/* ======================================================================= */}
      {activeTab === 'doctors' && (
        <div className="space-y-4">
          {/* Header Description */}
          <div className="px-1">
            <h1 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Stethoscope className="text-blue-600" size={19} />
              Đội ngũ Bác sĩ & Lịch phòng khám
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Tra cứu thông tin, chuyên môn và lịch trực theo tuần của các bác sĩ chuyên khoa.
            </p>
          </div>

          {/* Search bar & 2 pushdown filters */}
          <div className="space-y-2.5 rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-sm">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm bác sĩ (TS. BS...), chuyên khoa..."
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5"
                  aria-label="Xóa tìm kiếm"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* 2 Pushdown Catalog Filters */}
            <div className="grid grid-cols-2 gap-2">
              {/* Pushdown 1: Chuyên khoa */}
              <div className="relative">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 pr-7 truncate"
                  title="Lọc theo chuyên khoa"
                >
                  <option value="">Tất cả chuyên khoa</option>
                  {specialties.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" size={14} />
              </div>

              {/* Pushdown 2: Chọn thứ */}
              <div className="relative">
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 pr-7 truncate"
                  title="Chọn thứ trong tuần"
                >
                  {DAYS_OF_WEEK_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 text-slate-400" size={14} />
              </div>
            </div>

            {/* Active filter counter / Clear button */}
            {(searchQuery || selectedSpecialty || selectedDay) && (
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                <span>
                  Tìm thấy <strong className="text-blue-600">{doctors.length}</strong> bác sĩ phù hợp
                </span>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Đặt lại bộ lọc
                </button>
              </div>
            )}
          </div>

          {/* Doctors List */}
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={() => window.location.reload()} />
          ) : doctors.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
              <Stethoscope className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="text-sm font-bold text-slate-700">Không tìm thấy bác sĩ phù hợp</p>
              <p className="text-xs text-slate-500 mt-1">
                Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn chuyên khoa/thứ để xem tất cả bác sĩ.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100"
              >
                Xem tất cả bác sĩ
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor) => {
                const displayName = `${doctor.academic_title ? `${doctor.academic_title} ` : ''}${doctor.full_name}`.toUpperCase();
                return (
                  <div
                    key={doctor.id}
                    className="flex flex-row items-stretch rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-sm hover:border-blue-300 transition-all gap-3"
                  >
                    {/* Left Column: Doctor Photo & "Xem chi tiết" Button */}
                    <div className="flex flex-col items-center justify-between w-24 sm:w-28 flex-shrink-0">
                      <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                        {doctor.avatar_url ? (
                          <img
                            src={doctor.avatar_url}
                            alt={doctor.full_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback on error
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <User className="text-slate-400" size={36} />
                        )}
                      </div>

                      {/* "Xem chi tiết" button right below doctor photo */}
                      <button
                        type="button"
                        onClick={() => handleOpenDoctorDetail(doctor.id)}
                        className="w-full mt-2 py-1.5 px-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 text-[11px] font-bold text-center transition flex items-center justify-center gap-1 shadow-sm active:scale-95"
                        title="Xem chi tiết lý lịch và lịch khám"
                      >
                        <Info size={13} />
                        <span>Xem chi tiết</span>
                      </button>
                    </div>

                    {/* Right Column: Title + Name, Specialty, Schedule Shifts, "Đặt khám" Button */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {/* Academic title & Full Name */}
                        <h3 className="text-[13px] sm:text-[14px] font-extrabold text-slate-900 leading-snug tracking-tight line-clamp-2">
                          {displayName}
                        </h3>

                        {/* Specialty (e.g. PHẪU THUẬT HÀM MẶT - RHM) */}
                        <div className="mt-1">
                          <span className="inline-block text-[10px] sm:text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200/70 uppercase">
                            {doctor.specialty}
                          </span>
                        </div>

                        {/* Room info if available */}
                        {doctor.room_name && (
                          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                            <Building2 size={12} className="text-slate-400 flex-shrink-0" />
                            <span className="truncate">{doctor.room_name}</span>
                          </p>
                        )}

                        {/* Shifts and Days scheduled */}
                        <div className="mt-2 text-[11px] text-slate-700 flex items-start gap-1.5 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                          <Clock size={13} className="text-blue-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-semibold text-slate-500 block text-[10px] uppercase">Lịch khám bệnh:</span>
                            <span className="font-bold text-slate-800 text-[11px] leading-tight">
                              {doctor.schedule_summary || 'Theo lịch phân bổ của bệnh viện'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* "Đặt khám" button linking to booking flow */}
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end">
                        <button
                          type="button"
                          onClick={() => onNavigate('booking')}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
                          title="Chuyển sang đăng ký khám bệnh"
                        >
                          <Calendar size={13} />
                          <span>Đặt khám</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================================= */}
      {/* TAB 2: LIÊN HỆ & BẢN ĐỒ */}
      {/* ======================================================================= */}
      {activeTab === 'contact' && (
        <div className="space-y-4">
          {/* Header Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-4 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
              <Building2 size={160} />
            </div>
            <span className="inline-block px-2 py-0.5 rounded-md bg-blue-500/30 text-blue-200 text-[10px] font-bold tracking-wider uppercase mb-1.5">
              Cơ sở chính 1
            </span>
            <h2 className="text-base sm:text-lg font-extrabold leading-tight tracking-tight">
              Bệnh viện Đại học Y Dược TP. Hồ Chí Minh
            </h2>
            <p className="text-xs text-blue-200/90 mt-1 leading-relaxed">
              Tiên phong trong điều trị, đào tạo và nghiên cứu khoa học chuẩn mực quốc tế.
            </p>
          </div>

          {/* Hospital Details Card */}
          <div className="rounded-2xl bg-white p-4 border border-slate-200/90 shadow-sm space-y-3.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Building2 size={15} className="text-blue-600" />
              Thông tin liên hệ chính thức
            </h3>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-slate-900">Địa chỉ bệnh viện</strong>
                <p className="text-xs text-slate-600 leading-relaxed mt-0.5">
                  215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh
                </p>
              </div>
            </div>

            {/* Hotline */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <PhoneCall size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-slate-900">Tổng đài Chăm sóc khách hàng (24/7)</strong>
                <a
                  href="tel:19007178"
                  className="text-sm font-extrabold text-blue-600 hover:underline block mt-0.5"
                >
                  1900 7178
                </a>
              </div>
            </div>

            {/* Telephone */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Phone size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-slate-900">Điện thoại cơ quan</strong>
                <a
                  href="tel:02838554269"
                  className="text-xs font-bold text-slate-800 hover:underline block mt-0.5"
                >
                  (028) 3855 4269
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Mail size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-slate-900">Hòm thư điện tử (Email)</strong>
                <a
                  href="mailto:bvdhyd@umc.edu.vn"
                  className="text-xs font-medium text-blue-600 hover:underline block mt-0.5"
                >
                  bvdhyd@umc.edu.vn
                </a>
              </div>
            </div>

            {/* Website */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Navigation size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-xs font-bold text-slate-900">Trang thông tin điện tử (Website)</strong>
                <a
                  href="https://bvdaihoc.com.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline inline-flex items-center gap-1 mt-0.5"
                >
                  <span>https://bvdaihoc.com.vn</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            {/* Working Hours */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80 space-y-1.5 mt-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Clock size={14} className="text-blue-600" />
                <span>Giờ khám bệnh ngoại trú:</span>
              </div>
              <ul className="text-xs text-slate-600 space-y-1 pl-5 list-disc">
                <li>
                  <strong>Thứ 2 - Thứ 6:</strong> Sáng 06:30 - 11:00 | Chiều 13:30 - 15:30
                </li>
                <li>
                  <strong>Thứ 7:</strong> Sáng 06:30 - 11:00 (Chiều nghỉ)
                </li>
                <li>
                  <strong>Chủ Nhật & Ngày lễ:</strong> Nghỉ khám ngoại trú (Khoa Cấp cứu tiếp nhận 24/24)
                </li>
              </ul>
            </div>
          </div>

          {/* Interactive Visual Map of Hospital Location */}
          <div className="rounded-2xl bg-white p-3.5 border border-slate-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <MapPin size={15} className="text-rose-600" />
                Bản đồ vị trí bệnh viện
              </h3>
              <a
                href="https://maps.google.com/?q=215+Hồng+Bàng+Phường+11+Quận+5+TPHCM"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                <span>Mở Google Maps</span>
                <ExternalLink size={11} />
              </a>
            </div>

            {/* Map Frame */}
            <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner">
              <iframe
                title="Bản đồ Bệnh viện Đại học Y Dược TP.HCM"
                src="https://maps.google.com/maps?q=215%20H%E1%BB%93ng%20B%C3%A0ng,%20Ph%C6%B0%E1%BB%9Dng%2011,%20Qu%E1%BA%ADn%205,%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=&z=16&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                aria-label="Vị trí bệnh viện 215 Hồng Bàng Quận 5"
              />
              <div className="pointer-events-none absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-sm p-2 rounded-lg border border-slate-200 text-[11px] text-slate-700 shadow-sm flex items-center justify-between">
                <span className="font-semibold truncate">📍 Cổng chính: 215 Hồng Bàng, P.11, Q.5</span>
                <span className="text-blue-700 font-bold shrink-0 ml-2">TP.HCM</span>
              </div>
            </div>
          </div>

          {/* Prominent Direct Phone Call Button */}
          <div className="sticky bottom-16 pt-2 z-10">
            <a
              href="tel:19007178"
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition border border-emerald-400/30"
            >
              <PhoneCall size={19} className="animate-pulse" />
              <span>GỌI TỔNG ĐÀI HỖ TRỢ: 1900 7178</span>
            </a>
            <p className="text-center text-[10px] text-slate-500 mt-1 font-medium">
              Bấm để gọi trực tiếp tới tổng đài hỗ trợ và tư vấn lịch khám 24/7
            </p>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* DOCTOR DETAIL MODAL (Khi bấm "Xem chi tiết") */}
      {/* ======================================================================= */}
      {selectedDoctorId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex max-h-[90vh] w-full max-w-[28rem] flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="relative bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-4 text-white">
              <button
                type="button"
                onClick={handleCloseDoctorDetail}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>

              {loadingDetail ? (
                <div className="py-6 text-center text-xs text-blue-100">Đang tải thông tin chi tiết bác sĩ...</div>
              ) : doctorDetail ? (
                <div className="flex items-start gap-3.5 pr-8">
                  {/* Doctor Avatar */}
                  <div className="w-16 h-20 sm:w-20 sm:h-24 rounded-2xl overflow-hidden bg-white/20 border-2 border-white shadow-md flex-shrink-0 flex items-center justify-center">
                    {doctorDetail.avatar_url ? (
                      <img
                        src={doctorDetail.avatar_url}
                        alt={doctorDetail.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-white" size={32} />
                    )}
                  </div>

                  {/* Doctor Info */}
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-white/20 text-blue-100 text-[10px] font-bold uppercase mb-1">
                      {doctorDetail.specialty}
                    </span>
                    <h2 className="text-sm sm:text-base font-extrabold leading-snug">
                      {`${doctorDetail.academic_title ? `${doctorDetail.academic_title} ` : ''}${doctorDetail.full_name}`.toUpperCase()}
                    </h2>
                    <p className="text-[11px] text-blue-100/90 mt-0.5">
                      Số CCHN: <strong>{doctorDetail.license_number}</strong>
                    </p>
                    {doctorDetail.room_name && (
                      <p className="text-[11px] text-blue-200 mt-0.5 flex items-center gap-1">
                        <Building2 size={12} />
                        <span className="truncate">{doctorDetail.room_name}</span>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-red-200">Không tìm thấy thông tin chi tiết</div>
              )}
            </div>

            {/* 4 Pushdown Tabs with Blue Highlight & Blue Border */}
            {doctorDetail && (
              <>
                <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50/80 text-center">
                  <button
                    type="button"
                    onClick={() => setDoctorDetailTab('schedules')}
                    className={`py-2.5 px-1 text-[11px] font-bold transition-all relative ${
                      detailTab === 'schedules'
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lịch khám
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorDetailTab('education')}
                    className={`py-2.5 px-1 text-[11px] font-bold transition-all relative ${
                      detailTab === 'education'
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Đào tạo
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorDetailTab('experience')}
                    className={`py-2.5 px-1 text-[11px] font-bold transition-all relative ${
                      detailTab === 'experience'
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Công tác
                  </button>
                  <button
                    type="button"
                    onClick={() => setDoctorDetailTab('memberships')}
                    className={`py-2.5 px-1 text-[11px] font-bold transition-all relative ${
                      detailTab === 'memberships'
                        ? 'text-blue-600 bg-white border-b-2 border-blue-600 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Hiệp hội
                  </button>
                </div>

                {/* Tab Contents Area */}
                <div className="flex-1 overflow-y-auto p-4 max-h-[50vh] space-y-3">
                  {/* TAB CONTENT 1: Lịch khám bệnh */}
                  {detailTab === 'schedules' && (
                    <div className="space-y-3">
                      <div className="rounded-xl bg-blue-50/70 p-3 border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                        <Clock size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">Lịch phân bổ định kỳ:</strong>
                          <span>{doctorDetail.schedule_summary || 'Theo quy chế luân phiên'}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                          Các ca trực gần nhất ({doctorDetail.schedules.length} ca khả dụng):
                        </h4>

                        {doctorDetail.schedules.length === 0 ? (
                          <p className="text-xs text-slate-500 italic">Chưa có lịch trực mở đăng ký trong tháng.</p>
                        ) : (
                          <div className="space-y-2">
                            {doctorDetail.schedules.slice(0, 10).map((slot) => {
                              const isMorning = slot.start_time.startsWith('06') || slot.start_time.startsWith('07') || slot.start_time.startsWith('08');
                              return (
                                <div
                                  key={slot.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 text-xs"
                                >
                                  <div>
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                      <Calendar size={13} className="text-blue-600" />
                                      <span>{slot.work_date}</span>
                                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                        isMorning ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                                      }`}>
                                        {isMorning ? 'Sáng' : 'Chiều'}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Giờ khám: <strong>{slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}</strong>
                                      {slot.room_name && ` · ${slot.room_name}`}
                                    </p>
                                  </div>

                                  <div className="text-right">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        slot.remaining_slots > 0
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {slot.remaining_slots > 0
                                        ? `Còn ${slot.remaining_slots}/${slot.max_slots} chỗ`
                                        : 'Đã hết chỗ'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-400 italic">
                          * Lịch khám có thể thay đổi tùy thuộc vào lịch công tác hoặc phẫu thuật đột xuất.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB CONTENT 2: Quá trình đào tạo */}
                  {detailTab === 'education' && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <GraduationCap size={15} className="text-blue-600" />
                        Quá trình học tập & Văn bằng
                      </h4>
                      {doctorDetail.education ? (
                        <div className="space-y-2">
                          {doctorDetail.education
                            .split('\n')
                            .filter((line) => line.trim().length > 0)
                            .map((line, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 leading-relaxed"
                              >
                                <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Đang cập nhật thông tin đào tạo...</p>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT 3: Quá trình công tác */}
                  {detailTab === 'experience' && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Briefcase size={15} className="text-blue-600" />
                        Kinh nghiệm làm việc & Chức vụ
                      </h4>
                      {doctorDetail.experience ? (
                        <div className="space-y-2">
                          {doctorDetail.experience
                            .split('\n')
                            .filter((line) => line.trim().length > 0)
                            .map((line, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 leading-relaxed"
                              >
                                <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Đang cập nhật thông tin công tác...</p>
                      )}
                    </div>
                  )}

                  {/* TAB CONTENT 4: Hiệp hội chuyên môn */}
                  {detailTab === 'memberships' && (
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                        <Award size={15} className="text-blue-600" />
                        Tổ chức & Hiệp hội y khoa
                      </h4>
                      {doctorDetail.memberships ? (
                        <div className="space-y-2">
                          {doctorDetail.memberships
                            .split('\n')
                            .filter((line) => line.trim().length > 0)
                            .map((line, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs text-slate-700 leading-relaxed"
                              >
                                <CheckCircle2 size={14} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{line.replace(/^[•\-*]\s*/, '')}</span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic">Đang cập nhật thông tin hội đồng...</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer: Action Button "Đặt khám với bác sĩ" */}
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleCloseDoctorDetail}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleCloseDoctorDetail();
                      onNavigate('booking');
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition"
                  >
                    <Calendar size={15} />
                    <span>Đặt khám với bác sĩ</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
