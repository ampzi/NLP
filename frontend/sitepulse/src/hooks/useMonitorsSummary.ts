import { useEffect, useState } from 'react';
import { listMonitors } from '../services/monitors.service';

interface MonitorsSummary {
  total: number;
  operational: number;
  down: number;
  degraded: number;
  pending: number;
  averageResponseTimeMs: number | null;
}

interface UseMonitorsSummaryResult {
  data: MonitorsSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMonitorsSummary(): UseMonitorsSummaryResult {
  const [data, setData] = useState<MonitorsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    listMonitors()
      .then((monitors) => {
        if (cancelled) return;
        const operational = monitors.filter((m) => m.status === 'operational').length;
        const down = monitors.filter((m) => m.status === 'down').length;
        const degraded = monitors.filter((m) => m.status === 'degraded').length;
        const pending = monitors.filter((m) => m.status === 'pending').length;
        const withResponse = monitors.filter((m) => m.responseTimeMs !== null);
        const averageResponseTimeMs = withResponse.length
          ? Math.round(
              withResponse.reduce((sum, m) => sum + (m.responseTimeMs ?? 0), 0) / withResponse.length,
            )
          : null;
        setData({
          total: monitors.length,
          operational,
          down,
          degraded,
          pending,
          averageResponseTimeMs,
        });
      })
      .catch(() => {
        if (!cancelled) setError('دریافت اطلاعات مانیتورها با خطا مواجه شد.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return { data, isLoading, error, refetch: () => setReloadKey((k) => k + 1) };
}
