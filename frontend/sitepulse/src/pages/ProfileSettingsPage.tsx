import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField } from '../components/forms/FormField';
import { PrimaryButton } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { useToast } from '../components/ui/Toast';
import { changePassword, getCurrentUser, updateProfile } from '../services/auth.service';
import type { User } from '../types/auth';
import { formatDate } from '../utils/format';

const profileSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد.'),
  email: z.string().min(1, 'وارد کردن ایمیل الزامی است.').email('ایمیل معتبر نیست.'),
});

type ProfileSchema = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'وارد کردن رمز عبور فعلی الزامی است.'),
    newPassword: z.string().min(8, 'رمز عبور جدید باید حداقل ۸ کاراکتر باشد.'),
    confirmNewPassword: z.string().min(1, 'تکرار رمز عبور الزامی است.'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'رمز عبور جدید و تکرار آن یکسان نیستند.',
    path: ['confirmNewPassword'],
  });

type PasswordSchema = z.infer<typeof passwordSchema>;

export function ProfileSettingsPage() {
  const { showToast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const profileForm = useForm<ProfileSchema>({
    resolver: zodResolver(profileSchema),
    values: user ? { name: user.name, email: user.email } : undefined,
  });

  const passwordForm = useForm<PasswordSchema>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  useEffect(() => {
    let cancelled = false;
    setError(false);
    getCurrentUser()
      .then((data) => !cancelled && setUser(data))
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const onSaveProfile = async (values: ProfileSchema) => {
    try {
      const updated = await updateProfile(values);
      setUser(updated);
      showToast('success', 'اطلاعات حساب کاربری به‌روزرسانی شد.');
    } catch {
      showToast('error', 'به‌روزرسانی اطلاعات با خطا مواجه شد.');
    }
  };

  const onChangePassword = async (values: PasswordSchema) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      showToast('success', 'رمز عبور با موفقیت تغییر کرد.');
      passwordForm.reset();
    } catch {
      showToast('error', 'تغییر رمز عبور با خطا مواجه شد.');
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="حساب کاربری" />
        <ErrorState onRetry={() => setReloadKey((k) => k + 1)} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="حساب کاربری" description="اطلاعات حساب و رمز عبور خود را مدیریت کنید." />

      {user === null ? (
        <div className="card space-y-4 p-6">
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-full" />
          <LoadingSkeleton className="h-10 w-28" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <form
            onSubmit={profileForm.handleSubmit(onSaveProfile)}
            noValidate
            className="card flex flex-col gap-4 p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-ink">اطلاعات حساب</h2>
            <FormField
              label="نام"
              error={profileForm.formState.errors.name?.message}
              {...profileForm.register('name')}
            />
            <FormField
              label="ایمیل"
              type="email"
              error={profileForm.formState.errors.email?.message}
              {...profileForm.register('email')}
            />
            <p className="text-xs text-charcoal">
              عضو از {formatDate(user.createdAt)}
            </p>
            <div className="flex justify-end">
              <PrimaryButton type="submit" isLoading={profileForm.formState.isSubmitting}>
                ذخیره تغییرات
              </PrimaryButton>
            </div>
          </form>

          <form
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            noValidate
            className="card flex flex-col gap-4 p-5 sm:p-6"
          >
            <h2 className="text-sm font-semibold text-ink">تغییر رمز عبور</h2>
            <FormField
              label="رمز عبور فعلی"
              type="password"
              autoComplete="current-password"
              error={passwordForm.formState.errors.currentPassword?.message}
              {...passwordForm.register('currentPassword')}
            />
            <FormField
              label="رمز عبور جدید"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register('newPassword')}
            />
            <FormField
              label="تکرار رمز عبور جدید"
              type="password"
              autoComplete="new-password"
              error={passwordForm.formState.errors.confirmNewPassword?.message}
              {...passwordForm.register('confirmNewPassword')}
            />
            <div className="flex justify-end">
              <PrimaryButton type="submit" isLoading={passwordForm.formState.isSubmitting}>
                تغییر رمز عبور
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
