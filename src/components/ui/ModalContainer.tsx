import { type HTMLAttributes, type ReactNode, forwardRef } from 'react';

import { cn } from '@/utils/cn';

interface ModalContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | 'none';
  scrollable?: boolean;
  innerClassName?: string;
}

/**
 * Standardized responsive container for modal content.
 * Enforces 80% height constraint on mobile with automatic scrolling.
 */
export const ModalContainer = forwardRef<HTMLDivElement, ModalContainerProps>(
  ({ children, className, innerClassName, maxWidth = '3xl', scrollable = true, ...props }, ref) => {
    const maxWidthClasses = {
      sm: 'max-w-[92vw] sm:max-w-sm',
      md: 'max-w-[92vw] sm:max-w-md',
      lg: 'max-w-[92vw] sm:max-w-lg',
      xl: 'max-w-[92vw] sm:max-w-xl',
      '2xl': 'max-w-[92vw] sm:max-w-2xl',
      '3xl': 'max-w-[92vw] sm:max-w-3xl',
      '4xl': 'max-w-[92vw] sm:max-w-4xl',
      none: 'max-w-none',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'bg-card relative w-full overflow-hidden rounded-[var(--radius-feature)] border shadow-2xl transition-all',
          maxWidthClasses[maxWidth],
          className,
        )}
        {...props}
      >
        <div
          className={cn(
            'custom-scrollbar w-full',
            scrollable ? 'h-responsive overflow-y-auto' : 'overflow-hidden',
            innerClassName,
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);

ModalContainer.displayName = 'ModalContainer';
