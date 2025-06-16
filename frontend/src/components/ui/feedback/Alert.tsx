'use client';

import { HTMLAttributes, forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const alertVariants = cva(
  'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-surface-950',
  {
    variants: {
      variant: {
        default: 'bg-surface-50 text-surface-900 border-surface-200',
        success: 'bg-green-50 text-green-900 border-green-200 [&>svg]:text-green-600',
        warning: 'bg-yellow-50 text-yellow-900 border-yellow-200 [&>svg]:text-yellow-600',
        error: 'bg-red-50 text-red-900 border-red-200 [&>svg]:text-red-600',
        info: 'bg-blue-50 text-blue-900 border-blue-200 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const alertTitleVariants = cva('mb-1 font-medium leading-none tracking-tight text-sm');

const alertDescriptionVariants = cva('text-sm [&_p]:leading-relaxed');

export interface AlertProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  icon?: ReactNode;
}

export interface AlertTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {}

// Default icons for each variant
const DefaultIcons = {
  default: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  success: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
      />
    </svg>
  ),
  error: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = 'default', icon, children, ...props }, ref) => {
    const displayIcon = icon !== null ? icon || DefaultIcons[variant || 'default'] : null;

    return (
      <div ref={ref} role="alert" className={alertVariants({ variant, className })} {...props}>
        {displayIcon}
        <div>{children}</div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

export const AlertTitle = forwardRef<HTMLParagraphElement, AlertTitleProps>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={alertTitleVariants({ className })} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

export const AlertDescription = forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={alertDescriptionVariants({ className })} {...props} />
  )
);
AlertDescription.displayName = 'AlertDescription';
