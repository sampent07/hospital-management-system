import React, { useState } from 'react';
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  User,
  MapPin,
  ChevronRight,
  HeartPulse,
  Phone,
  Mail,
  FileCheck,
  Layers,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { PackageDetail, BookingAppointment, PatientUser, PatientProfile, SingleServiceItem, ServiceCategoryGroup } from '../types';
import { PackageDetailModal } from '../components/PackageDetailModal';
import { AppointmentBookingModal, RegistrationInfo } from '../components/AppointmentBookingModal';
import { PackageConsultationModal } from '../components/PackageConsultationModal';
import { SingleServicesModal } from '../components/SingleServicesModal';

interface PackageAdvisorProps {
  currentUser?: PatientUser | null;
  patientProfile?: PatientProfile;
  onRegisterSuccess?: (booking: BookingAppointment) => void;
}

// 1. Danh sách các Mục Lớn (Chuyên khoa chính) theo yêu cầu
const majorCategories: ServiceCategoryGroup[] = [
  {
    id: 'DENTAL',
    name: 'Chuyên Khoa Răng - Hàm - Mặt',
    shortName: 'Răng - Hàm - Mặt',
    icon: '🦷',
    description: 'Khám nha khoa tổng quát, lấy cao răng, chụp X-quang răng toàn cảnh'
  },
  {
    id: 'GASTRO',
    name: 'Tiêu Hóa & Dạ Dày',
    shortName: 'Dạ Dày & Tiêu Hóa',
    icon: '🫄',
    description: 'Khám tiêu hóa, nội soi dạ dày, siêu âm bụng, test HP hơi thở'
  },
  {
    id: 'ORTHO',
    name: 'Cơ Xương Khớp & Cột Sống (Xương)',
    shortName: 'Xương & Khớp',
    icon: '🦴',
    description: 'Khám khớp, chụp X-quang cột sống/khớp gối, đo mật độ loãng xương'
  },
  {
    id: 'CARDIO',
    name: 'Tim Mạch & Hô Hấp',
    shortName: 'Tim Mạch',
    icon: '❤️',
    description: 'Khám tim mạch, đo điện tim ECG 12 cần, X-quang tim phổi'
  },
  {
    id: 'ENT_EYE',
    name: 'Mắt & Tai - Mũi - Họng',
    shortName: 'Mắt & TMH',
    icon: '👁️',
    description: 'Nội soi tai mũi họng, khám khúc xạ mắt & đo thị lực KTS'
  },
  {
    id: 'LAB',
    name: 'Xét Nghiệm Máu & Sinh Hóa',
    shortName: 'Xét Nghiệm Máu',
    icon: '🧪',
    description: 'Tổng phân tích máu CBC, men gan, đường huyết, mỡ máu, chức năng thận'
  }
];

// 2. Danh sách các gói & dịch vụ liên quan bên trong từng mục lớn
const singleServicesList: SingleServiceItem[] = [
  // --- MỤC: RĂNG - HÀM - MẶT ---
  {
    id: 'srv-kham-rhm',
    code: 'DV-RHM',
    name: 'Khám Chuyên Khoa Răng - Hàm - Mặt & Tư Vấn',
    category: 'Lâm sàng',
    categoryId: 'DENTAL',
    categoryName: 'Răng - Hàm - Mặt',
    roomNumber: 'Phòng 105',
    price: 150000,
    estimatedMinutes: 10,
    preparationNote: 'Vệ sinh răng miệng sạch sẽ trước khi khám'
  },
  {
    id: 'srv-cao-rang',
    code: 'DV-CAO-RANG',
    name: 'Lấy Cao Răng & Đánh Bóng Sóng Siêu Âm',
    category: 'Nha khoa điều trị',
    categoryId: 'DENTAL',
    categoryName: 'Răng - Hàm - Mặt',
    roomNumber: 'Phòng 105',
    price: 200000,
    estimatedMinutes: 20,
    preparationNote: 'Vô trùng chuẩn Bộ Y Tế, êm ái nhẹ nhàng'
  },
  {
    id: 'srv-xq-rang',
    code: 'DV-XQ-PANORAMA',
    name: 'Chụp X-Quang Panorama Toàn Cảnh Răng KTS',
    category: 'Chẩn đoán hình ảnh',
    categoryId: 'DENTAL',
    categoryName: 'Răng - Hàm - Mặt',
    roomNumber: 'Phòng CĐHA-02',
    price: 180000,
    estimatedMinutes: 5,
    preparationNote: 'Tháo hoa tai, dây chuyền kim loại trước khi chụp'
  },

  // --- MỤC: DẠ DÀY & TIÊU HÓA ---
  {
    id: 'srv-kham-daday',
    code: 'DV-DADAY',
    name: 'Khám Chuyên Khoa Tiêu Hóa & Dạ Dày',
    category: 'Lâm sàng',
    categoryId: 'GASTRO',
    categoryName: 'Dạ Dày & Tiêu Hóa',
    roomNumber: 'Phòng 101',
    price: 150000,
    estimatedMinutes: 10,
    preparationNote: 'Nên nhịn ăn sáng nếu có ý định nội soi hoặc test vi khuẩn HP'
  },
  {
    id: 'srv-sieu-am-bung',
    code: 'DV-SA-BUNG',
    name: 'Siêu Âm Ổ Bụng Tổng Quát',
    category: 'Chẩn đoán hình ảnh',
    categoryId: 'GASTRO',
    categoryName: 'Dạ Dày & Tiêu Hóa',
    roomNumber: 'Phòng CĐHA-03',
    price: 220000,
    estimatedMinutes: 10,
    preparationNote: 'Uống nhiều nước lọc và nhịn tiểu trước khi siêu âm'
  },
  {
    id: 'srv-test-hp',
    code: 'DV-TEST-HP',
    name: 'Test Vi Khuẩn HP Dạ Dày Qua Hơi Thở C14',
    category: 'Xét nghiệm chuyên sâu',
    categoryId: 'GASTRO',
    categoryName: 'Dạ Dày & Tiêu Hóa',
    roomNumber: 'Phòng XN-03',
    price: 250000,
    estimatedMinutes: 15,
    preparationNote: 'Nhịn ăn tối thiểu 4 - 6 tiếng, ngừng kháng sinh 4 tuần'
  },

  // --- MỤC: CƠ XƯƠNG KHỚP (XƯƠNG) ---
  {
    id: 'srv-kham-xuong',
    code: 'DV-XUONG-KHOP',
    name: 'Khám Chuyên Khoa Cơ Xương Khớp & Cột Sống',
    category: 'Lâm sàng',
    categoryId: 'ORTHO',
    categoryName: 'Xương & Khớp',
    roomNumber: 'Phòng 107',
    price: 180000,
    estimatedMinutes: 10,
    preparationNote: 'Mang theo kết quả phim chụp X-quang, MRI cũ nếu có'
  },
  {
    id: 'srv-xq-xuong',
    code: 'DV-XQ-COT-SONG',
    name: 'Chụp X-Quang Cột Sống / Khớp Gối KTS',
    category: 'Chẩn đoán hình ảnh',
    categoryId: 'ORTHO',
    categoryName: 'Xương & Khớp',
    roomNumber: 'Phòng CĐHA-01',
    price: 180000,
    estimatedMinutes: 6,
    preparationNote: 'Mặc trang phục thoải mái không có khuy hay kim loại'
  },
  {
    id: 'srv-do-mat-do-xuong',
    code: 'DV-DEXA-XUONG',
    name: 'Đo Mật Độ Xương Bằng Phương Pháp DEXA (Loãng Xương)',
    category: 'Chẩn đoán hình ảnh',
    categoryId: 'ORTHO',
    categoryName: 'Xương & Khớp',
    roomNumber: 'Phòng CĐHA-04',
    price: 250000,
    estimatedMinutes: 12,
    preparationNote: 'Ngừng uống thuốc canxi bổ sung trong 24 giờ trước đo'
  },

  // --- MỤC: TIM MẠCH & HÔ HẤP ---
  {
    id: 'srv-kham-tim',
    code: 'DV-TIM-MACH',
    name: 'Khám Chuyên Khoa Tim Mạch',
    category: 'Lâm sàng',
    categoryId: 'CARDIO',
    categoryName: 'Tim Mạch',
    roomNumber: 'Phòng 102',
    price: 180000,
    estimatedMinutes: 10,
    preparationNote: 'Mang theo đơn thuốc huyết áp, tim mạch đang dùng hàng ngày'
  },
  {
    id: 'srv-xq-nguc',
    code: 'DV-XQ-NGUC',
    name: 'Chụp X-Quang Tim Phổi / Ngực Thẳng KTS',
    category: 'Chẩn đoán hình ảnh',
    categoryId: 'CARDIO',
    categoryName: 'Tim Mạch',
    roomNumber: 'Phòng CĐHA-01',
    price: 180000,
    estimatedMinutes: 5,
    preparationNote: 'Tháo trang sức kim loại trước khi vào phòng chụp'
  },
  {
    id: 'srv-ecg',
    code: 'DV-ECG',
    name: 'Đo Điện Tâm Đồ (ECG 12 Đạo Trình)',
    category: 'Thăm dò chức năng',
    categoryId: 'CARDIO',
    categoryName: 'Tim Mạch',
    roomNumber: 'Phòng TDCN-01',
    price: 100000,
    estimatedMinutes: 6,
    preparationNote: 'Nghỉ ngơi yên tĩnh thả lỏng 10 phút trước khi đo'
  },

  // --- MỤC: MẮT & TAI - MŨI - HỌNG ---
  {
    id: 'srv-kham-tmh',
    code: 'DV-TMH',
    name: 'Khám Tai - Mũi - Họng & Nội Soi KTS',
    category: 'Lâm sàng',
    categoryId: 'ENT_EYE',
    categoryName: 'Mắt & TMH',
    roomNumber: 'Phòng 103',
    price: 180000,
    estimatedMinutes: 8,
    preparationNote: 'Báo bác sĩ nếu đang bị chảy máu mũi hoặc ngạt mũi cấp'
  },
  {
    id: 'srv-kham-mat',
    code: 'DV-MAT',
    name: 'Khám Chuyên Khoa Mắt & Đo Khúc Xạ Máy KTS',
    category: 'Lâm sàng',
    categoryId: 'ENT_EYE',
    categoryName: 'Mắt & TMH',
    roomNumber: 'Phòng 104',
    price: 150000,
    estimatedMinutes: 8,
    preparationNote: 'Tháo kính áp tròng trước khi đo khúc xạ mắt'
  },

  // --- MỤC: XÉT NGHIỆM MÁU & SINH HÓA ---
  {
    id: 'srv-xn-mau',
    code: 'DV-XN-MAU',
    name: 'Tổng Phân Tích Tế Bào Máu (CBC 18 chỉ số)',
    category: 'Xét nghiệm',
    categoryId: 'LAB',
    categoryName: 'Xét Nghiệm Máu',
    roomNumber: 'Phòng XN-02',
    price: 120000,
    estimatedMinutes: 4,
    preparationNote: 'Nhịn ăn từ 6 - 8 tiếng trước khi lấy mẫu máu'
  },
  {
    id: 'srv-xn-sinhhoa',
    code: 'DV-XN-SINHHOA',
    name: 'Xét Nghiệm Men Gan (AST/ALT) & Đường Huyết (Glucose)',
    category: 'Xét nghiệm',
    categoryId: 'LAB',
    categoryName: 'Xét Nghiệm Máu',
    roomNumber: 'Phòng XN-02',
    price: 160000,
    estimatedMinutes: 5,
    preparationNote: 'Nhịn ăn sáng để kết quả đường máu và men gan chính xác'
  },
  {
    id: 'srv-xn-than-mo',
    code: 'DV-XN-LIPID',
    name: 'Xét Nghiệm Mỡ Máu & Chức Năng Thận (Ure/Creatinin)',
    category: 'Xét nghiệm',
    categoryId: 'LAB',
    categoryName: 'Xét Nghiệm Máu',
    roomNumber: 'Phòng XN-02',
    price: 180000,
    estimatedMinutes: 5,
    preparationNote: 'Uống nước lọc bình thường, không dùng chất kích thích'
  }
];

// Gợi ý combo khám lẻ nhanh theo các mục lớn
const quickCombos = [
  {
    id: 'combo-digest',
    name: 'Combo Dạ Dày & Tiêu Hóa',
    desc: 'Khám Dạ Dày + Siêu Âm Bụng + Test Vi Khuẩn HP',
    serviceIds: ['srv-kham-daday', 'srv-sieu-am-bung', 'srv-test-hp']
  },
  {
    id: 'combo-dental',
    name: 'Combo Răng - Hàm - Mặt',
    desc: 'Khám Răng + Lấy Cao Răng + Chụp X-Quang Panorama',
    serviceIds: ['srv-kham-rhm', 'srv-cao-rang', 'srv-xq-rang']
  },
  {
    id: 'combo-ortho',
    name: 'Combo Cơ Xương Khớp (Xương)',
    desc: 'Khám Xương Khớp + Chụp Cột Sống + Đo Mật Độ Xương DEXA',
    serviceIds: ['srv-kham-xuong', 'srv-xq-xuong', 'srv-do-mat-do-xuong']
  },
  {
    id: 'combo-cardio',
    name: 'Combo Tim Mạch & Hô Hấp',
    desc: 'Khám Tim Mạch + Chụp X-Quang Ngực + Đo Điện Tim ECG',
    serviceIds: ['srv-kham-tim', 'srv-xq-nguc', 'srv-ecg']
  }
];

// Dữ liệu mẫu các gói khám chi tiết cho Cá nhân và Doanh nghiệp
const mockPackagesDatabase: Record<string, PackageDetail> = {
  'basic-general': {
    id: 'pkg-basic-general',
    code: 'PKG-BASIC-01',
    name: 'Gói Khám Sức Khỏe Tổng Quát Cơ Bản (Tiết Kiệm)',
    targetType: 'INDIVIDUAL',
    basePrice: 1250000,
    priceUnitText: '/ người',
    targetAudienceText: 'Mọi lứa tuổi, học sinh sinh viên, người lao động kiểm tra định kỳ nhanh',
    description:
      'Gói khám cơ bản tinh gọn bao gồm khám thể lực, nội khoa, mắt, tai mũi họng, chụp X-quang phổi, siêu âm bụng và bộ xét nghiệm máu cơ bản.',
    clinicalServices: [
      'Khám Thể Lực & Nội Tổng Quát',
      'Khám Chuyên Khoa Mắt & Đo thị lực',
      'Khám Tai - Mũi - Họng & Răng Hàm Mặt',
      'Khám Ngoại Khoa & Da Liễu cơ bản'
    ],
    imagingServices: [
      'Chụp X-Quang Ngực Thẳng Kỹ Thuật Số (DR)',
      'Siêu Âm Ổ Bụng Tổng Quát'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu ngoại vi (CBC 18 chỉ số)',
      'Đường huyết lúc đói (Glucose)',
      'Đánh giá men gan (AST, ALT)',
      'Đánh giá chức năng thận (Creatinine)',
      'Tổng phân tích nước tiểu 10 thông số'
    ],
    functionalServices: [
      'Đo điện tâm đồ 12 đạo trình (ECG)'
    ],
    benefits: [
      'Chi phí tiết kiệm, phù hợp kiểm tra sức khỏe tổng quát nhanh',
      'Nhận kết quả và tư vấn ngay trong ngày'
    ]
  },
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
  'digestive-gastro': {
    id: 'pkg-digestive-gastro',
    code: 'PKG-GASTRO-PRO',
    name: 'Gói Tầm Soát Chuyên Sâu Tiêu Hóa, Dạ Dày & Gan Mật',
    targetType: 'INDIVIDUAL',
    basePrice: 2650000,
    priceUnitText: '/ người',
    targetAudienceText: 'Người có triệu chứng đau dạ dày, trào ngược hoặc có tiền sử gan mật',
    description:
      'Gói khám chuyên sâu hệ tiêu hóa giúp phát hiện sớm viêm loét dạ dày, vi khuẩn HP, bệnh lý gan nhiễm mỡ, sỏi mật và polyp đường ruột.',
    clinicalServices: [
      'Khám Chuyên Khoa Tiêu Hóa & Gan Mật với Bác sĩ chuyên khoa',
      'Khám Nội Tổng Quát & Đánh giá thể lực',
      'Khám Răng Hàm Mặt & Khoang miệng'
    ],
    imagingServices: [
      'Siêu Âm Ổ Bụng Tổng Quát Màu (Gan, mật, tụy, lách, thận)',
      'Chụp X-Quang Tim Phổi KTS thẳng'
    ],
    laboratoryServices: [
      'Test vi khuẩn HP dạ dày qua hơi thở C14 (Không xâm lấn)',
      'Tổng phân tích tế bào máu ngoại vi (CBC 18 chỉ số)',
      'Đánh giá men gan chuyên sâu (AST, ALT, GGT)',
      'Xét nghiệm Viêm Gan B (HBsAg) & Viêm Gan C (Anti-HCV)',
      'Chức năng thận, đường huyết, mỡ máu',
      'Tổng phân tích nước tiểu 10 thông số'
    ],
    functionalServices: [
      'Đo điện tâm đồ 12 đạo trình (ECG)'
    ],
    benefits: [
      'Test HP hơi thở hiện đại không cần nội soi, êm ái, chính xác 98%',
      'Bác sĩ Tiêu hóa kết luận và kê phác đồ bảo vệ niêm mạc dạ dày'
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
  'corp-occupational': {
    id: 'pkg-corp-occupational',
    code: 'PKG-CORP-OCCUPATIONAL',
    name: 'Gói Khám Bệnh Nghề Nghiệp & Môi Trường Sản Xuất / Độc Hại',
    targetType: 'CORPORATE',
    basePrice: 1450000,
    priceUnitText: '/ nhân sự',
    discountNote: 'Tuân thủ Thông tư 28/2016/TT-BYT',
    targetAudienceText: 'Nhà máy, Xí nghiệp, Cơ khí, Xây dựng, Hóa chất, Logistics',
    description:
      'Đặc thù cho lao động tiếp xúc tiếng ồn, bụi mịn, hóa chất hoặc rung chấn: đo thính lực nghề nghiệp, đo chức năng hô hấp và tầm soát bệnh nghề nghiệp.',
    clinicalServices: [
      'Khám Thể Lực & Khám Nội Tổng Quát',
      'Khám Mắt & Đánh giá thị lực, sắc giác',
      'Khám Tai Mũi Họng & Thính lực',
      'Khám Da Liễu & Bệnh ngoài da nghề nghiệp',
      'Khám Cơ Xương Khớp nghề nghiệp'
    ],
    imagingServices: [
      'Chụp X-Quang Tim Phổi thẳng (Tầm soát bệnh bụi phổi Bông/Silic)',
      'Siêu Âm Ổ Bụng Tổng Quát'
    ],
    laboratoryServices: [
      'Đo chức năng hô hấp thông khí phổi (Spirometry - FVC, FEV1)',
      'Đo thính lực đơn âm trong buồng cách âm',
      'Tổng phân tích tế bào máu ngoại vi (CBC)',
      'Đường huyết, Men gan, Chức năng thận',
      'Tổng phân tích nước tiểu 10 chỉ số'
    ],
    functionalServices: [
      'Đo điện tâm đồ (ECG 12 đạo trình)'
    ],
    benefits: [
      'Hồ sơ vệ sinh lao động và bệnh nghề nghiệp chuẩn nộp Sở Y Tế & Sở LĐTBXH',
      'Lấy mẫu tận nơi tại nhà máy theo từng ca sản xuất 24/7'
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
  'corp-adv': {
    id: 'pkg-corp-adv',
    code: 'PKG-CORP-ADV',
    name: 'Gói Khám Doanh Nghiệp Toàn Diện (Nâng Cao & Tầm Soát Ung Thư)',
    targetType: 'CORPORATE',
    basePrice: 2250000,
    priceUnitText: '/ nhân sự',
    discountNote: 'Gói phúc lợi cao cấp được doanh nghiệp ưa chuộng',
    targetAudienceText: 'Doanh nghiệp FDI, Tập đoàn, Công ty đa quốc gia',
    description:
      'Gói khám nâng cao bổ sung siêu âm tuyến giáp, siêu âm tim, xét nghiệm dấu ấn ung thư gan, phổi, đường tiêu hóa và bộ mỡ máu chuyên sâu.',
    clinicalServices: [
      'Khám Thể Lực & Khám Nội Tổng Quát chuyên sâu',
      'Khám Mắt (Khúc xạ, nhãn áp & thị lực)',
      'Khám Tai Mũi Họng & Răng Hàm Mặt',
      'Khám Phụ Khoa & Tầm soát ung thư cổ tử cung (nữ)',
      'Khám Da Liễu nghề nghiệp'
    ],
    imagingServices: [
      'Chụp X-Quang Tim Phổi Kỹ Thuật Số (DR)',
      'Siêu Âm Tuyến Giáp & Siêu Âm Tuyến Vú (nữ)',
      'Siêu Âm Ổ Bụng Tổng Quát Màu'
    ],
    laboratoryServices: [
      'Tổng phân tích tế bào máu (CBC 18 chỉ số)',
      'Xét nghiệm dấu ấn ung thư gan (AFP) & phổi (CEA)',
      'Bộ mỡ máu toàn phần & Đường huyết đói',
      'Men gan (AST, ALT, GGT) & Chức năng thận (Ure, Creatinine)',
      'Tổng phân tích nước tiểu 10 thông số'
    ],
    functionalServices: [
      'Đo điện tâm đồ 12 đạo trình (ECG)'
    ],
    benefits: [
      'Bác sĩ chuyên khoa trực tiếp đọc phim và tư vấn sức khỏe cho từng nhân sự',
      'Hỗ trợ phân tích dữ liệu sức khỏe doanh nghiệp theo nhóm tuổi và phòng ban'
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

const commonDiseases = [
  'Tăng huyết áp',
  'Đái tháo đường',
  'Bệnh tim mạch',
  'Viêm gan B/C',
  'Đau dạ dày / Tiêu hóa',
  'Dị ứng kháng sinh / Thuốc'
];

export const PackageAdvisor: React.FC<PackageAdvisorProps> = ({
  currentUser,
  patientProfile,
  onRegisterSuccess
}) => {
  // 1. CHIA LÀM 2 HƯỚNG KHÁM: CÁ NHÂN HOẶC DOANH NGHIỆP
  const [targetType, setTargetType] = useState<'INDIVIDUAL' | 'CORPORATE'>('INDIVIDUAL');

  // 2. HÌNH THỨC KHÁM: KHÁM THEO GÓI HOẶC KHÁM LẺ
  const [examMode, setExamMode] = useState<'PACKAGE' | 'SINGLE'>('PACKAGE');

  // Dịch vụ khám lẻ được chọn (Mặc định chọn 2 dịch vụ mẫu: X-Quang & Khám Dạ Dày)
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>(['srv-xq-nguc', 'srv-kham-daday']);

  // Thông báo lỗi validation khi chưa cung cấp thông tin người khám
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Ô vuông nhỏ: Lấy dữ liệu từ hồ sơ (ngay trên nút Khám Lẻ)
  const [isUseProfileData, setIsUseProfileData] = useState<boolean>(false);

  // FORM KHÁM CÁ NHÂN: ĐIỀN THÔNG TIN TRÊN PHIẾU KHÁM (Mặc định để trống, tick ô vuông nhỏ sẽ lấy từ Hồ Sơ)
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [age, setAge] = useState<number>(0);
  const [gender, setGender] = useState<string>('MALE');
  const [insuranceCard, setInsuranceCard] = useState<string>('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [medicalHistoryDetail, setMedicalHistoryDetail] = useState<string>('');
  const [maritalStatus, setMaritalStatus] = useState<string>('MARRIED');
  const [purpose, setPurpose] = useState<string>('GENERAL_CHECKUP');
  const [individualNotes, setIndividualNotes] = useState<string>('');

  // Xử lý khi tick / bỏ tick vào ô vuông nhỏ: Lấy dữ liệu từ hồ sơ
  const handleToggleProfileCheckbox = (checked: boolean) => {
    setIsUseProfileData(checked);
    setFormValidationError(null);
    if (checked) {
      if (patientProfile) {
        setPatientName(patientProfile.fullName);
        setPatientPhone(patientProfile.phone);
        setAge(patientProfile.age);
        setGender(patientProfile.gender);
        setInsuranceCard(patientProfile.insuranceCard);
        setSelectedDiseases([...patientProfile.selectedDiseases]);
        setMedicalHistoryDetail(patientProfile.medicalHistoryDetail);
        setMaritalStatus(patientProfile.maritalStatus);
        if (patientProfile.personalNotes) {
          setIndividualNotes(patientProfile.personalNotes);
        }
      } else if (currentUser) {
        setPatientName(currentUser.fullName);
        setAge(currentUser.age);
        setGender(currentUser.gender === 'Nữ' ? 'FEMALE' : 'MALE');
        setPatientPhone('0909 123 456');
        setInsuranceCard('DN 4 79 20261111');
      }
    } else {
      // Khi bỏ tick: xóa các ô để người dùng tự do nhập cho người thân
      setPatientName('');
      setPatientPhone('');
      setAge(0);
      setInsuranceCard('');
      setSelectedDiseases([]);
      setMedicalHistoryDetail('');
      setIndividualNotes('');
    }
  };

  // FORM KHÁM DOANH NGHIỆP
  const [companyName, setCompanyName] = useState<string>('Công ty Cổ phần Công nghệ Smart OPD');
  const [contactPerson, setContactPerson] = useState<string>('Nguyễn Văn Minh (Trưởng phòng HR)');
  const [contactPhone, setContactPhone] = useState<string>('0912 345 678');
  const [contactEmail, setContactEmail] = useState<string>('hr@smartopd.vn');
  const [employeeScale, setEmployeeScale] = useState<string>('50 – 200 nhân sự');
  const [workEnvironment, setWorkEnvironment] = useState<string>('OFFICE');
  const [corporatePackageNeed, setCorporatePackageNeed] = useState<string>('TT32_STANDARD');
  const [corporateNotes, setCorporateNotes] = useState<string>('');

  // Gói đề xuất & Modal
  const [recommendedPackage, setRecommendedPackage] = useState<PackageDetail | null>(() => mockPackagesDatabase['male-general']);

  // Điều khiển các Modal
  const [isPackageConsultationModalOpen, setIsPackageConsultationModalOpen] = useState<boolean>(false);
  const [isSingleServicesModalOpen, setIsSingleServicesModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<BookingAppointment | null>(null);

  // Toggle dịch vụ khám lẻ
  const toggleSingleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Chọn nhanh combo khám lẻ
  const applyQuickCombo = (serviceIds: string[]) => {
    setSelectedServiceIds(serviceIds);
  };

  // Danh sách các đối tượng dịch vụ khám lẻ đã chọn
  const selectedServices = singleServicesList.filter((s) => selectedServiceIds.includes(s.id));

  // Toggle chọn nhanh tiền sử bệnh lý
  const toggleDisease = (disease: string) => {
    setSelectedDiseases((prev) =>
      prev.includes(disease) ? prev.filter((d) => d !== disease) : [...prev, disease]
    );
  };

  // Gom chuỗi tiền sử bệnh lý & ghi chú
  const fullMedicalHistory = [
    ...selectedDiseases,
    medicalHistoryDetail.trim(),
    individualNotes.trim()
  ].filter(Boolean).join('; ');

  // Kiểm tra điều kiện bắt buộc: Phải điền các trường có dấu sao đỏ (*) trước khi chọn gói khám
  const validatePatientInfo = (): boolean => {
    if (targetType === 'INDIVIDUAL') {
      if (!patientName.trim()) {
        setFormValidationError('Vui lòng điền Họ và Tên người khám (trường có dấu * bắt buộc)!');
        return false;
      }
      if (!patientPhone.trim()) {
        setFormValidationError('Vui lòng điền Số điện thoại liên hệ (trường có dấu * bắt buộc)!');
        return false;
      }
      if (!age || age <= 0 || isNaN(age)) {
        setFormValidationError('Vui lòng điền Độ tuổi hợp lệ (trường có dấu * bắt buộc)!');
        return false;
      }
    } else {
      if (!companyName.trim()) {
        setFormValidationError('Vui lòng điền Tên doanh nghiệp / cơ quan!');
        return false;
      }
      if (!contactPerson.trim()) {
        setFormValidationError('Vui lòng điền Người liên hệ (HR / Quản lý)!');
        return false;
      }
      if (!contactPhone.trim()) {
        setFormValidationError('Vui lòng điền Số điện thoại liên hệ của doanh nghiệp!');
        return false;
      }
    }
    setFormValidationError(null);
    return true;
  };

  // Hàm tính toán và mở cửa sổ tư vấn gói khám dựa trên thông tin đã điền
  const handleOpenPackageModal = () => {
    if (!validatePatientInfo()) {
      return;
    }
    setExamMode('PACKAGE');
    const hasCardioHistory = selectedDiseases.some((d) =>
      ['Tăng huyết áp', 'Bệnh tim mạch', 'Đái tháo đường'].includes(d)
    );

    if (age >= 55 || hasCardioHistory) {
      setRecommendedPackage(mockPackagesDatabase['senior-comprehensive']);
    } else if (gender === 'FEMALE') {
      setRecommendedPackage(mockPackagesDatabase['female-general']);
    } else {
      setRecommendedPackage(mockPackagesDatabase['male-general']);
    }
    setIsPackageConsultationModalOpen(true);
  };

  // Mở cửa sổ khám lẻ (chỉ khi đã cung cấp đủ thông tin)
  const handleOpenSingleServicesModal = () => {
    if (!validatePatientInfo()) {
      return;
    }
    setExamMode('SINGLE');
    setIsSingleServicesModalOpen(true);
  };

  // Xử lý gửi Form Khảo Sát để nhận Gợi Ý Gói Khám hoặc Đặt Khám Lẻ
  const handleSurveySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePatientInfo()) {
      return;
    }
    setConfirmedBooking(null);

    if (targetType === 'CORPORATE') {
      setExamMode('PACKAGE');
      setIsPackageConsultationModalOpen(true);
    } else {
      if (examMode === 'SINGLE') {
        handleOpenSingleServicesModal();
      } else {
        handleOpenPackageModal();
      }
    }
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
      onRegisterSuccess(booking);
    }
  };

  // Tạo đối tượng dữ liệu đăng ký hoàn chỉnh để chuyển sang modal
  const currentRegistrationInfo: RegistrationInfo = {
    contactName: targetType === 'INDIVIDUAL' ? patientName : contactPerson,
    contactPhone: targetType === 'INDIVIDUAL' ? patientPhone : contactPhone,
    age: targetType === 'INDIVIDUAL' ? age : undefined,
    gender: targetType === 'INDIVIDUAL' ? gender : undefined,
    insuranceCardNumber: targetType === 'INDIVIDUAL' ? insuranceCard : undefined,
    medicalHistory: targetType === 'INDIVIDUAL' ? fullMedicalHistory : undefined,
    companyName: targetType === 'CORPORATE' ? companyName : undefined,
    employeeScale: targetType === 'CORPORATE' ? employeeScale : undefined,
    workEnvironment: targetType === 'CORPORATE' ? workEnvironment : undefined,
    email: targetType === 'CORPORATE' ? contactEmail : undefined,
    notes: targetType === 'INDIVIDUAL' ? individualNotes : corporateNotes
  };

  return (
    <div className="max-w-4xl mx-auto w-full space-y-5 font-sans">

      {/* THÔNG BÁO ĐẶT LỊCH THÀNH CÔNG (NẾU CÓ) */}
      {confirmedBooking && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 p-6 sm:p-7 rounded-3xl shadow-sm space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Đăng Ký Khám Thành Công!</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-slate-500">Mã Đặt Lịch:</span>
              <span className="font-mono font-bold text-emerald-700 text-sm sm:text-base">{confirmedBooking.bookingCode}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">
                {confirmedBooking.examMode === 'SINGLE' ? 'Dịch Vụ Khám:' : 'Gói Khám:'}
              </span>
              <div className="font-bold text-slate-900 leading-snug">{confirmedBooking.packageName}</div>
            </div>
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Cơ Sở Bệnh Viện:</span>
              <div className="font-semibold text-blue-700 flex items-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                <span>{confirmedBooking.facilityName}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Ngày khám:</span>
                <strong className="text-slate-800">{confirmedBooking.appointmentDate}</strong>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 block text-[11px]">Khung giờ:</span>
                <strong className="text-blue-600">{confirmedBooking.timeSlot}</strong>
              </div>
            </div>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">
            Quý khách vui lòng đến trước 15 phút tại sảnh Lễ tân để đọc mã đặt lịch và nhận STT ưu tiên.
          </p>

          <button
            type="button"
            onClick={() => setConfirmedBooking(null)}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm transition-all cursor-pointer shadow-sm"
          >
            Đặt Dịch Vụ / Gói Khác
          </button>
        </div>
      )}

      {/* Khung Form Đăng Ký Chính */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-blue-200 shadow-sm space-y-5">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Đăng Ký Gói Khám Sức Khỏe</h3>
          </div>

          {/* 2 TAB CHUYỂN ĐỔI: KHÁM CÁ NHÂN HOẶC KHÁM DOANH NGHIỆP */}
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTargetType('INDIVIDUAL');
                setConfirmedBooking(null);
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${targetType === 'INDIVIDUAL'
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
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${targetType === 'CORPORATE'
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

          {/* ===================== KHÁM CÁ NHÂN ===================== */}
          {targetType === 'INDIVIDUAL' ? (
            <>
              {/* 1. ĐIỀN PHIẾU KHÁM TRƯỚC (THÔNG TIN CẦN THIẾT) */}
              <div className="space-y-3.5 p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>1. Phiếu Thông Tin Người Khám:</span>
                  </label>
                  <span className="text-[10px] text-slate-500 font-medium">
                    (*) Thông tin cơ bản bắt buộc
                  </span>
                </div>

                {/* Họ tên và Số điện thoại */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Họ và Tên Người Khám <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (formValidationError) setFormValidationError(null);
                      }}
                      placeholder="Ví dụ: Lê Văn Hùng"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all ${
                        formValidationError && !patientName.trim()
                          ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300'
                      }`}
                      required
                    />
                    {formValidationError && !patientName.trim() && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        * Bắt buộc nhập họ và tên
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Số Điện Thoại Liên Hệ <span className="text-rose-500">*</span>:
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => {
                          setPatientPhone(e.target.value);
                          if (formValidationError) setFormValidationError(null);
                        }}
                        placeholder="Ví dụ: 0909 123 456"
                        className={`w-full pl-9 pr-3.5 py-2.5 bg-white border rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all ${
                          formValidationError && !patientPhone.trim()
                            ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
                            : 'border-slate-300'
                        }`}
                        required
                      />
                    </div>
                    {formValidationError && !patientPhone.trim() && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        * Bắt buộc nhập số điện thoại
                      </span>
                    )}
                  </div>
                </div>

                {/* Độ tuổi, Giới tính, Mã BHYT */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Độ Tuổi <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={110}
                      value={age > 0 ? age : ''}
                      onChange={(e) => {
                        setAge(parseInt(e.target.value) || 0);
                        if (formValidationError) setFormValidationError(null);
                      }}
                      placeholder="Ví dụ: 38"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm transition-all ${
                        formValidationError && (age <= 0 || isNaN(age))
                          ? 'border-rose-400 ring-2 ring-rose-200 bg-rose-50/20'
                          : 'border-slate-300'
                      }`}
                      required
                    />
                    {formValidationError && (age <= 0 || isNaN(age)) && (
                      <span className="text-[11px] text-rose-600 font-semibold mt-1 block">
                        * Bắt buộc nhập độ tuổi
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Giới Tính:</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Số BHYT / CCCD:</span>
                    </label>
                    <input
                      type="text"
                      value={insuranceCard}
                      onChange={(e) => setInsuranceCard(e.target.value)}
                      placeholder="DN 4 79... hoặc số CCCD"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>

                  {/* Tiền sử bệnh lý & Dị ứng thuốc (chọn nhanh nếu có) */}
                  <div className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-200/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        <HeartPulse className="w-4 h-4 text-rose-500" />
                        <span>Tiền Sử Bệnh Lý & Dị Ứng Thuốc (chọn nhanh nếu có):</span>
                      </label>
                      <span className="text-[10px] text-slate-400">Giúp AI đối chiếu</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {commonDiseases.map((disease) => {
                        const isChecked = selectedDiseases.includes(disease);
                        return (
                          <button
                            key={disease}
                            type="button"
                            onClick={() => toggleDisease(disease)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                              isChecked
                                ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:border-rose-300'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '}
                            {disease}
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={medicalHistoryDetail}
                        onChange={(e) => setMedicalHistoryDetail(e.target.value)}
                        placeholder="Ghi chú thêm: Đang uống thuốc tim mạch/huyết áp hàng ngày, tiền sử phẫu thuật..."
                        className="w-full px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs text-slate-800 outline-none focus:border-rose-400 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Tình trạng hôn nhân & Mục đích khám chính */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Tình Trạng Hôn Nhân:</label>
                      <select
                        value={maritalStatus}
                        onChange={(e) => setMaritalStatus(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                      >
                        <option value="SINGLE">Độc thân</option>
                        <option value="MARRIED">Đã kết hôn</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Mục Đích Khám Chính:</label>
                    <select
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 shadow-sm"
                    >
                      <option value="GENERAL_CHECKUP">Khám tổng quát định kỳ hàng năm</option>
                      <option value="PRE_EMPLOYMENT">Khám sức khỏe đi làm / Nhập học</option>
                      <option value="SYMPTOM_INVESTIGATION">Có triệu chứng bất thường cần kiểm tra</option>
                      <option value="CHRONIC_MONITORING">Theo dõi bệnh mạn tính định kỳ</option>
                      <option value="CANCER_SCREENING">Tầm soát ung thư chuyên sâu</option>
                    </select>
                  </div>
                </div>

                {/* Ghi chú y khoa ban đầu */}
                <div className="pt-1">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Ghi Chú Y Khoa / Yêu Cầu Riêng (nếu có):
                  </label>
                  <input
                    type="text"
                    value={individualNotes}
                    onChange={(e) => setIndividualNotes(e.target.value)}
                    placeholder="Ví dụ: Cần xe lăn hỗ trợ, muốn khám sớm trong buổi sáng..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-800 outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* 2. DƯỚI CÙNG LÀ 2 NÚT HÀNH ĐỘNG: KHÁM THEO GÓI & KHÁM LẺ */}
              <div className="pt-2 border-t border-slate-100 space-y-2.5">
                {/* Thông báo lỗi khi bấm nút mà thiếu trường có dấu sao đỏ (*) */}
                {formValidationError && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold">{formValidationError}</span>
                  </div>
                )}

                {/* Ô vuông nhỏ ở góc dưới bên trên nút Khám Lẻ */}
                <div className="flex justify-end pr-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none bg-blue-50/90 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-xl transition-all shadow-sm group">
                    <input
                      type="checkbox"
                      checked={isUseProfileData}
                      onChange={(e) => handleToggleProfileCheckbox(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 border-blue-400 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs font-semibold text-blue-900 group-hover:text-blue-700 transition-colors">
                      Lấy dữ liệu từ hồ sơ
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* NÚT 1: KHÁM THEO GÓI */}
                  <button
                    type="button"
                    onClick={handleOpenPackageModal}
                    className="py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <Layers className="w-4 h-4 text-white" />
                    <span className="text-sm">Khám Theo Gói</span>
                  </button>

                  {/* NÚT 2: KHÁM LẺ */}
                  <button
                    type="button"
                    onClick={handleOpenSingleServicesModal}
                    className="py-3.5 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-md shadow-teal-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                  >
                    <ListChecks className="w-4 h-4 text-white" />
                    <span className="text-sm">Khám Lẻ</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* ===================== KHÁM DOANH NGHIỆP ===================== */
            <>
              <div className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tên Doanh Nghiệp / Cơ Quan:</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ví dụ: Công ty Cổ phần Công nghệ Smart OPD"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    required
                  />
                </div>

                {/* Dòng 2 cột cân đối: Người liên hệ & SĐT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Người Liên Hệ (HR / Quản Lý):</label>
                    <input
                      type="text"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="Ví dụ: Nguyễn Văn Minh"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Số Điện Thoại Liên Hệ:</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                      <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="0912 345 678"
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Dòng Email riêng biệt cân đối */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email Nhận Báo Giá & Hợp Đồng:</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Ví dụ: hr@smartopd.vn"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Quy Mô Nhân Sự:</label>
                    <select
                      value={employeeScale}
                      onChange={(e) => setEmployeeScale(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="Dưới 50 nhân sự">Dưới 50 nhân sự</option>
                      <option value="50 – 200 nhân sự">50 – 200 nhân sự</option>
                      <option value="200 – 500 nhân sự">200 – 500 nhân sự</option>
                      <option value="Trên 500 nhân sự">Trên 500 nhân sự</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Môi Trường Làm Việc Chính:</label>
                    <select
                      value={workEnvironment}
                      onChange={(e) => setWorkEnvironment(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="OFFICE">Khối Văn Phòng / IT (Ngồi nhiều, máy tính)</option>
                      <option value="FACTORY">Sản Xuất / Nhà Máy / Cơ Khí</option>
                      <option value="LOGISTICS">Vận Tải / Kho Bãi / Logistics</option>
                      <option value="SERVICE">Dịch Vụ / Bán Lẻ / F&B</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Nhu Cầu Gói Khám Của Doanh Nghiệp:</label>
                  <select
                    value={corporatePackageNeed}
                    onChange={(e) => setCorporatePackageNeed(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-semibold text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  >
                    <option value="TT32_STANDARD">Gói khám định kỳ theo chuẩn Thông tư 32/BYT (Bắt buộc)</option>
                    <option value="OFFICE_TECH">Gói khám văn phòng tầm soát cột sống, mắt & tim mạch</option>
                    <option value="VIP_EXECUTIVE">Gói khám sức khỏe VIP cho cấp Quản lý & Lãnh đạo</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Ghi Chú Y Khoa / Yêu Cầu Riêng Của Doanh Nghiệp:</label>
                  <input
                    type="text"
                    value={corporateNotes}
                    onChange={(e) => setCorporateNotes(e.target.value)}
                    placeholder="Ví dụ: Lấy mẫu xét nghiệm tại công ty, khám theo từng ca kíp, xuất hóa đơn VAT..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs text-slate-900 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>
              </div>
            </>
          )}

          {targetType === 'CORPORATE' && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {formValidationError && (
                <div className="p-3 bg-rose-50 border-2 border-rose-300 rounded-2xl flex items-center gap-2 text-xs font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{formValidationError}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  if (!validatePatientInfo()) return;
                  setExamMode('PACKAGE');
                  setIsPackageConsultationModalOpen(true);
                }}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
              >
                <Layers className="w-4 h-4 text-white" />
                <span className="text-sm">Lựa Chọn Các Gói Khám Doanh Nghiệp</span>
                <ChevronRight className="w-4 h-4 text-blue-200" />
              </button>
            </div>
          )}
        </form>
      </div>
      {/* CỬA SỔ MODAL 1: TƯ VẤN & ĐĂNG KÝ KHÁM THEO GÓI */}
      <PackageConsultationModal
        isOpen={isPackageConsultationModalOpen}
        onClose={() => setIsPackageConsultationModalOpen(false)}
        targetType={targetType}
        corporateInfo={{
          companyName,
          contactPerson,
          contactPhone,
          contactEmail,
          employeeScale,
          workEnvironment,
          corporatePackageNeed,
          corporateNotes
        }}
        patientInfo={{
          fullName: patientName,
          phone: patientPhone,
          age,
          gender,
          insuranceCard,
          initialNotes: individualNotes,
          selectedDiseases,
          medicalHistoryDetail,
          maritalStatus,
          purpose
        }}
        onProceedToBooking={(pkg) => {
          setRecommendedPackage(pkg);
          setExamMode('PACKAGE');
          setIsBookingModalOpen(true);
        }}
        mockPackages={mockPackagesDatabase}
      />

      {/* CỬA SỔ MODAL 2: CHỌN DỊCH VỤ KHÁM LẺ THEO CHUYÊN KHOA */}
      <SingleServicesModal
        isOpen={isSingleServicesModalOpen}
        onClose={() => setIsSingleServicesModalOpen(false)}
        patientInfo={{
          fullName: patientName,
          phone: patientPhone,
          age,
          gender,
          insuranceCard,
          initialNotes: individualNotes,
          selectedDiseases,
          medicalHistoryDetail,
          maritalStatus,
          purpose
        }}
        selectedServiceIds={selectedServiceIds}
        onToggleService={toggleSingleService}
        onApplyCombo={applyQuickCombo}
        onClearAll={() => setSelectedServiceIds([])}
        onProceedToBooking={() => {
          setExamMode('SINGLE');
          setIsBookingModalOpen(true);
        }}
        servicesList={singleServicesList}
        categories={majorCategories}
        quickCombos={quickCombos}
      />

      {/* MODAL 3: XEM CHI TIẾT GÓI KHÁM */}
      <PackageDetailModal
        packageData={recommendedPackage}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onProceedToBooking={handleProceedToBooking}
      />

      {/* MODAL 4: BẢNG CHỌN CƠ SỞ & THỜI GIAN KHÁM (HỖ TRỢ CẢ GÓI VÀ KHÁM LẺ) */}
      <AppointmentBookingModal
        packageData={recommendedPackage}
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onConfirmBooking={handleConfirmBooking}
        registrationInfo={currentRegistrationInfo}
        examMode={examMode}
        selectedServices={selectedServices}
      />
    </div>
  );
};
