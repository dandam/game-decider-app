'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const radioVariants = cva(
  'peer h-4 w-4 shrink-0 rounded-full border border-surface-300 bg-surface-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50',
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

const radioGroupVariants = cva('space-y-2', {
  variants: {
    orientation: {
      vertical: 'space-y-2',
      horizontal: 'flex space-x-4 space-y-0',
    },
  },
  defaultVariants: {
    orientation: 'vertical',
  },
});

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>,
    VariantProps<typeof radioVariants> {
  label?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ className, size, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <div className="relative">
          <input
            type="radio"
            className={radioVariants({ size, className })}
            ref={ref}
            id={id}
            {...props}
          />
          {/* Radio dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
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

Radio.displayName = 'Radio';

export interface RadioGroupProps
  extends VariantProps<typeof radioGroupVariants> {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  options: RadioOption[];
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  disabled?: boolean;
}

export function RadioGroup({
  name,
  value,
  defaultValue,
  onValueChange,
  options,
  className,
  orientation,
  size,
  disabled,
}: RadioGroupProps) {
  return (
    <div className={radioGroupVariants({ orientation, className })} role="radiogroup">
      {options.map((option, index) => (
        <Radio
          key={option.value}
          id={`${name}-${option.value}`}
          name={name}
          value={option.value}
          label={option.label}
          size={size}
          disabled={disabled || option.disabled}
          checked={value ? value === option.value : defaultValue === option.value}
          onChange={(e) => {
            if (onValueChange && e.target.checked) {
              onValueChange(option.value);
            }
          }}
        />
      ))}
    </div>
  );
} 