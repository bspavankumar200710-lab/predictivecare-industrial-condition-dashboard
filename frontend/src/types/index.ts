export interface Machine {
  id: number;
  machineName: string;
  machineCode: string;
  machineType?: string;
  location?: string;
  status?: string;
  installationDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isDemoData?: boolean;
}

export interface Sensor {
  id: number;
  sensorType: string;
  thresholdValue?: number;
  unit?: string;
}

export interface SensorReading {
  id: number;
  machine?: Machine;
  machineId?: number;
  sensor?: Sensor;
  sensorId?: number;
  readingValue: number;
  temperature: number;
  vibration: number;
  operatingHours: number;
  healthScore: number;
  severityLevel?: string;
  appliedStrategy?: string;
  readingTime: string;
  isDemoData?: boolean;
}

export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'URGENT';
export type MaintenanceStatus = 'REQUESTED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Maintenance {
  id: number;
  machine: Machine;
  machineId?: number;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  requestDate: string;
  scheduledDate?: string | null;
  completionDate?: string | null;
  notes?: string | null;
  assignedTechnician?: string | null;
  resolutionNotes?: string | null;
  isDemoData?: boolean;
}

export interface HealthScoreBreakdown {
  temperature: number;
  vibration: number;
  temperatureScore: number;
  vibrationScore: number;
  healthScore: number;
  category: 'Healthy' | 'Warning' | 'Critical';
}

/**
 * Verified formula from Spring Boot backend SensorReadingService:
 * temperatureScore = max(0, 100 - temperature)
 * vibrationScore = max(0, 100 - vibration * 10)
 * healthScore = (temperatureScore + vibrationScore) / 2
 */
export function calculateHealthScore(temperature: number, vibration: number): HealthScoreBreakdown {
  const temperatureScore = Math.max(0, 100 - Number(temperature || 0));
  const vibrationScore = Math.max(0, 100 - Number(vibration || 0) * 10);
  const healthScore = Math.round(((temperatureScore + vibrationScore) / 2) * 100) / 100;

  let category: 'Healthy' | 'Warning' | 'Critical' = 'Healthy';
  if (healthScore < 40) {
    category = 'Critical';
  } else if (healthScore < 70) {
    category = 'Warning';
  }

  return {
    temperature: Number(temperature || 0),
    vibration: Number(vibration || 0),
    temperatureScore: Math.round(temperatureScore * 100) / 100,
    vibrationScore: Math.round(vibrationScore * 100) / 100,
    healthScore,
    category,
  };
}

export function getHealthStatus(score: number | null | undefined, fallbackStatus = 'No reading'): 'Healthy' | 'Warning' | 'Critical' | string {
  if (score === null || score === undefined) return fallbackStatus;
  if (score >= 70) return 'Healthy';
  if (score >= 40) return 'Warning';
  return 'Critical';
}
