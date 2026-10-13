import { useMemo } from 'react';

import { pendingFields } from '@/features/dashboard/editor/proposals/pendingFields';
import {
  type DiffMark,
  type EntryDiffRowModel,
  type ProseDiffModel,
} from '@/features/dashboard/editor/proposals/types';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { type AITargetKey } from '@/utils/aiTarget';

/** Field name to visible label, keyed by the entry's own fields. */
export type DiffFieldLabels<T> = Readonly<Partial<Record<keyof T & string, string>>>;

/** Field name to how its stored value reads — a level number as its name. */
export type DiffValueFormatters<T> = Readonly<
  Partial<Record<keyof T & string, (value: unknown) => string>>
>;

const NO_FORMATTERS = {};

const asText = (value: unknown): string => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map((entry) => String(entry ?? '')).join('\n');
  return String(value);
};

/**
 * A list field's bullet-by-bullet diff. Order follows the proposal, with the
 * bullets it dropped appended, so the panel reads as the list the user would
 * end up with plus what it cost them.
 */
const markList = (
  mine: unknown,
  proposal: unknown,
  unsourced: readonly string[] = [],
): DiffMark[] | null => {
  if (!Array.isArray(mine) && !Array.isArray(proposal)) return null;

  const before = (Array.isArray(mine) ? mine : []).map((entry) => String(entry ?? ''));
  const after = (Array.isArray(proposal) ? proposal : []).map((entry) => String(entry ?? ''));
  const beforeSet = new Set(before);
  const afterSet = new Set(after);

  return [
    ...after.map<DiffMark>((value) =>
      beforeSet.has(value)
        ? { value, mark: 'unchanged' }
        : { value, mark: 'added', ...(unsourced.includes(value) ? { unsourced: true } : {}) },
    ),
    ...before
      .filter((value) => !afterSet.has(value))
      .map<DiffMark>((value) => ({ value, mark: 'removed' })),
  ];
};

/** Paragraphs, the way the letter's own editor splits them. */
const asParagraphs = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [String(value ?? '')]).map((entry) => String(entry ?? ''));

/**
 * Everything the prose view needs, and nothing that pairs paragraphs for an
 * action. See `ProseDiffModel`.
 */
const buildProse = (mine: unknown, proposal: unknown): ProseDiffModel => {
  const before = asParagraphs(mine);
  const after = asParagraphs(proposal);

  const sameShape = before.length === after.length;
  const changed = sameShape ? after.map((entry, index) => entry !== before[index]) : [];

  const beforeChars = before.join('').length;
  const afterChars = after.join('').length;
  const delta =
    beforeChars === 0 ? 0 : Math.round(((afterChars - beforeChars) / beforeChars) * 100);

  return {
    mine: before,
    proposal: after,
    changed,
    // ⚠️ One meaning, always "how many same-index paragraphs differ". It read
    // `sameShape ? … : after.length`, so it meant "the total" on the other
    // branch — a field with two meanings, and nothing reads it there, because a
    // changed COUNT is its own summary.
    changedCount: changed.filter(Boolean).length,
    // Under 5% is noise on a rewrite; reporting "about 2% shorter" invites the
    // reader to look for two percent of difference that is not there.
    lengthDeltaPercent: Math.abs(delta) < 5 ? 0 : delta,
  };
};

/**
 * The changed fields of one entry, as the diff panel renders them.
 *
 * Replaces the per-field comparison `Input`/`TextArea` used to draw around the
 * live control. That version could only ever show one field at a time, and only
 * while the entry was expanded — so a collapsed entry with four rewritten
 * fields looked identical to an untouched one.
 */
export function useEntryDiff<T extends object>(
  target: AITargetKey | undefined,
  fieldLabels: DiffFieldLabels<T>,
  proseFields: readonly (keyof T & string)[] = [],
  valueFormatters: DiffValueFormatters<T> = NO_FORMATTERS as DiffValueFormatters<T>,
) {
  const suggestions = useResumeStore((state) => state.ai.suggestions);
  const acceptAISuggestion = useResumeStore((state) => state.acceptAISuggestion);
  const declineAISuggestion = useResumeStore((state) => state.declineAISuggestion);

  const entry = target ? suggestions[target] : undefined;

  const rows = useMemo<EntryDiffRowModel[]>(() => {
    if (!entry) return [];

    // Keys come from stored data, so a field outside `T` is still possible.
    const labels: Partial<Record<string, string>> = fieldLabels;
    const formatters: Partial<Record<string, (value: unknown) => string>> = valueFormatters;
    const prose: readonly string[] = proseFields;

    return pendingFields(entry).map((field) => {
      const mine = entry.originalValue[field];
      const proposal = entry.improvedValue[field];
      // ⚠️ Named by the call site, never inferred from length. An invisible
      // threshold cannot be checked by eye and surprises whoever meets it.
      const isProse = prose.includes(field);
      const format = formatters[field] ?? asText;

      return {
        field,
        // ⚠️ Falls back to the raw data key. Dropping a row we cannot label
        // would hide a proposed change, which is strictly worse than showing
        // `skillLevel` next to it.
        label: labels[field] ?? field,
        mine: format(mine),
        proposal: format(proposal),
        // ⚠️ `prose` is what ROUTES the row — `EntryDiffRow` checks it first, so
        // clearing `marks` here changes no rendering and no test reds for it.
        // It stays because a model carrying both is incoherent, and because
        // `markList` over an 11-paragraph letter is work whose only output would
        // be discarded.
        marks: isProse ? null : markList(mine, proposal, entry.unsourced?.[field]),
        // Measured: the bullet treatment on that letter renders 2,869px at
        // 1440×900 and 5,205px on a phone, above the letter it describes.
        prose: isProse ? buildProse(mine, proposal) : null,
      };
    });
  }, [entry, fieldLabels, proseFields, valueFormatters]);

  return {
    rows,
    hasDiff: rows.length > 0,
    acceptField: (field: string) => target && acceptAISuggestion(target, field),
    declineField: (field: string) => target && declineAISuggestion(target, field),
    acceptAll: () => target && acceptAISuggestion(target),
    declineAll: () => target && declineAISuggestion(target),
  };
}
