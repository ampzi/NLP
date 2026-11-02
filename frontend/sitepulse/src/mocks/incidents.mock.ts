import type { Incident } from '../types/incident';

const now = () => Date.now();
const hoursAgo = (h: number) => new Date(now() - h * 60 * 60_000).toISOString();
const daysAgo = (d: number) => new Date(now() - d * 24 * 60 * 60_000).toISOString();

export const incidentsMock: Incident[] = [
  {
    id: 'inc-1',
    monitorId: 'mon-3',
    monitorName: 'API پرداخت',
    startedAt: hoursAgo(2),
    resolvedAt: null,
    state: 'active',
    failureSummary: 'سرور به‌طور مکرر خطای ۵۰۲ بازمی‌گرداند',
  },
  {
    id: 'inc-2',
    monitorId: 'mon-4',
    monitorName: 'وبلاگ شرکتی',
    startedAt: hoursAgo(5),
    resolvedAt: null,
    state: 'active',
    failureSummary: 'زمان پاسخ به‌طور غیرعادی بالا رفته است',
  },
  {
    id: 'inc-3',
    monitorId: 'mon-1',
    monitorName: 'فروشگاه اصلی',
    startedAt: daysAgo(2),
    resolvedAt: hoursAgo(44),
    state: 'resolved',
    failureSummary: 'قطعی کوتاه‌مدت به دلیل بروزرسانی زیرساخت',
  },
  {
    id: 'inc-4',
    monitorId: 'mon-2',
    monitorName: 'پنل مدیریت',
    startedAt: daysAgo(5),
    resolvedAt: daysAgo(5),
    state: 'resolved',
    failureSummary: 'خطای اتصال شبکه به مدت ۴ دقیقه',
  },
  {
    id: 'inc-5',
    monitorId: 'mon-8',
    monitorName: 'CDN تصاویر',
    startedAt: daysAgo(12),
    resolvedAt: daysAgo(12),
    state: 'resolved',
    failureSummary: 'تایم‌اوت موقت در پاسخ‌دهی',
  },
  {
    id: 'inc-6',
    monitorId: 'mon-6',
    monitorName: 'وب‌سایت شرکتی',
    startedAt: daysAgo(20),
    resolvedAt: daysAgo(20),
    state: 'resolved',
    failureSummary: 'خطای سرور ۵۰۰ هنگام استقرار نسخه جدید',
  },
];
