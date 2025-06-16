'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const checkboxVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-sm border border-surface-300 bg-surface-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:border-primary data-[state=checked]:text-white',
  {
    variants: {
      size: {
        sm: 'h-3 w-3',
        default: 'h-4 w-4',
        lg: 'h-5 w-5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof checkboxVariants> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, size, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="checkbox"
            className={checkboxVariants({ size, className })}
            ref={ref}
            id={id}
            {...props}
          />
          {/* Checkmark icon */}
          <svg
            className="absolute inset-0 h-full w-full text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
