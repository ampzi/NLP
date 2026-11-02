import { Plus, Radar, SearchX } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { PrimaryButton } from '../components/ui/Button';
import { SearchInput } from '../components/ui/SearchInput';
import { FilterSelect } from '../components/ui/FilterSelect';
import { MonitorTable } from '../components/monitors/MonitorTable';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { TableSkeleton } from '../components/ui/LoadingSkeleton';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Pagination } from '../components/ui/Pagination';
import { useToast } from '../components/ui/Toast';
import { deleteMonitor, listMonitors, togglePauseMonitor } from '../services/monitors.service';
import type { Monitor, MonitorStatus } from '../types/monitor';

const PAGE_SIZE = 5;

type SortKey = 'responseTime' | 'uptime' | 'lastChecked';

export function MonitorsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [monitors, setMonitors] = useState<Monitor[] | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | MonitorStatus>('all');
  const [sortKey, setSortKey] = useState<SortKey>('lastChecked');
  const [page, setPage] = useState(1);

  const [pendingDelete, setPendingDelete] = useState<Monitor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    listMonitors()
      .then((data) => !cancelled && setMonitors(data))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, sortKey]);

  const filtered = useMemo(() => {
    if (!monitors) return [];
    let result = monitors.filter((m) => {
      const matchesSearch =
        !search.trim() ||
        m.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        m.url.toLowerCase().includes(search.trim().toLowerCase());
      const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result = [...result].sort((a, b) => {
      if (sortKey === 'responseTime') return (a.responseTimeMs ?? Infinity) - (b.responseTimeMs ?? Infinity);
      if (sortKey === 'uptime') return b.uptimePercentage - a.uptimePercentage;
      return (b.lastCheckedAt ? new Date(b.lastCheckedAt).getTime() : 0) -
        (a.lastCheckedAt ? new Date(a.lastCheckedAt).getTime() : 0);
    });

    return result;
  }, [monitors, search, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTogglePause = async (monitor: Monitor) => {
    try {
      const updated = await togglePauseMonitor(monitor.id);
      setMonitors((prev) => prev?.map((m) => (m.id === monitor.id ? updated : m)) ?? null);
      showToast('success', updated.isPaused ? 'پایش این مانیتور متوقف شد.' : 'پایش این مانیتور از سر گرفته شد.');
    } catch {
      showToast('error', 'عملیات با خطا مواجه شد.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setIsDeleting(true);
    try {
      await deleteMonitor(pendingDelete.id);
      setMonitors((prev) => prev?.filter((m) => m.id !== pendingDelete.id) ?? null);
      showToast('success', 'مانیتور با موفقیت حذف شد.');
      setPendingDelete(null);
    } catch {
      showToast('error', 'حذف مانیتور با خطا مواجه شد.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isLoading = monitors === null;
  const hasAnyMonitors = (monitors?.length ?? 0) > 0;

  return (
    <div>
      <PageHeader
        title="سایت‌های من"
        description="مدیریت و پایش تمام سایت‌های ثبت‌شده در یک نگاه."
        action={
          <PrimaryButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/monitors/new')}>
            افزودن سایت
          </PrimaryButton>
        }
      />

      {error ? (
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      ) : isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : !hasAnyMonitors ? (
        <EmptyState
          icon={Radar}
          title="هنوز هیچ سایتی اضافه نکرده‌اید"
          description="برای دریافت اطلاعات زمان پاسخ و آپ‌تایم، اولین سایت خود را اضافه کنید."
          action={
            <PrimaryButton icon={<Plus className="h-4 w-4" />} onClick={() => navigate('/monitors/new')}>
              افزودن سایت
            </PrimaryButton>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="جستجو بر اساس نام یا آدرس..." className="sm:max-w-xs" />
            <FilterSelect
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | MonitorStatus)}
              label="وضعیت"
              options={[
                { value: 'all', label: 'همه وضعیت‌ها' },
                { value: 'operational', label: 'عملیاتی' },
                { value: 'degraded', label: 'کند / ناپایدار' },
                { value: 'down', label: 'از دسترس خارج' },
                { value: 'pending', label: 'در انتظار بررسی' },
              ]}
            />
            <FilterSelect
              value={sortKey}
              onChange={(v) => setSortKey(v as SortKey)}
              label="مرتب‌سازی"
              options={[
                { value: 'lastChecked', label: 'مرتب‌سازی: آخرین بررسی' },
                { value: 'responseTime', label: 'مرتب‌سازی: زمان پاسخ' },
                { value: 'uptime', label: 'مرتب‌سازی: آپ‌تایم' },
              ]}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="نتیجه‌ای یافت نشد"
              description="هیچ مانیتوری با این جستجو یا فیلتر مطابقت ندارد."
            />
          ) : (
            <>
              <MonitorTable
                monitors={pageItems}
                onEdit={(m) => navigate(`/monitors/${m.id}`)}
                onTogglePause={handleTogglePause}
                onDelete={(m) => setPendingDelete(m)}
              />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="حذف مانیتور"
        description={
          pendingDelete
            ? `آیا از حذف «${pendingDelete.name}» مطمئن هستید؟ این عملیات قابل بازگشت نیست.`
            : undefined
        }
        confirmLabel="حذف مانیتور"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
