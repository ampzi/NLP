import { AlertOctagon, SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterSelect } from '../components/ui/FilterSelect';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { listIncidents } from '../services/incidents.service';
import { listMonitors } from '../services/monitors.service';
import type { Incident, IncidentState } from '../types/incident';
import type { Monitor } from '../types/monitor';

export function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[] | null>(null);
  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | IncidentState>('all');
  const [monitorFilter, setMonitorFilter] = useState<string>('all');

  useEffect(() => {
    let cancelled = false;
    setError(false);
    Promise.all([listIncidents(), listMonitors()])
      .then(([i, m]) => {
        if (cancelled) return;
        setIncidents(i);
        setMonitors(m);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    if (!incidents) return [];
    return incidents
      .filter((i) => stateFilter === 'all' || i.state === stateFilter)
      .filter((i) => monitorFilter === 'all' || i.monitorId === monitorFilter)
      .filter(
        (i) =>
          !search.trim() || i.monitorName.toLowerCase().includes(search.trim().toLowerCase()),
      )
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [incidents, search, stateFilter, monitorFilter]);

  const isLoading = incidents === null || monitors === null;

  return (
    <div>
      <PageHeader title="رخدادها" description="تاریخچه قطعی‌ها و مشکلات مانیتورهای شما." />

      {error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isLoading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (incidents?.length ?? 0) === 0 ? (
        <EmptyState
          icon={AlertOctagon}
          title="هیچ رخدادی ثبت نشده است"
          description="عالی است! در حال حاضر هیچ قطعی یا مشکلی برای سایت‌های شما گزارش نشده."
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="جستجو بر اساس نام مانیتور..."
              className="sm:max-w-xs"
            />
            <FilterSelect
              value={stateFilter}
              onChange={(v) => setStateFilter(v as 'all' | IncidentState)}
              label="وضعیت"
              options={[
                { value: 'all', label: 'همه وضعیت‌ها' },
                { value: 'active', label: 'در حال وقوع' },
                { value: 'resolved', label: 'برطرف‌شده' },
              ]}
            />
            <FilterSelect
              value={monitorFilter}
              onChange={setMonitorFilter}
              label="مانیتور"
              options={[
                { value: 'all', label: 'همه مانیتورها' },
                ...(monitors ?? []).map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="نتیجه‌ای یافت نشد"
              description="هیچ رخدادی با این جستجو یا فیلتر مطابقت ندارد."
            />
          ) : (
            <IncidentTable incidents={filtered} />
          )}
        </>
      )}
    </div>
  );
}
