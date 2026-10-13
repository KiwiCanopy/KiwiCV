import type { ReactNode } from 'react';

import { InfoBox } from '@/components/ui/InfoBox';
import { MainColumnBadge } from '@/components/ui/MainColumnBadge';
import { cn } from '@/utils/cn';
import { CircleQuestionMark, type LucideIcon } from 'lucide-react';

interface FieldLabelProps {
  /** Id of the control this label names. */
  htmlFor: string;
  children: ReactNode;
  /**
   * Typography and spacing for the label row. Only inheritable properties
   * reach the `<label>` — `truncate`, `block`, and `max-w-*` will not. Use
   * `labelClassName` for those.
   */
  className?: string;
  /** Applied to the `<label>` element itself. */
  labelClassName?: string;
  layoutHint?: string;
  infoHint?: ReactNode;
  infoInteractive?: boolean;
  infoIcon?: LucideIcon;
  /** Rendered after the label, before the layout and help triggers. */
  after?: ReactNode;
}

/**
 * A form label plus the help and layout affordances that sit beside it.
 *
 * `InfoBox` and `MainColumnBadge` both render a `<button>`. Nesting a button
 * inside `<label>` is invalid HTML, and a click on it also activates the
 * labelled control. Five form primitives hand-rolled that shape independently;
 * this renders the triggers as siblings of the label instead, which is the
 * structural fix rather than suppressing the click.
 */
export function FieldLabel({
  htmlFor,
  children,
  className,
  labelClassName,
  layoutHint,
  infoHint,
  infoInteractive = false,
  infoIcon: InfoIcon = CircleQuestionMark,
  after,
}: FieldLabelProps) {
  return (
    // `min-h-6`: the info trigger is a 24px target, so a row carrying one is
    // 24px tall. Without this floor an unhinted row is 20px and two fields side
    // by side misalign by 4px — the same defect the 44px trigger caused at 24px.
    <div className={cn('flex min-h-6 items-center gap-1.5', className)}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {children}
      </label>
      {after}
      {layoutHint && <MainColumnBadge layoutHint={layoutHint} />}
      {infoHint && (
        <InfoBox position="top" content={infoHint} className="flex" interactive={infoInteractive}>
          <InfoIcon className="text-muted-foreground/60 hover:text-primary-strong h-3.5 w-3.5 cursor-help transition-colors" />
        </InfoBox>
      )}
    </div>
  );
}
