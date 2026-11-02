import { zodResolver } from '@hookform/resolvers/zod';
import { Activity } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { FormField } from '../components/forms/FormField';
import { PrimaryButton } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { register as registerUser } from '../services/auth.service';

const registerSchema = z
  .object({
    name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد.'),
    email: z.string().min(1, 'وارد کردن ایمیل الزامی است.').email('ایمیل معتبر نیست.'),
    password: z.string().min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد.'),
    confirmPassword: z.string().min(1, 'تکرار رمز عبور الزامی است.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'رمز عبور و تکرار آن یکسان نیستند.',
    path: ['confirmPassword'],
  });

type RegisterSchema = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterSchema) => {
    setSubmitError(null);
    try {
      await registerUser(values);
      showToast('success', 'حساب کاربری شما با موفقیت ایجاد شد.');
      navigate('/dashboard');
    } catch {
      setSubmitError('ثبت‌نام با خطا مواجه شد. دوباره تلاش کنید.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-signal/15">
            <Activity className="h-5 w-5 text-signal" strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-semibold text-ink">ساخت حساب کاربری</h1>
          <p className="mt-1.5 text-sm text-charcoal">
            برای شروع پایش سایت‌های خود، حساب کاربری بسازید.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <FormField
            label="نام"
            autoComplete="name"
            placeholder="نام و نام خانوادگی"
            error={errors.name?.message}
            {...registerField('name')}
          />
          <FormField
            label="ایمیل"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...registerField('email')}
          />
          <FormField
            label="رمز عبور"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...registerField('password')}
          />
          <FormField
            label="تکرار رمز عبور"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...registerField('confirmPassword')}
          />

          {submitError && (
            <p role="alert" className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
              {submitError}
            </p>
          )}

          <PrimaryButton type="submit" isLoading={isSubmitting} className="mt-1 w-full">
            ثبت‌نام
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal">
          قبلاً حساب ساخته‌اید؟{' '}
          <Link to="/login" className="font-medium text-ink hover:text-signal">
            وارد شوید
          </Link>
        </p>
      </div>
    </div>
  );
}
