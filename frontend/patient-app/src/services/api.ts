import type {
  ApiErrorBody,
  AuthSession,
  CreateProfileRequest,
  DemoRegistration,
  LookupProfileRequest,
  PackageSummary,
  DoctorListItem,
  DoctorDetail,
  PatientAppointment,
  PatientPackageRegistration,
  PatientProfile,
  PatientProfileUpdate,
  PatientQueueSummary,
  PatientRoute,
  PatientVisit,
  PublicConfiguration,
} from '../types/api';

const API_ROOT = '/api/v1';
const SESSION_KEY = 'smart-opd-patient-session';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonStr) as { exp?: number };
    if (!payload.exp) return false;
    // Hết hạn nếu exp * 1000 <= thời gian hiện tại
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

export function readSession(): AuthSession | null {
  const stored = sessionStorage.getItem(SESSION_KEY);
  if (!stored) return null;
  try {
    const session: AuthSession = JSON.parse(stored) as AuthSession;
    if (session.role === 'PATIENT' && session.access_token && !isTokenExpired(session.access_token)) {
      return session;
    }
    // Token không hợp lệ hoặc đã hết hạn -> tự động xóa phiên cũ
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  } catch {
    sessionStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: AuthSession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  sessionStorage.removeItem(SESSION_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`${API_ROOT}${path}`, { ...options, headers });
  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    // Log để debug
    console.error(`[API] ${options.method ?? 'GET'} ${path} → ${response.status}`, body);
    const msg = body.message ?? body.detail ?? `Lỗi ${response.status}: Không thể hoàn tất yêu cầu.`;

    // Khi nhận mã 401 Unauthorized -> Tự động xóa token lỗi và thông báo đăng nhập lại
    if (response.status === 401) {
      clearSession();
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: { message: msg } }));
    }

    throw new ApiError(msg, response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const patientApi = {
  login: (username: string, password: string) =>
    request<AuthSession>('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (input: Record<string, string>) =>
    request<DemoRegistration>('/auth/register-patient', { method: 'POST', body: JSON.stringify(input) }),
  verify: (username: string, code: string) =>
    request<AuthSession>('/auth/verify-patient', { method: 'POST', body: JSON.stringify({ username, code }) }),
  profile: (token: string) => request<PatientProfile>('/patients/me', {}, token),
  profiles: (token: string) => request<PatientProfile[]>('/patients/me/profiles', {}, token),
  createProfile: (token: string, input: CreateProfileRequest) =>
    request<PatientProfile>('/patients/me/profiles', { method: 'POST', body: JSON.stringify(input) }, token),
  linkByCode: (token: string, patientCode: string) =>
    request<PatientProfile>('/patients/me/link-by-code', {
      method: 'POST',
      body: JSON.stringify({ patient_code: patientCode }),
    }, token),
  lookupProfiles: (token: string, input: LookupProfileRequest) =>
    request<PatientProfile[]>('/patients/me/lookup', {
      method: 'POST',
      body: JSON.stringify(input),
    }, token),
  updateProfile: (token: string, input: PatientProfileUpdate) =>
    request<PatientProfile>('/patients/me', { method: 'PATCH', body: JSON.stringify(input) }, token),
  packages: () => request<PackageSummary[]>('/packages'),
  packageSchedules: (packageId: string, month?: string) =>
    request<import('../types/api').PackageAvailableSchedules>(`/packages/${packageId}/available-schedules${month ? `?month=${month}` : ''}`),
  registrations: (token: string) => request<PatientPackageRegistration[]>('/patients/me/package-registrations', {}, token),
  registerPackage: (token: string, packageId: string) =>
    request<PatientPackageRegistration>('/patients/me/package-registrations', {
      method: 'POST', body: JSON.stringify({ package_id: packageId }),
    }, token),
  payDemo: (token: string, registrationId: string) =>
    request<PatientPackageRegistration>(`/patients/me/package-registrations/${registrationId}/pay-demo`, {
      method: 'POST',
    }, token),
  appointments: (token: string) => request<PatientAppointment[]>('/patients/me/appointments', {}, token),
  createAppointment: (
    token: string,
    payloadOrRegId: string | { package_registration_id?: string; patient_id?: string; package_id?: string; doctor_schedule_id?: string; appointment_time: string; notes?: string },
    appointmentTime?: string,
  ) => {
    const body = typeof payloadOrRegId === 'string'
      ? { package_registration_id: payloadOrRegId, appointment_time: appointmentTime }
      : payloadOrRegId;
    return request<PatientAppointment>('/patients/me/appointments', {
      method: 'POST',
      body: JSON.stringify(body),
    }, token);
  },
  checkIn: (token: string, code: string) =>
    request<PatientVisit>('/patients/me/appointments/check-in', {
      method: 'POST', body: JSON.stringify({ appointment_code: code }),
    }, token),
  visits: (token: string) => request<PatientVisit[]>('/patients/me/visits', {}, token),
  route: (token: string, visitId: string) =>
    request<PatientRoute>(`/patients/me/visits/${visitId}/active-route`, {}, token),
  startRoute: (token: string, visitId: string) =>
    request<PatientRoute>(`/patients/me/visits/${visitId}/start-route`, { method: 'POST' }, token),
  recalculateRoute: (token: string, visitId: string) =>
    request<PatientRoute>(`/routes/visits/${visitId}/recalculate`, {
      method: 'POST', body: JSON.stringify({ is_proxy_action: false }),
    }, token),
  decideRoute: (token: string, routeId: string, decision: 'ACCEPTED_NEW' | 'KEPT_EXISTING') =>
    request<{ success: boolean; message: string }>(`/routes/${routeId}/decision`, {
      method: 'POST', body: JSON.stringify({ decision_type: decision, is_proxy_action: false }),
    }, token),
  queues: (token: string) => request<PatientQueueSummary[]>('/patients/me/queues', {}, token),
  publicConfig: () => request<PublicConfiguration>('/config/public'),
  doctors: (params?: { specialty?: string; day_of_week?: string; q?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.specialty) searchParams.set('specialty', params.specialty);
    if (params?.day_of_week) searchParams.set('day_of_week', params.day_of_week);
    if (params?.q) searchParams.set('q', params.q);
    const qs = searchParams.toString();
    return request<DoctorListItem[]>(`/doctors${qs ? `?${qs}` : ''}`);
  },
  specialties: () => request<string[]>('/doctors/specialties'),
  doctor: (doctorId: string) => request<DoctorDetail>(`/doctors/${doctorId}`),
};
