import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from './lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label-base">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'select-base',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
