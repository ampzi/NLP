import { Activity, AlertOctagon, Plus, Radar, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/ui/MetricCard';
import { PrimaryButton } from '../components/ui/Button';
import { MonitorTable } from '../components/monitors/MonitorTable';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { DateRangeSelector } from '../components/ui/DateRangeSelector';
import { ResponseTimeChart } from '../components/charts/ResponseTimeChart';
import { listMonitors } from '../services/monitors.service';
import { fetchAggregateResponseTimeSeries } from '../services/monitors.service';
import { listRecentIncidents } from '../services/incidents.service';
import type { Monitor, ResponseTimePoint, ResponseTimeRange } from '../types/monitor';
import type { Incident } from '../types/incident';
import { formatMs, formatNumber } from '../utils/format';

export function DashboardPage() {
  const navigate = useNavigate();
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [chartData, setChartData] = useState<ResponseTimePoint[] | null>(null);
  const [range, setRange] = useState<ResponseTimeRange>('24h');
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    Promise.all([listMonitors(), listRecentIncidents(5)])
      .then(([m, i]) => {
        if (cancelled) return;
        setMonitors(m);
        setIncidents(i);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    let cancelled = false;
    fetchAggregateResponseTimeSeries(range).then((data) => {
      if (!cancelled) setChartData(data);
    });
    return () => {
      cancelled = true;
    };
  }, [range]);

  const isLoading = monitors === null || incidents === null;

  const total = monitors?.length ?? 0;
  const operational = monitors?.filter((m) => m.status === 'operational').length ?? 0;
  const down = monitors?.filter((m) => m.status === 'down').length ?? 0;
  const withResponse = monitors?.filter((m) => m.responseTimeMs !== null) ?? [];
  const avgResponse = withResponse.length
    ? Math.round(withResponse.reduce((sum, m) => sum + (m.responseTimeMs ?? 0), 0) / withResponse.length)
    : null;

  return (
    <div>
      <PageHeader
        title="نمای کلی"
        description="وضعیت و عملکرد سایت‌های خود را بررسی کنید."
        action={
          <PrimaryButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/monitors/new')}>
            افزودن سایت
          </PrimaryButton>
        }
      />

      {error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : (
              <>
                <MetricCard label="تعداد کل مانیتورها" value={formatNumber(total)} icon={Radar} />
                <MetricCard
                  label="عملیاتی"
                  value={formatNumber(operational)}
                  caption={total ? `از ${formatNumber(total)} مانیتور` : undefined}
                  icon={Activity}
                />
                <MetricCard
                  label="از دسترس خارج"
                  value={formatNumber(down)}
                  icon={AlertOctagon}
                  emphasize={down > 0}
                />
                <MetricCard label="میانگین زمان پاسخ" value={formatMs(avgResponse)} icon={Timer} />
              </>
            )}
          </div>

          <section className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">زمان پاسخ</h2>
              <DateRangeSelector value={range} onChange={setRange} />
            </div>
            <div className="card p-4">
              {chartData ? (
                <ResponseTimeChart data={chartData} range={range} />
              ) : (
                <div className="h-[280px] animate-pulse rounded-md bg-ink/5" />
              )}
            </div>
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-ink">وضعیت سایت‌ها</h2>
            {isLoading ? (
              <TableSkeleton rows={4} cols={5} />
            ) : monitors && monitors.length > 0 ? (
              <MonitorTable monitors={monitors.slice(0, 6)} />
            ) : (
              <EmptyState
                icon={Radar}
                title="هنوز هیچ سایتی اضافه نشده است"
                description="برای شروع پایش، اولین سایت خود را اضافه کنید."
                action={
                  <PrimaryButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/monitors/new')}>
                    افزودن سایت
                  </PrimaryButton>
                }
              />
            )}
          </section>

          <section className="mt-8">
            <h2 className="mb-3 text-base font-semibold text-ink">رخدادهای اخیر</h2>
            {isLoading ? (
              <TableSkeleton rows={3} cols={4} />
            ) : incidents && incidents.length > 0 ? (
              <IncidentTable incidents={incidents} compact />
            ) : (
              <EmptyState icon={AlertOctagon} title="هیچ رخدادی ثبت نشده است" description="عالی است! در حال حاضر هیچ قطعی یا مشکلی گزارش نشده است." />
            )}
          </section>
        </>
      )}
    </div>
  );
}
