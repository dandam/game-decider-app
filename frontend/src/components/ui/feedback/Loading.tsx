'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingVariants = cva('flex items-center justify-center', {
  variants: {
    size: {
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-surface-300 border-t-primary',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const dotsVariants = cva('flex space-x-1', {
  variants: {
    size: {
      sm: 'space-x-0.5',
      default: 'space-x-1',
      lg: 'space-x-1.5',
      xl: 'space-x-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const dotVariants = cva('rounded-full bg-primary animate-pulse', {
  variants: {
    size: {
      sm: 'h-1 w-1',
      default: 'h-1.5 w-1.5',
      lg: 'h-2 w-2',
      xl: 'h-3 w-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface LoadingProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingVariants> {
  variant?: 'spinner' | 'dots';
  text?: string;
}

export const Loading = forwardRef<HTMLDivElement, LoadingProps>(
  ({ className, size, variant = 'spinner', text, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center space-y-2 ${className || ''}`}
        {...props}
      >
        <div className={loadingVariants({ size })}>
          {variant === 'spinner' ? (
            <div className={spinnerVariants({ size })} />
          ) : (
            <div className={dotsVariants({ size })}>
              <div className={dotVariants({ size })} style={{ animationDelay: '0ms' }} />
              <div className={dotVariants({ size })} style={{ animationDelay: '150ms' }} />
              <div className={dotVariants({ size })} style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
        {text && <p className="text-sm text-surface-600 font-medium">{text}</p>}
      </div>
    );
  }
);

Loading.displayName = 'Loading';
