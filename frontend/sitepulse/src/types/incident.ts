export type IncidentState = 'active' | 'resolved';

export interface Incident {
  id: string;
  monitorId: string;
  monitorName: string;
  startedAt: string; // ISO
  resolvedAt: string | null; // ISO
  state: IncidentState;
  failureSummary?: string;
}
