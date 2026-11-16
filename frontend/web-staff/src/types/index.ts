export type Role = 'ADMIN' | 'COORDINATOR' | 'DOCTOR' | 'PATIENT';

export interface Account {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  employeeCode?: string;
  assignedServicePointId?: string;
  phoneNumber?: string;
  email?: string;
  specialty?: string;
  licenseNumber?: string;
}

export interface ServicePoint {
  id: string;
  code: string;
  name: string;
  roomNumber?: string;
  resourceCount: number;
  avgServiceDurationSeconds: number;
  queueCapacity: number;
}

export interface QueuePatient {
  progressId: string;
  visitId: string;
  visitCode: string;
  patientName: string;
  isPriority: boolean;
  queueNumber: number;
  queuedAt: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  version: number;
}

export interface ServicePointQueueSummary {
  servicePointId: string;
  servicePointCode: string;
  servicePointName: string;
  roomNumber?: string;
  resourceCount: number;
  avgServiceDurationSeconds: number;
  queueCapacity: number;
  waitingCount: number;
  inProgressCount: number;
  estimatedWaitSeconds: number;
  isFull: boolean;
  waitingPatients: QueuePatient[];
  inProgressPatients: QueuePatient[];
  recentlyCompletedPatients: QueuePatient[];
}

export interface ExamService {
  id: string;
  code: string;
  name: string;
  category: string;
  hasResultWaiting: boolean;
  defaultServicePointId: string;
}

export interface Package {
  id: string;
  code: string;
  name: string;
  packageType: string;
  targetGroup?: string;
  basePrice: number;
  tierName?: string;
  services: ExamService[];
}

export interface RouteStep {
  id: string;
  stepOrder: number;
  serviceName: string;
  servicePointName: string;
  roomNumber?: string;
  status: string;
  estimatedWaitSeconds: number;
  estimatedServiceSeconds: number;
}

export interface Route {
  id: string;
  visitId?: string;
  version: number;
  status: string;
  suggestionSource: string;
  estimatedTotalDurationSeconds: number;
  steps: RouteStep[];
  isBetter?: boolean;
  improvementMinutes?: number;
  message?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  medicalHistory?: string;
  familyHistory?: string;
  allergies?: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus?: string;
  phoneNumber: string;
  email?: string;
  address?: string;
  idCardNumber?: string;
  createdAt: string;
  medicalRecords?: MedicalRecord[];
}

export interface ExamResult {
  id: string;
  visitProgressId: string;
  resultContent: string;
  attachmentUrl?: string;
  recordedById: string;
  recordedAt: string;
}

export interface Diagnosis {
  id: string;
  visitId: string;
  doctorId: string;
  icd10Code?: string;
  diagnosisDescription: string;
  diagnosedAt: string;
}

export interface PrescriptionItem {
  id?: string;
  drugName: string;
  dosage: string;
  unit: string;
  quantity: number;
  usageInstructions: string;
}

export interface Prescription {
  id: string;
  visitId: string;
  doctorId: string;
  prescribedAt: string;
  doctorAdvice?: string;
  items: PrescriptionItem[];
}

export interface TreatmentPlan {
  id: string;
  visitId: string;
  doctorId: string;
  planContent: string;
  startedAt: string;
  estimatedDurationDays?: number;
  status: string;
}

export interface Conclusion {
  id: string;
  visitId: string;
  doctorId: string;
  conclusionText: string;
  doctorRecommendation?: string;
  concludedAt: string;
}

export interface VisitSummaryServiceItem {
  progressId: string;
  serviceCode: string;
  serviceName: string;
  category: string;
  status: string;
  resultContent?: string;
  attachmentUrl?: string;
}

export interface VisitSummary {
  visitId: string;
  visitCode: string;
  checkInAt: string;
  completedAt?: string;
  patientName: string;
  patientDob: string;
  patientGender: string;
  patientPhone: string;
  patientAddress?: string;
  packageName?: string;
  doctorName?: string;
  services: VisitSummaryServiceItem[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  treatmentPlans: TreatmentPlan[];
  conclusion?: Conclusion;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  packageId?: string;
  packageName?: string;
  appointmentTime: string;
  appointmentType: 'FIRST_VISIT' | 'FOLLOW_UP' | 'PERIODIC';
  notes?: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED';
}

export interface Authorization {
  id: string;
  doctorId: string;
  doctorName: string;
  coordinatorId: string;
  coordinatorName: string;
  scope: string;
  startedAt: string;
  endedAt?: string;
  acceptedAt?: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}
