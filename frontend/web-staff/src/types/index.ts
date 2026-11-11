export type Role = 'ADMIN' | 'COORDINATOR' | 'DOCTOR' | 'PATIENT';

export interface Account {
  id: string;
  username: string;
  fullName: string;
  role: Role;
  employeeCode?: string;
  assignedServicePointId?: string;
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
  version: number;
  status: string;
  suggestionSource: string;
  estimatedTotalDurationSeconds: number;
  steps: RouteStep[];
}
