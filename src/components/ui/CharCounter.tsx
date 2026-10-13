import { useTranslation } from '@/hooks/useTranslation';
import { charCapZone } from '@/utils/charCapZone';
import { cn } from '@/utils/cn';

/** `id`, `length`, `limit` and `notice` come from `useCharCapNotice`'s `counter`. */
interface CharCounterProps {
  id: string;
  length: number;
  limit: number;
  notice: string;
  /** Size and placement at the call site; zone colour and weight belong to the counter. */
  className?: string;
}

/**
 * The "n / limit" counter under an AI free-text field: three zones — `--warning`
 * at `near`, red only at `full`, where typing is dropped (owner, 2026-10-12).
 */
export function CharCounter({ length, limit, notice, className, id }: CharCounterProps) {
  const { t, language } = useTranslation();
  const zone = charCapZone(length, limit);
  // The UI language, never the browser's: `5,000` reads as a decimal in German.
  const { format } = new Intl.NumberFormat(language);
  const visual = `${format(length)} / ${format(limit)}`;

  return (
    <>
      <span
        id={id}
        className={cn(
          className,
          'font-medium transition-colors',
          zone === 'full'
            ? 'text-destructive font-bold'
            : zone === 'near'
              ? 'text-warning font-bold'
              : 'text-muted-foreground',
        )}
      >
        <span className="sr-only">
          {t('ai.chars_used', { used: format(length), limit: format(limit) })}
        </span>
        <span aria-hidden="true">{visual}</span>
      </span>
      {/* A sibling, never inside the counter: an `aria-describedby` pointing
          at the counter would otherwise replay the notice on every focus. */}
      <span className="sr-only" role="status" aria-live="polite">
        {notice}
      </span>
    </>
  );
}
