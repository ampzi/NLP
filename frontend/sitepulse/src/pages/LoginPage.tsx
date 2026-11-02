import { zodResolver } from '@hookform/resolvers/zod';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { CheckboxField } from '../components/forms/CheckboxField';
import { FormField } from '../components/forms/FormField';
import { PrimaryButton } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { login } from '../services/auth.service';

const loginSchema = z.object({
  email: z.string().min(1, 'وارد کردن ایمیل الزامی است.').email('ایمیل معتبر نیست.'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد.'),
  rememberMe: z.boolean(),
});

type LoginSchema = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values: LoginSchema) => {
    setSubmitError(null);
    try {
      await login(values);
      showToast('success', 'ورود با موفقیت انجام شد.');
      navigate('/dashboard');
    } catch {
      setSubmitError('ایمیل یا رمز عبور نادرست است.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-signal/15">
            <Activity className="h-5 w-5 text-signal" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-ink">خوش آمدید</h1>
          <p className="mt-1.5 text-sm text-charcoal">
            برای دسترسی به داشبورد پایش سایت‌های خود وارد شوید.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField
            label="ایمیل"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <FormField
            label="رمز عبور"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center justify-between">
            <CheckboxField label="مرا به خاطر بسپار" {...register('rememberMe')} />
          </div>

          {submitError && (
            <p role="alert" className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
              {submitError}
            </p>
          )}

          <PrimaryButton type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            ورود
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal">
          حساب کاربری ندارید؟{' '}
          <Link to="/register" className="font-medium text-ink hover:text-signal">
            ثبت‌نام کنید
          </Link>
        </p>
      </div>
    </div>
  );
}
