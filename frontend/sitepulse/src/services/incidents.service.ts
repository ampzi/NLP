import type { Incident } from '../types/incident';
import { apiFetch } from './api';

type BackendIncident = {
  id: number;
  monitorId: number;
  monitorName: string;
  startedAt: string;
  resolvedAt: string | null;
  status: 'OPEN' | 'RESOLVED';
  cause: string | null;
  failureMessage: string | null;
};

function mapIncident(i: BackendIncident): Incident {
  return {
    id: String(i.id),
    monitorId: String(i.monitorId),
    monitorName: i.monitorName,
    startedAt: i.startedAt,
    resolvedAt: i.resolvedAt,
    state: i.status === 'OPEN' ? 'active' : 'resolved',
    failureSummary: i.failureMessage ?? i.cause ?? undefined,
  };
}

export async function listIncidents(): Promise<Incident[]> {
  const res = await apiFetch<{ items: BackendIncident[] }>(
    '/incidents?limit=200',
  );
  return res.items.map(mapIncident);
}

export async function listRecentIncidents(count = 5): Promise<Incident[]> {
  const res = await apiFetch<{ items: BackendIncident[] }>(
    `/incidents?limit=${count}`,
  );
  return res.items.map(mapIncident);
}

export async function listIncidentsForMonitor(
  monitorId: string,
): Promise<Incident[]> {
  const res = await apiFetch<{ items: BackendIncident[] }>(
    `/monitors/${monitorId}/incidents?limit=100`,
  );
  return res.items.map(mapIncident);
}
