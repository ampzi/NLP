import type { SelectHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  hint?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, options, error, hint, id, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <div className="relative">
          <select
            id={fieldId}
            ref={ref}
            aria-invalid={!!error}
            className={`w-full appearance-none rounded-md border bg-ivory px-3 py-2.5 pe-9 text-sm text-ink focus:border-ink/40 ${
              error ? 'border-signal' : 'border-stone'
            } ${className}`}
            {...rest}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal/60" />
        </div>
        {error ? (
          <p className="text-xs text-signal">{error}</p>
        ) : hint ? (
          <p className="text-xs text-charcoal">{hint}</p>
        ) : null}
      </div>
    );
  },
);

SelectField.displayName = 'SelectField';
