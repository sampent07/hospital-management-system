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

export interface BookingAppointment {
  packageId: string;
  packageName: string;
  targetType: 'INDIVIDUAL' | 'CORPORATE';
  facilityId: 'CS1' | 'CS2';
  facilityName: string;
  facilityAddress: string;
  appointmentDate: string;
  timeSlot: string;
  contactName: string;
  contactPhone: string;
  companyName?: string;
  estimatedEmployees?: string;
  notes?: string;
  bookingCode: string;
}
