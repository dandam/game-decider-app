'use client';

import { ReactNode, HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const formFieldVariants = cva('space-y-2', {
  variants: {
    size: {
      sm: 'space-y-1',
      default: 'space-y-2',
      lg: 'space-y-3',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const labelVariants = cva(
  'block font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
      },
      required: {
        true: "after:content-['*'] after:ml-0.5 after:text-red-500",
        false: '',
      },
    },
    defaultVariants: {
      size: 'default',
      required: false,
    },
  }
);

const helpTextVariants = cva('text-surface-600', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

const errorTextVariants = cva('text-red-600 font-medium', {
  variants: {
    size: {
      sm: 'text-xs',
      default: 'text-sm',
      lg: 'text-sm',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

export interface FormFieldProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof formFieldVariants> {
  label?: string;
  htmlFor?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  className,
  size,
  label,
  htmlFor,
  error,
  helpText,
  required = false,
  children,
  ...props
}: FormFieldProps) {
  return (
    <div className={formFieldVariants({ size, className })} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className={labelVariants({ size, required })}
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p className={errorTextVariants({ size })} role="alert">
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className={helpTextVariants({ size })}>{helpText}</p>
      )}
    </div>
  );
} 