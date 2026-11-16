import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { VisitSummary } from '../types';
import { formatFacilityDateTime } from '../utils/formatTime';

interface PrintVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: VisitSummary | null;
}

export const PrintVisitModal: React.FC<PrintVisitModalProps> = ({ isOpen, onClose, summary }) => {
  if (!isOpen || !summary) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 overflow-hidden my-8">
        {/* Action bar (ẩn khi in) */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
            <FileText className="w-4 h-4 text-primary-600" />
            <span>Xem Trước Phiếu Kết Quả Khám & Đơn Thuốc (In Ấn)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>In Phiếu Khám</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung phiếu khám - In chuẩn khổ A4 */}
        <div className="p-8 sm:p-12 text-slate-900 space-y-6 bg-white font-serif" id="printable-visit-sheet">
          {/* Header Bệnh Viện */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
            <div>
              <div className="text-xs uppercase font-sans font-bold tracking-wider text-slate-500">
                Sở Y Tế TP. Hồ Chí Minh
              </div>
              <h1 className="text-lg font-bold uppercase tracking-tight text-slate-900 font-sans">
                Hệ Thống Phòng Khám Đa Khoa Thông Minh
              </h1>
              <p className="text-xs font-sans text-slate-500">Địa chỉ: 123 Đường Y Dược, Quận 5, TP. Hồ Chí Minh | ĐT: 1900 8888</p>
            </div>
            <div className="text-right font-sans">
              <div className="text-xs font-bold font-mono">MÃ PHIẾU: {summary.visitCode}</div>
              <div className="text-[11px] text-slate-500">Ngày in: {formatFacilityDateTime(new Date().toISOString())}</div>
            </div>
          </div>

          <div className="text-center py-2">
            <h2 className="text-2xl font-bold uppercase tracking-wide font-sans text-slate-900">
              PHIẾU KẾT QUẢ KHÁM BỆNH &amp; ĐƠN THUỐC
            </h2>
            <p className="text-xs italic text-slate-500 font-sans mt-0.5">
              (Gói khám: {summary.packageName || 'Khám theo chỉ định'})
            </p>
          </div>

          {/* 1. Thông tin bệnh nhân */}
          <div className="p-4 border border-slate-300 rounded-xl space-y-2 text-xs font-sans">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <span className="text-slate-500">Họ và tên:</span>{' '}
                <strong className="text-sm uppercase text-slate-900">{summary.patientName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Ngày sinh:</span>{' '}
                <strong className="text-slate-800">{summary.patientDob}</strong>
              </div>
              <div>
                <span className="text-slate-500">Giới tính:</span>{' '}
                <strong className="text-slate-800">
                  {summary.patientGender === 'MALE' ? 'Nam' : summary.patientGender === 'FEMALE' ? 'Nữ' : 'Khác'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500">Điện thoại:</span>{' '}
                <strong className="text-slate-800">{summary.patientPhone}</strong>
              </div>
            </div>
            <div>
              <span className="text-slate-500">Địa chỉ thường trú:</span>{' '}
              <span className="text-slate-800">{summary.patientAddress || 'Chưa cập nhật'}</span>
            </div>
          </div>

          {/* 2. Kết quả cận lâm sàng / chẩn đoán hình ảnh */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-800 border-b border-slate-200 pb-1">
              I. KẾT QUẢ DỊCH VỤ CẬN LÂM SÀNG &amp; XÉT NGHIỆM
            </h3>
            {summary.services.length === 0 ? (
              <p className="text-xs italic text-slate-400">Không có chỉ định cận lâm sàng.</p>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden text-xs font-sans">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-2.5 font-bold">STT</th>
                      <th className="p-2.5 font-bold">Tên Dịch Vụ Khám</th>
                      <th className="p-2.5 font-bold">Phân Loại</th>
                      <th className="p-2.5 font-bold">Trạng Thái</th>
                      <th className="p-2.5 font-bold">Kết Luận Chuyên Môn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {summary.services.map((s, idx) => (
                      <tr key={s.progressId}>
                        <td className="p-2.5 text-center text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{s.serviceName}</td>
                        <td className="p-2.5 text-slate-500">{s.category}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {s.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-medium text-slate-900">
                          {s.resultContent || <span className="text-slate-400 italic">Đang chờ kết quả</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 3. Chẩn đoán bệnh */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-800 border-b border-slate-200 pb-1">
              II. CHẨN ĐOÁN CỦA BÁC SĨ (ICD-10)
            </h3>
            {summary.diagnoses.length === 0 ? (
              <p className="text-xs italic text-slate-400">Chưa có chẩn đoán xác định.</p>
            ) : (
              <div className="space-y-1.5 font-sans text-xs">
                {summary.diagnoses.map((d) => (
                  <div key={d.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-start gap-2">
                    {d.icd10Code && (
                      <span className="font-mono font-bold bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
                        [{d.icd10Code}]
                      </span>
                    )}
                    <span className="font-semibold text-slate-900 text-sm">{d.diagnosisDescription}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Đơn thuốc */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-800 border-b border-slate-200 pb-1">
              III. ĐƠN THUỐC ĐIỀU TRỊ
            </h3>
            {summary.prescriptions.length === 0 ? (
              <p className="text-xs italic text-slate-400">Không kê đơn thuốc.</p>
            ) : (
              summary.prescriptions.map((p) => (
                <div key={p.id} className="space-y-2 font-sans text-xs">
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                        <tr>
                          <th className="p-2 font-bold">STT</th>
                          <th className="p-2 font-bold">Tên Thuốc / Hàm Lượng</th>
                          <th className="p-2 font-bold">Số Lượng</th>
                          <th className="p-2 font-bold">Hướng Dẫn Sử Dụng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {p.items.map((it, idx) => (
                          <tr key={it.id || idx}>
                            <td className="p-2 text-center text-slate-500">{idx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">
                              {it.drugName} <span className="font-normal text-slate-500">({it.dosage})</span>
                            </td>
                            <td className="p-2 font-semibold">
                              {it.quantity} {it.unit}
                            </td>
                            <td className="p-2 text-slate-700 italic">{it.usageInstructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {p.doctorAdvice && (
                    <div className="p-2.5 bg-amber-50/60 border border-amber-200 rounded-lg text-amber-900 text-xs">
                      <strong>Lời dặn của Bác sĩ:</strong> {p.doctorAdvice}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 5. Kết luận chung & Kế hoạch */}
          {summary.conclusion && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider font-sans text-slate-800 border-b border-slate-200 pb-1">
                IV. KẾT LUẬN &amp; LỜI KHUYÊN THEO DÕI
              </h3>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans space-y-1">
                <div>
                  <strong>Kết luận:</strong> {summary.conclusion.conclusionText}
                </div>
                {summary.conclusion.doctorRecommendation && (
                  <div>
                    <strong>Khuyến nghị:</strong> {summary.conclusion.doctorRecommendation}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chữ ký Bác sĩ */}
          <div className="pt-8 flex justify-between items-start font-sans text-xs">
            <div className="text-center w-48">
              <div className="font-bold">Bệnh nhân / Thân nhân</div>
              <div className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
            </div>

            <div className="text-center w-64 space-y-16">
              <div>
                <div className="italic text-slate-500">TP. Hồ Chí Minh, {formatFacilityDateTime(new Date().toISOString())}</div>
                <div className="font-bold text-slate-900 uppercase">BÁC SĨ KHÁM BỆNH</div>
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {summary.doctorName || 'BS. CK1 Nguyễn Văn An'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
