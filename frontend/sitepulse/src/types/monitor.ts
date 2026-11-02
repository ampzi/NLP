export type MonitorStatus = 'operational' | 'degraded' | 'down' | 'pending';

export type CheckInterval = number;

export interface Monitor {
  id: string;
  name: string;
  url: string;
  status: MonitorStatus;
  isPaused: boolean;
  responseTimeMs: number | null;
  uptimePercentage: number; // over the selected/default period
  lastCheckedAt: string | null; // ISO timestamp
  lastSuccessAt: string | null;
  checkIntervalMinutes: CheckInterval;
  requestTimeoutSeconds: number;
  description?: string;
  createdAt: string;
}

export type ResponseTimeRange = '24h' | '7d' | '30d';

export interface ResponseTimePoint {
  timestamp: string; // ISO
  responseTimeMs: number | null;
}

export type CheckResult = 'success' | 'http_error' | 'network_error' | 'timeout';

export interface CheckHistoryEntry {
  id: string;
  timestamp: string;
  result: CheckResult;
  httpStatusCode: number | null;
  responseTimeMs: number | null;
  errorSummary?: string;
}

export interface MonitorFormValues {
  name: string;
  url: string;
  checkIntervalMinutes: CheckInterval;
  requestTimeoutSeconds: number;
  description?: string;
}
