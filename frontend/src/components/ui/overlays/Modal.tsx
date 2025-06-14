'use client';

import { HTMLAttributes, forwardRef, useEffect, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity',
  {
    variants: {
      open: {
        true: 'opacity-100',
        false: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      open: false,
    },
  }
);

const modalContentVariants = cva(
  'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] rounded-lg border bg-surface-50 p-6 shadow-lg transition-all',
  {
    variants: {
      size: {
        sm: 'max-w-sm',
        default: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      open: {
        true: 'scale-100 opacity-100',
        false: 'scale-95 opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      size: 'default',
      open: false,
    },
  }
);

const modalHeaderVariants = cva(
  'flex flex-col space-y-1.5 text-center sm:text-left mb-4'
);

const modalFooterVariants = cva(
  'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6'
);

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  size?: 'sm' | 'default' | 'lg' | 'xl' | 'full';
}

export interface ModalContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof modalContentVariants> {}

export interface ModalHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalFooterProps extends HTMLAttributes<HTMLDivElement> {}

export interface ModalTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

export interface ModalDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export function Modal({ open, onOpenChange, children, size }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={modalOverlayVariants({ open })}
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div
        className={modalContentVariants({ size, open })}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
}

export const ModalContent = forwardRef<HTMLDivElement, ModalContentProps>(
  ({ className, size, open, ...props }, ref) => (
    <div
      ref={ref}
      className={modalContentVariants({ size, open, className })}
      {...props}
    />
  )
);
ModalContent.displayName = 'ModalContent';

export const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={modalHeaderVariants({ className })}
      {...props}
    />
  )
);
ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = forwardRef<HTMLHeadingElement, ModalTitleProps>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight ${className || ''}`}
      {...props}
    />
  )
);
ModalTitle.displayName = 'ModalTitle';

export const ModalDescription = forwardRef<HTMLParagraphElement, ModalDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-surface-600 ${className || ''}`}
      {...props}
    />
  )
);
ModalDescription.displayName = 'ModalDescription';

export const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={modalFooterVariants({ className })}
      {...props}
    />
  )
);
ModalFooter.displayName = 'ModalFooter'; 