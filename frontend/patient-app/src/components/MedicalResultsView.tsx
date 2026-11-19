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
  X
} from 'lucide-react';
import { MedicalExamRecord } from '../types';

// Dữ liệu mẫu các đợt khám bệnh trong quá khứ của bệnh nhân
const mockExamRecords: MedicalExamRecord[] = [
  {
    id: 'rec-001',
    recordCode: 'HSBA-20261015-88',
    examDate: '15/10/2026',
    examType: 'PACKAGE',
    packageName: 'Gói Khám Tổng Quát Định Kỳ & Chuyên Sâu Tiêu Hóa',
    doctorName: 'BSCKII. Trần Hoàng Nam',
    department: 'Khoa Khám Bệnh - Nội Tổng Hợp',
    diagnosis: 'Viêm trợt niêm mạc hang vị dạ dày, test HP (+); Tăng huyết áp độ 1 (ổn định).',
    generalConclusion: 'Sức khỏe Loại II (Khá). Đang có tình trạng viêm dạ dày do vi khuẩn HP, cần tuân thủ phác đồ tiệt trừ 14 ngày và tái khám đúng hẹn. Huyết áp kiểm soát tốt.',
    serviceResults: [
      {
        name: 'Khám Nội Tổng Quát & Đo Huyết Áp',
        category: 'Lâm sàng',
        roomNumber: 'Phòng 101',
        resultValue: '125/80 mmHg - Nhịp tim 74 l/p',
        status: 'NORMAL',
        doctorNote: 'Huyết áp ổn định, tim đều rõ, phổi thông khí tốt'
      },
      {
        name: 'Test Vi Khuẩn HP Dạ Dày Qua Hơi Thở C14',
        category: 'Thăm dò chức năng',
        roomNumber: 'Phòng TDCN-02',
        resultValue: 'DƯƠNG TÍNH (+)',
        status: 'ABNORMAL',
        doctorNote: 'Chỉ số nhiễm HP: 185 dpm (Ngưỡng âm tính < 50). Cần điều trị tiệt trừ.'
      },
      {
        name: 'Nội Soi Thực Quản - Dạ Dày - Tá Tràng',
        category: 'Thăm dò chức năng',
        roomNumber: 'Phòng Nội Soi 01',
        resultValue: 'Viêm xung huyết và trợt nông hang vị',
        status: 'ATTENTION',
        doctorNote: 'Không có ổ loét sâu, không chảy máu, môn vị co bóp tốt'
      },
      {
        name: 'Tổng Phân Tích Tế Bào Máu (CBC 18 chỉ số)',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-01',
        resultValue: 'RBC: 4.7 M/uL | WBC: 6.8 K/uL | PLT: 225 K/uL',
        status: 'NORMAL',
        doctorNote: 'Các dòng tế bào máu trong giới hạn bình thường'
      },
      {
        name: 'Sinh Hóa Đường Huyết (Glucose lúc đói)',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: '5.2 mmol/L',
        normalRange: '3.9 - 6.4 mmol/L',
        unit: 'mmol/L',
        status: 'NORMAL',
        doctorNote: 'Đường huyết hoàn toàn bình thường'
      },
      {
        name: 'Chức Năng Gan (Men gan AST / ALT)',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: 'AST: 24 U/L | ALT: 28 U/L',
        normalRange: '< 40 U/L',
        unit: 'U/L',
        status: 'NORMAL',
        doctorNote: 'Men gan tốt, không có tổn thương nhu mô gan'
      },
      {
        name: 'Chụp X-Quang Ngực Thẳng KTS',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-01',
        resultValue: 'Tim phổi bình thường',
        status: 'NORMAL',
        doctorNote: 'Bóng tim không to, hai phế trường sáng đều, không thâm nhiễm'
      },
      {
        name: 'Siêu Âm Ổ Bụng Tổng Quát KTS',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-03',
        resultValue: 'Gan nhiễm mỡ độ 1 nhẹ, thận & mật không sỏi',
        status: 'ATTENTION',
        doctorNote: 'Cần duy trì tập thể dục và hạn chế chất béo động vật'
      }
    ],
    prescription: [
      {
        drugName: 'Esomeprazole (Nexium Mups) 40mg',
        dosage: '1 viên / lần x 1 lần / ngày',
        usage: 'Uống trước bữa ăn sáng 30 - 60 phút',
        quantity: '28 viên'
      },
      {
        drugName: 'Amoxicillin 500mg',
        dosage: '2 viên / lần x 2 lần / ngày',
        usage: 'Uống sau bữa ăn sáng và tối',
        quantity: '56 viên'
      },
      {
        drugName: 'Clarithromycin 500mg',
        dosage: '1 viên / lần x 2 lần / ngày',
        usage: 'Uống sau bữa ăn sáng và tối',
        quantity: '28 viên'
      }
    ],
    doctorAdvice: 'Uống thuốc đúng giờ, tuyệt đối không tự ý ngưng kháng sinh khi hết triệu chứng. Kiêng hoàn toàn rượu bia, thuốc lá, ớt, tiêu, cà phê đặc. Ăn chậm nhai kỹ, không ăn no sát giờ đi ngủ.',
    followUpRecommendation: 'Bác sĩ đã lên lịch hẹn tái khám vào ngày 25/11/2026 (sau 4 tuần) để kiểm tra lại vi khuẩn HP bằng test hơi thở.'
  },
  {
    id: 'rec-002',
    recordCode: 'HSBA-20260522-42',
    examDate: '22/05/2026',
    examType: 'PACKAGE',
    packageName: 'Khám Sức Khỏe Doanh Nghiệp Định Kỳ Hàng Năm',
    doctorName: 'BSCKI. Lê Thị Thu Thảo',
    department: 'Khoa Sức Khỏe Nghề Nghiệp',
    diagnosis: 'Rối loạn lipid máu nhẹ (Cholesterol 5.8 mmol/L); Căng cơ vùng cổ gáy do tư thế ngồi văn phòng.',
    generalConclusion: 'Sức khỏe Loại II. Thể lực tốt, chức năng gan thận bình thường. Cần vận động giãn cơ cổ gáy và điều chỉnh chế độ ăn giảm mỡ động vật.',
    serviceResults: [
      {
        name: 'Khám Thể Lực & Huyết Áp',
        category: 'Lâm sàng',
        roomNumber: 'Phòng 102',
        resultValue: '120/78 mmHg - Chiều cao: 172cm, Cân nặng: 68kg (BMI 23.0)',
        status: 'NORMAL',
        doctorNote: 'Chỉ số thể trọng chuẩn, thể lực tốt'
      },
      {
        name: 'Bộ Mỡ Máu (Cholesterol toàn phần)',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: '5.8 mmol/L',
        normalRange: '< 5.2 mmol/L',
        unit: 'mmol/L',
        status: 'ATTENTION',
        doctorNote: 'Hơi cao nhẹ so với ngưỡng tham chiếu'
      },
      {
        name: 'Khám Khúc Xạ Mắt & Đo Thị Lực KTS',
        category: 'Chuyên khoa lẻ',
        roomNumber: 'Phòng 204',
        resultValue: 'Mắt phải: 10/10 | Mắt trái: 10/10',
        status: 'NORMAL',
        doctorNote: 'Thị lực tốt, không có tật khúc xạ'
      },
      {
        name: 'Chụp X-Quang Cột Sống Cổ Thẳng Nghiêng',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-01',
        resultValue: 'Thẳng trục sinh lý, không trượt đốt sống',
        status: 'NORMAL',
        doctorNote: 'Chưa có thoái hóa gai xương rõ rệt'
      }
    ],
    prescription: [
      {
        drugName: 'Vitamin 3B (B1, B6, B12)',
        dosage: '1 viên / lần x 2 lần / ngày',
        usage: 'Uống sau ăn',
        quantity: '30 viên'
      }
    ],
    doctorAdvice: 'Tránh ngồi liên tục quá 60 phút, thực hiện bài tập xoay cổ nhẹ nhàng. Tăng cường rau xanh và cá trong bữa ăn.',
    followUpRecommendation: 'Tái kiểm tra mỡ máu trong đợt khám sức khỏe định kỳ tiếp theo.'
  },
  {
    id: 'rec-003',
    recordCode: 'HSBA-20251118-19',
    examDate: '18/11/2025',
    examType: 'SINGLE',
    packageName: 'Khám Chuyên Khoa Răng - Hàm - Mặt & Nha Khoa',
    doctorName: 'ThS.BS. Phạm Quốc Huy',
    department: 'Khoa Răng - Hàm - Mặt',
    diagnosis: 'Vôi răng độ 2, viêm nướu mép răng hàm dưới nhẹ; Răng khôn số 38 mọc lệch không viêm.',
    generalConclusion: 'Đã hoàn tất lấy cao răng sóng siêu âm và đánh bóng men răng. Men răng sáng bóng, nướu cầm máu tốt.',
    serviceResults: [
      {
        name: 'Khám Chuyên Khoa Răng Miệng',
        category: 'Lâm sàng',
        roomNumber: 'Phòng 105',
        resultValue: 'Có vôi răng hàm trên và dưới mức độ trung bình',
        status: 'ATTENTION',
        doctorNote: 'Không sâu răng hoạt tính, khớp cắn chuẩn'
      },
      {
        name: 'Lấy Cao Răng Sóng Siêu Âm & Đánh Bóng',
        category: 'Thủ thuật',
        roomNumber: 'Phòng 105',
        resultValue: 'Làm sạch hoàn toàn mảng bám vi khuẩn',
        status: 'NORMAL',
        doctorNote: 'Nướu lành thương tốt sau thủ thuật'
      },
      {
        name: 'Chụp X-Quang Toàn Cảnh Răng Panorama KTS',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-02',
        resultValue: 'Răng số 38 mọc nghiêng 30 độ, chưa chèn ép răng số 37',
        status: 'NORMAL',
        doctorNote: 'Chưa cần nhổ, theo dõi định kỳ 6 tháng'
      }
    ],
    doctorAdvice: 'Đánh răng ít nhất 2 lần/ngày bằng bàn chải lông mềm, sử dụng chỉ nha khoa và nước súc miệng sau bữa ăn.',
    followUpRecommendation: 'Kiểm tra răng miệng định kỳ sau 6 tháng.'
  }
];

export const MedicalResultsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>('rec-001');
  const [selectedRecordForModal, setSelectedRecordForModal] = useState<MedicalExamRecord | null>(null);

  // Lọc theo từ khóa tìm kiếm (theo tên gói, bác sĩ hoặc ngày)
  const filteredRecords = mockExamRecords.filter((rec) => {
    const term = searchTerm.toLowerCase();
    return (
      rec.packageName.toLowerCase().includes(term) ||
      rec.doctorName.toLowerCase().includes(term) ||
      rec.examDate.includes(term) ||
      rec.diagnosis.toLowerCase().includes(term)
    );
  });

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Trang Kết Quả Khám */}
      <div className="bg-white p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl mb-2 border border-emerald-200">
            <FileText className="w-3.5 h-3.5" />
            <span>Hồ Sơ Y Khoa Bệnh Nhân</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            Kết Quả Các Đợt Khám Bệnh
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Tra cứu ngày tháng, chẩn đoán của bác sĩ và kết quả chi tiết từng dịch vụ qua các đợt khám
          </p>
        </div>

        {/* Ô Tìm Kiếm Nhanh */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo ngày, gói hoặc chẩn đoán..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>
      </div>

      {/* 2. Thống Kê Nhanh */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-200/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Tổng Đợt Khám</div>
            <div className="text-base font-black text-slate-800">{mockExamRecords.length} đợt khám</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Đợt Khám Mới Nhất</div>
            <div className="text-base font-black text-emerald-800">15/10/2026</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/80 p-4 rounded-2xl flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500">Tình Trạng Kết Quả</div>
            <div className="text-base font-black text-purple-900">Đã Ký Số Bác Sĩ</div>
          </div>
        </div>
      </div>

      {/* 3. Danh Sách Các Đợt Khám */}
      <div className="space-y-4">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-sm text-slate-500">Không tìm thấy đợt khám nào khớp với từ khóa tìm kiếm.</p>
          </div>
        ) : (
          filteredRecords.map((record, index) => {
            const isExpanded = expandedRecordId === record.id;
            const isLatest = index === 0;

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
                            ★ Đợt Khám Gần Nhất
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
                  <div className="px-5 md:px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 bg-slate-50/40">
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

                    {/* B. Bảng Kết Quả Chi Tiết Từng Dịch Vụ / Xét Nghiệm */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                          Chi Tiết Các Hạng Mục Dịch Vụ Đã Khám ({record.serviceResults.length} dịch vụ)
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

                    {/* C. Đơn Thuốc Đợt Khám (nếu có) */}
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

                    {/* D. Lời Dặn & Khuyến Cáo Tái Khám */}
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

                    {/* E. Nút Hành Động: Xem Chi Tiết Bản Đầy Đủ & In */}
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

      {/* 4. Modal Xem Phiếu Kết Quả Khám Đầy Đủ (Chuẩn Bệnh Viện) */}
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

              {/* Thông tin Hành Chính */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Họ và tên bệnh nhân:</span>
                  <strong className="text-slate-900 font-bold">Lê Văn Hùng</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Năm sinh / Tuổi:</span>
                  <strong className="text-slate-900 font-bold">1988 (38 tuổi) - Nam</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Số Thẻ BHYT / CCCD:</span>
                  <strong className="text-slate-900 font-mono font-bold">DN 4 79 20261111</strong>
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
