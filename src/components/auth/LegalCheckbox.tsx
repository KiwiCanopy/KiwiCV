import { cn } from '@/utils/cn';

interface LegalCheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  linkText: string;
  linkUrl: string;
  className?: string;
}

const LINK_PLACEHOLDER = '{link}';

export function LegalCheckbox({
  id,
  checked,
  onChange,
  label,
  linkText,
  linkUrl,
  className,
}: LegalCheckboxProps) {
  // Languages differ on where the policy link sits in the sentence. German
  // needs it mid-sentence ("Ich habe die Datenschutzerklärung gelesen …"),
  // which a trailing `{label} {link}` cannot express. When the label carries a
  // `{link}` placeholder we split around it and drop the link in place;
  // otherwise the link trails the label, as English and the other locales want.
  const hasPlaceholder = label.includes(LINK_PLACEHOLDER);
  // Split around every placeholder, not just the first — a label with N
  // `{link}`s yields N+1 text segments interleaved with N links, and no text is
  // ever dropped.
  const segments = label.split(LINK_PLACEHOLDER);

  // The composed name keeps the full sentence — with the link text in its real
  // position(s) — as the control's accessible name for a screen reader and for
  // voice control, which the split visible markup would otherwise lose.
  const accessibleName = hasPlaceholder ? segments.join(linkText) : `${label} ${linkText}`;

  // The policy link is a sibling of the label(s), never a child, so a click
  // meant to read the terms cannot also toggle consent.
  const link = (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary-strong font-medium hover:underline"
    >
      {linkText}
    </a>
  );

  return (
    <div className={cn('flex items-start gap-3', className)}>
      <div className="flex h-5 items-center">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-label={accessibleName}
          className="accent-primary border-border focus-visible:ring-primary-strong h-4 w-4 rounded focus-visible:ring-2"
          required
        />
      </div>
      <p className="text-muted-foreground text-sm">
        {hasPlaceholder ? (
          // Interleave every text segment with the sibling link between them.
          segments.map((segment, index) => (
            <span key={index}>
              <label htmlFor={id} className="cursor-pointer">
                {segment}
              </label>
              {index < segments.length - 1 && link}
            </span>
          ))
        ) : (
          <>
            <label htmlFor={id} className="cursor-pointer">
              {label}
            </label>{' '}
            {link}
          </>
        )}
      </p>
    </div>
  );
}
