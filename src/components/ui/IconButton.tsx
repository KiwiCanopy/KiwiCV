import { type ReactNode, forwardRef } from 'react';

import { Button, type ButtonProps } from '@/components/ui/Button';
import { cn } from '@/utils/cn';

interface IconButtonProps extends Omit<ButtonProps, 'children'> {
  label: string;
  children: ReactNode;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ children, className, label, title = label, ...props }, ref) => (
    <Button
      ref={ref}
      aria-label={label}
      title={title}
      className={cn('h-11 w-11 shrink-0 p-0', className)}
      {...props}
    >
      {children}
    </Button>
  ),
);

IconButton.displayName = 'IconButton';
