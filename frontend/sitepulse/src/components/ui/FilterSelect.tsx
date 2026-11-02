import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  label?: string;
  className?: string;
}

export function FilterSelect({ value, onChange, options, label, className = '' }: FilterSelectProps) {
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      {label && <span className="sr-only">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-md border border-stone bg-ivory py-2.5 pe-8 ps-3 text-sm text-ink focus:border-ink/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute end-2.5 h-4 w-4 text-charcoal/60" />
    </label>
  );
}
