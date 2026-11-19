import { BookingAppointment, Route, RouteStep } from '../types';

/**
 * Tự động sinh lộ trình di chuyển và thứ tự phòng khám (Route)
 * tương ứng chính xác với Gói khám hoặc Các dịch vụ lẻ mà bệnh nhân đã đăng ký thành công.
 */
export function buildRouteForBooking(
  booking: BookingAppointment,
  visitId: string = 'VK-20261111-001'
): Route {
  let steps: RouteStep[] = [];

  // TRƯỜNG HỢP 1: KHÁM LẺ THEO CÁC DỊCH VỤ BỆNH NHÂN TỰ CHỌN
  if (booking.examMode === 'SINGLE' && booking.selectedServices && booking.selectedServices.length > 0) {
    steps = booking.selectedServices.map((srv, idx) => ({
      id: `step-${srv.id || idx + 1}`,
      stepOrder: idx + 1,
      serviceId: srv.id,
      serviceName: srv.name,
      servicePointId: `sp-${srv.categoryId || 'clinic'}`,
      servicePointName: srv.categoryName || srv.category || 'Phòng Khám Chuyên Khoa',
      roomNumber: srv.roomNumber || 'Phòng 101',
      status: idx === 0 ? 'IN_PROGRESS' : 'NOT_STARTED',
      estimatedWaitSeconds: 180 + idx * 120,
      estimatedServiceSeconds: (srv.estimatedMinutes || 10) * 60
    }));
  } else {
    // TRƯỜNG HỢP 2: KHÁM THEO GÓI SỨC KHỎE
    const pkgId = booking.packageId || '';
    const pkgName = (booking.packageName || '').toLowerCase();

    if (
      pkgId === 'pkg-digestive-general' ||
      pkgName.includes('tiêu hóa') ||
      booking.bookingCode === 'DK-20261015-88'
    ) {
      steps = [
        {
          id: 'step-dg-1',
          stepOrder: 1,
          serviceId: 'srv-kham-noi',
          serviceName: 'Khám Thể Lực & Nội Tổng Quát',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-dg-2',
          stepOrder: 2,
          serviceId: 'srv-test-hp',
          serviceName: 'Test Vi Khuẩn HP Dạ Dày Qua Hơi Thở C14',
          servicePointId: 'sp-func',
          servicePointName: 'Phòng Thăm Dò Chức Năng',
          roomNumber: 'Phòng TDCN-02',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-dg-3',
          stepOrder: 3,
          serviceId: 'srv-noi-soi-daday',
          serviceName: 'Nội Soi Thực Quản - Dạ Dày - Tá Tràng',
          servicePointId: 'sp-endoscopy',
          servicePointName: 'Phòng Nội Soi Tiêu Hóa',
          roomNumber: 'Phòng Nội Soi 01',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-dg-4',
          stepOrder: 4,
          serviceId: 'srv-xn-cbc',
          serviceName: 'Tổng Phân Tích Tế Bào Máu (CBC 18 chỉ số)',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-01',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-dg-5',
          stepOrder: 5,
          serviceId: 'srv-xn-glucose-gan',
          serviceName: 'Sinh Hóa Đường Huyết & Men Gan AST/ALT',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Xét Nghiệm Sinh Hóa',
          roomNumber: 'Phòng XN-02',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-dg-6',
          stepOrder: 6,
          serviceId: 'srv-xq-nguc',
          serviceName: 'Chụp X-Quang Ngực Thẳng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-dg-7',
          stepOrder: 7,
          serviceId: 'srv-sieu-am-bung',
          serviceName: 'Siêu Âm Ổ Bụng Tổng Quát KTS',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm KTS',
          roomNumber: 'Phòng CĐHA-03',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-dg-8',
          stepOrder: 8,
          serviceId: 'srv-ket-luan-bs',
          serviceName: 'Bác Sĩ Chuyên Khoa Kết Luận & Kê Đơn Thuốc',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội (BSCKII. Trần Hoàng Nam)',
          roomNumber: 'Phòng 101',
          status: 'COMPLETED',
          estimatedWaitSeconds: 0,
          estimatedServiceSeconds: 600
        }
      ];
    } else if (pkgId === 'basic-general' || pkgName.includes('cơ bản') || pkgName.includes('tiết kiệm')) {
      steps = [
        {
          id: 'step-bg-1',
          stepOrder: 1,
          serviceId: 'srv-kham-noi',
          serviceName: 'Khám Thể Lực & Nội Tổng Quát',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-bg-2',
          stepOrder: 2,
          serviceId: 'srv-kham-tmh',
          serviceName: 'Khám Tai - Mũi - Họng & Nội Soi',
          servicePointId: 'sp-ent',
          servicePointName: 'Phòng Tai Mũi Họng',
          roomNumber: 'Phòng 103',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-bg-3',
          stepOrder: 3,
          serviceId: 'srv-kham-mat',
          serviceName: 'Khám Chuyên Khoa Mắt & Đo Khúc Xạ',
          servicePointId: 'sp-eye',
          servicePointName: 'Phòng Mắt',
          roomNumber: 'Phòng 104',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-bg-4',
          stepOrder: 4,
          serviceId: 'srv-xq-nguc',
          serviceName: 'Chụp X-Quang Ngực Thẳng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 420,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-bg-5',
          stepOrder: 5,
          serviceId: 'srv-xn-mau',
          serviceName: 'Tổng Phân Tích Tế Bào Máu (CBC 18 chỉ số)',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 240
        },
        {
          id: 'step-bg-6',
          stepOrder: 6,
          serviceId: 'srv-sieu-am-bung',
          serviceName: 'Siêu Âm Ổ Bụng Tổng Quát',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 600,
          estimatedServiceSeconds: 600
        }
      ];
    } else if (pkgId === 'male-general' || pkgName.includes('nam giới')) {
      steps = [
        {
          id: 'step-mg-1',
          stepOrder: 1,
          serviceId: 'srv-kham-noi',
          serviceName: 'Khám Nội Tổng Quát & Nam Học',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-mg-2',
          stepOrder: 2,
          serviceId: 'srv-xq-nguc',
          serviceName: 'Chụp X-Quang Ngực Thẳng KTS (Tim Phổi)',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-mg-3',
          stepOrder: 3,
          serviceId: 'srv-xn-mau-gan-than',
          serviceName: 'Xét Nghiệm Men Gan, Chức Năng Thận & Mỡ Máu',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 420,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-mg-4',
          stepOrder: 4,
          serviceId: 'srv-ecg',
          serviceName: 'Đo Điện Tâm Đồ (ECG 12 Đạo Trình)',
          servicePointId: 'sp-function',
          servicePointName: 'Phòng Thăm Dò Chức Năng',
          roomNumber: 'Phòng TDCN-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 360
        },
        {
          id: 'step-mg-5',
          stepOrder: 5,
          serviceId: 'srv-sieu-am-bung-tiet-nieu',
          serviceName: 'Siêu Âm Ổ Bụng & Hệ Tiết Niệu Nam',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 480,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-mg-6',
          stepOrder: 6,
          serviceId: 'srv-ket-luan',
          serviceName: 'Bác Sĩ Trưởng Khoa Kết Luận & Tư Vấn Sức Khỏe',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Tư Vấn Bác Sĩ',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        }
      ];
    } else if (pkgId === 'female-general' || pkgName.includes('nữ giới')) {
      steps = [
        {
          id: 'step-fg-1',
          stepOrder: 1,
          serviceId: 'srv-kham-noi',
          serviceName: 'Khám Nội Tổng Quát',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-fg-2',
          stepOrder: 2,
          serviceId: 'srv-kham-phu-khoa',
          serviceName: 'Khám Phụ Khoa & Soi Tươi Dịch Âm Đạo',
          servicePointId: 'sp-gyn',
          servicePointName: 'Phòng Sản Phụ Khoa',
          roomNumber: 'Phòng 102',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 480,
          estimatedServiceSeconds: 720
        },
        {
          id: 'step-fg-3',
          stepOrder: 3,
          serviceId: 'srv-sa-tuyen-vu',
          serviceName: 'Siêu Âm Tuyến Vú & Tử Cung Buồng Trứng',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-fg-4',
          stepOrder: 4,
          serviceId: 'srv-xq-nguc',
          serviceName: 'Chụp X-Quang Ngực Thẳng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-fg-5',
          stepOrder: 5,
          serviceId: 'srv-xn-mau-noi-tiet',
          serviceName: 'Xét Nghiệm Sinh Hóa Máu & Tuyến Giáp',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-fg-6',
          stepOrder: 6,
          serviceId: 'srv-ket-luan-nu',
          serviceName: 'Bác Sĩ Kết Luận & Kê Đơn Tư Vấn',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Tư Vấn Bác Sĩ',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 480
        }
      ];
    } else if (pkgId === 'digestive-gastro' || pkgName.includes('tiêu hóa') || pkgName.includes('dạ dày')) {
      steps = [
        {
          id: 'step-dg-1',
          stepOrder: 1,
          serviceId: 'srv-kham-tieu-hoa',
          serviceName: 'Khám Chuyên Khoa Tiêu Hóa & Dạ Dày',
          servicePointId: 'sp-gastro',
          servicePointName: 'Phòng Tiêu Hóa',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-dg-2',
          stepOrder: 2,
          serviceId: 'srv-test-hp',
          serviceName: 'Test Vi Khuẩn HP Dạ Dày Qua Hơi Thở C14',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-dg-3',
          stepOrder: 3,
          serviceId: 'srv-sa-bung-gastro',
          serviceName: 'Siêu Âm Ổ Bụng Chuyên Sâu Dạ Dày - Gan Mật',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 420,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-dg-4',
          stepOrder: 4,
          serviceId: 'srv-noi-soi-da-day',
          serviceName: 'Nội Soi Dạ Dày & Tá Tràng (Gây Mê Êm Ái)',
          servicePointId: 'sp-endoscopy',
          servicePointName: 'Phòng Nội Soi',
          roomNumber: 'Phòng TDCN-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 600,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-dg-5',
          stepOrder: 5,
          serviceId: 'srv-tu-van-don-thuoc',
          serviceName: 'Tư Vấn Phác Đồ Tiệt Trừ HP & Chế Độ Dinh Dưỡng',
          servicePointId: 'sp-gastro',
          servicePointName: 'Phòng Tiêu Hóa',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        }
      ];
    } else if (pkgId === 'senior-comprehensive' || pkgName.includes('tim mạch') || pkgName.includes('đột quỵ')) {
      steps = [
        {
          id: 'step-sc-1',
          stepOrder: 1,
          serviceId: 'srv-kham-tim-mach',
          serviceName: 'Khám Chuyên Khoa Tim Mạch & Huyết Áp',
          servicePointId: 'sp-cardio',
          servicePointName: 'Phòng Khám Tim Mạch',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 720
        },
        {
          id: 'step-sc-2',
          stepOrder: 2,
          serviceId: 'srv-ecg-senior',
          serviceName: 'Đo Điện Tâm Đồ (ECG 12 Cần)',
          servicePointId: 'sp-function',
          servicePointName: 'Phòng Thăm Dò Chức Năng',
          roomNumber: 'Phòng TDCN-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 360
        },
        {
          id: 'step-sc-3',
          stepOrder: 3,
          serviceId: 'srv-sa-tim',
          serviceName: 'Siêu Âm Tim Doppler Màu Chuyên Sâu',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm Tim',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 480,
          estimatedServiceSeconds: 720
        },
        {
          id: 'step-sc-4',
          stepOrder: 4,
          serviceId: 'srv-xq-nguc-sc',
          serviceName: 'Chụp X-Quang Ngực Thẳng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-sc-5',
          stepOrder: 5,
          serviceId: 'srv-xn-mo-mau-dong-mau',
          serviceName: 'Xét Nghiệm Bộ Mỡ Máu & Đông Máu Phòng Đột Quỵ',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 420,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-sc-6',
          stepOrder: 6,
          serviceId: 'srv-hoi-chan-tim-mach',
          serviceName: 'Bác Sĩ Chuyên Gia Tim Mạch Hội Chẩn & Kê Đơn',
          servicePointId: 'sp-cardio',
          servicePointName: 'Phòng Tim Mạch',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 900
        }
      ];
    } else if (pkgId.includes('corp-office') || pkgName.includes('văn phòng')) {
      steps = [
        {
          id: 'step-co-1',
          stepOrder: 1,
          serviceId: 'srv-kham-cot-song',
          serviceName: 'Khám Nội & Đánh Giá Cột Sống Cổ - Thắt Lưng',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-co-2',
          stepOrder: 2,
          serviceId: 'srv-kham-mat-it',
          serviceName: 'Khám Mắt Tầm Soát Hội Chứng Thị Giác Máy Tính',
          servicePointId: 'sp-eye',
          servicePointName: 'Phòng Mắt',
          roomNumber: 'Phòng 104',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-co-3',
          stepOrder: 3,
          serviceId: 'srv-xq-cot-song',
          serviceName: 'Chụp X-Quang Cột Sống Cổ / Thắt Lưng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 420,
          estimatedServiceSeconds: 360
        },
        {
          id: 'step-co-4',
          stepOrder: 4,
          serviceId: 'srv-ecg-co',
          serviceName: 'Đo Điện Tim ECG (Tầm Soát Rối Loạn Nhịp Do Căng Thẳng)',
          servicePointId: 'sp-function',
          servicePointName: 'Phòng Thăm Dò Chức Năng',
          roomNumber: 'Phòng TDCN-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 360
        },
        {
          id: 'step-co-5',
          stepOrder: 5,
          serviceId: 'srv-xn-mau-mo-co',
          serviceName: 'Xét Nghiệm Mỡ Máu, Đường Huyết & Men Gan',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-co-6',
          stepOrder: 6,
          serviceId: 'srv-tu-van-cong-thai-hoc',
          serviceName: 'Tư Vấn Công Thái Học & Báo Cáo Sức Khỏe Doanh Nghiệp',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 480
        }
      ];
    } else if (pkgId.includes('corp-vip') || pkgName.includes('vip') || pkgName.includes('lãnh đạo')) {
      steps = [
        {
          id: 'step-cv-1',
          stepOrder: 1,
          serviceId: 'srv-kham-vip-noi',
          serviceName: 'Tiếp Đón Phòng Chờ VIP & Khám Nội Chuyên Gia',
          servicePointId: 'sp-vip',
          servicePointName: 'Khu Khám VIP',
          roomNumber: 'Phòng VIP-01',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 120,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-cv-2',
          stepOrder: 2,
          serviceId: 'srv-sa-tim-doppler',
          serviceName: 'Siêu Âm Tim Doppler & Động Mạch Cảnh',
          servicePointId: 'sp-ultrasound',
          servicePointName: 'Phòng Siêu Âm VIP',
          roomNumber: 'Phòng CĐHA-03',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 900
        },
        {
          id: 'step-cv-3',
          stepOrder: 3,
          serviceId: 'srv-msct-nguc',
          serviceName: 'Chụp Cắt Lớp MSCT Lồng Ngực Liều Thấp',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chẩn Đoán Hình Ảnh',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-cv-4',
          stepOrder: 4,
          serviceId: 'srv-xn-dau-an-ung-thu',
          serviceName: 'Bộ Xét Nghiệm Dấu Ấn Ung Thư Sớm Chuyên Sâu',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Xét Nghiệm VIP',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 180,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-cv-5',
          stepOrder: 5,
          serviceId: 'srv-ecg-xo-vua',
          serviceName: 'Đo Xơ Vữa Động Mạch & Điện Tim Gắng Sức',
          servicePointId: 'sp-function',
          servicePointName: 'Phòng Thăm Dò Chức Năng',
          roomNumber: 'Phòng TDCN-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 600
        },
        {
          id: 'step-cv-6',
          stepOrder: 6,
          serviceId: 'srv-tu-van-giao-su',
          serviceName: 'Giáo Sư / Bác Sĩ Trưởng Khoa Tư Vấn Sức Khỏe 1:1',
          servicePointId: 'sp-vip',
          servicePointName: 'Khu Khám VIP',
          roomNumber: 'Phòng VIP-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 120,
          estimatedServiceSeconds: 1200
        }
      ];
    } else {
      // MẶC ĐỊNH CHO CÁC GÓI DOANH NGHIỆP HOẶC GÓI CHUẨN KHÁC
      steps = [
        {
          id: 'step-def-1',
          stepOrder: 1,
          serviceId: 'srv-kham-the-luc',
          serviceName: 'Khám Thể Lực & Phân Loại Sức Khỏe',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'IN_PROGRESS',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-def-2',
          stepOrder: 2,
          serviceId: 'srv-kham-chuyen-khoa',
          serviceName: 'Khám Mắt, Tai Mũi Họng & Răng Hàm Mặt',
          servicePointId: 'sp-specialty',
          servicePointName: 'Phòng Liên Chuyên Khoa',
          roomNumber: 'Phòng 103',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 240,
          estimatedServiceSeconds: 480
        },
        {
          id: 'step-def-3',
          stepOrder: 3,
          serviceId: 'srv-xq-phoi',
          serviceName: 'Chụp X-Quang Phổi Thẳng KTS',
          servicePointId: 'sp-imaging',
          servicePointName: 'Phòng Chụp X-Quang',
          roomNumber: 'Phòng CĐHA-01',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-def-4',
          stepOrder: 4,
          serviceId: 'srv-xn-mau-nuoc-tieu',
          serviceName: 'Tổng Phân Tích Máu & Nước Tiểu 10 Chỉ Số',
          servicePointId: 'sp-lab',
          servicePointName: 'Phòng Lấy Mẫu Xét Nghiệm',
          roomNumber: 'Phòng XN-02',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 360,
          estimatedServiceSeconds: 300
        },
        {
          id: 'step-def-5',
          stepOrder: 5,
          serviceId: 'srv-ket-luan-tt32',
          serviceName: 'Đánh Giá Hồ Sơ & Kết Luận Phân Loại Sức Khỏe',
          servicePointId: 'sp-internal',
          servicePointName: 'Phòng Khám Nội',
          roomNumber: 'Phòng 101',
          status: 'NOT_STARTED',
          estimatedWaitSeconds: 300,
          estimatedServiceSeconds: 360
        }
      ];
    }
  }

  // Nếu gói khám đã ở quá khứ (đã khám xong) -> tất cả bước đều tính hoàn thành
  if (booking.status === 'COMPLETED') {
    steps = steps.map((s) => ({
      ...s,
      status: 'COMPLETED',
      estimatedWaitSeconds: 0
    }));
  }

  const totalWait = steps.reduce((sum, s) => sum + s.estimatedWaitSeconds, 0);
  const totalService = steps.reduce((sum, s) => sum + s.estimatedServiceSeconds, 0);

  return {
    id: `route-${booking.bookingCode || Date.now()}`,
    visitId: visitId,
    version: 1,
    creationReason: 'REGISTERED_PACKAGE',
    status: booking.status === 'COMPLETED' ? 'COMPLETED' : 'ACTIVE',
    suggestionSource: 'AI_RL',
    estimatedTotalDurationSeconds: booking.status === 'COMPLETED' ? 48 * 60 : totalWait + totalService,
    steps
  };
}
