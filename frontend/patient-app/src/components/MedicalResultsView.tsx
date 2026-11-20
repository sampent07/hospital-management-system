import React, { useState } from 'react';
import {
  FileText,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  Pill,
  Printer,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Search,
  Clock,
  ExternalLink,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Image as ImageIcon,
  Users,
  Eye,
  Download,
  Activity
} from 'lucide-react';
import { MedicalExamRecord, MedicalImagingItem, PatientProfile } from '../types';
import { allMockExamRecords, defaultPatientProfilesList } from '../utils/mockImagingData';

interface MedicalResultsViewProps {
  profiles?: PatientProfile[];
  selectedProfileId?: string;
  onSelectProfile?: (profileId: string) => void;
  onGoToProfileView?: () => void;
}

export const MedicalResultsView: React.FC<MedicalResultsViewProps> = ({
  profiles = defaultPatientProfilesList,
  selectedProfileId: propSelectedProfileId,
  onSelectProfile,
  onGoToProfileView
}) => {
  // Quản lý hồ sơ bệnh nhân được chọn để xem kết quả khám
  // Mặc định chọn hồ sơ được truyền vào hoặc hồ sơ mặc định (prof-self)
  const [internalSelectedProfileId, setInternalSelectedProfileId] = useState<string>(() => {
    if (propSelectedProfileId) return propSelectedProfileId;
    const defaultP = profiles.find((p) => p.isDefault) || profiles[0];
    return defaultP?.id || 'prof-self';
  });

  const activeProfileId = propSelectedProfileId || internalSelectedProfileId;
  const currentProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || defaultPatientProfilesList[0];

  const handleSelectMember = (profileId: string) => {
    setInternalSelectedProfileId(profileId);
    setExpandedRecordId(null);
    if (onSelectProfile) {
      onSelectProfile(profileId);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<MedicalExamRecord | null>(null);

  // State cho Modal phóng to xem ảnh chẩn đoán hình ảnh (DICOM / PACS viewer)
  const [selectedImageForViewer, setSelectedImageForViewer] = useState<MedicalImagingItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isInverted, setIsInverted] = useState<boolean>(false);

  // Lọc các đợt khám thuộc hồ sơ bệnh nhân đang chọn
  const patientRecords = allMockExamRecords.filter((rec) => {
    if (rec.profileId) {
      return rec.profileId === currentProfile.id;
    }
    // Nếu chưa gán profileId thì mặc định gán cho hồ sơ bản thân
    return currentProfile.id === 'prof-self';
  });

  // Lọc tiếp theo từ khóa tìm kiếm
  const filteredRecords = patientRecords.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.packageName.toLowerCase().includes(term) ||
      rec.doctorName.toLowerCase().includes(term) ||
      rec.examDate.includes(term) ||
      rec.diagnosis.toLowerCase().includes(term) ||
      (rec.imagingResults && rec.imagingResults.some((img) => img.title.toLowerCase().includes(term)))
    );
  });

  // Tổng số ảnh chụp y khoa của hồ sơ hiện tại
  const totalImagingCount = patientRecords.reduce(
    (acc, cur) => acc + (cur.imagingResults?.length || 0),
    0
  );

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  const openImageViewer = (image: MedicalImagingItem) => {
    setSelectedImageForViewer(image);
    setZoomLevel(1);
    setIsInverted(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. KHU VỰC BẮT BUỘC: CHỌN HỒ SƠ BỆNH NHÂN TRƯỚC KHI XEM KẾT QUẢ KHÁM */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm md:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span>Chọn Hồ Sơ Bệnh Nhân Để Xem Kết Quả Khám</span>
                <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {profiles.length} hồ sơ trong tài khoản
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Tài khoản có nhiều hồ sơ người thân (Ba, Mẹ, Con...). Nhấp vào một hồ sơ bên dưới để tra cứu bệnh án:
              </p>
            </div>
          </div>

          {onGoToProfileView && (
            <button
              onClick={onGoToProfileView}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition-all self-start sm:self-center cursor-pointer"
            >
              + Quản Lý / Thêm Hồ Sơ Mới
            </button>
          )}
        </div>

        {/* Danh sách thẻ hồ sơ bệnh nhân dạng ngang để chọn nhanh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {profiles.map((p) => {
            const isSelected = p.id === activeProfileId;
            const recordsCount = allMockExamRecords.filter((r) => r.profileId === p.id).length;

            return (
              <div
                key={p.id}
                onClick={() => handleSelectMember(p.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer relative flex items-start gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/60 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm shadow-xs ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {p.gender === 'FEMALE' ? '👩' : '👨'}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-xs font-black text-slate-900 truncate">{p.fullName}</div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        p.relationship === 'SELF'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.relationshipLabel || (p.relationship === 'SELF' ? 'Bản thân' : 'Người thân')}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-medium">
                    {p.gender === 'FEMALE' ? 'Nữ' : 'Nam'} • {p.age} tuổi • {p.phone}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="font-semibold text-slate-600">
                      {recordsCount > 0 ? (
                        <span className="text-emerald-700 font-bold">{recordsCount} đợt khám</span>
                      ) : (
                        <span className="text-slate-400">Chưa có đợt khám</span>
                      )}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-200">
                        <CheckCircle2 className="w-3 h-3 text-blue-600" />
                        Đang Xem
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. BANNER THÔNG TIN BỆNH NHÂN HIỆN TẠI & TÌM KIẾM */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-5 md:p-6 rounded-3xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 text-blue-100 text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs">
              <User className="w-3.5 h-3.5" />
              <span>
                Hồ Sơ: {currentProfile.fullName} ({currentProfile.relationshipLabel || 'Bản thân'})
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Kết Quả Khám Bệnh & Chẩn Đoán Hình Ảnh
            </h1>
            <p className="text-xs md:text-sm text-blue-100/90">
              Mã BHYT: {currentProfile.insuranceCard || 'Chưa cập nhật'} • CCCD: {currentProfile.idCardNumber || 'Chưa cập nhật'} • {currentProfile.address}
            </p>
          </div>

          {/* Ô Tìm Kiếm Nhanh */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo ngày, gói, chẩn đoán, X-quang..."
              className="w-full pl-9 pr-4 py-2.5 bg-white text-slate-900 border border-transparent rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-300 shadow-md placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Thống kê 3 chỉ số nhanh của hồ sơ này */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-white/15">
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200">Tổng Đợt Khám</div>
              <div className="text-sm font-black text-white">{patientRecords.length} đợt khám</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200">Kết Quả Ảnh Chụp (X-Quang, Siêu Âm...)</div>
              <div className="text-sm font-black text-emerald-300">{totalImagingCount} kết quả ảnh</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[11px] text-blue-200">Chữ Ký Số Y Khoa</div>
              <div className="text-sm font-black text-white">Đã Xác Thực Bác Sĩ</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH CÁC ĐỢT KHÁM CỦA BỆNH NHÂN ĐANG CHỌN */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Chưa có kết quả khám cho hồ sơ "{currentProfile.fullName}"
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Hồ sơ này chưa thực hiện đợt khám nào hoặc không có dữ liệu khớp với từ khóa tìm kiếm. Bạn có thể sang mục "Đăng Ký Gói Khám" để đặt lịch khám cho thành viên này.
            </p>
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const isExpanded = expandedRecordId === record.id;
            const isLatest = index === 0;
            const imagingList = record.imagingResults || [];

            return (
              <div
                key={record.id}
                className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                  isLatest
                    ? 'border-blue-300 shadow-md shadow-blue-500/5'
                    : 'border-slate-200 shadow-sm'
                }`}
              >
                {/* Header Thẻ Đợt Khám */}
                <div
                  onClick={() => toggleExpand(record.id)}
                  className="p-5 md:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Badge Ngày Tháng Lớn Trực Quan */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-blue-50 to-indigo-50 border border-blue-200 text-blue-900 flex flex-col items-center justify-center shrink-0 shadow-inner">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Ngày</span>
                      <span className="text-sm font-black leading-tight text-blue-800">
                        {record.examDate.slice(0, 5)}
                      </span>
                      <span className="text-[9px] text-slate-400">{record.examDate.slice(6)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                          {record.recordCode}
                        </span>
                        {isLatest && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            ★ Đợt Khám Mới Nhất
                          </span>
                        )}
                        {imagingList.length > 0 && (
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {imagingList.length} Ảnh Chụp
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400">
                          {record.department}
                        </span>
                      </div>

                      <h2 className="text-base font-bold text-slate-900">
                        {record.packageName}
                      </h2>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-0.5">
                        <span className="flex items-center gap-1 font-medium">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          Bác sĩ kết luận: <strong className="text-slate-800">{record.doctorName}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bên phải: Chẩn đoán vắn tắt & Nút mở rộng */}
                  <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right">
                      <div className="text-[10px] font-bold uppercase text-slate-400">Chẩn đoán tóm tắt:</div>
                      <div className="text-xs font-bold text-slate-800 max-w-xs truncate">
                        {record.diagnosis}
                      </div>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Nội Dung Chi Tiết Khi Mở Rộng */}
                {isExpanded && (
                  <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 space-y-6 bg-slate-50/40">
                    {/* A. Kết Luận Chung & Chẩn Đoán Của Bác Sĩ */}
                    <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200/90 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Kết Luận & Chẩn Đoán Y Khoa</span>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        {record.diagnosis}
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {record.generalConclusion}
                      </p>
                    </div>

                    {/* B. MỤC ĐẶC BIỆT THEO YÊU CẦU: KẾT QUẢ ẢNH CHỤP (X-QUANG, SIÊU ÂM, NỘI SOI...) */}
                    {imagingList.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black text-purple-900 uppercase tracking-wide flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-purple-600" />
                            <span>Kết Quả Ảnh Chụp Y Khoa ({imagingList.length} phim chụp & hình ảnh)</span>
                          </h3>
                          <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                            Chuẩn hình ảnh y tế DICOM KTS
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                          {imagingList.map((img) => (
                            <div
                              key={img.id}
                              className="bg-white rounded-2xl border border-purple-200/90 shadow-sm overflow-hidden flex flex-col hover:border-purple-400 hover:shadow-md transition-all group"
                            >
                              {/* Khung xem trước ảnh y khoa có overlay nút phóng to */}
                              <div
                                onClick={() => openImageViewer(img)}
                                className="relative h-44 bg-slate-950 overflow-hidden cursor-pointer"
                              >
                                <img
                                  src={img.imageUrl}
                                  alt={img.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex items-end justify-between p-3">
                                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-600/90 text-white backdrop-blur-xs">
                                    {img.modalityName}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openImageViewer(img);
                                    }}
                                    className="px-2.5 py-1 bg-white/90 hover:bg-white text-slate-900 text-[11px] font-bold rounded-lg shadow-sm flex items-center gap-1 transition-all"
                                  >
                                    <Eye className="w-3 h-3 text-purple-600" />
                                    <span>Phóng to</span>
                                  </button>
                                </div>
                              </div>

                              {/* Thông tin chẩn đoán hình ảnh */}
                              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                    {img.title}
                                  </h4>
                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                    {img.roomNumber} • Chụp: {img.captureTime}
                                  </div>
                                </div>

                                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700 line-clamp-3">
                                  <strong className="text-purple-900 font-semibold">Kết luận: </strong>
                                  {img.diagnosticConclusion}
                                </div>

                                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100">
                                  <span>BS: {img.technicianOrDoctor}</span>
                                  <button
                                    onClick={() => openImageViewer(img)}
                                    className="text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <span>Xem chi tiết PACS</span>
                                    <ChevronRightIcon className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* C. Bảng Kết Quả Chi Tiết Từng Dịch Vụ / Xét Nghiệm */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Chi Tiết Các Hạng Mục Dịch Vụ & Xét Nghiệm ({record.serviceResults.length} dịch vụ)
                        </h3>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Ngày thực hiện: {record.examDate}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {record.serviceResults.map((srv, sIdx) => {
                          const isNormal = srv.status === 'NORMAL';
                          const isAttention = srv.status === 'ATTENTION';

                          return (
                            <div
                              key={sIdx}
                              className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-900 line-clamp-1">
                                  {srv.name}
                                </span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                    isNormal
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : isAttention
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {isNormal ? 'Bình thường' : isAttention ? 'Cần chú ý' : 'Bất thường'}
                                </span>
                              </div>

                              <div className="text-xs font-mono font-bold text-blue-800 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                                Kết quả: {srv.resultValue}
                              </div>

                              {srv.doctorNote && (
                                <div className="text-[11px] text-slate-500 italic">
                                  Ghi chú BS: {srv.doctorNote}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* D. Đơn Thuốc Đợt Khám (nếu có) */}
                    {record.prescription && record.prescription.length > 0 && (
                      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase">
                          <Pill className="w-4 h-4 text-emerald-600" />
                          <span>Đơn Thuốc Được Kê Đợt Này</span>
                        </div>

                        <div className="space-y-2">
                          {record.prescription.map((med, mIdx) => (
                            <div
                              key={mIdx}
                              className="p-2.5 bg-white rounded-xl border border-emerald-200/70 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1"
                            >
                              <div>
                                <span className="font-bold text-slate-900">
                                  {mIdx + 1}. {med.drugName}
                                </span>
                                <div className="text-[11px] text-slate-500">
                                  Cách dùng: {med.dosage} • {med.usage}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg self-start sm:self-center shrink-0">
                                SL: {med.quantity}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* E. Lời Dặn & Khuyến Cáo Tái Khám */}
                    <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Lời Dặn Của Bác Sĩ & Lịch Tái Khám</span>
                      </div>
                      <p className="text-xs text-slate-800 leading-relaxed font-medium">
                        {record.doctorAdvice}
                      </p>
                      {record.followUpRecommendation && (
                        <div className="pt-1.5 border-t border-amber-200/60 text-xs font-bold text-blue-900 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>{record.followUpRecommendation}</span>
                        </div>
                      )}
                    </div>

                    {/* F. Nút Hành Động: Xem Chi Tiết Bản Đầy Đủ & In */}
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedRecordForModal(record)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Xem Toàn Văn Phiếu Kết Quả (Bản Gốc)</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. MODAL XEM ẢNH CHẨN ĐOÁN HÌNH ẢNH (PACS / DICOM VIEWER THEME) */}
      {selectedImageForViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 text-white w-full max-w-5xl rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Top Bar Viewer */}
            <div className="bg-slate-800/90 px-5 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600/30 text-purple-300 flex items-center justify-center border border-purple-500/40">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">
                    {selectedImageForViewer.title}
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Bệnh nhân: <strong className="text-white">{currentProfile.fullName}</strong> • Mã HS: {currentProfile.idCardNumber || '079088...'} • {selectedImageForViewer.captureTime}
                  </div>
                </div>
              </div>

              {/* Tools Phóng to / Thu nhỏ / Đảo màu */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.25))}
                    title="Thu nhỏ"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-300">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
                    title="Phóng to"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    title="Đặt lại kích thước gốc"
                    className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setIsInverted((v) => !v)}
                    title="Đảo âm bản / High Contrast"
                    className={`px-2 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                      isInverted ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Âm bản
                  </button>
                </div>

                <button
                  onClick={() => setSelectedImageForViewer(null)}
                  className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Đóng xem ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Body: Chia 2 cột (Cột Trái là Ảnh KTS, Cột Phải là Thông Tin Chẩn Đoán) */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
              {/* Vùng hiển thị ảnh có thể kéo pan hoặc cuộn */}
              <div className="flex-1 bg-black flex items-center justify-center p-4 overflow-auto min-h-[320px] md:min-h-0 relative">
                <img
                  src={selectedImageForViewer.imageUrl}
                  alt={selectedImageForViewer.title}
                  style={{
                    transform: `scale(${zoomLevel})`,
                    filter: isInverted ? 'invert(1) contrast(1.2)' : 'none',
                    transition: 'transform 0.15s ease-out'
                  }}
                  className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
                />
                <div className="absolute bottom-3 left-4 text-[10px] text-slate-500 font-mono pointer-events-none">
                  KTS DICOM Matrix • Window Level: Preset Auto
                </div>
              </div>

              {/* Sidebar Chi Tiết Y Khoa */}
              <div className="w-full md:w-80 bg-slate-850 p-5 border-t md:border-t-0 md:border-l border-slate-700/80 space-y-4 overflow-y-auto text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-400 block tracking-wider">
                    Loại Kỹ Thuật
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {selectedImageForViewer.modalityName} ({selectedImageForViewer.modality})
                  </div>
                </div>

                <div className="p-3 bg-purple-950/40 border border-purple-800/50 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold uppercase text-purple-300 block">
                    Kết Luận Chẩn Đoán Của Bác Sĩ
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {selectedImageForViewer.diagnosticConclusion}
                  </p>
                </div>

                {selectedImageForViewer.techniqueDetails && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">
                      Thông Số Kỹ Thuật Chụp
                    </span>
                    <p className="text-[11px] text-slate-300 font-mono bg-slate-900 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                      {selectedImageForViewer.techniqueDetails}
                    </p>
                  </div>
                )}

                <div className="space-y-2 pt-2 border-t border-slate-700/80">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Địa điểm thực hiện:</span>
                    <strong className="text-slate-200">{selectedImageForViewer.roomNumber}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Bác sĩ / Kỹ thuật viên:</span>
                    <strong className="text-slate-200">{selectedImageForViewer.technicianOrDoctor}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Thời gian chụp:</span>
                    <strong className="text-slate-200">{selectedImageForViewer.captureTime}</strong>
                  </div>
                </div>

                <div className="pt-3">
                  <a
                    href={selectedImageForViewer.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải Ảnh Gốc Độ Phân Giải Cao</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL XEM PHIẾU KẾT QUẢ KHÁM TOÀN VĂN (CHUẨN BỆNH VIỆN) */}
      {selectedRecordForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-blue-200" />
                <div>
                  <h3 className="text-sm font-bold">Phiếu Kết Quả Khám Chữa Bệnh Ngoại Trú</h3>
                  <p className="text-[11px] text-blue-200">
                    Mã Hồ Sơ: {selectedRecordForModal.recordCode} • Ngày khám: {selectedRecordForModal.examDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Mẫu Phiếu Kết Quả */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto font-sans">
              {/* Thông tin Bệnh Viện */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="text-xs font-bold uppercase text-slate-500">Sở Y Tế TP. Hồ Chí Minh</div>
                  <div className="text-sm font-black text-blue-900 uppercase">
                    Bệnh Viện Đa Khoa Smart OPD
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Địa chỉ: Số 215 Hồng Bàng, Phường 11, Quận 5, TP.HCM
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-bold text-slate-700">
                    MÃ BA: {selectedRecordForModal.recordCode}
                  </div>
                  <div className="text-[10px] text-slate-400">Lưu trữ điện tử v2.0</div>
                </div>
              </div>

              {/* Thông tin Hành Chính Bệnh Nhân Được Chọn */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Họ và tên bệnh nhân:</span>
                  <strong className="text-slate-900 font-bold">{currentProfile.fullName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Quan hệ / Tuổi / Giới:</span>
                  <strong className="text-slate-900 font-bold">
                    {currentProfile.relationshipLabel || 'Bản thân'} • {currentProfile.age} tuổi ({currentProfile.gender === 'FEMALE' ? 'Nữ' : 'Nam'})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số Thẻ BHYT / CCCD:</span>
                  <strong className="text-slate-900 font-mono font-bold">
                    {currentProfile.insuranceCard || currentProfile.idCardNumber || 'Chưa cập nhật'}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày khám bệnh:</span>
                  <strong className="text-blue-800 font-bold">{selectedRecordForModal.examDate}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Gói / Dịch vụ khám:</span>
                  <strong className="text-slate-900">{selectedRecordForModal.packageName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Bác sĩ chủ trì:</span>
                  <strong className="text-slate-900">{selectedRecordForModal.doctorName}</strong>
                </div>
              </div>

              {/* Chẩn đoán & Kết luận */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  I. Chẩn Đoán & Kết Luận Y Khoa
                </h4>
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
                  <div className="text-xs text-slate-600">
                    Chẩn đoán lâm sàng: <strong className="text-slate-900">{selectedRecordForModal.diagnosis}</strong>
                  </div>
                  <div className="text-xs text-slate-600">
                    Kết luận tổng thể: <span className="text-slate-800">{selectedRecordForModal.generalConclusion}</span>
                  </div>
                </div>
              </div>

              {/* Kết quả cận lâm sàng chi tiết */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  II. Kết Quả Các Hạng Mục Khám & Cận Lâm Sàng
                </h4>
                <div className="border border-slate-200 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold">
                      <tr>
                        <th className="p-2.5">Hạng Mục / Xét Nghiệm</th>
                        <th className="p-2.5">Kết Quả</th>
                        <th className="p-2.5">Đánh Giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedRecordForModal.serviceResults.map((s, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-slate-800">{s.name}</td>
                          <td className="p-2.5 font-mono text-blue-900">{s.resultValue}</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.status === 'NORMAL'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.status === 'ATTENTION'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {s.status === 'NORMAL' ? 'Bình thường' : s.status === 'ATTENTION' ? 'Cần chú ý' : 'Bất thường'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lời dặn & Chữ ký bác sĩ */}
              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start justify-between gap-6">
                <div className="space-y-1 max-w-sm text-xs">
                  <span className="font-bold text-slate-800 block">Lời dặn của Bác sĩ:</span>
                  <p className="text-slate-600 italic">{selectedRecordForModal.doctorAdvice}</p>
                  {selectedRecordForModal.followUpRecommendation && (
                    <p className="text-blue-700 font-bold mt-1">
                      {selectedRecordForModal.followUpRecommendation}
                    </p>
                  )}
                </div>

                <div className="text-center sm:text-right shrink-0">
                  <div className="text-[11px] text-slate-500">
                    TP.HCM, ngày {selectedRecordForModal.examDate}
                  </div>
                  <div className="text-xs font-bold text-slate-800 mt-1 uppercase">
                    Bác Sĩ Khám Bệnh
                  </div>
                  <div className="h-14 flex items-center justify-center sm:justify-end">
                    <span className="font-serif italic text-blue-900 text-base font-bold">
                      {selectedRecordForModal.doctorName}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    {selectedRecordForModal.doctorName}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedRecordForModal(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Phiếu Kết Quả</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
