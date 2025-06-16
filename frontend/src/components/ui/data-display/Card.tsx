'use client';

import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const cardVariants = cva(
  'rounded-lg border bg-surface-50 text-surface-900 shadow-sm transition-colors',
  {
    variants: {
      variant: {
        default: 'border-surface-200',
        outlined: 'border-surface-300',
        elevated: 'border-surface-200 shadow-md',
        ghost: 'border-transparent shadow-none',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-6',
        lg: 'p-8',
      },
      interactive: {
        true: 'cursor-pointer hover:bg-surface-100 hover:shadow-md transition-all',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      interactive: false,
    },
  }
);

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3 pb-2',
      default: 'p-6 pb-4',
      lg: 'p-8 pb-6',
    },
  },
  defaultVariants: {
    padding: 'default',
  },
});

const cardContentVariants = cva('', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3 pt-0',
      default: 'p-6 pt-0',
      lg: 'p-8 pt-0',
    },
  },
  defaultVariants: {
    padding: 'default',
  },
});

const cardFooterVariants = cva('flex items-center', {
  variants: {
    padding: {
      none: 'p-0',
      sm: 'p-3 pt-2',
      default: 'p-6 pt-4',
      lg: 'p-8 pt-6',
    },
  },
  defaultVariants: {
    padding: 'default',
  },
});

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export interface CardHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

export interface CardContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

export interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, interactive, ...props }, ref) => (
    <div
      ref={ref}
      className={cardVariants({ variant, padding, interactive, className })}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cardHeaderVariants({ padding, className })} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<HTMLParagraphElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={`text-sm text-surface-600 ${className || ''}`} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cardContentVariants({ padding, className })} {...props} />
  )
);
CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding, ...props }, ref) => (
    <div ref={ref} className={cardFooterVariants({ padding, className })} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';
