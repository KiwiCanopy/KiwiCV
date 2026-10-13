import type React from 'react';

import type { FieldLock } from '@/components/ui/fieldLock';

/**
 * The typed half of the trimmed-`basics` invariant.
 *
 * `sanitizeResumeData` trims a `basics` block on the way in, but a value the
 * user *types* reaches the store through `updateBasics` and never passes it,
 * and `onChange` cannot trim: it fires per keystroke, so trimming there makes
 * `"New York"` unwritable at the space.
 *
 * ⚠️ **"The `setResume` paths only — import, sync pull and AI apply" was an
 * undercount**, measured by the code-reviewer pass: 13 of `setResume`'s 18 call
 * sites are ordinary editor list operations (`useArrayForm`, `useSkillsForm`,
 * `useLanguageForm`), all passing `{ silent: true }`. So the sanitizer also
 * repairs rehydrated state the moment the user adds or edits any list item —
 * which is a good thing this file was selling short, and the reason the
 * rehydration hole is narrower in practice than it reads.
 *
 * ⚠️ It also has a cost worth naming: on that same silent path a rehydrated
 * `highlights: "a, b"` is replaced with `[]` and the import warning is **suppressed**
 * by `options.silent`. Crash traded for recoverable loss with no notice. Left to the
 * general fix rather than special-cased here.
 *
 * ⚠️ **It lives in the two field components rather than at the call sites.**
 * `BasicsForm.tsx` has **eleven** `onChange={handleChange}` props; an
 * `onBlur={handleBlur}` beside each would be eleven chances to forget one, on a
 * field added next year, with nothing to catch it — the copy shape this repo
 * keeps deleting. Wrapping the `onChange` the component already has means a new
 * field is covered by construction.
 *
 * ⚠️ **The event is synthesised, not the real one mutated.** Writing
 * `event.target.value = trimmed` desynchronises React's internal value tracker
 * on a controlled input, which can swallow a later real edit. What is passed
 * on carries `name` and `value`, which is **exactly** what `useBasicsForm`'s
 * `handleChange` reads — verified, not assumed, and pinned in
 * `trimOnBlur.test.tsx` so a `handleChange` that grows a third read fails
 * rather than silently getting `undefined`.
 *
 * Returns without calling `onChange` when nothing would change, so an
 * untouched field never writes to the store or dirties an undo step.
 */
export const trimOnBlur =
  <T extends HTMLInputElement | HTMLTextAreaElement>(
    onChange: (event: React.ChangeEvent<T>) => void,
  ) =>
  (event: React.FocusEvent<T>): void => {
    const { name, value } = event.target;
    const trimmed = value.trim();
    if (trimmed === value) return;
    onChange({ target: { name, value: trimmed } } as React.ChangeEvent<T>);
  };

/**
 * The locked half of the same invariant: text typed before a proposal's lock
 * goes to `keepTyped` instead of `onChange`, and "Keep mine" writes it back, so
 * it is trimmed on the way in exactly as a blur would have.
 */
export const trimOnKeep = (lock: FieldLock | null | undefined): FieldLock | null | undefined => {
  const keepTyped = lock?.keepTyped;
  if (!lock || !keepTyped) return lock;
  return {
    ...lock,
    keepTyped: (typed) => keepTyped(typeof typed === 'string' ? typed.trim() : typed),
  };
};
