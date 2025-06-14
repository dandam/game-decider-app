'use client';

import { TextareaHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const textareaVariants = cva(
  'flex min-h-[80px] w-full rounded-md border bg-surface-50 px-3 py-2 text-sm font-medium transition-colors placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50 resize-vertical',
  {
    variants: {
      variant: {
        default: 'border-surface-300 hover:border-surface-400 focus-visible:border-primary',
        error: 'border-red-500 hover:border-red-600 focus-visible:border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 hover:border-green-600 focus-visible:border-green-500 focus-visible:ring-green-500',
      },
      size: {
        sm: 'min-h-[60px] px-2 py-1 text-xs',
        default: 'min-h-[80px] px-3 py-2 text-sm',
        lg: 'min-h-[120px] px-4 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: boolean;
  success?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, size, error, success, ...props }, ref) => {
    // Determine variant based on state props
    const computedVariant = error ? 'error' : success ? 'success' : variant;

    return (
      <textarea
        className={textareaVariants({ variant: computedVariant, size, className })}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea'; 