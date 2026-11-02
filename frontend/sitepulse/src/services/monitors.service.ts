import type {
  CheckHistoryEntry,
  Monitor,
  MonitorFormValues,
  MonitorStatus,
  ResponseTimePoint,
  ResponseTimeRange,
} from '../types/monitor';
import { ApiError, apiFetch } from './api';

type BackendStatus = 'PENDING' | 'UP' | 'DOWN';
type BackendCheckStatus =
  | 'SUCCESS'
  | 'HTTP_ERROR'
  | 'TIMEOUT'
  | 'CONNECTION_ERROR'
  | 'SSL_ERROR'
  | 'UNKNOWN_ERROR';

type BackendMonitor = {
  id: number;
  name: string;
  url: string;
  description?: string | null;
  currentStatus: BackendStatus;
  isActive: boolean;
  lastCheckedAt: string | null;
  lastResponseTimeMs: number | null;
  checkIntervalSeconds: number;
  timeoutMs: number;
  createdAt: string;
};

type BackendStatsItem = {
  monitorId: number;
  uptimePercentage: number;
  averageResponseTimeMs: number | null;
  lastSuccessAt: string | null;
  totalChecks: number;
};

type BackendCheck = {
  id: number;
  status: BackendCheckStatus;
  httpStatusCode: number | null;
  responseTimeMs: number | null;
  errorType: string | null;
  errorMessage: string | null;
  checkedAt: string;
};

const statusMap: Record<BackendStatus, MonitorStatus> = {
  PENDING: 'pending',
  UP: 'operational',
  DOWN: 'down',
};

const checkResultMap: Record<BackendCheckStatus, CheckHistoryEntry['result']> = {
  SUCCESS: 'success',
  HTTP_ERROR: 'http_error',
  TIMEOUT: 'timeout',
  CONNECTION_ERROR: 'network_error',
  SSL_ERROR: 'network_error',
  UNKNOWN_ERROR: 'network_error',
};

function mapMonitor(m: BackendMonitor, stats?: BackendStatsItem): Monitor {
  return {
    id: String(m.id),
    name: m.name,
    url: m.url,
    status: statusMap[m.currentStatus],
    isPaused: !m.isActive,
    responseTimeMs: m.lastResponseTimeMs,
    uptimePercentage: stats?.uptimePercentage ?? 0,
    lastCheckedAt: m.lastCheckedAt,
    lastSuccessAt: stats?.lastSuccessAt ?? null,
    checkIntervalMinutes: Math.round(m.checkIntervalSeconds / 60),
    requestTimeoutSeconds: Math.round(m.timeoutMs / 1000),
    description: m.description ?? undefined,
    createdAt: m.createdAt,
  };
}

async function fetchStatsMap(): Promise<Map<number, BackendStatsItem>> {
  const stats = await apiFetch<{ items: BackendStatsItem[] }>(
    '/monitors/stats?days=30',
  );
  return new Map(stats.items.map((s) => [s.monitorId, s]));
}

export async function listMonitors(): Promise<Monitor[]> {
  const [list, stats] = await Promise.all([
    apiFetch<{ items: BackendMonitor[] }>('/monitors?limit=100'),
    apiFetch<{ items: BackendStatsItem[] }>('/monitors/stats?days=30'),
  ]);
  const statsMap = new Map(stats.items.map((s) => [s.monitorId, s]));
  return list.items.map((m) => mapMonitor(m, statsMap.get(m.id)));
}

export async function getMonitor(id: string): Promise<Monitor | null> {
  const monitor = await apiFetch<BackendMonitor>(`/monitors/${id}`).catch(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    },
  );
  if (!monitor) return null;
  const statsMap = await fetchStatsMap();
  return mapMonitor(monitor, statsMap.get(monitor.id));
}

export async function createMonitor(values: MonitorFormValues): Promise<Monitor> {
  const monitor = await apiFetch<BackendMonitor>('/monitors', {
    method: 'POST',
    body: JSON.stringify({
      name: values.name,
      url: values.url,
      description: values.description || undefined,
      checkIntervalSeconds: values.checkIntervalMinutes * 60,
      timeoutMs: values.requestTimeoutSeconds * 1000,
    }),
  });
  return mapMonitor(monitor);
}

export async function updateMonitor(
  id: string,
  values: Partial<MonitorFormValues>,
): Promise<Monitor> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) payload.name = values.name;
  if (values.url !== undefined) payload.url = values.url;
  if (values.description !== undefined) payload.description = values.description;
  if (values.checkIntervalMinutes !== undefined) {
    payload.checkIntervalSeconds = values.checkIntervalMinutes * 60;
  }
  if (values.requestTimeoutSeconds !== undefined) {
    payload.timeoutMs = values.requestTimeoutSeconds * 1000;
  }

  const monitor = await apiFetch<BackendMonitor>(`/monitors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return mapMonitor(monitor);
}

export async function deleteMonitor(id: string): Promise<void> {
  await apiFetch(`/monitors/${id}`, { method: 'DELETE' });
}

export async function togglePauseMonitor(id: string): Promise<Monitor> {
  const current = await apiFetch<BackendMonitor>(`/monitors/${id}`);
  const monitor = await apiFetch<BackendMonitor>(`/monitors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: !current.isActive }),
  });
  return mapMonitor(monitor);
}

export async function fetchResponseTimeSeries(
  id: string,
  range: ResponseTimeRange,
): Promise<ResponseTimePoint[]> {
  return apiFetch<ResponseTimePoint[]>(
    `/monitors/${id}/response-times?range=${range}`,
  );
}

export async function fetchAggregateResponseTimeSeries(
  range: ResponseTimeRange,
): Promise<ResponseTimePoint[]> {
  return apiFetch<ResponseTimePoint[]>(
    `/monitors/response-times?range=${range}`,
  );
}

export async function fetchCheckHistory(id: string): Promise<CheckHistoryEntry[]> {
  const res = await apiFetch<{ items: BackendCheck[] }>(
    `/monitors/${id}/checks?limit=200`,
  );
  return res.items.map((c) => ({
    id: String(c.id),
    timestamp: c.checkedAt,
    result: checkResultMap[c.status],
    httpStatusCode: c.httpStatusCode,
    responseTimeMs: c.responseTimeMs,
    errorSummary: c.errorMessage ?? c.errorType ?? undefined,
  }));
}
