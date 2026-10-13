import { InfoBox } from '@/components/ui/InfoBox';
import { useTranslation } from '@/hooks/useTranslation';
import { CircleQuestionMark } from 'lucide-react';

interface AIReorganizationControlProps {
  checked: boolean;
  id: string;
  onCheckedChange: (checked: boolean) => void;
  sectionName: string;
  /**
   * `card` is the dialog's full-width panel. `inline` is the same control and
   * the same help, stripped to a checkbox and a label so it can sit in the
   * composer's options row beside the translate add-on — one control, two
   * chromes, rather than two checkboxes meaning the same thing.
   */
  variant?: 'card' | 'inline';
}

export function AIReorganizationControl({
  checked,
  id,
  onCheckedChange,
  sectionName,
  variant = 'card',
}: AIReorganizationControlProps) {
  const { t } = useTranslation();
  const label = t('ai.allow_restructuring', { SectionName: sectionName });
  const help = t('ai.restructuring_help');

  /**
   * ⚠️ Shared by both chromes on purpose: the explanation is what the user is
   * opting into, and a compact row is not a licence to drop it.
   *
   * Rendered immediately after the label in both, matching `FieldLabel`'s
   * ordering, `gap-1.5`, and its `h-3.5` muted-to-primary-strong `cursor-help` glyph. A
   * help icon takes its meaning from proximity: parked at the far end of a row
   * it could belong to the checkbox, the select beside it, or the row itself.
   *
   * Not `FieldLabel` itself: that renders the trigger with the generic "More
   * information" name and italic content, and this one is named after the
   * option and reads as prose. Same ordering and same glyph, one component
   * short of reuse.
   */
  const helpBox = (
    <InfoBox
      position="top"
      italic={false}
      label={label}
      className="flex"
      content={
        <div className="space-y-2">
          <p>{help}</p>
          <p className="text-muted-foreground font-medium">
            {t('ai.reorg_original_short')} → {t('ai.reorg_proposed_short')}
          </p>
        </div>
      }
    >
      <CircleQuestionMark
        className="text-muted-foreground/60 hover:text-primary-strong h-3.5 w-3.5 cursor-help transition-colors"
        aria-hidden="true"
      />
    </InfoBox>
  );

  if (variant === 'inline') {
    return (
      <span className="flex min-h-11 min-w-0 items-center gap-1.5">
        {/* ⚠️ `text-foreground`, matching the translate and cover-letter ticks
            beside it. This was `text-muted-foreground`, which gave two peer
            add-ons two tiers of emphasis for no reason anyone could name. */}
        <label
          htmlFor={id}
          className="text-foreground flex cursor-pointer items-center gap-2 text-xs font-medium"
        >
          <input
            id={id}
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckedChange(event.target.checked)}
            className="accent-primary focus:ring-primary-strong/20 h-4 w-4 rounded"
          />
          {label}
        </label>
        {helpBox}
      </span>
    );
  }

  return (
    <div className="border-border bg-muted/30 grid grid-cols-[auto_1fr] gap-x-3 rounded-xl border p-4">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
        className="border-border bg-background mt-2.5 h-5 w-5 rounded"
      />
      <div className="flex min-w-0 items-center gap-1.5">
        <label htmlFor={id} className="text-foreground cursor-pointer text-sm font-medium">
          {label}
        </label>
        {helpBox}
      </div>
    </div>
  );
}
