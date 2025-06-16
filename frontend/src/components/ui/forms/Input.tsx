'use client';

import { InputHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const inputVariants = cva(
  'flex w-full rounded-md border bg-surface-50 px-3 py-2 text-sm font-medium transition-colors placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-surface-300 hover:border-surface-400 focus-visible:border-primary',
        error:
          'border-red-500 hover:border-red-600 focus-visible:border-red-500 focus-visible:ring-red-500',
        success:
          'border-green-500 hover:border-green-600 focus-visible:border-green-500 focus-visible:ring-green-500',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10 px-3 text-sm',
        lg: 'h-12 px-4 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean;
  success?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, error, success, type = 'text', ...props }, ref) => {
    // Determine variant based on state props
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <input
        type={type}
        className={inputVariants({ variant: computedVariant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
