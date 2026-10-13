import { type HTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/utils/cn';

interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  maxHeight?: 'none' | 'screen' | 'responsive';
}

/**
 * Centered responsive container for top-level pages.
 * Default maxWidth is 7xl, consistent with the Settings page.
 */
export function PageContainer({
  children,
  className,
  maxWidth = '7xl',
  maxHeight = 'none',
  ...props
}: PageContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  const maxHeightClasses = {
    none: '',
    screen: 'max-h-screen overflow-y-auto',
    responsive: 'h-responsive',
  };

  return (
    <div
      className={cn(
        'mx-auto w-full',
        maxWidthClasses[maxWidth],
        maxHeightClasses[maxHeight],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
