export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  telegramConnected: boolean;
  telegramChatId: string;
  notificationsEnabled: boolean;
  notifyOnDown: boolean;
  notifyOnRecovery: boolean;
}

export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface PasswordChangeFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
