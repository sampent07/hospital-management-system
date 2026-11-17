import React, { useState } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Stethoscope,
  Building2,
  User,
  Eye,
  MapPin,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { PackageDetail, BookingAppointment } from '../types';
import { PackageDetailModal } from '../components/PackageDetailModal';
import { AppointmentBookingModal } from '../components/AppointmentBookingModal';

interface PackageAdvisorProps {
  onRegisterSuccess?: (bookingInfo: {
    packageName: string;
    facilityName: string;
    appointmentDate: string;
    timeSlot: string;
    bookingCode: string;
  }) => void;
}

// Dữ liệu mẫu các gói khám chi tiết cho Cá nhân và Doanh nghiệp
const mockPackagesDatabase: Record<string, PackageDetail> = {
  'male-general': {
    id: 'pkg-male-general',
    code: 'PKG-GEN-MALE',
    name: 'Gói Khám Sức Khỏe Tổng Quát Nam Giới (Định Kỳ)',
    targetType: 'INDIVIDUAL',
    basePrice: 1850000,
    priceUnitText: '/ người',
    targetAudienceText: 'Nam giới từ 18 – 50 tuổi',
    description:
      'Gói khám định kỳ toàn diện được thiết kế chuyên biệt cho nam giới, giúp tầm soát chức năng gan thận, tim mạch, mỡ máu, phổi và các bệnh lý chuyển hóa phổ biến.',
    clinicalServices: [
      'Khám Nội Tổng Quát & Đánh giá thể lực, chỉ số BMI, huyết áp',
      'Khám Chuyên Khoa Mắt (Đo khúc xạ, thị lực & soi đáy mắt)',
      'Khám Tai - Mũi - Họng (Soi vòm họng, thanh quản, màng nhĩ)',
      'Khám Răng - Hàm - Mặt & Tầm soát bệnh lý răng miệng',
      'Khám Ngoại khoa & Nam khoa cơ bản'
    ],
    imagingServices: [
      'Chụp X-Quang Ngực Thẳng Kỹ Thuật Số (DR) tầm soát tim phổi',
      'Siêu Âm Ổ Bụng Tổng Quát (Gan, mật, tụy, lách, thận, bàng quang)'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu ngoại vi (CBC 18 chỉ số)',
      'Đường huyết lúc đói (Glucose máu) tầm soát đái tháo đường',
      'Đánh giá chức năng gan (Men gan AST, ALT, GGT)',
      'Đánh giá chức năng thận (Ure, Creatinine máu)',
      'Bộ mỡ máu tim mạch toàn phần (Cholesterol, Triglyceride, HDL-C, LDL-C)',
      'Tổng phân tích nước tiểu 10 thông số',
      'Định lượng Axit Uric máu (Tầm soát nguy cơ bệnh Gút)'
    ],
    functionalServices: [
      'Đo điện tâm đồ 12 đạo trình (ECG) kiểm tra nhịp tim & thiếu máu cơ tim'
    ],
    benefits: [
      'Hệ thống AI Smart OPD tự động phân bổ thứ tự phòng khám, giảm tối đa thời gian chờ',
      'Bác sĩ chuyên khoa kết luận và tư vấn riêng chế độ dinh dưỡng, vận động',
      'Hồ sơ bệnh án số hóa lưu trữ trọn đời trên Cổng Bệnh Nhân Smart OPD'
    ]
  },
  'female-general': {
    id: 'pkg-female-general',
    code: 'PKG-GEN-FEMALE',
    name: 'Gói Khám Sức Khỏe Tổng Quát Nữ Giới (Toàn Diện & Phụ Khoa)',
    targetType: 'INDIVIDUAL',
    basePrice: 2150000,
    priceUnitText: '/ người',
    targetAudienceText: 'Nữ giới từ 18 – 50 tuổi',
    description:
      'Gói khám tối ưu dành cho nữ giới, kết hợp khám tổng quát và tầm soát sức khỏe phụ khoa, tuyến vú, tuyến giáp và các chỉ số sinh hóa quan trọng.',
    clinicalServices: [
      'Khám Nội Tổng Quát, đo huyết áp, nhịp tim và thể lực',
      'Khám Chuyên Khoa Mắt (Thị lực & khúc xạ)',
      'Khám Tai - Mũi - Họng',
      'Khám Răng - Hàm - Mặt',
      'Khám Chuyên Khoa Phụ Sản & Tầm soát phụ khoa'
    ],
    imagingServices: [
      'Chụp X-Quang Ngực Thẳng Kỹ Thuật Số (DR)',
      'Siêu Âm Ổ Bụng Tổng Quát',
      'Siêu Âm Tuyến Vú 2 Bên tầm soát u xơ',
      'Siêu Âm Tử Cung & Phần Phụ (Đầu dò hoặc ngả bụng)'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu (CBC 18 chỉ số)',
      'Đường huyết lúc đói (Glucose)',
      'Chức năng gan (AST, ALT, GGT) & Thận (Ure, Creatinine)',
      'Bộ mỡ máu toàn phần (Cholesterol, Triglyceride)',
      'Soi tươi dịch âm đạo & Xét nghiệm nước tiểu 10 thông số'
    ],
    functionalServices: [
      'Đo điện tâm đồ 12 đạo trình (ECG)'
    ],
    benefits: [
      'Khu vực khám Phụ khoa riêng tư, bác sĩ nữ chuyên khoa nhiều năm kinh nghiệm',
      'Tự động đồng bộ lộ trình khám thông minh bằng AI Smart OPD',
      'Nhận kết quả và tư vấn chuyên sâu qua cổng trực tuyến'
    ]
  },
  'senior-comprehensive': {
    id: 'pkg-senior-comprehensive',
    code: 'PKG-SENIOR-VIP',
    name: 'Gói Tầm Soát Chuyên Sâu Tim Mạch & Đột Quỵ (Người Cao Tuổi)',
    targetType: 'INDIVIDUAL',
    basePrice: 3450000,
    priceUnitText: '/ người',
    targetAudienceText: 'Người từ 50 tuổi trở lên hoặc có tiền sử tim mạch, huyết áp',
    description:
      'Gói khám chuyên sâu tập trung vào hệ tuần hoàn, tim mạch, tầm soát nguy cơ xơ vữa động mạch và đột quỵ sớm ở người trung niên và cao tuổi.',
    clinicalServices: [
      'Khám Chuyên Khoa Tim Mạch & Nội Tiết',
      'Khám Mắt (Soi mạch máu đáy mắt phát hiện tổn thương huyết áp)',
      'Khám Nội Thần Kinh'
    ],
    imagingServices: [
      'Chụp X-Quang Ngực Thẳng kỹ thuật số',
      'Siêu Âm Tim Màu Dopper kiểm tra van tim & chức năng co bóp',
      'Siêu Âm Doppler Động Mạch Cảnh tầm soát nguy cơ đột quỵ',
      'Siêu Âm Ổ Bụng Tổng Quát'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu, Đường huyết & HbA1c (Đái tháo đường)',
      'Bộ mỡ máu chuyên sâu (Cholesterol, Triglyceride, HDL, LDL)',
      'Điện giải đồ (Na, K, Cl) & Men tim cơ bản',
      'Đánh giá chức năng gan thận chuyên sâu'
    ],
    functionalServices: [
      'Đo điện tâm đồ (ECG 12 cần)',
      'Đo độ xơ vữa động mạch (ABI)'
    ],
    benefits: [
      'Được ưu tiên điều phối đến phòng khám vắng nhất để người lớn tuổi không phải chờ lâu',
      'Bác sĩ Tim mạch trực tiếp tư vấn chế độ dùng thuốc và phòng ngừa đột quỵ'
    ]
  },
  'corp-std': {
    id: 'pkg-corp-std',
    code: 'PKG-CORP-STD',
    name: 'Gói Khám Sức Khỏe Doanh Nghiệp Định Kỳ (Chuẩn TT 32/BYT)',
    targetType: 'CORPORATE',
    basePrice: 1250000,
    priceUnitText: '/ nhân sự',
    discountNote: 'Chiết khấu 15% cho đoàn từ 50 nhân sự',
    targetAudienceText: 'Cán bộ nhân viên các doanh nghiệp sản xuất, dịch vụ, bán lẻ',
    description:
      'Gói khám đáp ứng đầy đủ 100% danh mục khám sức khỏe định kỳ bắt buộc của Bộ Y Tế theo Thông tư 32/2023/TT-BYT, đồng thời áp dụng thuật toán điều phối luồng để nhân viên không phải chờ đợi.',
    clinicalServices: [
      'Khám Thể Lực (Chiều cao, cân nặng, chỉ số BMI, mạch, huyết áp)',
      'Khám Nội Tổng Quát (Tim mạch, hô hấp, tiêu hóa, thần kinh)',
      'Khám Chuyên Khoa Mắt (Thị lực, đo khúc xạ & sắc giác)',
      'Khám Tai - Mũi - Họng & Thính lực nghề nghiệp',
      'Khám Răng - Hàm - Mặt & Da liễu nghề nghiệp',
      'Khám Ngoại khoa & Khám Phụ khoa (cho lao động nữ)'
    ],
    imagingServices: [
      'Chụp X-Quang Tim Phổi Kỹ Thuật Số (DR) thẳng',
      'Siêu Âm Ổ Bụng Tổng Quát (Gan, thận, mật, bàng quang)'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu ngoại vi (CBC 18 chỉ số)',
      'Đường máu (Glucose)',
      'Đánh giá men gan (AST, ALT)',
      'Đánh giá chức năng thận (Ure, Creatinine)',
      'Tổng phân tích nước tiểu 10 thông số'
    ],
    functionalServices: [
      'Đo điện tâm đồ (ECG 12 cần)'
    ],
    benefits: [
      'Cung cấp Báo Cáo Tổng Hợp Tình Trạng Sức Khỏe Nhân Sự theo chuẩn Bộ Y Tế gửi phòng HR',
      'Hệ thống Smart OPD phân luồng giờ khám thông minh, doanh nghiệp không bị gián đoạn vận hành',
      'Hỗ trợ lấy mẫu xét nghiệm tận nơi tại trụ sở công ty cho đoàn từ 80 người',
      'Xuất hóa đơn VAT đầy đủ và hồ sơ khám sức khỏe đóng dấu bệnh viện'
    ]
  },
  'corp-office': {
    id: 'pkg-corp-office',
    code: 'PKG-CORP-OFFICE',
    name: 'Gói Khám Doanh Nghiệp Văn Phòng (Tầm Soát Cột Sống, Mắt & Mỡ Máu)',
    targetType: 'CORPORATE',
    basePrice: 1650000,
    priceUnitText: '/ nhân sự',
    discountNote: 'Tối ưu cho khối Công nghệ & Ngân hàng',
    targetAudienceText: 'Doanh nghiệp Công nghệ, Tài chính, Ngân hàng, Văn phòng',
    description:
      'Thiết kế riêng cho nhân sự ngồi nhiều trước màn hình máy tính: tầm soát hội chứng cổ vai gáy, thoát vị đĩa đệm, cận thị/loạn thị và mỡ máu cao do ít vận động.',
    clinicalServices: [
      'Khám Nội tổng quát & Đánh giá nguy cơ tim mạch sớm',
      'Khám Mắt chuyên sâu & Tầm soát hội chứng thị giác màn hình',
      'Khám Cơ - Xương - Khớp & Cột sống thắt lưng',
      'Khám Tai Mũi Họng & Răng Hàm Mặt',
      'Khám Phụ khoa toàn diện (cho lao động nữ)'
    ],
    imagingServices: [
      'Chụp X-Quang Cột Sống Cổ hoặc Thắt Lưng (Thẳng & Nghiêng)',
      'Chụp X-Quang Tim Phổi Kỹ Thuật Số',
      'Siêu Âm Bụng Tổng Quát'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu (CBC)',
      'Bộ mỡ máu toàn diện (Cholesterol, Triglyceride, HDL, LDL)',
      'Đường huyết, Axit Uric (Tầm soát Gút), Men gan, Chức năng thận',
      'Xét nghiệm nước tiểu'
    ],
    functionalServices: [
      'Đo điện tâm đồ (ECG)'
    ],
    benefits: [
      'Tư vấn trực tiếp bài tập công thái học (Ergonomics) chống đau vai gáy cho nhân viên',
      'Đặt lịch khám linh hoạt nhiều đợt, nhân viên chủ động chọn ngày phù hợp',
      'Báo cáo thống kê nguy cơ sức khỏe ẩn cho Ban Lãnh đạo'
    ]
  },
  'corp-vip': {
    id: 'pkg-corp-vip',
    code: 'PKG-CORP-VIP',
    name: 'Gói Khám Sức Khỏe Cấp Quản Lý & Lãnh Đạo (VIP Executive)',
    targetType: 'CORPORATE',
    basePrice: 3800000,
    priceUnitText: '/ nhân sự',
    discountNote: 'Đặc quyền phòng chờ VIP & Trưởng khoa khám',
    targetAudienceText: 'Ban Giám Đốc, Quản lý cấp cao, Chuyên gia chủ chốt',
    description:
      'Gói khám cao cấp tầm soát toàn diện nguy cơ đột quỵ, ung thư sớm và bệnh lý tim mạch chuyển hóa với dịch vụ tiếp đón chuẩn VIP.',
    clinicalServices: [
      'Bác sĩ Trưởng/Phó khoa trực tiếp thăm khám Nội Tổng Quát',
      'Khám toàn diện Mắt, Tai Mũi Họng, Răng Hàm Mặt, Da Liễu',
      'Khám chuyên khoa Tim mạch & Tiêu hóa'
    ],
    imagingServices: [
      'Chụp X-Quang Ngực Thẳng KTS',
      'Siêu Âm Tuyến Giáp & Tuyến Vú (nữ)',
      'Siêu Âm Tim Doppler Màu & Động Mạch Cảnh (Tầm soát đột quỵ)',
      'Siêu Âm Ổ Bụng Toàn Diện'
    ],
    laboratoryServices: [
      'Bộ xét nghiệm chuyên sâu 25 chỉ số máu & sinh hóa',
      'Bộ dấu ấn tầm soát ung thư sớm (Gan AFP, Phổi CEA, Đại trực tràng, Tiền liệt tuyến PSA)',
      'Chức năng gan thận, mỡ máu, đường huyết HbA1c'
    ],
    functionalServices: [
      'Đo điện tim đồ (ECG) & Đo độ xơ vữa mạch máu'
    ],
    benefits: [
      'Phòng chờ VIP riêng biệt, có phục vụ điểm tâm nhẹ và trà dinh dưỡng',
      'Lối đi ưu tiên không phải chờ đợi',
      'Hồ sơ sức khỏe báo cáo chi tiết kèm khuyến nghị cá nhân hóa từ chuyên gia'
    ]
  }
};

export const PackageAdvisor: React.FC<PackageAdvisorProps> = ({ onRegisterSuccess }) => {
  // 1. CHIA LÀM 2 HƯỚNG KHÁM: CÁ NHÂN HOẶC DOANH NGHIỆP
  const [targetType, setTargetType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');

  // Form Cá Nhân
  const [age, setAge] = useState<number>(35);
  const [gender, setGender] = useState<string>('MALE');
  const [maritalStatus, setMaritalStatus] = useState<string>('MARRIED');
  const [purpose, setPurpose] = useState<string>('GENERAL_CHECKUP');

  // Form Doanh Nghiệp
  const [companyName, setCompanyName] = useState<string>('Công ty Cổ phần Công nghệ Smart OPD');
  const [employeeScale, setEmployeeScale] = useState<string>('50_200');
  const [workEnvironment, setWorkEnvironment] = useState<string>('OFFICE');
  const [corporatePackageNeed, setCorporatePackageNeed] = useState<string>('TT32_STANDARD');

  // State kết quả & Modal
  const [recommendedPackage, setRecommendedPackage] = useState<PackageDetail | null>(() => mockPackagesDatabase['male-general']);
  const [explanationText, setExplanationText] = useState<string>(
    'Dựa trên độ tuổi 35 và mục đích khám định kỳ, hệ thống khuyến nghị gói khám bao gồm đầy đủ xét nghiệm máu, men gan, chức năng thận, X-Quang ngực và siêu âm ổ bụng tổng quát.'
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Điều khiển các Modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingAppointment | null>(null);

  // Xử lý gửi Form Khảo Sát để nhận Gợi Ý Gói Khám
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setConfirmedBooking(null);

    setTimeout(() => {
      if (targetType === 'INDIVIDUAL') {
        if (age >= 50 || purpose === 'SCREENING') {
          setRecommendedPackage(mockPackagesDatabase['senior-comprehensive']);
          setExplanationText(
            `Dựa trên độ tuổi ${age} và mục đích tầm soát chuyên sâu, hệ thống ưu tiên gói tầm soát chuyên sâu tim mạch, mạch máu và huyết áp để phòng ngừa đột quỵ sớm.`
          );
        } else if (gender === 'FEMALE') {
          setRecommendedPackage(mockPackagesDatabase['female-general']);
          setExplanationText(
            `Dựa trên độ tuổi ${age} của bạn, hệ thống khuyến nghị gói tổng quát nữ tích hợp tầm soát chuyên khoa phụ sản, tuyến vú và các chỉ số sinh hóa chuyên biệt.`
          );
        } else {
          setRecommendedPackage(mockPackagesDatabase['male-general']);
          setExplanationText(
            `Dựa trên độ tuổi ${age} và mục đích khám tổng quát, hệ thống khuyến nghị gói đầy đủ xét nghiệm máu, men gan, chức năng thận, X-Quang và siêu âm bụng tổng quát.`
          );
        }
      } else {
        // Hướng Doanh Nghiệp
        if (corporatePackageNeed === 'VIP_EXECUTIVE') {
          setRecommendedPackage(mockPackagesDatabase['corp-vip']);
          setExplanationText(
            'Gói khám VIP chuyên biệt cho cấp Lãnh đạo & Quản lý doanh nghiệp với phòng chờ riêng và tầm soát dấu ấn ung thư sớm.'
          );
        } else if (workEnvironment === 'OFFICE' || corporatePackageNeed === 'OFFICE_TECH') {
          setRecommendedPackage(mockPackagesDatabase['corp-office']);
          setExplanationText(
            'Gói khám tối ưu cho nhân sự văn phòng & công nghệ, tập trung phát hiện sớm bệnh lý cột sống cổ, thắt lưng, thị lực và mỡ máu.'
          );
        } else {
          setRecommendedPackage(mockPackagesDatabase['corp-std']);
          setExplanationText(
            'Gói khám đáp ứng trọn vẹn 100% tiêu chuẩn Thông tư 32/2023/TT-BYT bắt buộc của Bộ Y Tế, có báo cáo phân loại sức khỏe cho phòng HR.'
          );
        }
      }
      setIsLoading(false);
    }, 450);
  };

  // Mở modal đặt lịch từ modal chi tiết
  const handleProceedToBooking = (pkg: PackageDetail) => {
    setRecommendedPackage(pkg);
    setIsDetailModalOpen(false);
    setIsBookingModalOpen(true);
  };

  // Hoàn tất đặt lịch
  const handleConfirmBooking = (booking: BookingAppointment) => {
    setConfirmedBooking(booking);
    setIsBookingModalOpen(false);

    if (onRegisterSuccess) {
      onRegisterSuccess({
        packageName: booking.packageName,
        facilityName: booking.facilityName,
        appointmentDate: booking.appointmentDate,
        timeSlot: booking.timeSlot,
        bookingCode: booking.bookingCode
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
      
      {/* CỘT TRÁI (7 PHẦN): CẢNH BÁO BẮT BUỘC & FORM CHIA 2 HƯỚNG KHÁM */}
      <div className="lg:col-span-7 space-y-5">
        
        {/* Khung cảnh báo y khoa bắt buộc */}
        <div className="bg-amber-50 border-2 border-amber-300 p-5 rounded-3xl space-y-2 shadow-sm">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Cảnh Báo Y Khoa Bắt Buộc (Tuân thủ Quy tắc Y Tế)</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Kết quả gợi ý <strong>chỉ mang tính chất tham khảo</strong> dựa trên quy tắc thống kê độ tuổi và giới tính, 
            <strong> tuyệt đối không thay thế chẩn đoán y khoa của Bác sĩ</strong>. 
            Nếu quý khách có bất kỳ triệu chứng đau tức ngực, khó thở hoặc dấu hiệu bất thường, vui lòng đến ngay 
            <strong> khu vực Cấp cứu</strong> hoặc quầy tư vấn trực tiếp!
          </p>
        </div>

        {/* Khung Khảo Sát Chính Có 2 Tab Hướng Khám */}
        <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Khảo Sát Nhu Cầu Khám Sức Khỏe</h3>
            </div>

            {/* 2 TAB CHUYỂN ĐỔI: KHÁM CÁ NHÂN HOẶC KHÁM DOANH NGHIỆP */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setTargetType('INDIVIDUAL');
                  setConfirmedBooking(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetType === 'INDIVIDUAL'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Khám Cá Nhân</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTargetType('CORPORATE');
                  setConfirmedBooking(null);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  targetType === 'CORPORATE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Khám Doanh Nghiệp</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSurveySubmit} className="space-y-4">
            {/* FORM DÀNH CHO KHÁM CÁ NHÂN */}
            {targetType === 'INDIVIDUAL' ? (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Độ tuổi của bạn</label>
                  <input
                    type="number"
                    min={1}
                    max={110}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none focus:border-blue-500 font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Giới tính</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Tình trạng hôn nhân</label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="SINGLE">Độc thân</option>
                      <option value="MARRIED">Đã kết hôn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Mục đích khám chính</label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="GENERAL_CHECKUP">Khám tổng quát định kỳ hàng năm</option>
                    <option value="SCREENING">Tầm soát chuyên sâu gan, thận, tim mạch & đột quỵ</option>
                    <option value="PRE_EMPLOYMENT">Khám sức khỏe đi làm / đi học / cấp chứng nhận</option>
                  </select>
                </div>
              </>
            ) : (
              /* FORM DÀNH CHO KHÁM DOANH NGHIỆP */
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Tên Doanh Nghiệp / Cơ Quan</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ Smart OPD"
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none focus:border-blue-500 font-bold text-slate-900"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Quy mô nhân sự</label>
                    <select
                      value={employeeScale}
                      onChange={(e) => setEmployeeScale(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="UNDER_50">Dưới 50 nhân viên</option>
                      <option value="50_200">50 – 200 nhân viên</option>
                      <option value="200_500">200 – 500 nhân viên</option>
                      <option value="OVER_500">Trên 500 nhân viên</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1">Môi trường làm việc chính</label>
                    <select
                      value={workEnvironment}
                      onChange={(e) => setWorkEnvironment(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                    >
                      <option value="OFFICE">Khối Văn Phòng / IT (Ngồi nhiều, máy tính)</option>
                      <option value="FACTORY">Sản Xuất / Nhà Máy / Cơ Khí</option>
                      <option value="LOGISTICS">Vận Tải / Kho Bãi / Logistics</option>
                      <option value="SERVICE">Dịch Vụ / Bán Lẻ / F&B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Nhu cầu gói khám của doanh nghiệp</label>
                  <select
                    value={corporatePackageNeed}
                    onChange={(e) => setCorporatePackageNeed(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-sm outline-none bg-white font-medium text-slate-800"
                  >
                    <option value="TT32_STANDARD">Gói khám định kỳ theo chuẩn Thông tư 32/BYT (Bắt buộc)</option>
                    <option value="OFFICE_TECH">Gói khám văn phòng tầm soát cột sống, mắt & tim mạch</option>
                    <option value="VIP_EXECUTIVE">Gói khám sức khỏe VIP cho cấp Quản lý & Lãnh đạo</option>
                  </select>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>
                {isLoading
                  ? 'Đang Phân Tích Tiêu Chí Phù Hợp...'
                  : targetType === 'INDIVIDUAL'
                  ? 'Nhận Gợi Ý Gói Khám Cá Nhân'
                  : 'Nhận Gợi Ý Gói Khám Doanh Nghiệp'}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* CỘT PHẢI (5 PHẦN): GÓI KHÁM GỢI Ý XUẤT HIỆN & NÚT XEM CHI TIẾT */}
      <div className="lg:col-span-5 space-y-5">
        
        {/* NẾU ĐÃ ĐĂNG KÝ THÀNH CÔNG: HIỂN THỊ THẺ XÁC NHẬN ĐẶT LỊCH NGAY TRÊN GIAO DIỆN */}
        {confirmedBooking ? (
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 p-6 rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Đăng Ký Khám Thành Công!</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500">Mã Đặt Lịch:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{confirmedBooking.bookingCode}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Gói Khám:</span>
                <div className="font-bold text-slate-900 leading-snug">{confirmedBooking.packageName}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Cơ Sở Bệnh Viện:</span>
                <div className="font-semibold text-blue-700 flex items-start gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <span>{confirmedBooking.facilityName}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Ngày khám:</span>
                  <strong className="text-slate-800">{confirmedBooking.appointmentDate}</strong>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Khung giờ:</span>
                  <strong className="text-blue-600">{confirmedBooking.timeSlot}</strong>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Quý khách vui lòng đến trước 15 phút tại sảnh Lễ tân để đọc mã đặt lịch và nhận STT ưu tiên.
            </p>

            <button
              onClick={() => setConfirmedBooking(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Đặt Gói Khám Khác
            </button>
          </div>
        ) : recommendedPackage ? (
          /* THẺ GÓI KHÁM GỢI Ý XUẤT HIỆN: CÓ NÚT XEM CHI TIẾT */
          <div className="bg-gradient-to-br from-blue-50/60 to-indigo-50/60 border-2 border-blue-200 p-6 rounded-3xl shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Gói Khám Phù Hợp Nhất
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  recommendedPackage.targetType === 'CORPORATE'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {recommendedPackage.targetType === 'CORPORATE' ? 'Doanh Nghiệp' : 'Cá Nhân'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border-2 border-blue-200 shadow-sm space-y-2.5">
              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                {recommendedPackage.code}
              </span>

              <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                {recommendedPackage.name}
              </h4>

              <div className="flex items-baseline gap-1.5 pt-1">
                <span className="text-xl sm:text-2xl font-black text-blue-600">
                  {recommendedPackage.basePrice.toLocaleString('vi-VN')} VNĐ
                </span>
                {recommendedPackage.priceUnitText && (
                  <span className="text-xs text-slate-500 font-medium">{recommendedPackage.priceUnitText}</span>
                )}
              </div>

              {recommendedPackage.discountNote && (
                <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                  {recommendedPackage.discountNote}
                </div>
              )}

              <p className="text-xs text-slate-600 pt-2 border-t border-slate-100 leading-relaxed">
                {explanationText}
              </p>
            </div>

            {/* NÚT XEM CHI TIẾT GÓI KHÁM THEO YÊU CẦU */}
            <button
              onClick={() => setIsDetailModalOpen(true)}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Xem Chi Tiết Gói Khám</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* TRẠNG THÁI CHƯA CÓ GỢI Ý */
          <div className="bg-white p-6 rounded-3xl border-2 border-blue-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
              <Stethoscope className="w-4 h-4 text-blue-600" />
              <span>Tiêu Chí Lựa Chọn Gói Khám</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Điền các thông tin cơ bản ở form bên cạnh, thuật toán dựa trên bảng ràng buộc y tế sẽ tự động lọc ra các dịch vụ phù hợp nhất cho lứa tuổi hoặc quy mô doanh nghiệp của bạn.
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Kiểm tra tự động ràng buộc theo giới tính (khám phụ khoa, nhũ hoa...).</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-2">
                <Briefcase className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Đáp ứng chuẩn Thông tư 32/BYT bắt buộc cho khối cơ quan, doanh nghiệp.</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: XEM CHI TIẾT GÓI KHÁM */}
      <PackageDetailModal
        packageData={recommendedPackage}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onProceedToBooking={handleProceedToBooking}
      />

      {/* MODAL 2: BẢNG CHỌN CƠ SỞ & THỜI GIAN KHÁM */}
      <AppointmentBookingModal
        packageData={recommendedPackage}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
      />
    </div>
  );
};
