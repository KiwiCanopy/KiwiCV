import { type ReactNode } from 'react';

import { Disclosure } from '@/components/ui/Disclosure';
import { cn } from '@/utils/cn';
import { ChevronDown } from 'lucide-react';

interface DesignDisclosureProps {
  id: string;
  title: string;
  summary: string;
  icon: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function DesignDisclosure({
  id,
  title,
  summary,
  icon,
  open,
  onOpenChange,
  children,
}: DesignDisclosureProps) {
  return (
    <Disclosure
      id={id}
      open={open}
      onOpenChange={onOpenChange}
      className={cn(
        // Container root so the panel contents can respond to the Design
        // column's width rather than the viewport. A wide side-by-side preview
        // narrows this column while the page stays wide.
        'bg-card border-border @container overflow-hidden rounded-2xl border transition-colors',
        open && 'border-primary-strong/35',
      )}
      headerClassName="min-h-16"
      triggerClassName="group flex items-center gap-3 px-4 py-3 sm:px-5"
      panelClassName="border-border/70 border-t px-4 py-5 sm:px-5 sm:py-6"
      trigger={
        <>
          <span
            className={cn(
              'bg-muted text-muted-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
              open && 'bg-primary/10 text-primary-strong',
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-foreground block text-sm font-semibold">{title}</span>
            <span className="text-muted-foreground mt-0.5 block truncate text-xs">{summary}</span>
          </span>
          <ChevronDown
            className={cn(
              'text-muted-foreground h-5 w-5 shrink-0 transition-transform duration-200',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </>
      }
    >
      {children}
    </Disclosure>
  );
}
