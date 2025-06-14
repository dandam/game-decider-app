'use client';

import { HTMLAttributes, forwardRef, useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full bg-surface-200',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

const avatarImageVariants = cva('aspect-square h-full w-full object-cover');

const avatarFallbackVariants = cva(
  'flex h-full w-full items-center justify-center bg-surface-300 text-surface-700 font-medium',
  {
    variants: {
      size: {
        sm: 'text-xs',
        default: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
        '2xl': 'text-xl',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export interface AvatarImageProps extends HTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export interface AvatarFallbackProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarFallbackVariants> {}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size, src, alt, fallback, ...props }, ref) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    // Generate initials from fallback text
    const getInitials = (text: string) => {
      return text
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <div
        ref={ref}
        className={avatarVariants({ size, className })}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || ''}
            className={avatarImageVariants()}
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        ) : (
          <div className={avatarFallbackVariants({ size })}>
            {fallback ? getInitials(fallback) : '?'}
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export const AvatarImage = forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, ...props }, ref) => (
    <img
      ref={ref}
      className={avatarImageVariants({ className })}
      {...props}
    />
  )
);
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback = forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, size, ...props }, ref) => (
    <div
      ref={ref}
      className={avatarFallbackVariants({ size, className })}
      {...props}
    />
  )
);
AvatarFallback.displayName = 'AvatarFallback'; 