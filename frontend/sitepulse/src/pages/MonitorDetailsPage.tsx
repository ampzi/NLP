import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  Gauge,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Timer,
  Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/ui/StatusBadge';
import { MetricCard } from '../components/ui/MetricCard';
import { DateRangeSelector } from '../components/ui/DateRangeSelector';
import { ResponseTimeChart } from '../components/charts/ResponseTimeChart';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { DropdownMenu } from '../components/ui/DropdownMenu';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { LoadingSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { useToast } from '../components/ui/Toast';
import {
  deleteMonitor,
  fetchCheckHistory,
  fetchResponseTimeSeries,
  getMonitor,
  togglePauseMonitor,
} from '../services/monitors.service';
import { listIncidentsForMonitor } from '../services/incidents.service';
import type {
  CheckHistoryEntry,
  Monitor,
  ResponseTimePoint,
  ResponseTimeRange,
} from '../types/monitor';
import type { Incident } from '../types/incident';
import { formatDateTime, formatMs, formatRelativeTime, formatUptime } from '../utils/format';

const resultMeta: Record<CheckHistoryEntry['result'], { label: string; className: string }> = {
  success: { label: 'موفق', className: 'text-ink bg-ink/5' },
  http_error: { label: 'خطای HTTP', className: 'text-signal bg-signal/10' },
  network_error: { label: 'خطای شبکه', className: 'text-signal bg-signal/10' },
  timeout: { label: 'اتمام زمان', className: 'text-signal bg-signal/10' },
};

export function MonitorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [monitor, setMonitor] = useState<Monitor | null | undefined>(undefined);
  const [chartData, setChartData] = useState<ResponseTimePoint[] | null>(null);
  const [checkHistory, setCheckHistory] = useState<CheckHistoryEntry[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [range, setRange] = useState<ResponseTimeRange>('24h');
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setError(false);
    Promise.all([getMonitor(id), fetchCheckHistory(id), listIncidentsForMonitor(id)])
      .then(([m, history, inc]) => {
        if (cancelled) return;
        setMonitor(m);
        setCheckHistory(history);
        setIncidents(inc);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchResponseTimeSeries(id, range).then((data) => {
      if (!cancelled) setChartData(data);
    });
    return () => {
      cancelled = true;
    };
  }, [id, range]);

  const sortedIncidents = useMemo(
    () => [...(incidents ?? [])].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()),
    [incidents],
  );

  const handleTogglePause = async () => {
    if (!monitor) return;
    setIsTogglingPause(true);
    try {
      const updated = await togglePauseMonitor(monitor.id);
      setMonitor(updated);
      showToast('success', updated.isPaused ? 'پایش این مانیتور متوقف شد.' : 'پایش این مانیتور از سر گرفته شد.');
    } catch {
      showToast('error', 'عملیات با خطا مواجه شد.');
    } finally {
      setIsTogglingPause(false);
    }
  };

  const handleDelete = async () => {
    if (!monitor) return;
    setIsDeleting(true);
    try {
      await deleteMonitor(monitor.id);
      showToast('success', 'مانیتور با موفقیت حذف شد.');
      navigate('/monitors');
    } catch {
      showToast('error', 'حذف مانیتور با خطا مواجه شد.');
      setIsDeleting(false);
    }
  };

  if (error) {
    return <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />;
  }

  if (monitor === null) {
    return (
      <EmptyState
        title="مانیتور یافت نشد"
        description="این مانیتور وجود ندارد یا حذف شده است."
        action={
          <Link to="/monitors" className="text-sm font-medium text-ink hover:text-signal">
            بازگشت به فهرست مانیتورها
          </Link>
        }
      />
    );
  }

  return (
    <div>
      <Link
        to="/monitors"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-charcoal hover:text-ink"
      >
        <ArrowRight className="h-4 w-4" />
        بازگشت به سایت‌های من
      </Link>

      {monitor === undefined ? (
        <div className="mb-6 flex items-center justify-between">
          <div>
            <LoadingSkeleton className="h-7 w-48" />
            <LoadingSkeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
      ) : (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-ink sm:text-2xl">{monitor.name}</h1>
              <StatusBadge status={monitor.status} />
            </div>
            <a
              href={monitor.url}
              target="_blank"
              rel="noreferrer"
              className="ltr-num mt-1.5 inline-flex items-center gap-1.5 text-sm text-charcoal hover:text-ink"
              dir="ltr"
            >
              {monitor.url}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/monitors/${monitor.id}`)}
              className="inline-flex items-center gap-2 rounded-md border border-stone bg-ivory px-3.5 py-2 text-sm font-medium text-ink hover:bg-ink/5"
            >
              <Pencil className="h-4 w-4" />
              ویرایش
            </button>
            <button
              onClick={handleTogglePause}
              disabled={isTogglingPause}
              className="inline-flex items-center gap-2 rounded-md border border-stone bg-ivory px-3.5 py-2 text-sm font-medium text-ink hover:bg-ink/5 disabled:opacity-50"
            >
              {monitor.isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
              {monitor.isPaused ? 'ازسرگیری' : 'توقف پایش'}
            </button>
            <DropdownMenu
              align="end"
              trigger={<MoreHorizontal className="h-4 w-4" />}
              items={[
                {
                  label: 'حذف مانیتور',
                  icon: Trash2,
                  destructive: true,
                  onSelect: () => setConfirmDelete(true),
                },
              ]}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {monitor === undefined ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <LoadingSkeleton className="h-4 w-20" />
              <LoadingSkeleton className="mt-3 h-7 w-16" />
            </div>
          ))
        ) : (
          <>
            <MetricCard
              label="وضعیت فعلی"
              value={<StatusBadge status={monitor.status} />}
              icon={Activity}
            />
            <MetricCard label="آپ‌تایم (۳۰ روز)" value={formatUptime(monitor.uptimePercentage)} icon={Gauge} />
            <MetricCard label="میانگین زمان پاسخ" value={formatMs(monitor.responseTimeMs)} icon={Timer} />
            <MetricCard
              label="آخرین بررسی موفق"
              value={formatRelativeTime(monitor.lastSuccessAt)}
              icon={Clock}
            />
          </>
        )}
      </div>

      <section className="mt-8">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">تاریخچه زمان پاسخ</h2>
          <DateRangeSelector value={range} onChange={setRange} />
        </div>
        <div className="card p-4">
          {chartData ? (
            chartData.length > 0 ? (
              <ResponseTimeChart data={chartData} range={range} />
            ) : (
              <EmptyState
                icon={AlertTriangle}
                title="داده‌ای برای این بازه موجود نیست"
                description="با انتخاب بازه زمانی دیگر دوباره تلاش کنید."
              />
            )
          ) : (
            <div className="h-[280px] animate-pulse rounded-md bg-ink/5" />
          )}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">تاریخچه بررسی‌ها</h2>
        {checkHistory === null ? (
          <TableSkeleton rows={6} cols={5} />
        ) : checkHistory.length === 0 ? (
          <EmptyState title="هنوز بررسی‌ای انجام نشده است" />
        ) : (
          <div className="overflow-hidden rounded-lg border border-stone">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-stone bg-ink/[0.02] text-xs text-charcoal">
                    <th className="px-4 py-3 text-start font-medium">زمان</th>
                    <th className="px-4 py-3 text-start font-medium">نتیجه</th>
                    <th className="px-4 py-3 text-start font-medium">کد وضعیت</th>
                    <th className="px-4 py-3 text-start font-medium">زمان پاسخ</th>
                    <th className="px-4 py-3 text-start font-medium">جزئیات خطا</th>
                  </tr>
                </thead>
                <tbody>
                  {checkHistory.map((entry) => (
                    <tr key={entry.id} className="border-b border-stone/70 last:border-0">
                      <td className="px-4 py-3.5 text-charcoal">{formatDateTime(entry.timestamp)}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${resultMeta[entry.result].className}`}
                        >
                          {resultMeta[entry.result].label}
                        </span>
                      </td>
                      <td className="ltr-num px-4 py-3.5 text-ink">
                        {entry.httpStatusCode ?? '—'}
                      </td>
                      <td className="ltr-num px-4 py-3.5 text-ink">{formatMs(entry.responseTimeMs)}</td>
                      <td className="max-w-xs px-4 py-3.5 text-charcoal">
                        {entry.errorSummary ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-ink">تاریخچه رخدادها</h2>
        {incidents === null ? (
          <TableSkeleton rows={3} cols={4} />
        ) : sortedIncidents.length === 0 ? (
          <EmptyState title="هیچ رخدادی برای این مانیتور ثبت نشده است" />
        ) : (
          <IncidentTable incidents={sortedIncidents} />
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title="حذف مانیتور"
        description={monitor ? `آیا از حذف «${monitor.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.` : undefined}
        confirmLabel="حذف مانیتور"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
