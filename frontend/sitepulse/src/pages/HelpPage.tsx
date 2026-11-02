import {
  Activity,
  AlertOctagon,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock,
  Gauge,
  LifeBuoy,
  MessageCircle,
  Plus,
  Radar,
  Send,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { PageHeader } from '../components/layout/PageHeader';

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="card mt-6 p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal/15">
          <Icon className="h-4 w-4 text-signal" strokeWidth={2} />
        </span>
        <h2 className="text-base font-semibold text-ink">{title}</h2>
      </div>
      <div className="mt-4 text-sm leading-7 text-charcoal">{children}</div>
    </section>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink/10 text-xs font-bold text-ink">
        {n}
      </span>
      <div>
        <span className="font-medium text-ink">{title}</span>
        <p className="mt-0.5 text-charcoal">{children}</p>
      </div>
    </li>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="border-b border-stone/50 py-4 last:border-0">
      <h3 className="text-sm font-semibold text-ink">{q}</h3>
      <p className="mt-1.5 text-charcoal">{children}</p>
    </div>
  );
}

export function HelpPage() {
  return (
    <div>
      <PageHeader
        title="راهنما و مستندات"
        description="همه‌چیز درباره استفاده از SitePulse — از افزودن سایت تا تنظیم اعلان‌های تلگرام."
      />

      <Section icon={BookOpen} title="شروع سریع">
        <ol className="space-y-3">
          <Step n={1} title="ثبت‌نام یا ورود">
            با ایمیل و رمز عبور حساب بسازید یا وارد شوید.
          </Step>
          <Step n={2} title="افزودن سایت">
            از بخش «مانیتورها» روی «افزودن سایت» بزنید و نام، آدرس، بازه بررسی و زمان انتظار را وارد کنید.
          </Step>
          <Step n={3} title="پایش خودکار">
            سیستم طبق بازه انتخابی، سایت را بررسی می‌کند و وضعیت آن را در داشبورد نشان می‌دهد.
          </Step>
          <Step n={4} title="تنظیم اعلان‌ها">
            از «تنظیمات اعلان‌ها» ربات تلگرام را متصل کنید تا هنگام قطعی یا بازیابی مطلع شوید.
          </Step>
        </ol>
      </Section>

      <Section icon={Activity} title="وضعیت‌ها">
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-ink" />
            <span className="font-medium text-ink">عملیاتی</span>
            <span>— سایت سالم است و پاسخ می‌دهد.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-signal" />
            <span className="font-medium text-ink">از دسترس خارج</span>
            <span>— سایت پاسخ نمی‌دهد یا خطا برمی‌گرداند.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-charcoal/50" />
            <span className="font-medium text-ink">در انتظار بررسی</span>
            <span>— هنوز اولین بررسی انجام نشده است.</span>
          </li>
        </ul>
      </Section>

      <Section icon={Radar} title="بررسی‌ها و رخدادها">
        <p>
          هر بررسی (Check) نتیجه‌ای ثبت می‌کند: موفق، خطای HTTP، اتمام زمان (Timeout)، خطای اتصال یا خطای SSL.
          پس از چند شکست متوالی (به‌صورت پیش‌فرض ۳ بار) یک <span className="font-medium text-ink">رخداد</span> (Incident)
          باز می‌شود. وقتی سایت دوباره سالم شد، همان رخداد به‌صورت خودکار بسته می‌شود.
        </p>
      </Section>

      <Section icon={Gauge} title="آپ‌تایم">
        <p>
          درصد آپ‌تایم نسبت بررسی‌های موفق به کل بررسی‌ها در بازه ۳۰ روز گذشته است. برای سایت‌هایی که تازه اضافه
          شده‌اند و هنوز بررسی ندارند، مقدار صفر نمایش داده می‌شود.
        </p>
      </Section>

      <Section icon={Bell} title="اتصال تلگرام">
        <ol className="space-y-3">
          <Step n={1} title="ساخت ربات">
            در تلگرام با <span dir="ltr" className="ltr-num">@BotFather</span> گفتگو کنید و با دستور{' '}
            <span dir="ltr" className="ltr-num">/newbot</span> یک ربات بسازید. توکن دریافتی را نزد خود نگه دارید.
          </Step>
          <Step n={2} title="تنظیم توکن روی سرور">
            توکن را در متغیر <code>TELEGRAM_BOT_TOKEN</code> فایل <code>.env</code> قرار دهید.
          </Step>
          <Step n={3} title="شروع ربات">
            ربات خود را باز کنید و <span dir="ltr" className="ltr-num">/start</span> بزنید.
          </Step>
          <Step n={4} title="دریافت شناسه چت">
            شناسه عددی چت خود را با <span dir="ltr" className="ltr-num">@userinfobot</span> دریافت کنید.
          </Step>
          <Step n={5} title="وارد کردن شناسه و تست">
            شناسه را در «تنظیمات اعلان‌ها» وارد کنید، فعال‌سازی اعلان‌ها را روشن کنید و روی «ارسال پیام آزمایشی» بزنید.
          </Step>
        </ol>
      </Section>

      <Section icon={MessageCircle} title="پرسش‌های متداول">
        <Faq q="هر چند وقت یک‌بار سایت‌ها بررسی می‌شوند؟">
          طبق بازه‌ای که هنگام افزودن سایت انتخاب می‌کنید: هر ۱، ۵، ۱۰ یا ۳۰ دقیقه.
        </Faq>
        <Faq q="چرا اعلان تلگرام دریافت نمی‌کنم؟">
          مطمئن شوید توکن روی سرور تنظیم شده، شناسه چت درست وارد شده و «فعال‌سازی اعلان‌ها» روشن است. با دکمه
          «ارسال پیام آزمایشی» می‌توانید سریع بررسی کنید.
        </Faq>
        <Faq q="رخداد چه زمانی بسته می‌شود؟">
          به‌محض اینکه یک بررسی موفق انجام شود، رخداد باز به‌صورت خودکار بسته می‌شود.
        </Faq>
        <Faq q="آیا می‌توانم پایش را موقتاً متوقف کنم؟">
          بله. از منوی هر مانیتور گزینه «توقف پایش» را انتخاب کنید.
        </Faq>
      </Section>

      <Section icon={LifeBuoy} title="پشتیبانی">
        <p>
          برای راهنمایی بیشتر با تیم پشتیبانی SitePulse در تماس باشید. پیشنهادها و مشکلات خود را از طریق همین بخش
          برای ما ارسال کنید.
        </p>
      </Section>

      <div className="mt-6 flex flex-wrap gap-2 text-xs text-charcoal">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-signal" /> پایش خودکار
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5">
          <AlertOctagon className="h-3.5 w-3.5 text-signal" /> مدیریت رخدادها
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5">
          <Clock className="h-3.5 w-3.5 text-signal" /> بازه‌های قابل تنظیم
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5">
          <Send className="h-3.5 w-3.5 text-signal" /> اعلان تلگرام
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-ink/5 px-3 py-1.5">
          <Plus className="h-3.5 w-3.5 text-signal" /> افزودن نامحدود سایت
        </span>
      </div>
    </div>
  );
}
