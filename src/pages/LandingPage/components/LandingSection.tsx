import React from 'react';

import { cn } from '@/utils/cn';

interface LandingSectionProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  withBorder?: boolean;
}

/**
 * Globalized Landing Page Section wrapper.
 * Ensures consistent vertical spacing and bottom borders.
 */
export const LandingSection: React.FC<LandingSectionProps> = ({
  id,
  children,
  className,
  containerClassName,
  withBorder = true,
}) => {
  return (
    <section
      id={id}
      className={cn(
        'bg-background relative overflow-hidden px-5 py-16 sm:px-8 sm:py-24',
        withBorder && 'border-border border-b',
        className,
      )}
    >
      <div className={cn('mx-auto max-w-6xl', containerClassName)}>{children}</div>
    </section>
  );
};
