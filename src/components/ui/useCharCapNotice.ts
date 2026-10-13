import { useId, useState } from 'react';

import { useTranslation } from '@/hooks/useTranslation';
import { type CharCapZone, charCapZone } from '@/utils/charCapZone';

/**
 * Everything a `CharCounter` renders, plus `track`, which wraps the field's
 * change handler. The notice speaks only when an edit made through `track`
 * moves the length into another `charCapZone` — never per keystroke, never at
 * mount, and never when the value changes from outside (a mode swap, Clear).
 * The field takes `aria-describedby={counter.id}`.
 */
export function useCharCapNotice(length: number, limit: number) {
  const { t, language } = useTranslation();
  const id = useId();
  // `spoken`: the zone the live region describes. `at` and `cap`: what it was settled for.
  const [state, setState] = useState<{ at: number; cap: number; spoken: CharCapZone }>({
    at: length,
    cap: limit,
    spoken: 'ok',
  });

  let { spoken } = state;
  if (state.at !== length || state.cap !== limit) {
    // The length or the cap moved without an edit: follow it silently.
    spoken = 'ok';
    setState({ at: length, cap: limit, spoken });
  }

  const track =
    (onChange: (value: string) => void) =>
    (next: string): void => {
      const zone = charCapZone(next.length, limit);
      setState({
        at: next.length,
        cap: limit,
        spoken: zone === charCapZone(length, limit) ? spoken : zone,
      });
      onChange(next);
    };

  const values = { limit: new Intl.NumberFormat(language).format(limit) };
  const notice =
    spoken === 'full'
      ? t('ai.char_limit_reached', values)
      : spoken === 'near'
        ? t('ai.char_limit_near', values)
        : '';

  return { counter: { id, length, limit, notice }, track };
}
