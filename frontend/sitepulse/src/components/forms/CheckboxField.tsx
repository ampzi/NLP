import type { InputHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';

interface CheckboxFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(
  ({ label, id, className = '', ...rest }, ref) => {
    const generatedId = useId();
    const fieldId = id ?? generatedId;
    return (
      <label htmlFor={fieldId} className="flex cursor-pointer items-center gap-2 text-sm text-charcoal">
        <input
          id={fieldId}
          ref={ref}
          type="checkbox"
          className={`h-4 w-4 rounded border-stone text-signal focus:ring-signal/40 ${className}`}
          {...rest}
        />
        {label}
      </label>
    );
  },
);

CheckboxField.displayName = 'CheckboxField';
