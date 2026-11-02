import { useNavigate } from 'react-router-dom';
import type { Incident } from '../../types/incident';
import { incidentStateMeta } from '../../utils/status';
import { formatDateTime, formatDuration } from '../../utils/format';

interface IncidentTableProps {
  incidents: Incident[];
  compact?: boolean;
}

export function IncidentTable({ incidents, compact }: IncidentTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-lg border border-stone">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone bg-ink/[0.02] text-xs text-charcoal">
              <th className="px-4 py-3 text-start font-medium">مانیتور</th>
              <th className="px-4 py-3 text-start font-medium">شروع</th>
              {!compact && <th className="px-4 py-3 text-start font-medium">بازیابی</th>}
              <th className="px-4 py-3 text-start font-medium">مدت</th>
              <th className="px-4 py-3 text-start font-medium">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => {
              const meta = incidentStateMeta[incident.state];
              return (
                <tr
                  key={incident.id}
                  onClick={() => navigate(`/monitors/${incident.monitorId}`)}
                  className="cursor-pointer border-b border-stone/70 last:border-0 hover:bg-ink/[0.02]"
                >
                  <td className="px-4 py-3.5 font-medium text-ink">{incident.monitorName}</td>
                  <td className="px-4 py-3.5 text-charcoal">{formatDateTime(incident.startedAt)}</td>
                  {!compact && (
                    <td className="px-4 py-3.5 text-charcoal">
                      {incident.resolvedAt ? formatDateTime(incident.resolvedAt) : '—'}
                    </td>
                  )}
                  <td className="px-4 py-3.5 text-charcoal">
                    {formatDuration(incident.startedAt, incident.resolvedAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${meta.bgClass} ${meta.textClass}`}
                    >
                      {meta.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
