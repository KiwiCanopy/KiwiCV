import { type SectionVariant } from '@/components/ui/section/types';
import { type FluencyLevel, type ResumeData } from '@/types/resume';

export interface LanguageFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export type LocalLanguage = ResumeData['languages'][0] & { _id: string; _vId?: string };

/**
 * The level picker's options, in display order. Same binding as
 * `SKILL_LEVELS` and for the same reason — see the note there.
 *
 * ⚠️ `FluencyLevel` is `Enumerate<6>`, i.e. **generated**, so it resolves to
 * `0 | 1 | 2 | 3 | 4 | 5` rather than being written out. Bumping the `6` is
 * therefore an edit that never mentions this file, which is exactly the case the
 * `_…AreExhaustive` alias catches: it becomes `Missing = 6` and fails to satisfy
 * `extends never`.
 */
export const FLUENCY_LEVELS = [
  { value: 0, label: 'editor.modules.languages.levels.not_specified' },
  { value: 5, label: 'editor.modules.languages.levels.native' },
  { value: 4, label: 'editor.modules.languages.levels.fluent' },
  { value: 3, label: 'editor.modules.languages.levels.professional' },
  { value: 2, label: 'editor.modules.languages.levels.intermediate' },
  { value: 1, label: 'editor.modules.languages.levels.elementary' },
] as const satisfies readonly { value: FluencyLevel; label: string }[];

export type _FluencyLevelsAreExhaustive<
  Missing extends never = Exclude<FluencyLevel, (typeof FLUENCY_LEVELS)[number]['value']>,
> = Missing;

/** Same widening pin as `_SkillLevelsStayLiteral` — see the note there. */
export type _FluencyLevelsStayLiteral<
  Widened extends never = number extends (typeof FLUENCY_LEVELS)[number]['value']
    ? 'FLUENCY_LEVELS lost `as const` — both drift guards are now vacuous'
    : never,
> = Widened;

/**
 * The subtitle key for a level, a proper subset of the union for the same reason
 * as `SKILL_LEVEL_TO_KEY`: `0` is omitted so the read sites' `item.level && …`
 * guard produces the "not specified" branch.
 */
export const LEVEL_TO_KEY: Record<Exclude<FluencyLevel, 0>, string> = {
  5: 'native',
  4: 'fluent',
  3: 'professional',
  2: 'intermediate',
  1: 'elementary',
};

/**
 * The `editor.modules.languages.levels.*` suffix for any stored level, `0` and
 * values outside the union included — those read as `not_specified`.
 */
export const languageLevelKey = (level: unknown): string =>
  LEVEL_TO_KEY[level as keyof typeof LEVEL_TO_KEY] ?? 'not_specified';
