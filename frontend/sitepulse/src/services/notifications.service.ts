import type { NotificationSettings } from '../types/auth';
import { apiFetch } from './api';

type BackendSettings = {
  telegramChatId: string | null;
  telegramEnabled: boolean;
  notifyOnDown: boolean;
  notifyOnRecovery: boolean;
};

function mapSettings(s: BackendSettings): NotificationSettings {
  return {
    telegramConnected: s.telegramEnabled && Boolean(s.telegramChatId),
    telegramChatId: s.telegramChatId ?? '',
    notificationsEnabled: s.telegramEnabled,
    notifyOnDown: s.notifyOnDown,
    notifyOnRecovery: s.notifyOnRecovery,
  };
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const s = await apiFetch<BackendSettings>('/notification-settings');
  return mapSettings(s);
}

export async function saveNotificationSettings(
  values: NotificationSettings,
): Promise<NotificationSettings> {
  const s = await apiFetch<BackendSettings>('/notification-settings', {
    method: 'PUT',
    body: JSON.stringify({
      telegramChatId: values.telegramChatId || null,
      telegramEnabled: values.notificationsEnabled,
      notifyOnDown: values.notifyOnDown,
      notifyOnRecovery: values.notifyOnRecovery,
    }),
  });
  return mapSettings(s);
}
