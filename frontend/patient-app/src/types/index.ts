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
