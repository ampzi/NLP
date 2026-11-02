import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PrimaryButton } from '../components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-ivory px-4 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-signal/15">
        <Activity className="h-6 w-6 text-signal" strokeWidth={2.5} />
      </div>
      <p className="ltr-num text-sm font-medium text-signal">۴۰۴</p>
      <h1 className="mt-2 text-xl font-semibold text-ink sm:text-2xl">صفحه پیدا نشد</h1>
      <p className="mt-2 max-w-sm text-sm text-charcoal">
        صفحه‌ای که به دنبال آن بودید وجود ندارد یا جابه‌جا شده است.
      </p>
      <Link to="/dashboard" className="mt-6">
        <PrimaryButton type="button">بازگشت به داشبورد</PrimaryButton>
      </Link>
    </div>
  );
}
