import { memo, useId } from 'react';

import { InfoBox } from '@/components/ui/InfoBox';
import { CircleQuestionMark } from 'lucide-react';

interface ExportOptionProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (c: boolean) => void;
  hideDescriptionOnMobile?: boolean;
  infoHint?: React.ReactNode;
  infoInteractive?: boolean;
}

export const ExportOption = memo(
  ({
    label,
    description,
    checked,
    onChange,
    hideDescriptionOnMobile,
    infoHint,
    infoInteractive = false,
  }: ExportOptionProps) => {
    const controlId = useId();
    const descriptionId = description ? `${controlId}-description` : undefined;

    const cardClassName = `group border-border/50 bg-secondary/10 hover:bg-secondary/20 relative flex cursor-pointer gap-2 rounded-xl border p-2 transition-all hover:shadow-sm active:scale-[0.99] sm:gap-3 sm:p-4 ${
      hideDescriptionOnMobile
        ? 'flex-col items-center justify-center text-center sm:flex-row sm:items-start sm:justify-start sm:text-left'
        : 'flex-row items-start text-left'
    }`;

    const control = (
      <input
        id={controlId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-describedby={infoHint ? descriptionId : undefined}
        className="border-input text-primary-strong focus:ring-primary-strong relative z-10 mt-0.5 h-4 w-4 shrink-0 rounded transition-transform active:scale-95 sm:mt-1"
      />
    );

    const descriptionClassName = `text-muted-foreground mt-0.5 text-[10px] leading-tight sm:text-xs ${
      hideDescriptionOnMobile ? 'hidden sm:block' : ''
    }`;

    // Without a help trigger there is no button to keep out of the label, so
    // the card stays one plain <label> and the whole of it toggles the
    // checkbox. This is the only shape any consumer renders today.
    if (!infoHint) {
      return (
        <label htmlFor={controlId} className={cardClassName}>
          {control}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-foreground group-hover:text-primary-strong text-[11px] leading-tight font-bold transition-colors sm:text-sm sm:leading-snug">
              {label}
            </span>
            {description && <span className={descriptionClassName}>{description}</span>}
          </div>
        </label>
      );
    }

    // With a help trigger the card cannot be a <label>, because a button nested
    // in a label is invalid HTML and a click on it toggles the checkbox. The
    // label stretches back over the card through an inset ::after so the target
    // stays the full card, and the trigger is lifted above that overlay.
    return (
      <div className={cardClassName}>
        {control}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor={controlId}
              className="text-foreground group-hover:text-primary-strong cursor-pointer text-[11px] leading-tight font-bold transition-colors after:absolute after:inset-0 after:content-[''] sm:text-sm sm:leading-snug"
            >
              {label}
            </label>
            <InfoBox
              position="top"
              content={infoHint}
              className="relative z-10 flex"
              interactive={infoInteractive}
            >
              <CircleQuestionMark className="text-muted-foreground/60 hover:text-primary-strong h-3.5 w-3.5 cursor-help transition-colors" />
            </InfoBox>
          </div>
          {description && (
            <span id={descriptionId} className={descriptionClassName}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  },
);

ExportOption.displayName = 'ExportOption';
