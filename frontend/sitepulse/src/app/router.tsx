import type { ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { MonitorsPage } from '../pages/MonitorsPage';
import { NewMonitorPage } from '../pages/NewMonitorPage';
import { MonitorDetailsPage } from '../pages/MonitorDetailsPage';
import { IncidentsPage } from '../pages/IncidentsPage';
import { NotificationSettingsPage } from '../pages/NotificationSettingsPage';
import { ProfileSettingsPage } from '../pages/ProfileSettingsPage';
import { HelpPage } from '../pages/HelpPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { getToken } from '../services/api';

function RequireAuth({ children }: { children: ReactNode }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnly({ children }: { children: ReactNode }) {
  if (getToken()) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/dashboard" replace /> },
  {
    path: '/login',
    element: (
      <PublicOnly>
        <LoginPage />
      </PublicOnly>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicOnly>
        <RegisterPage />
      </PublicOnly>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/monitors', element: <MonitorsPage /> },
      { path: '/monitors/new', element: <NewMonitorPage /> },
      { path: '/monitors/:id', element: <MonitorDetailsPage /> },
      { path: '/incidents', element: <IncidentsPage /> },
      { path: '/settings/notifications', element: <NotificationSettingsPage /> },
      { path: '/settings/profile', element: <ProfileSettingsPage /> },
      { path: '/help', element: <HelpPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
