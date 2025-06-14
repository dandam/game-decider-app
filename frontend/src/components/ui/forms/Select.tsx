'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const selectVariants = cva(
  'flex w-full rounded-md border bg-surface-50 px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-no-repeat bg-right bg-[length:16px_16px] pr-8',
  {
    variants: {
      variant: {
        default: 'border-surface-300 hover:border-surface-400 focus-visible:border-primary',
        error: 'border-red-500 hover:border-red-600 focus-visible:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 hover:border-green-600 focus-visible:border-green-500 focus-visible:ring-green-500',
      },
      size: {
        sm: 'h-8 px-2 pr-6 text-xs',
        default: 'h-10 px-3 pr-8 text-sm',
        lg: 'h-12 px-4 pr-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  error?: boolean;
  success?: boolean;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, size, error, success, placeholder, children, ...props }, ref) => {
    // Determine variant based on state props
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <div className="relative">
        <select
          className={selectVariants({ variant: computedVariant, size, className })}
          ref={ref}
          {...props}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select'; 