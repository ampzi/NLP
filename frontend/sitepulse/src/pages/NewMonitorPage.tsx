import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { PageHeader } from '../components/layout/PageHeader';
import { FormField } from '../components/forms/FormField';
import { SelectField } from '../components/forms/SelectField';
import { TextareaField } from '../components/forms/TextareaField';
import { PrimaryButton, SecondaryButton } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { createMonitor } from '../services/monitors.service';

// Available intervals are easy to change here to match whatever the
// backend eventually supports.
const INTERVAL_OPTIONS = [1, 5, 10, 30] as const;

const monitorSchema = z.object({
  name: z.string().min(2, 'نام مانیتور باید حداقل ۲ کاراکتر باشد.'),
  url: z
    .string()
    .min(1, 'وارد کردن آدرس وب‌سایت الزامی است.')
    .url('آدرس وب‌سایت معتبر نیست. مثال: https://example.com'),
  checkIntervalMinutes: z.coerce.number().refine((v) => INTERVAL_OPTIONS.includes(v as 1 | 5 | 10 | 30), {
    message: 'بازه بررسی نامعتبر است.',
  }),
  requestTimeoutSeconds: z.coerce
    .number()
    .min(1, 'حداقل ۱ ثانیه.')
    .max(60, 'حداکثر ۶۰ ثانیه.'),
  description: z.string().optional(),
});

type MonitorFormInput = z.input<typeof monitorSchema>;
type MonitorSchema = z.output<typeof monitorSchema>;

export function NewMonitorPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MonitorFormInput, unknown, MonitorSchema>({
    resolver: zodResolver(monitorSchema),
    defaultValues: {
      name: '',
      url: '',
      checkIntervalMinutes: 5,
      requestTimeoutSeconds: 10,
      description: '',
    },
  });

  const onSubmit = async (values: MonitorSchema) => {
    setSubmitError(null);
    try {
      await createMonitor({
        ...values,
        checkIntervalMinutes: values.checkIntervalMinutes as 1 | 5 | 10 | 30,
      });
      showToast('success', 'مانیتور با موفقیت ایجاد شد. بررسی اولیه به‌زودی انجام می‌شود.');
      navigate('/monitors');
    } catch {
      setSubmitError('ایجاد مانیتور با خطا مواجه شد. دوباره تلاش کنید.');
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="افزودن سایت" description="یک مانیتور جدید برای پایش وب‌سایت خود ایجاد کنید." />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card flex flex-col gap-5 p-5 sm:p-6">
        <FormField
          label="نام مانیتور"
          placeholder="مثلاً فروشگاه اصلی"
          error={errors.name?.message}
          {...register('name')}
        />
        <FormField
          label="آدرس وب‌سایت"
          placeholder="https://example.com"
          dir="ltr"
          className="text-start"
          hint="آدرس کامل شامل https:// را وارد کنید."
          error={errors.url?.message}
          {...register('url')}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="بازه بررسی"
            options={[
              { value: 1, label: 'هر ۱ دقیقه' },
              { value: 5, label: 'هر ۵ دقیقه' },
              { value: 10, label: 'هر ۱۰ دقیقه' },
              { value: 30, label: 'هر ۳۰ دقیقه' },
            ]}
            error={errors.checkIntervalMinutes?.message}
            {...register('checkIntervalMinutes')}
          />
          <FormField
            label="زمان انتظار درخواست (ثانیه)"
            type="number"
            min={1}
            max={60}
            error={errors.requestTimeoutSeconds?.message}
            {...register('requestTimeoutSeconds')}
          />
        </div>

        <TextareaField
          label="توضیحات (اختیاری)"
          placeholder="یادداشتی برای این مانیتور..."
          error={errors.description?.message}
          {...register('description')}
        />

        {submitError && (
          <p role="alert" className="rounded-md bg-signal/10 px-3 py-2 text-sm text-signal">
            {submitError}
          </p>
        )}

        <p className="text-xs text-charcoal">
          پس از ایجاد مانیتور، اولین بررسی طبق بازه انتخابی شما انجام خواهد شد و بلافاصله نتیجه‌ای نمایش داده نمی‌شود.
        </p>

        <div className="flex justify-end gap-2">
          <SecondaryButton type="button" onClick={() => navigate('/monitors')}>
            انصراف
          </SecondaryButton>
          <PrimaryButton type="submit" isLoading={isSubmitting}>
            ایجاد مانیتور
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
