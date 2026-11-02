import { IncidentStatus } from '@prisma/client';

/** An incident row with its monitor name flattened in (used by the API). */
export interface IncidentDto {
  id: number;
  monitorId: number;
  monitorName: string;
  startedAt: Date;
  resolvedAt: Date | null;
  status: IncidentStatus;
  cause: string | null;
  failureMessage: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Flattens a Prisma incident + its included `monitor.name` into a DTO. */
export function flattenIncident(incident: {
  monitor?: { name: string } | null;
  [key: string]: unknown;
}): IncidentDto {
  const { monitor, ...rest } = incident;
  return {
    ...(rest as Omit<IncidentDto, 'monitorName'>),
    monitorName: monitor?.name ?? '—',
  };
}
