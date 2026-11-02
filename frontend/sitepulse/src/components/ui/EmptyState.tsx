import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Inbox, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-stone px-6 py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-ink/5">
        <Icon className="h-5 w-5 text-charcoal" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-charcoal">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
