import type { ResponseTimeRange } from '../../types/monitor';

const options: { value: ResponseTimeRange; label: string }[] = [
  { value: '24h', label: '۲۴ ساعت' },
  { value: '7d', label: '۷ روز' },
  { value: '30d', label: '۳۰ روز' },
];

interface DateRangeSelectorProps {
  value: ResponseTimeRange;
  onChange: (value: ResponseTimeRange) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-stone bg-ivory p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value ? 'bg-signal text-white' : 'text-charcoal hover:bg-white/5'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
