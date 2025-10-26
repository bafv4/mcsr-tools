import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from './lib/utils';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, ...props }, ref) => {
    return (
      <label className="inline-flex items-center cursor-pointer">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={checked}
            {...props}
          />
          <div
            className={cn(
              'switch-bg',
              checked ? 'switch-bg-checked' : 'switch-bg-unchecked'
            )}
          />
          <div
            className={cn(
              'switch-thumb',
              checked && 'translate-x-5'
            )}
          />
        </div>
        {label && <span className="ml-3 text-sm font-medium text-muted">{label}</span>}
      </label>
    );
  }
);

Switch.displayName = 'Switch';
