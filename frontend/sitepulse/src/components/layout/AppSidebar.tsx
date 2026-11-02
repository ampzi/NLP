import {
  Activity,
  AlertOctagon,
  Bell,
  HelpCircle,
  LayoutGrid,
  LogOut,
  Radar,
  X,
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getStoredUser } from '../../services/api';
import { logout } from '../../services/auth.service';

const navItems = [
  { to: '/dashboard', label: 'نمای کلی', icon: LayoutGrid },
  { to: '/monitors', label: 'مانیتورها', icon: Radar },
  { to: '/incidents', label: 'رخدادها', icon: AlertOctagon },
  { to: '/settings/notifications', label: 'تنظیمات اعلان‌ها', icon: Bell },
];

function initials(name?: string): string {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0].slice(0, 1)}.${parts[1].slice(0, 1)}`;
  return parts[0].slice(0, 2);
}

interface AppSidebarProps {
  onNavigate?: () => void;
  isMobile?: boolean;
  onClose?: () => void;
}

export function AppSidebar({ onNavigate, isMobile, onClose }: AppSidebarProps) {
  const navigate = useNavigate();
  const user = getStoredUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-white/10 bg-[#0d1219]/85 text-white/80 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2 px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-signal/20">
            <Activity className="h-4 w-4 text-signal" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">SitePulse</span>
        </div>
        {isMobile && (
          <button
            onClick={onClose}
            aria-label="بستن منو"
            className="rounded p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'bg-signal/20 font-medium text-white'
                  : 'text-white/65 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-4 w-4 ${isActive ? 'text-signal' : 'text-white/50'}`}
                  strokeWidth={2}
                />
                <span>{item.label}</span>
                {isActive && <span className="me-auto h-1.5 w-1.5 rounded-full bg-signal" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-3">
        <NavLink
          to="/help"
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              isActive ? 'bg-signal/20 font-medium text-white' : 'text-white/65 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <HelpCircle className="h-4 w-4 text-white/50" strokeWidth={2} />
          راهنما و مستندات
        </NavLink>
      </div>

      <NavLink
        to="/settings/profile"
        onClick={onNavigate}
        className="flex items-center gap-3 border-t border-white/10 px-5 py-4 text-sm text-white/80 hover:bg-white/5"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
          {initials(user?.name)}
        </div>
        <div className="min-w-0 flex-1 text-start">
          <p className="truncate text-sm font-medium text-white">{user?.name ?? 'کاربر'}</p>
          <p className="truncate text-xs text-white/50">مشاهده حساب کاربری</p>
        </div>
      </NavLink>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 border-t border-white/10 px-5 py-3 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
      >
        <LogOut className="h-4 w-4 text-white/50" />
        خروج از حساب
      </button>
    </aside>
  );
}
