import { CircleCheck, CircleMinus, CircleX, Clock } from 'lucide-react';
import type { MonitorStatus } from '../types/monitor';
import type { IncidentState } from '../types/incident';

export const statusMeta: Record<
  MonitorStatus,
  { label: string; icon: typeof CircleCheck; dot: string; textClass: string; bgClass: string }
> = {
  operational: {
    label: 'عملیاتی',
    icon: CircleCheck,
    dot: 'bg-ink',
    textClass: 'text-ink',
    bgClass: 'bg-ink/5',
  },
  degraded: {
    label: 'کند / ناپایدار',
    icon: Clock,
    dot: 'bg-signal',
    textClass: 'text-signal',
    bgClass: 'bg-signal/10',
  },
  down: {
    label: 'از دسترس خارج',
    icon: CircleX,
    dot: 'bg-signal',
    textClass: 'text-signal',
    bgClass: 'bg-signal/10',
  },
  pending: {
    label: 'در انتظار بررسی',
    icon: CircleMinus,
    dot: 'bg-charcoal/50',
    textClass: 'text-charcoal',
    bgClass: 'bg-charcoal/5',
  },
};

export const incidentStateMeta: Record<
  IncidentState,
  { label: string; textClass: string; bgClass: string }
> = {
  active: { label: 'در حال وقوع', textClass: 'text-signal', bgClass: 'bg-signal/10' },
  resolved: { label: 'برطرف‌شده', textClass: 'text-ink', bgClass: 'bg-ink/5' },
};
