import { MedicalExamRecord, MedicalImagingItem, PatientProfile } from '../types';

/**
 * Danh sách hình ảnh y tế mẫu (X-Quang, Siêu Âm, Nội Soi) chất lượng cao
 * Phục vụ hiển thị kết quả chẩn đoán hình ảnh chuyên sâu
 */
export const mockImagingItems: Record<string, MedicalImagingItem[]> = {
  // 1. Hồ sơ: Lê Văn Hùng (Bản thân) - Đợt khám 15/10/2026 (Tiêu hóa & Tổng quát)
  'rec-001': [
    {
      id: 'img-xray-chest-001',
      title: 'Ảnh Chụp X-Quang Ngực Thẳng KTS (Tim - Phổi)',
      modality: 'XRAY',
      modalityName: 'Chụp X-Quang KTS',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      captureTime: '15/10/2026 08:35',
      roomNumber: 'Phòng CĐHA-01 (Tầng 1)',
      technicianOrDoctor: 'BSCKI. Nguyễn Thị Lan',
      diagnosticConclusion: 'Bóng tim không lớn (Chỉ số tim ngực < 50%). Hai phế trường sáng đều, các nhánh phế huyết quản phân nhánh bình thường, góc sườn hoành hai bên sáng nhọn, không thấy tràn dịch hay tràn khí màng phổi.',
      techniqueDetails: 'Tư thế chụp: Đứng thẳng PA • Điện áp bóng: 110 kVp • Liều bức xạ: 0.02 mSv • Độ phân giải: 3000 x 3000 Matrix KTS'
    },
    {
      id: 'img-ultrasound-abdomen-001',
      title: 'Ảnh Siêu Âm Ổ Bụng Tổng Quát Màu (Gan - Mật - Thận)',
      modality: 'ULTRASOUND',
      modalityName: 'Siêu Âm Doppler Màu',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      captureTime: '15/10/2026 09:10',
      roomNumber: 'Phòng CĐHA-03 (Tầng 1)',
      technicianOrDoctor: 'ThS.BS. Lê Quang Vinh',
      diagnosticConclusion: 'Gan bờ đều, kích thước bình thường, nhu mô gan tăng hồi âm dạng hạt mịn nhẹ lan tỏa (Gan nhiễm mỡ độ 1). Túi mật thành mỏng < 2mm, lòng túi mật dịch trong, không sỏi. Hai thận kích thước bình thường, phân biệt vỏ tủy rõ, không ứ nước, không sỏi.',
      techniqueDetails: 'Đầu dò Convex 3.5 - 5.0 MHz • Chế độ: B-mode kết hợp Doppler màu xung • Đánh giá mặt cắt dọc gan phải và hạ phân thùy IV, V, VI'
    },
    {
      id: 'img-endoscopy-gastro-001',
      title: 'Ảnh Nội Soi Thực Quản - Hang Vị Dạ Dày - Tá Tràng',
      modality: 'ENDOSCOPY',
      modalityName: 'Nội Soi Tiêu Hóa HD',
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
      captureTime: '15/10/2026 09:45',
      roomNumber: 'Phòng Nội Soi 01 (Tầng 2)',
      technicianOrDoctor: 'BSCKII. Trần Hoàng Nam',
      diagnosticConclusion: 'Thực quản: Niêm mạc nhẵn bóng, đường Z nằm cách cung răng 39cm, không loét. Dạ dày: Dịch ứ trong, niêm mạc thân vị bình thường. Vùng hang vị xung huyết đỏ, có vài vết trợt nông rải rác kích thước 2-4mm, không chảy máu. Clo-test thử vi khuẩn HP: DƯƠNG TÍNH (+). Môn vị tròn đều, co bóp tốt.',
      techniqueDetails: 'Hệ thống máy nội soi Olympus EVIS EXERA III • Ống soi mềm độ phân giải cao có dải tần ánh sáng hẹp NBI nhuộm màu mô'
    }
  ],

  // 2. Hồ sơ: Lê Văn Ba (Ba - 68 tuổi) - Đợt khám 10/08/2026 (Tim Mạch & Khớp)
  'rec-003': [
    {
      id: 'img-xray-knee-003',
      title: 'Ảnh Chụp X-Quang Khớp Gối Hai Bên Thẳng & Nghiêng KTS',
      modality: 'XRAY',
      modalityName: 'Chụp X-Quang KTS',
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      captureTime: '10/08/2026 08:20',
      roomNumber: 'Phòng CĐHA-02 (Tầng 1)',
      technicianOrDoctor: 'BSCKI. Vũ Trọng Hiếu',
      diagnosticConclusion: 'Gai xương mâm chày hai bên (bên phải trội hơn), hẹp khe khớp đùi chày phía trong. Xơ đặc xương dưới sụn mức độ vừa. Kết luận: Thoái hóa khớp gối hai bên độ II theo tiêu chuẩn Kellgren & Lawrence.',
      techniqueDetails: 'Tư thế đứng chịu lực thẳng AP và nghiêng Lateral • Cường độ tia 65 kVp, 10 mAs'
    },
    {
      id: 'img-xray-spine-003',
      title: 'Ảnh Chụp X-Quang Cột Sống Thắt Lưng Cùng (L1 - L5 - S1)',
      modality: 'XRAY',
      modalityName: 'Chụp X-Quang KTS',
      imageUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      captureTime: '10/08/2026 08:40',
      roomNumber: 'Phòng CĐHA-01 (Tầng 1)',
      technicianOrDoctor: 'BSCKI. Nguyễn Thị Lan',
      diagnosticConclusion: 'Mỏ gai thoái hóa thân đốt sống L3, L4, L5. Giảm nhẹ chiều cao khe liên đốt L4-L5 và L5-S1. Độ cong sinh lý cột sống thắt lưng giảm nhẹ. Giảm đậm độ xương nghi ngờ loãng xương tuổi già.',
      techniqueDetails: 'Tư thế chụp: Thẳng AP và Nghiêng Lateral cột sống thắt lưng'
    },
    {
      id: 'img-echo-heart-003',
      title: 'Ảnh Siêu Âm Tim Doppler Màu Chuyên Sâu',
      modality: 'ULTRASOUND',
      modalityName: 'Siêu Âm Tim Doppler',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      captureTime: '10/08/2026 09:25',
      roomNumber: 'Phòng CĐHA-04 (Tầng 1)',
      technicianOrDoctor: 'BSCKII. Phạm Văn Đông',
      diagnosticConclusion: 'Dày đồng tâm thất trái mức độ nhẹ (hậu quả tăng huyết áp mạn). Giảm vận động nhẹ vùng mỏm tim (phù hợp tiền sử bệnh mạch vành). Hở van 2 lá nhẹ (1.5/4), van động mạch chủ xơ vôi nhẹ. Phân suất tống máu EF = 60%.',
      techniqueDetails: 'Máy siêu âm tim chuyên dụng GE Vivid E95 • Đầu dò Sector Matrix M5S 1.5 - 4.6 MHz • Đầy đủ mặt cắt 4 buồng, 2 buồng và trục dọc mỏm tim'
    }
  ],

  // 3. Hồ sơ: Trần Thị Mai (Mẹ - 65 tuổi) - Đợt khám 05/09/2026 (Nội tiết & Tiểu đường)
  'rec-004': [
    {
      id: 'img-us-thyroid-004',
      title: 'Ảnh Siêu Âm Tuyến Giáp Doppler Màu',
      modality: 'ULTRASOUND',
      modalityName: 'Siêu Âm Tuyến Giáp',
      imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      captureTime: '05/09/2026 08:30',
      roomNumber: 'Phòng CĐHA-03 (Tầng 1)',
      technicianOrDoctor: 'ThS.BS. Lê Quang Vinh',
      diagnosticConclusion: 'Hai thùy tuyến giáp kích thước trong giới hạn bình thường. Thùy phải có nhân đặc đồng âm kích thước 4x6mm, bờ rõ, không vôi hóa vi thể, không tăng sinh mạch máu bất thường (TIRADS 2 - Lành tính).',
      techniqueDetails: 'Đầu dò Linear tần số cao 7.5 - 12.0 MHz'
    },
    {
      id: 'img-fundus-eye-004',
      title: 'Ảnh Chụp Đáy Mắt Màu KTS (Tầm Soát Bệnh Võng Mạc Đái Tháo Đường)',
      modality: 'OTHER',
      modalityName: 'Chụp Đáy Mắt KTS',
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80',
      captureTime: '05/09/2026 09:05',
      roomNumber: 'Phòng Khám Mắt (Phòng 104)',
      technicianOrDoctor: 'BSCKI. Hoàng Mai Anh',
      diagnosticConclusion: 'Gai thị hồng rõ, ranh giới đều, tỷ lệ C/D = 0.3. Mạch máu võng mạc không co thắt bất thường. Chưa phát hiện vi phình mạch hay xuất huyết chấm võng mạc do đái tháo đường. Kết luận: Chưa có bệnh võng mạc đái tháo đường.',
      techniqueDetails: 'Máy chụp đáy mắt không giãn đồng tử Topcon TRC-NW400 góc chụp 45 độ'
    }
  ]
};

/**
 * Danh sách hồ sơ bệnh nhân trong tài khoản người dùng
 * Khởi tạo sẵn 3 hồ sơ mẫu: Bản thân, Ba, Mẹ (giống sổ địa chỉ Shopee)
 */
export const defaultPatientProfilesList: PatientProfile[] = [
  {
    id: 'prof-self',
    relationship: 'SELF',
    relationshipLabel: 'Bản thân',
    isDefault: true,
    fullName: 'Lê Văn Hùng',
    phone: '0909 123 456',
    age: 38,
    dateOfBirth: '1988-06-15',
    gender: 'MALE',
    insuranceCard: 'DN 4 79 20261111',
    idCardNumber: '079088012345',
    selectedDiseases: ['Tăng huyết áp', 'Đau dạ dày / Tiêu hóa'],
    medicalHistoryDetail: 'Tăng huyết áp phát hiện 2 năm, viêm trợt hang vị dạ dày test HP (+)',
    maritalStatus: 'MARRIED',
    address: 'Số 215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
    personalNotes: 'Dị ứng nhẹ với Penicillin liều cao, ưu tiên khám sáng'
  },
  {
    id: 'prof-dad',
    relationship: 'FATHER',
    relationshipLabel: 'Ba',
    isDefault: false,
    fullName: 'Lê Văn Ba',
    phone: '0913 888 999',
    age: 68,
    dateOfBirth: '1958-08-10',
    gender: 'MALE',
    insuranceCard: 'HT 2 79 19580810',
    idCardNumber: '079058000123',
    selectedDiseases: ['Tăng huyết áp', 'Bệnh tim mạch', 'Cơ xương khớp / Cột sống'],
    medicalHistoryDetail: 'Thoái hóa khớp gối hai bên độ 2, tiền sử đặt stent mạch vành năm 2021',
    maritalStatus: 'MARRIED',
    address: 'Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    personalNotes: 'Đi lại hơi đau khớp gối, cần hỗ trợ khi di chuyển giữa các tầng'
  },
  {
    id: 'prof-mom',
    relationship: 'MOTHER',
    relationshipLabel: 'Mẹ',
    isDefault: false,
    fullName: 'Trần Thị Mai',
    phone: '0908 654 321',
    age: 65,
    dateOfBirth: '1961-05-20',
    gender: 'FEMALE',
    insuranceCard: 'HT 2 79 19610520',
    idCardNumber: '079161000456',
    selectedDiseases: ['Đái tháo đường', 'Tăng huyết áp'],
    medicalHistoryDetail: 'Đái tháo đường type 2 đang điều trị thuốc viên kết hợp ăn kiêng',
    maritalStatus: 'MARRIED',
    address: 'Số 45 Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    personalNotes: 'Cần nhịn ăn sáng để xét nghiệm đường huyết lúc đói'
  }
];

/**
 * Danh sách toàn bộ các đợt khám của tất cả các hồ sơ
 */
export const allMockExamRecords: MedicalExamRecord[] = [
  // 1. Đợt khám của Lê Văn Hùng (Bản thân - prof-self)
  {
    id: 'rec-001',
    profileId: 'prof-self',
    patientName: 'Lê Văn Hùng',
    recordCode: 'HSBA-20261015-88',
    examDate: '15/10/2026',
    examType: 'PACKAGE',
    packageName: 'Gói Khám Tổng Quát Định Kỳ & Chuyên Sâu Tiêu Hóa',
    doctorName: 'BSCKII. Trần Hoàng Nam',
    department: 'Khoa Khám Bệnh - Nội Tổng Hợp',
    diagnosis: 'Viêm trợt niêm mạc hang vị dạ dày, test HP (+); Tăng huyết áp độ 1 (ổn định).',
    generalConclusion: 'Sức khỏe Loại II (Khá). Đang có tình trạng viêm dạ dày do vi khuẩn HP, cần tuân thủ phác đồ tiệt trừ 14 ngày và tái khám đúng hẹn. Huyết áp kiểm soát tốt.',
    imagingResults: mockImagingItems['rec-001'],
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
        resultValue: 'Tim phổi bình thường, có hình ảnh đính kèm',
        status: 'NORMAL',
        doctorNote: 'Bóng tim không to, hai phế trường sáng đều, không thâm nhiễm'
      },
      {
        name: 'Siêu Âm Ổ Bụng Tổng Quát KTS',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-03',
        resultValue: 'Gan nhiễm mỡ độ 1 nhẹ, có hình ảnh đính kèm',
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

  // 2. Đợt khám thứ 2 của Lê Văn Hùng (prof-self)
  {
    id: 'rec-002',
    profileId: 'prof-self',
    patientName: 'Lê Văn Hùng',
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
        doctorNote: 'Thể trạng cân đối, huyết áp bình thường'
      },
      {
        name: 'Khám Mắt & Thị Lực',
        category: 'Lâm sàng',
        roomNumber: 'Phòng 104',
        resultValue: 'Mắt phải: 10/10 | Mắt trái: 9/10',
        status: 'NORMAL',
        doctorNote: 'Thị lực tốt, không có tật khúc xạ nặng'
      },
      {
        name: 'Bộ Mỡ Máu (Lipid Profile)',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: 'Cholesterol TP: 5.8 mmol/L | Triglyceride: 2.1 mmol/L',
        status: 'ATTENTION',
        doctorNote: 'Chỉ số mỡ máu hơi cao so với mức khuyến nghị'
      }
    ],
    doctorAdvice: 'Tập thể dục ít nhất 30 phút mỗi ngày, hạn chế ngồi liên tục quá 60 phút trước màn hình máy tính.'
  },

  // 3. Đợt khám của Ba: Lê Văn Ba (prof-dad)
  {
    id: 'rec-003',
    profileId: 'prof-dad',
    patientName: 'Lê Văn Ba (Ba)',
    recordCode: 'HSBA-20260810-15',
    examDate: '10/08/2026',
    examType: 'PACKAGE',
    packageName: 'Gói Tầm Soát Chuyên Sâu Tim Mạch & Đột Quỵ (Người Cao Tuổi)',
    doctorName: 'BSCKII. Phạm Văn Đông',
    department: 'Khoa Tim Mạch - Lão Khoa',
    diagnosis: 'Tăng huyết áp độ 2 (đang kiểm soát thuốc); Thiếu máu cơ tim cục bộ mạn; Thoái hóa khớp gối hai bên độ 2.',
    generalConclusion: 'Sức khỏe Loại III (Trung bình). Chức năng tim mạch được bảo tồn tốt, cần tiếp tục duy trì thuốc huyết áp và thuốc chống kết tập tiểu cầu. Khớp gối thoái hóa cần tập vật lý trị liệu nhẹ nhàng, tránh mang vác nặng hay ngồi xổm.',
    imagingResults: mockImagingItems['rec-003'],
    serviceResults: [
      {
        name: 'Khám Chuyên Khoa Tim Mạch & Đo Huyết Áp',
        category: 'Lâm sàng',
        roomNumber: 'Phòng 103',
        resultValue: '135/85 mmHg - Nhịp tim 68 l/p',
        status: 'NORMAL',
        doctorNote: 'Huyết áp kiểm soát ổn với phác đồ hiện tại'
      },
      {
        name: 'Đo Điện Tâm Đồ (ECG 12 Đạo Trình)',
        category: 'Thăm dò chức năng',
        roomNumber: 'Phòng TDCN-01',
        resultValue: 'Nhịp xoang đều, dày thất trái nhẹ',
        status: 'ATTENTION',
        doctorNote: 'Phù hợp tiền sử tăng huyết áp lâu năm'
      },
      {
        name: 'Siêu Âm Tim Doppler Màu Chuyên Sâu',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-04',
        resultValue: 'EF = 60%, dày thất trái nhẹ, có ảnh đính kèm',
        status: 'NORMAL',
        doctorNote: 'Chức năng bóp thất trái tốt, không rối loạn vận động vùng nặng'
      },
      {
        name: 'Chụp X-Quang Khớp Gối Hai Bên KTS',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-02',
        resultValue: 'Thoái hóa khớp gối độ 2, có hình ảnh đính kèm',
        status: 'ATTENTION',
        doctorNote: 'Gai mâm chày hai bên, hẹp nhẹ khe khớp'
      },
      {
        name: 'Sinh Hóa Máu Chức Năng Thận & Điện Giải Đồ',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: 'Ure: 5.6 mmol/L | Creatinine: 85 umol/L (eGFR: 78)',
        status: 'NORMAL',
        doctorNote: 'Chức năng lọc cầu thận bình thường theo lứa tuổi'
      }
    ],
    prescription: [
      {
        drugName: 'Amlodipine 5mg',
        dosage: '1 viên / ngày',
        usage: 'Uống vào buổi sáng sau ăn',
        quantity: '30 viên'
      },
      {
        drugName: 'Glucosamine Sulfate 1500mg',
        dosage: '1 gói / ngày',
        usage: 'Hòa tan vào nước uống trong bữa ăn',
        quantity: '30 gói'
      }
    ],
    doctorAdvice: 'Đi bộ vừa sức 20-30 phút mỗi ngày trên đường bằng, tránh leo cầu thang nhiều, theo dõi huyết áp tại nhà 2 lần/ngày.',
    followUpRecommendation: 'Tái khám định kỳ chuyên khoa Tim mạch sau 3 tháng hoặc khi có biểu hiện đau tức ngực bất thường.'
  },

  // 4. Đợt khám của Mẹ: Trần Thị Mai (prof-mom)
  {
    id: 'rec-004',
    profileId: 'prof-mom',
    patientName: 'Trần Thị Mai (Mẹ)',
    recordCode: 'HSBA-20260905-09',
    examDate: '05/09/2026',
    examType: 'PACKAGE',
    packageName: 'Gói Tầm Soát Đái Tháo Đường & Nội Tiết Chuyên Sâu',
    doctorName: 'BSCKI. Vũ Thị Bích Phượng',
    department: 'Khoa Nội Tiết - Đái Tháo Đường',
    diagnosis: 'Đái tháo đường type 2 (HbA1c 6.8% - Kiểm soát mức đạt mục tiêu); Tăng huyết áp độ 1; Nhân thùy phải tuyến giáp TIRADS 2.',
    generalConclusion: 'Sức khỏe Loại II. Đường huyết và chỉ số HbA1c kiểm soát tốt theo mục tiêu điều trị ở người cao tuổi. Tuyến giáp lành tính, theo dõi siêu âm định kỳ mỗi năm.',
    imagingResults: mockImagingItems['rec-004'],
    serviceResults: [
      {
        name: 'Đường Huyết Đói & Chỉ Số HbA1c',
        category: 'Xét nghiệm',
        roomNumber: 'Phòng XN-02',
        resultValue: 'Glucose: 6.2 mmol/L | HbA1c: 6.8%',
        status: 'NORMAL',
        doctorNote: 'Mức HbA1c đạt mục tiêu < 7.0% rất tốt'
      },
      {
        name: 'Siêu Âm Tuyến Giáp Doppler Màu',
        category: 'Chẩn đoán hình ảnh',
        roomNumber: 'Phòng CĐHA-03',
        resultValue: 'Nhân thùy phải tuyến giáp TIRADS 2, có ảnh đính kèm',
        status: 'NORMAL',
        doctorNote: 'Nang keo lành tính, kích thước nhỏ không cần chọc hút'
      },
      {
        name: 'Chụp Đáy Mắt KTS Tầm Soát Võng Mạc',
        category: 'Thăm dò chức năng',
        roomNumber: 'Phòng 104',
        resultValue: 'Đáy mắt bình thường, có hình ảnh đính kèm',
        status: 'NORMAL',
        doctorNote: 'Chưa có biến chứng vi mạch đáy mắt do tiểu đường'
      }
    ],
    prescription: [
      {
        drugName: 'Metformin 850mg',
        dosage: '1 viên / lần x 2 lần / ngày',
        usage: 'Uống trong hoặc ngay sau bữa ăn trưa và tối',
        quantity: '60 viên'
      }
    ],
    doctorAdvice: 'Tiếp tục duy trì chế độ ăn hạn chế tinh bột trắng, tăng cường rau xanh, kiểm tra đường huyết mao mạch định kỳ.',
    followUpRecommendation: 'Tái khám định kỳ chuyên khoa Nội tiết sau 3 tháng để xét nghiệm lại HbA1c.'
  }
];
