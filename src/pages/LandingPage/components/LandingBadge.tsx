import React from 'react';

import { cn } from '@/utils/cn';

interface LandingBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function LandingBadge({ children, className }: LandingBadgeProps) {
  return (
    <p
      className={cn(
        'text-primary-strong mx-auto flex w-fit items-center gap-2 text-sm font-semibold',
        className,
      )}
    >
      <span className="bg-kiwi h-2 w-2 rounded-full" aria-hidden="true" />
      {children}
    </p>
  );
}
