import type { ArrayElement, FieldConfig } from '@/components/editor/ArrayForm/types';
import type { useTranslation } from '@/hooks/useTranslation';
import type { ResumeData } from '@/types/resume';
import { MAIN_COLUMN_ONLY_FIELDS } from '@/utils/componentVariants';
import type { SectionKey } from '@/utils/layout/constants';
import { Sparkles } from 'lucide-react';

/**
 * ⚠️ Read off `useTranslation` rather than restated. A hand-written
 * `(key: string, vars?: Record<string, unknown>) => string` is *wider* than the
 * real `t`, so every caller failed to assign — and the fix that suggests itself
 * (widen the callers) would have thrown away the placeholder typing that makes
 * `{ section }` checkable.
 */
type Translate = ReturnType<typeof useTranslation>['t'];

/**
 * The `main_column_only_section` badge, or `undefined` if this field does not
 * carry the promise.
 *
 * ⚠️ **The only place in the app that spells `editor.hints.main_column_only_section`.**
 * `mainColumnOnlyHint.test.ts` asserts that, and the assertion is the point:
 * fifteen forms' worth of inline `t('editor.hints.main_column_only_section', …)`
 * calls were the inventory, and the inventory was miscounted three times in a
 * row — twelve, then fourteen, then fifteen, the last one because
 * `SkillsFormField.tsx` passed the same hint as a JSX prop instead of an object
 * property and every `grep`-shaped census had been scoped by the other spelling.
 * With the key confined here, `MAIN_COLUMN_ONLY_FIELDS` is the census.
 */
export function mainColumnOnlyHint(
  section: SectionKey,
  field: string,
  t: Translate,
): string | undefined {
  const fields = Object.hasOwn(MAIN_COLUMN_ONLY_FIELDS, section)
    ? MAIN_COLUMN_ONLY_FIELDS[section]
    : undefined;
  if (!fields?.some((f) => f === field)) return undefined;

  return t('editor.hints.main_column_only_section', {
    section: t(`editor.sections.${section}`),
  });
}

/**
 * Attach the badge to whichever of a form's fields `MAIN_COLUMN_ONLY_FIELDS`
 * names.
 *
 * ⚠️ **A map over the form's *whole* field list, not a call the author makes per
 * badged field**, and that is the guard rather than a tidier spelling. Every
 * field is offered to the table, so a field entering the table gains its badge
 * with no edit in any form — and a form cannot keep a stale badge or miss a new
 * one, because it no longer expresses an opinion. The previous shape gave each
 * author fifteen chances to forget a line and no signal when they did: the
 * projection blanked `projects.highlights` with no badge beside it, and
 * `interests.keywords` carried a badge nothing enforced.
 *
 * ⚠️ `layoutIcon` travels with the hint. All fifteen original sites paired
 * `layoutHint` with `layoutIcon: Sparkles`; splitting them would let a badge
 * render iconless, which is a visual difference no parity sweep looks at.
 *
 * ⚠️ **`K` is inferred from the `section` *value*, and the field array is typed
 * `ArrayElement<ResumeData[K]>` off it.** That is a second guard the old inline
 * hints did not have: the array literal a form passes is now checked field by
 * field against the real item type, so a form cannot name a field its section
 * does not have. It also makes the table and the form agree by construction — the
 * table's entries are keyed off the same `ResumeData` shape, so a badge on a
 * field no form can pass is a build error at the table.
 */
export function withMainColumnHints<K extends SectionKey>(
  section: K,
  t: Translate,
  fields: FieldConfig<ArrayElement<ResumeData[K]>>[],
): FieldConfig<ArrayElement<ResumeData[K]>>[] {
  return fields.map((field) => {
    const layoutHint = mainColumnOnlyHint(section, field.name, t);
    return layoutHint ? { ...field, layoutHint, layoutIcon: Sparkles } : field;
  });
}

/**
 * The same hints for a custom section, which renders through the theme's
 * volunteer layout and so drops volunteer's main-column-only fields in a sidebar.
 */
export function withCustomSectionMainColumnHints<T>(
  title: string,
  t: Translate,
  fields: FieldConfig<T>[],
): FieldConfig<T>[] {
  const mainOnly: readonly string[] = MAIN_COLUMN_ONLY_FIELDS.volunteer ?? [];
  const layoutHint = t('editor.hints.main_column_only_section', { section: title });
  return fields.map((field) =>
    mainOnly.includes(field.name) ? { ...field, layoutHint, layoutIcon: Sparkles } : field,
  );
}
