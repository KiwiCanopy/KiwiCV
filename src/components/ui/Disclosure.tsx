import { type ReactNode, useId } from 'react';

import { cn } from '@/utils/cn';

interface DisclosureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
  id?: string;
  className?: string;
  headerClassName?: string;
  triggerClassName?: string;
  panelClassName?: string;
}

export function Disclosure({
  open,
  onOpenChange,
  trigger,
  children,
  actions,
  id,
  className,
  headerClassName,
  triggerClassName,
  panelClassName,
}: DisclosureProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const panelId = `${baseId}-panel`;

  return (
    <div className={className}>
      <div className={cn('flex items-center', headerClassName)}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => onOpenChange(!open)}
          className={cn('min-h-11 min-w-0 flex-1 text-left', triggerClassName)}
        >
          {trigger}
        </button>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <div id={panelId} hidden={!open} className={panelClassName}>
        {children}
      </div>
    </div>
  );
}
