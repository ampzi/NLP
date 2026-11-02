// Persian (fa-IR) formatting helpers so numbers, dates and durations read
// naturally in the RTL interface while staying accurate.

const faNumberFormatter = new Intl.NumberFormat('fa-IR');
const faDateTimeFormatter = new Intl.DateTimeFormat('fa-IR', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
const faDateFormatter = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' });
const faTimeFormatter = new Intl.DateTimeFormat('fa-IR', { timeStyle: 'short' });

export function formatNumber(value: number): string {
  return faNumberFormatter.format(value);
}

export function formatMs(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${formatNumber(Math.round(value))} میلی‌ثانیه`;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return faDateTimeFormatter.format(new Date(iso));
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return faDateFormatter.format(new Date(iso));
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return faTimeFormatter.format(new Date(iso));
}

export function formatUptime(value: number): string {
  return `${formatNumber(Number(value.toFixed(2)))}٪`;
}

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return 'هرگز بررسی نشده';
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return 'همین الان';
  if (diffMinutes < 60) return `${formatNumber(diffMinutes)} دقیقه پیش`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${formatNumber(diffHours)} ساعت پیش`;

  const diffDays = Math.round(diffHours / 24);
  return `${formatNumber(diffDays)} روز پیش`;
}

export function formatDuration(startIso: string, endIso: string | null): string {
  const end = endIso ? new Date(endIso).getTime() : Date.now();
  const diffMs = end - new Date(startIso).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 60) return `${formatNumber(diffMinutes)} دقیقه`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  if (hours < 24) {
    return minutes > 0
      ? `${formatNumber(hours)} ساعت و ${formatNumber(minutes)} دقیقه`
      : `${formatNumber(hours)} ساعت`;
  }

  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0
    ? `${formatNumber(days)} روز و ${formatNumber(remHours)} ساعت`
    : `${formatNumber(days)} روز`;
}
