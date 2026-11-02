import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface BaseProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  icon?: ReactNode;
}

export function PrimaryButton({ children, isLoading, icon, disabled, className = '', ...rest }: BaseProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md bg-signal px-4 py-2.5 text-sm font-medium text-white shadow-glass transition-colors hover:bg-signal/90 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, isLoading, icon, disabled, className = '', ...rest }: BaseProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-stone bg-ivory px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-ink/5 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function DangerButton({ children, isLoading, icon, disabled, className = '', ...rest }: BaseProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md border border-signal/40 bg-ivory px-4 py-2.5 text-sm font-medium text-signal transition-colors hover:bg-signal/10 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

export function GhostIconButton({ children, isLoading, disabled, className = '', ...rest }: BaseProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-md p-2 text-charcoal transition-colors hover:bg-ink/5 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}
