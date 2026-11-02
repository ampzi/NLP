import { ExternalLink, Pause, Pencil, Play, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Monitor } from '../../types/monitor';
import { StatusBadge } from '../ui/StatusBadge';
import { DropdownMenu } from '../ui/DropdownMenu';
import { formatMs, formatRelativeTime, formatUptime } from '../../utils/format';

interface MonitorTableProps {
  monitors: Monitor[];
  onEdit?: (monitor: Monitor) => void;
  onTogglePause?: (monitor: Monitor) => void;
  onDelete?: (monitor: Monitor) => void;
}

export function MonitorTable({ monitors, onEdit, onTogglePause, onDelete }: MonitorTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-lg border border-stone">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-stone bg-ink/[0.02] text-start text-xs text-charcoal">
              <th className="px-4 py-3 text-start font-medium">نام / آدرس</th>
              <th className="px-4 py-3 text-start font-medium">وضعیت</th>
              <th className="px-4 py-3 text-start font-medium">زمان پاسخ</th>
              <th className="px-4 py-3 text-start font-medium">آپ‌تایم</th>
              <th className="px-4 py-3 text-start font-medium">آخرین بررسی</th>
              <th className="px-4 py-3 text-start font-medium">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {monitors.map((monitor) => (
              <tr
                key={monitor.id}
                onClick={() => navigate(`/monitors/${monitor.id}`)}
                className="cursor-pointer border-b border-stone/70 last:border-0 hover:bg-ink/[0.02]"
              >
                <td className="px-4 py-3.5">
                  <div className="font-medium text-ink">{monitor.name}</div>
                  <div className="ltr-num mt-0.5 flex items-center gap-1 text-xs text-charcoal" dir="ltr">
                    {monitor.url}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={monitor.status} />
                  {monitor.isPaused && (
                    <span className="ms-2 inline-block text-xs text-charcoal/70">(متوقف‌شده)</span>
                  )}
                </td>
                <td className="ltr-num px-4 py-3.5 text-ink">{formatMs(monitor.responseTimeMs)}</td>
                <td className="ltr-num px-4 py-3.5 text-ink">{formatUptime(monitor.uptimePercentage)}</td>
                <td className="px-4 py-3.5 text-charcoal">{formatRelativeTime(monitor.lastCheckedAt)}</td>
                <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-1">
                    <a
                      href={monitor.url}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="باز کردن سایت"
                      className="inline-flex items-center justify-center rounded-md p-2 text-charcoal hover:bg-ink/5 hover:text-ink"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <DropdownMenu
                      align="end"
                      items={[
                        {
                          label: 'مشاهده جزئیات',
                          onSelect: () => navigate(`/monitors/${monitor.id}`),
                        },
                        {
                          label: 'ویرایش مانیتور',
                          icon: Pencil,
                          onSelect: () => onEdit?.(monitor),
                        },
                        {
                          label: monitor.isPaused ? 'ازسرگیری پایش' : 'توقف پایش',
                          icon: monitor.isPaused ? Play : Pause,
                          onSelect: () => onTogglePause?.(monitor),
                        },
                        {
                          label: 'حذف مانیتور',
                          icon: Trash2,
                          destructive: true,
                          onSelect: () => onDelete?.(monitor),
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
