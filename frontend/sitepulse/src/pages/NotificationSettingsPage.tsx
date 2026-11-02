import { CheckCircle2, Send, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField } from '../components/forms/FormField';
import { PrimaryButton } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { getNotificationSettings, saveNotificationSettings } from '../services/notifications.service';
import type { NotificationSettings } from '../types/auth';

function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        {description && <p className="mt-0.5 text-xs text-charcoal">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-signal' : 'bg-stone'
        }`}
      >
        <span
          className={`inline-block transform rounded-full bg-white transition-transform ${
            checked ? '-translate-x-1' : '-translate-x-6'
          }`}
          style={{ height: 18, width: 18 }}
        />
      </button>
    </div>
  );
}

export function NotificationSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [original, setOriginal] = useState<NotificationSettings | null>(null);
  const [error, setError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setError(false);
    getNotificationSettings()
      .then((data) => {
        if (cancelled) return;
        setSettings(data);
        setOriginal(data);
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const hasUnsavedChanges = settings && original && JSON.stringify(settings) !== JSON.stringify(original);

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const saved = await saveNotificationSettings(settings);
      setSettings(saved);
      setOriginal(saved);
      showToast('success', 'تنظیمات اعلان‌ها با موفقیت ذخیره شد.');
    } catch {
      showToast('error', 'ذخیره تنظیمات با خطا مواجه شد.');
    } finally {
      setIsSaving(false);
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="تنظیمات اعلان‌ها" />
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader
        title="تنظیمات اعلان‌ها"
        description="نحوه اطلاع‌رسانی درباره وضعیت سایت‌های خود را مشخص کنید."
      />

      {settings === null ? (
        <div className="card space-y-4 p-6">
          <LoadingSkeleton className="h-5 w-40" />
          <LoadingSkeleton className="h-16 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="card p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-ink">اتصال تلگرام</h2>
            <p className="mt-1 text-xs text-charcoal">
              با اتصال ربات تلگرام SitePulse، اعلان‌های قطعی و بازیابی را فوراً دریافت کنید.
            </p>

            <div
              className={`mt-4 flex items-center gap-2 rounded-md px-3 py-2.5 text-sm ${
                settings.telegramConnected ? 'bg-ink/5 text-ink' : 'bg-charcoal/5 text-charcoal'
              }`}
            >
              {settings.telegramConnected ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0" />
              )}
              {settings.telegramConnected ? 'ربات تلگرام متصل است.' : 'ربات تلگرام متصل نیست.'}
            </div>

            <ol className="mt-4 list-decimal space-y-1.5 ps-5 text-xs text-charcoal">
              <li>ربات @SitePulseBot را در تلگرام پیدا و شروع کنید.</li>
              <li>دستور «شناسه من» را ارسال کنید تا شناسه چت خود را دریافت کنید.</li>
              <li>شناسه دریافتی را در فیلد زیر وارد و ذخیره کنید.</li>
            </ol>

            <div className="mt-4">
              <FormField
                label="شناسه چت تلگرام"
                placeholder="مثلاً 123456789"
                dir="ltr"
                className="text-start"
                value={settings.telegramChatId}
                onChange={(e) => setSettings({ ...settings, telegramChatId: e.target.value })}
                rightElement={<Send className="h-4 w-4 text-charcoal/50" />}
              />
            </div>
          </div>

          <div className="card divide-y divide-stone/70 p-5 sm:p-6">
            <h2 className="pb-2 text-sm font-semibold text-ink">تنظیمات عمومی</h2>
            <Toggle
              checked={settings.notificationsEnabled}
              onChange={(v) => setSettings({ ...settings, notificationsEnabled: v })}
              label="فعال‌سازی اعلان‌ها"
              description="در صورت غیرفعال بودن، هیچ اعلانی ارسال نخواهد شد."
            />
            <Toggle
              checked={settings.notifyOnDown}
              onChange={(v) => setSettings({ ...settings, notifyOnDown: v })}
              label="اطلاع‌رسانی هنگام قطعی"
              description="وقتی مانیتوری از دسترس خارج می‌شود مطلع شوید."
            />
            <Toggle
              checked={settings.notifyOnRecovery}
              onChange={(v) => setSettings({ ...settings, notifyOnRecovery: v })}
              label="اطلاع‌رسانی هنگام بازیابی"
              description="وقتی مانیتوری دوباره عملیاتی می‌شود مطلع شوید."
            />
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-charcoal">
              {hasUnsavedChanges ? 'تغییرات ذخیره‌نشده وجود دارد.' : 'تمام تغییرات ذخیره شده‌اند.'}
            </span>
            <PrimaryButton onClick={handleSave} isLoading={isSaving} disabled={!hasUnsavedChanges}>
              ذخیره تغییرات
            </PrimaryButton>
          </div>
        </div>
      )}
    </div>
  );
}
