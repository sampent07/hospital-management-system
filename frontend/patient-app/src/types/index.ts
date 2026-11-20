export interface RouteStep {
  id: string;
  stepOrder: number;
  serviceId: string;
  serviceName: string;
  servicePointId: string;
  servicePointName: string;
  roomNumber?: string;
  status: 'NOT_STARTED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  estimatedWaitSeconds: number;
  estimatedServiceSeconds: number;
}

export interface Route {
  id: string;
  visitId: string;
  version: number;
  creationReason: string;
  status: string;
  suggestionSource: string;
  confidence?: number;
  estimatedTotalDurationSeconds: number;
  steps: RouteStep[];
  isBetter?: boolean;
  message?: string;
}

export interface PackageAdvisorResult {
  recommended_package?: {
    id: string;
    code: string;
    name: string;
    base_price: number;
    description?: string;
  };
  explanation: string;
  warning_disclaimer: string;
}

export interface PatientUser {
  id: string;
  username: string;
  fullName: string;
  patientCode: string;
  visitId: string;
  queueNumber: string;
  gender: string;
  age: number;
}

export interface PatientProfile {
  id: string; // Mã định danh hồ sơ (e.g. "prof-self", "prof-dad", ...)
  relationship: 'SELF' | 'FATHER' | 'MOTHER' | 'GRANDFATHER' | 'GRANDMOTHER' | 'SPOUSE' | 'CHILD' | 'OTHER' | string;
  relationshipLabel?: string; // Nhãn hiển thị quan hệ: "Bản thân", "Ba", "Mẹ", "Ông", "Bà", "Vợ/Chồng", "Con",...
  isDefault?: boolean; // Hồ sơ mặc định của chủ tài khoản
  fullName: string;
  phone: string;
  age: number;
  dateOfBirth?: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | string;
  insuranceCard: string;
  idCardNumber?: string;
  selectedDiseases: string[];
  medicalHistoryDetail: string;
  maritalStatus: string;
  address?: string;
  personalNotes?: string;
}

export interface MedicalImagingItem {
  id: string;
  title: string; // ví dụ: "Ảnh X-Quang Ngực Thẳng KTS", "Ảnh Siêu Âm Gan Mật", "Ảnh Nội Soi Dạ Dày"
  modality: 'XRAY' | 'ULTRASOUND' | 'ENDOSCOPY' | 'CT' | 'MRI' | 'ECG' | 'OTHER';
  modalityName: string; // "Chụp X-Quang", "Siêu Âm KTS", "Nội Soi Tiêu Hóa"
  imageUrl: string; // Link / SVG data biểu diễn ảnh y tế trực quan
  captureTime: string; // Ngày giờ chụp
  roomNumber: string; // Phòng chụp
  technicianOrDoctor: string; // Bác sĩ / KTV thực hiện
  diagnosticConclusion: string; // Kết luận hình ảnh y khoa
  techniqueDetails?: string; // Thông số kỹ thuật chụp
}

export interface PackageDetail {
  id: string;
  code: string;
  name: string;
  targetType: 'INDIVIDUAL' | 'CORPORATE';
  basePrice: number;
  priceUnitText?: string;
  discountNote?: string;
  targetAudienceText: string;
  description: string;
  clinicalServices: string[];
  imagingServices: string[];
  laboratoryServices: string[];
  functionalServices: string[];
  benefits: string[];
}

export interface SingleServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  categoryId?: string;
  categoryName?: string;
  roomNumber: string;
  price: number;
  estimatedMinutes: number;
  preparationNote?: string;
}

export interface ServiceCategoryGroup {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
}

export interface BookingAppointment {
  packageId?: string;
  packageName: string;
  targetType: 'INDIVIDUAL' | 'CORPORATE';
  examMode?: 'PACKAGE' | 'SINGLE';
  selectedServices?: SingleServiceItem[];
  totalPrice?: number;
  facilityId: 'CS1' | 'CS2';
  facilityName: string;
  facilityAddress: string;
  appointmentDate: string;
  timeSlot: string;
  contactName: string;
  contactPhone: string;
  relationship?: string;
  relationshipLabel?: string;
  profileId?: string;
  patientAge?: number;
  patientGender?: string;
  insuranceCardNumber?: string;
  medicalHistory?: string;
  companyName?: string;
  estimatedEmployees?: string;
  maleEmployees?: number;
  femaleEmployees?: number;
  totalEmployees?: number;
  email?: string;
  notes?: string;
  bookingCode: string;
  status?: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentStatus?: 'PAID_QR' | 'PAY_AT_COUNTER' | 'PENDING';
  paymentMethod?: 'VIETQR' | 'COUNTER';
  paidAt?: string;
  resultRecordCode?: string;
}

export interface PatientNotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'URGENT' | 'APPOINTMENT' | 'RESULT' | 'ROUTE' | 'SYSTEM';
  targetTab: 'profile' | 'packages' | 'advisor' | 'results' | 'appointments' | 'queues';
  isRead: boolean;
  actionLabel?: string;
}

export interface ServiceResultDetail {
  name: string;
  category: string;
  roomNumber: string;
  resultValue: string;
  normalRange?: string;
  unit?: string;
  status: 'NORMAL' | 'ABNORMAL' | 'ATTENTION';
  doctorNote?: string;
}

export interface MedicalExamRecord {
  id: string;
  profileId?: string; // ID hồ sơ tương ứng (ví dụ: "prof-self", "prof-dad", "prof-mom")
  patientName?: string; // Tên bệnh nhân của đợt khám này
  recordCode: string; // ví dụ: "HSBA-20261015-88"
  examDate: string; // Ngày, tháng khám: "15/10/2026"
  examType: 'PACKAGE' | 'SINGLE';
  packageName: string; // Tên gói hoặc dịch vụ khám
  doctorName: string; // Bác sĩ phụ trách kết luận
  department: string;
  diagnosis: string; // Chẩn đoán của đợt khám
  generalConclusion: string; // Kết luận tổng quát
  serviceResults: ServiceResultDetail[]; // Kết quả chi tiết từng dịch vụ
  imagingResults?: MedicalImagingItem[]; // Kết quả ảnh chụp X-Quang, Siêu Âm, Nội Soi
  prescription?: Array<{
    drugName: string;
    dosage: string;
    usage: string;
    quantity: string;
  }>;
  doctorAdvice: string; // Lời dặn của bác sĩ
  followUpRecommendation?: string; // Khuyến cáo tái khám từ bác sĩ
}

export interface DoctorFollowUpAppointment {
  id: string;
  appointmentCode: string; // ví dụ: "TH-20261125-0101"
  appointmentDate: string; // ví dụ: "25/11/2026"
  appointmentTime: string; // ví dụ: "08:30"
  dayOfWeek: string; // ví dụ: "Thứ Hai"
  doctorName: string; // ví dụ: "BSCKII. Trần Hoàng Nam"
  doctorTitle: string; // ví dụ: "Trưởng khoa Nội Tiêu Hóa"
  department: string; // ví dụ: "Khoa Nội Tiêu Hóa"
  roomNumber: string; // ví dụ: "Phòng 101 - Tầng 1"
  facilityName: string; // ví dụ: "Bệnh viện Đa Khoa Smart OPD (Cơ sở 1)"
  facilityAddress: string;
  purpose: string; // Mục đích tái khám bác sĩ chỉ định
  originalExamDate: string; // Đợt khám gốc liên quan
  originalRecordCode: string;
  preparationInstructions: string[]; // Bác sĩ dặn dò chuẩn bị trước khi đến
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  isDoctorAssignedOnly: boolean; // Chỉ bác sĩ đặt, bệnh nhân không tự đặt được
  notes?: string;
}
