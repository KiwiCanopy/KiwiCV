import { type ReactNode } from 'react';

import { type SectionVariant } from '@/components/ui/section/types';
import { type CustomSectionItem, type ResumeData } from '@/types/resume';
import { type SectionKey } from '@/utils/layout/constants';
import { type CustomSectionToken } from '@/utils/layout/customSections';
import { type LucideIcon } from 'lucide-react';

// Helper type to get the array element type
export type ArrayElement<ArrayType extends readonly unknown[]> =
  ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

/**
 * `ResumeData`'s array-valued keys, derived structurally rather than listed.
 *
 * This is *exactly* `SectionKey` today, and that is not a coincidence worth
 * leaving unstated: the two are independent derivations of the same inventory —
 * one off the data model, one off `ALL_SECTION_KEYS` — so the pair is a
 * cross-check between them, and the aliases below are what make it one.
 * Deleting this in favour of `SectionKey` would throw the check away; deriving it
 * and asserting nothing left both drift directions silent.
 *
 * ⚠️ **The regression to guard is a shrink, and the first draft of this comment
 * described the wrong one.** It claimed an *optional* section prop
 * (`work?: WorkItem[]`) drops out silently. Measured: it does drop out, but a
 * homomorphic mapped type preserves `?`, so `ArraySectionKeys` also gains
 * `undefined`, which breaks `ResumeData[K]` at every use of the constraint — 126
 * errors with the aliases, **125 without**. Anything but silent, and both aliases
 * fire.
 *
 * The genuinely silent shrink is a **non-optional** one, e.g.
 * `interests: null | Array<…>`: 20 errors, of which
 * `_ArraySectionKeysCoverSections` is the only one at a declaration site — and for
 * a section with no `ArrayForm` caller (`skills`, `languages`) it would be close to
 * the only signal at all. That is what earns the pair its keep.
 *
 * ⚠️ Both degenerations are loud, but not the way the first draft said. Measured:
 * an ordinary `[extra: string]: unknown` on `ResumeData` collapses this union to
 * **`never`**, firing the *first* alias with all twelve while the second stays
 * silent — the index signature is the `never` case, not the `string` case. Only
 * `[extra: string]: unknown[]` produces the `string` degeneration, on the second
 * alias. So the `never`-only trap does not apply here, but the mapping of
 * cause to alias is the opposite of what was written. Both reviewer passes
 * measured this independently.
 */
export type ArraySectionKeys = {
  [K in keyof ResumeData]: K extends 'customSections'
    ? never // an array of sections, not of entries; see `CustomSectionForm`
    : ResumeData[K] extends readonly unknown[]
      ? K
      : never;
}[keyof ResumeData];

/** Every `SectionKey` is a required array on `ResumeData`. Catches a shrink. */
export type _ArraySectionKeysCoverSections<
  Missing extends never = Exclude<SectionKey, ArraySectionKeys>,
> = Missing;

/** Every array on `ResumeData` is a declared section. Catches a growth. */
export type _ArraySectionKeysAreSections<
  Extra extends never = Exclude<ArraySectionKeys, SectionKey>,
> = Extra;

/**
 * What an `ArrayForm` edits: a built-in section by key, or a custom section's
 * entries by its layout token.
 */
export type ArrayFormKey = ArraySectionKeys | CustomSectionToken;

export type ArrayFormItem<K extends ArrayFormKey> = K extends ArraySectionKeys
  ? ArrayElement<ResumeData[K]>
  : CustomSectionItem;

export interface FieldConfig<T> {
  name: keyof T & string;
  label: string;
  type?: 'text' | 'textarea' | 'date' | 'tags';
  placeholder?: string;
  row?: number;
  infoHint?: string;
  infoIcon?: LucideIcon;
  layoutHint?: string;
  layoutIcon?: LucideIcon;
}

export interface ArrayFormProps<K extends ArrayFormKey> {
  sectionKey: K;
  title: string;
  description?: string;
  itemTitleKey: keyof ArrayFormItem<K>;
  itemSubtitleKey?: keyof ArrayFormItem<K>;
  itemSummaryKey?: keyof ArrayFormItem<K>;
  itemStartDateKey?: keyof ArrayFormItem<K>;
  itemEndDateKey?: keyof ArrayFormItem<K>;
  fields: FieldConfig<ArrayFormItem<K>>[];
  variant?: SectionVariant;
  emptyLabel?: string;
  addFirstLabel?: string;
  defaultCollapsed?: boolean;
  subtitleFormatter?: (item: ArrayFormItem<K>) => string;
  /** Overrides the section's metadata icon; a custom section has none. */
  icon?: ReactNode;
  /** Trailing header actions, after Add and Hide. */
  extraActions?: ReactNode;
  /** Rendered above the entries, or above the empty state. */
  beforeItems?: ReactNode;
}

export type LocalItem<T> = T & { _id: string; _vId?: string };
