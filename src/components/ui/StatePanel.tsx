import { type ReactNode, useEffect, useRef } from 'react';

import { cn } from '@/utils/cn';
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react';

type StatePanelVariant = 'loading' | 'empty' | 'error' | 'warning' | 'success' | 'disabled';

interface StatePanelProps {
  variant: StatePanelVariant;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  announce?: boolean;
  className?: string;
}

const icons: Record<StatePanelVariant, ReactNode> = {
  loading: <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />,
  empty: <Info className="h-5 w-5" aria-hidden="true" />,
  error: <CircleAlert className="h-5 w-5" aria-hidden="true" />,
  warning: <TriangleAlert className="h-5 w-5" aria-hidden="true" />,
  success: <CircleCheck className="h-5 w-5" aria-hidden="true" />,
  disabled: <Info className="h-5 w-5" aria-hidden="true" />,
};

// `empty` and `disabled` describe a resting state the user navigated to, so
// they are not announced. The rest report something that just happened.
const ANNOUNCED_BY_DEFAULT: Record<StatePanelVariant, boolean> = {
  loading: true,
  empty: false,
  error: true,
  warning: true,
  success: true,
  disabled: false,
};

export function StatePanel({
  variant,
  title,
  description,
  action,
  announce,
  className,
}: StatePanelProps) {
  const shouldAnnounce = announce ?? ANNOUNCED_BY_DEFAULT[variant];
  const role = variant === 'error' ? 'alert' : shouldAnnounce ? 'status' : undefined;

  // A live region mounted with its content already in place is not announced by
  // most screen readers. The region renders empty and is filled from an effect,
  // so the message arrives as a change the region reports.
  // The description carries the specific information — the actual error, the
  // limit that was reached — so it is announced with the title.
  const spokenDescription = typeof description === 'string' ? description : null;
  const announcement = [title, spokenDescription].filter(Boolean).join('. ');
  const liveRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (liveRef.current) liveRef.current.textContent = announcement;
  }, [role, announcement]);

  return (
    <div
      aria-busy={variant === 'loading' || undefined}
      className={cn('border-border bg-card rounded-xl border p-4', className)}
    >
      {role && (
        <div
          ref={liveRef}
          role={role}
          aria-live={role === 'status' ? 'polite' : undefined}
          className="sr-only"
        />
      )}
      <div className="flex items-start gap-3">
        <span className="text-muted-foreground shrink-0">{icons[variant]}</span>
        <div className="min-w-0 flex-1">
          <p className="text-foreground font-semibold">{title}</p>
          {description && <div className="text-muted-foreground mt-1 text-sm">{description}</div>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
}
