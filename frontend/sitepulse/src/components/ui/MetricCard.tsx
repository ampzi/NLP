import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: ReactNode;
  caption?: string;
  icon: LucideIcon;
  emphasize?: boolean;
}

export function MetricCard({ label, value, caption, icon: Icon, emphasize }: MetricCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-charcoal">{label}</span>
        <Icon
          className={`h-4 w-4 ${emphasize ? 'text-signal' : 'text-charcoal/60'}`}
          strokeWidth={2}
        />
      </div>
      <div className={`mt-3 text-2xl font-semibold ${emphasize ? 'text-signal' : 'text-ink'}`}>
        {value}
      </div>
      {caption && <p className="mt-1 text-xs text-charcoal">{caption}</p>}
    </div>
  );
}
