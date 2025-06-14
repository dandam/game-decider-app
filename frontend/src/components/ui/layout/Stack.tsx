'use client';

import { HTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const stackVariants = cva('flex', {
  variants: {
    direction: {
      vertical: 'flex-col',
      horizontal: 'flex-row',
    },
    spacing: {
      none: '',
      xs: '',
      sm: '',
      default: '',
      lg: '',
      xl: '',
      '2xl': '',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch',
    },
    justify: {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly',
    },
  },
  compoundVariants: [
    // Vertical spacing
    { direction: 'vertical', spacing: 'xs', class: 'space-y-1' },
    { direction: 'vertical', spacing: 'sm', class: 'space-y-2' },
    { direction: 'vertical', spacing: 'default', class: 'space-y-4' },
    { direction: 'vertical', spacing: 'lg', class: 'space-y-6' },
    { direction: 'vertical', spacing: 'xl', class: 'space-y-8' },
    { direction: 'vertical', spacing: '2xl', class: 'space-y-12' },
    // Horizontal spacing
    { direction: 'horizontal', spacing: 'xs', class: 'space-x-1' },
    { direction: 'horizontal', spacing: 'sm', class: 'space-x-2' },
    { direction: 'horizontal', spacing: 'default', class: 'space-x-4' },
    { direction: 'horizontal', spacing: 'lg', class: 'space-x-6' },
    { direction: 'horizontal', spacing: 'xl', class: 'space-x-8' },
    { direction: 'horizontal', spacing: '2xl', class: 'space-x-12' },
  ],
  defaultVariants: {
    direction: 'vertical',
    spacing: 'default',
  },
});

export interface StackProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({ className, direction, spacing, align, justify, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={stackVariants({ direction, spacing, align, justify, className })}
        {...props}
      />
    );
  }
);

Stack.displayName = 'Stack'; 