import { AlertTriangle } from 'lucide-react';
import { SecondaryButton } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'مشکلی پیش آمد',
  description = 'دریافت اطلاعات با خطا مواجه شد. لطفاً دوباره تلاش کنید.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-stone px-6 py-14 text-center">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-signal/10">
        <AlertTriangle className="h-5 w-5 text-signal" strokeWidth={1.75} />
      </div>
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-charcoal">{description}</p>
      {onRetry && (
        <div className="mt-4">
          <SecondaryButton onClick={onRetry}>تلاش مجدد</SecondaryButton>
        </div>
      )}
    </div>
  );
}
