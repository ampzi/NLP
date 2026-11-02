import type { MonitorStatus } from '../../types/monitor';
import { statusMeta } from '../../utils/status';

export function StatusBadge({ status }: { status: MonitorStatus }) {
  const meta = statusMeta[status];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${meta.bgClass} ${meta.textClass}`}
    >
      <Icon className="h-3.5 w-3.5" strokeWidth={2.25} />
      {meta.label}
    </span>
  );
}

export function StatusDot({ status }: { status: MonitorStatus }) {
  const meta = statusMeta[status];
  return <span className={`inline-block h-2 w-2 rounded-full ${meta.dot}`} aria-hidden />;
}
