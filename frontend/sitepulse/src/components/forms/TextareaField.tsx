import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, id, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <textarea
          id={fieldId}
          ref={ref}
          aria-invalid={!!error}
          rows={3}
          className={`w-full resize-none rounded-md border bg-ivory px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/50 focus:border-ink/40 ${
            error ? 'border-signal' : 'border-stone'
          } ${className}`}
          {...rest}
        />
        {error ? (
          <p className="text-xs text-signal">{error}</p>
        ) : hint ? (
          <p className="text-xs text-charcoal">{hint}</p>
        ) : null}
      </div>
    );
  },
);

TextareaField.displayName = 'TextareaField';
