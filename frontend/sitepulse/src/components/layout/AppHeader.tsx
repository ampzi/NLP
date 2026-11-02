import { Menu } from 'lucide-react';
import { StatusDot } from '../ui/StatusBadge';
import { useMonitorsSummary } from '../../hooks/useMonitorsSummary';
import { formatNumber } from '../../utils/format';

interface AppHeaderProps {
  onMenuClick: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { data } = useMonitorsSummary();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0b0f16]/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="باز کردن منو"
          className="rounded-md p-2 text-ink hover:bg-ink/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {data && (
        <div className="hidden items-center gap-4 rounded-md border border-stone px-3 py-1.5 text-xs text-charcoal sm:flex">
          <span className="flex items-center gap-1.5">
            <StatusDot status="operational" />
            {formatNumber(data.operational)} عملیاتی
          </span>
          {data.down > 0 && (
            <span className="flex items-center gap-1.5 text-signal">
              <StatusDot status="down" />
              {formatNumber(data.down)} قطع
            </span>
          )}
        </div>
      )}
    </header>
  );
}
