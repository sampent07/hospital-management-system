export interface AuthSession {
  access_token: string;
  role: 'PATIENT';
  username: string;
  full_name: string;
  account_id: string;
}

export interface PatientProfile {
  id: string;
  account_id: string | null;
  patient_code: string;
  full_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  marital_status: 'SINGLE' | 'MARRIED' | 'DIVORCED' | null;
  phone_number: string;
  country?: string | null;
  email: string | null;
  address: string | null;
  id_card_number: string | null;
}

export interface CreateProfileRequest {
  full_name: string;
  date_of_birth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone_number: string;
  id_card_number?: string | null;
  country?: string | null;
  email?: string | null;
  address?: string | null;
  marital_status?: 'SINGLE' | 'MARRIED' | 'DIVORCED' | null;
}

export interface LookupProfileRequest {
  last_name?: string;
  first_name?: string;
  full_name?: string;
  phone_number: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  country?: string;
  id_card_number?: string;
}

export interface PatientProfileUpdate {
  full_name?: string;
  date_of_birth?: string;
  gender?: PatientProfile['gender'];
  marital_status?: NonNullable<PatientProfile['marital_status']>;
  phone_number?: string;
  email?: string | null;
  address?: string | null;
  id_card_number?: string | null;
}

export interface DemoRegistration {
  account_id: string;
  username: string;
  verification_required: boolean;
  demo_verification_code: string;
  expires_at: string;
}

export interface ExamServiceItem {
  id: string;
  code: string;
  name: string;
  category: string;
  has_result_waiting: boolean;
  default_service_point_id: string;
  service_point_name: string | null;
}

export interface PackageSummary {
  id: string;
  code: string;
  name: string;
  package_type: string;
  target_group: string | null;
  description: string | null;
  base_price: number;
  tier_name: string | null;
  services: ExamServiceItem[];
}

export interface PatientPackageRegistration {
  id: string;
  patient_id: string;
  package_id: string;
  package_name: string;
  price_snapshot: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'PAID' | 'REJECTED';
  requested_at: string;
  reviewed_by_id: string | null;
  reviewed_at: string | null;
  paid_at: string | null;
  payment_method: 'DEMO' | null;
}

export interface DoctorScheduleSlot {
  id: string;
  doctor_id: string;
  doctor_name: string;
  specialty: string;
  service_point_id: string;
  room_number: string | null;
  room_name: string | null;
  work_date: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  current_booked: number;
  remaining_slots: number;
  status: 'AVAILABLE' | 'FULL' | 'OFF' | 'CANCELLED';
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  status: 'AVAILABLE' | 'FULL' | 'UNAVAILABLE';
  total_slots: number;
  remaining_slots: number;
  slots: DoctorScheduleSlot[];
}

export interface PackageAvailableSchedules {
  package_id: string;
  package_name: string;
  month: string; // YYYY-MM
  days: DayAvailability[];
}

export interface PatientAppointment {
  id: string;
  patient_id: string;
  patient_name?: string | null;
  package_id: string | null;
  package_name?: string | null;
  doctor_id?: string | null;
  doctor_name?: string | null;
  specialty?: string | null;
  room_number?: string | null;
  room_name?: string | null;
  package_registration_id: string | null;
  doctor_schedule_id?: string | null;
  appointment_time: string;
  appointment_type: string;
  appointment_code: string;
  qr_payload: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CHECKED_IN' | 'EXPIRED' | 'CANCELLED';
}

export interface VisitProgress {
  id: string;
  visit_id: string;
  exam_service_id: string;
  service_name: string | null;
  service_point_id: string;
  service_point_name: string | null;
  service_source: 'PACKAGE' | 'DOCTOR_ORDER';
  status: 'NOT_STARTED' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED';
  assigned_at: string;
  queued_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  version: number;
}

export interface PatientVisit {
  id: string;
  visit_code: string;
  patient_id: string;
  patient_name: string | null;
  package_id: string | null;
  package_name: string | null;
  visit_type: string;
  reception_channel: string;
  is_priority: boolean;
  queue_number: number;
  status: string;
  check_in_at: string;
  completed_at: string | null;
  progress_items: VisitProgress[];
}

export interface PatientRouteStep {
  id: string;
  visit_progress_id: string;
  step_order: number;
  service_id: string;
  service_name: string;
  service_point_id: string;
  service_point_name: string;
  room_number: string | null;
  status: VisitProgress['status'];
  estimated_wait_seconds: number;
  estimated_service_seconds: number;
}

export interface PatientRoute {
  id: string;
  visit_id: string;
  version: number;
  creation_reason: string;
  status: string;
  suggestion_source: string;
  confidence: number | null;
  latency_ms: number | null;
  estimated_total_duration_seconds: number;
  created_at: string;
  steps: PatientRouteStep[];
  is_better: boolean;
  improvement_minutes: number;
  message: string | null;
}

export interface PatientQueueSummary {
  service_point_id: string;
  service_point_code: string;
  service_point_name: string;
  room_number: string | null;
  waiting_count: number;
  in_progress_count: number;
  estimated_wait_seconds: number;
  is_full: boolean;
}

export interface ApiErrorBody {
  code?: string;
  message?: string;
  detail?: string;
}

export interface PublicConfiguration {
  facility_timezone: string;
}

export interface DoctorScheduleSlotItem {
  id: string;
  work_date: string;
  start_time: string;
  end_time: string;
  max_slots: number;
  current_booked: number;
  remaining_slots: number;
  status: 'AVAILABLE' | 'FULL' | 'OFF' | 'CANCELLED';
  service_point_id: string;
  room_number: string | null;
  room_name: string | null;
}

export interface DoctorListItem {
  id: string;
  full_name: string;
  academic_title: string;
  specialty: string;
  avatar_url: string | null;
  license_number: string;
  schedule_summary: string | null;
  service_point_id: string | null;
  room_number: string | null;
  room_name: string | null;
  available_days: string[];
}

export interface DoctorDetail {
  id: string;
  full_name: string;
  academic_title: string;
  specialty: string;
  avatar_url: string | null;
  license_number: string;
  schedule_summary: string | null;
  education: string | null;
  experience: string | null;
  memberships: string | null;
  service_point_id: string | null;
  room_number: string | null;
  room_name: string | null;
  schedules: DoctorScheduleSlotItem[];
}
