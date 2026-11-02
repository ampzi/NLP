import type {
  CheckHistoryEntry,
  CheckResult,
  Monitor,
  ResponseTimePoint,
  ResponseTimeRange,
} from '../types/monitor';

const now = () => Date.now();
const minutesAgo = (m: number) => new Date(now() - m * 60_000).toISOString();
const hoursAgo = (h: number) => new Date(now() - h * 60 * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now() - d * 24 * 60 * 60_000).toISOString();

export const monitorsMock: Monitor[] = [
  {
    id: 'mon-1',
    name: 'فروشگاه اصلی',
    url: 'https://shop.example.com',
    status: 'operational',
    isPaused: false,
    responseTimeMs: 182,
    uptimePercentage: 99.98,
    lastCheckedAt: minutesAgo(2),
    lastSuccessAt: minutesAgo(2),
    checkIntervalMinutes: 5,
    requestTimeoutSeconds: 10,
    description: 'سایت فروشگاهی اصلی برای مشتریان',
    createdAt: daysAgo(120),
  },
  {
    id: 'mon-2',
    name: 'پنل مدیریت',
    url: 'https://admin.example.com',
    status: 'operational',
    isPaused: false,
    responseTimeMs: 231,
    uptimePercentage: 99.95,
    lastCheckedAt: minutesAgo(1),
    lastSuccessAt: minutesAgo(1),
    checkIntervalMinutes: 5,
    requestTimeoutSeconds: 10,
    createdAt: daysAgo(90),
  },
  {
    id: 'mon-3',
    name: 'API پرداخت',
    url: 'https://api.example.com/payments',
    status: 'down',
    isPaused: false,
    responseTimeMs: null,
    uptimePercentage: 97.42,
    lastCheckedAt: minutesAgo(3),
    lastSuccessAt: hoursAgo(2),
    checkIntervalMinutes: 1,
    requestTimeoutSeconds: 8,
    description: 'مانیتور حیاتی برای درگاه پرداخت',
    createdAt: daysAgo(200),
  },
  {
    id: 'mon-4',
    name: 'وبلاگ شرکتی',
    url: 'https://blog.example.com',
    status: 'degraded',
    isPaused: false,
    responseTimeMs: 1840,
    uptimePercentage: 99.1,
    lastCheckedAt: minutesAgo(4),
    lastSuccessAt: minutesAgo(4),
    checkIntervalMinutes: 10,
    requestTimeoutSeconds: 10,
    createdAt: daysAgo(60),
  },
  {
    id: 'mon-5',
    name: 'مستندات توسعه‌دهندگان',
    url: 'https://docs.example.com',
    status: 'operational',
    isPaused: false,
    responseTimeMs: 145,
    uptimePercentage: 99.99,
    lastCheckedAt: minutesAgo(5),
    lastSuccessAt: minutesAgo(5),
    checkIntervalMinutes: 30,
    requestTimeoutSeconds: 10,
    createdAt: daysAgo(300),
  },
  {
    id: 'mon-6',
    name: 'وب‌سایت شرکتی',
    url: 'https://www.example.com',
    status: 'operational',
    isPaused: true,
    responseTimeMs: 210,
    uptimePercentage: 99.87,
    lastCheckedAt: hoursAgo(6),
    lastSuccessAt: hoursAgo(6),
    checkIntervalMinutes: 10,
    requestTimeoutSeconds: 10,
    description: 'مانیتورینگ موقتاً متوقف شده برای نگهداری',
    createdAt: daysAgo(150),
  },
  {
    id: 'mon-7',
    name: 'سرویس اعلان‌ها',
    url: 'https://notify.example.com',
    status: 'pending',
    isPaused: false,
    responseTimeMs: null,
    uptimePercentage: 0,
    lastCheckedAt: null,
    lastSuccessAt: null,
    checkIntervalMinutes: 5,
    requestTimeoutSeconds: 10,
    description: 'به‌تازگی اضافه شده، هنوز بررسی نشده است',
    createdAt: minutesAgo(10),
  },
  {
    id: 'mon-8',
    name: 'CDN تصاویر',
    url: 'https://cdn.example.com',
    status: 'operational',
    isPaused: false,
    responseTimeMs: 98,
    uptimePercentage: 100,
    lastCheckedAt: minutesAgo(1),
    lastSuccessAt: minutesAgo(1),
    checkIntervalMinutes: 1,
    requestTimeoutSeconds: 5,
    createdAt: daysAgo(400),
  },
];

function pointsForRange(range: ResponseTimeRange, base: number, volatile = false): ResponseTimePoint[] {
  const config = {
    '24h': { count: 24, stepMs: 60 * 60_000 },
    '7d': { count: 7 * 24, stepMs: 60 * 60_000 },
    '30d': { count: 30, stepMs: 24 * 60 * 60_000 },
  }[range];

  const points: ResponseTimePoint[] = [];
  for (let i = config.count; i >= 0; i--) {
    const t = new Date(now() - i * config.stepMs);
    const noise = Math.sin(i / 3) * (volatile ? 400 : 40) + (Math.random() - 0.5) * (volatile ? 300 : 30);
    const spike = volatile && Math.random() > 0.93 ? Math.random() * 1500 : 0;
    points.push({
      timestamp: t.toISOString(),
      responseTimeMs: Math.max(20, Math.round(base + noise + spike)),
    });
  }
  return points;
}

export function getResponseTimeSeries(monitorId: string, range: ResponseTimeRange): ResponseTimePoint[] {
  const monitor = monitorsMock.find((m) => m.id === monitorId);
  if (!monitor) return [];
  const volatile = monitor.status === 'degraded' || monitor.status === 'down';
  return pointsForRange(range, monitor.responseTimeMs ?? 200, volatile);
}

export function getAggregateResponseTimeSeries(range: ResponseTimeRange): ResponseTimePoint[] {
  return pointsForRange(range, 240, false);
}

const RESULT_POOL: CheckResult[] = ['success', 'success', 'success', 'success', 'http_error', 'network_error', 'timeout'];

export function getCheckHistory(monitorId: string, count = 20): CheckHistoryEntry[] {
  const monitor = monitorsMock.find((m) => m.id === monitorId);
  const entries: CheckHistoryEntry[] = [];
  for (let i = 0; i < count; i++) {
    const biasedResult: CheckResult =
      monitor?.status === 'down' && i < 4
        ? 'http_error'
        : RESULT_POOL[Math.floor(Math.random() * RESULT_POOL.length)];

    let httpStatusCode: number | null = null;
    let errorSummary: string | undefined;

    if (biasedResult === 'success') {
      httpStatusCode = 200;
    } else if (biasedResult === 'http_error') {
      httpStatusCode = [500, 502, 503, 404][Math.floor(Math.random() * 4)];
      errorSummary = `پاسخ سرور با کد وضعیت ${httpStatusCode} بازگشت`;
    } else if (biasedResult === 'network_error') {
      errorSummary = 'اتصال به سرور برقرار نشد (DNS یا شبکه)';
    } else if (biasedResult === 'timeout') {
      errorSummary = `درخواست پس از ${monitor?.requestTimeoutSeconds ?? 10} ثانیه به پایان رسید`;
    }

    entries.push({
      id: `${monitorId}-chk-${i}`,
      timestamp: minutesAgo(i * (monitor?.checkIntervalMinutes ?? 5)),
      result: biasedResult,
      httpStatusCode,
      responseTimeMs: biasedResult === 'success' ? Math.round(100 + Math.random() * 400) : null,
      errorSummary,
    });
  }
  return entries;
}
