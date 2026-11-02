import type {
  LoginFormValues,
  ProfileFormValues,
  RegisterFormValues,
  User,
} from '../types/auth';
import {
  apiFetch,
  clearStoredUser,
  clearToken,
  getStoredUser,
  setStoredUser,
  setToken,
} from './api';

type AuthResponse = {
  access_token: string;
  user: { id: number; email: string; name: string; createdAt?: string };
};

type MeResponse = {
  id: number;
  email: string;
  name: string;
  createdAt?: string;
};

function toUser(u: { id: number; email: string; name: string; createdAt?: string }): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

export async function login(values: LoginFormValues): Promise<User> {
  const res = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: values.email, password: values.password }),
  });
  setToken(res.access_token);
  const user = toUser(res.user);
  setStoredUser({ id: res.user.id, email: res.user.email, name: res.user.name, createdAt: user.createdAt });
  return user;
}

export async function register(values: RegisterFormValues): Promise<User> {
  const res = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: values.name, email: values.email, password: values.password }),
  });
  setToken(res.access_token);
  const user = toUser(res.user);
  setStoredUser({ id: res.user.id, email: res.user.email, name: res.user.name, createdAt: user.createdAt });
  return user;
}

export async function getCurrentUser(): Promise<User> {
  const me = await apiFetch<MeResponse>('/auth/me');
  const user = toUser(me);
  setStoredUser({ id: me.id, email: me.email, name: me.name, createdAt: user.createdAt });
  return user;
}

export async function updateProfile(values: ProfileFormValues): Promise<User> {
  const me = await apiFetch<{ id: number }>('/auth/me');
  const updated = await apiFetch<MeResponse>(`/user/${me.id}`, {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
  const user = toUser(updated);
  setStoredUser({ id: updated.id, email: updated.email, name: updated.name, createdAt: user.createdAt });
  return user;
}

export async function changePassword(values: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiFetch('/auth/password', {
    method: 'PATCH',
    body: JSON.stringify(values),
  });
}

export function logout(): void {
  clearToken();
  clearStoredUser();
}

/** Convenience: the cached user for header/sidebar without a network call. */
export function currentStoredUser() {
  return getStoredUser();
}
