import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  rightElement?: ReactNode;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, id, type, rightElement, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-ink">
          {label}
        </label>
        <div className="relative">
          <input
            id={fieldId}
            ref={ref}
            type={resolvedType}
            aria-invalid={!!error}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            className={`w-full rounded-md border bg-ivory px-3 py-2.5 text-sm text-ink placeholder:text-charcoal/50 focus:border-ink/40 ${
              error ? 'border-signal' : 'border-stone'
            } ${isPassword ? 'pe-10' : ''} ${className}`}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'پنهان کردن رمز عبور' : 'نمایش رمز عبور'}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-charcoal/70 hover:text-ink"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {!isPassword && rightElement && (
            <div className="absolute end-2.5 top-1/2 -translate-y-1/2">{rightElement}</div>
          )}
        </div>
        {error ? (
          <p id={`${fieldId}-error`} className="text-xs text-signal">
            {error}
          </p>
        ) : hint ? (
          <p id={`${fieldId}-hint`} className="text-xs text-charcoal">
            {hint}
          </p>
        ) : null}
      </div>
    );
  },
);

FormField.displayName = 'FormField';
