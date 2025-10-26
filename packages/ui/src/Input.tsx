import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label-base">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-base',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
