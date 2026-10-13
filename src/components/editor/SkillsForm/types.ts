import { type SectionVariant } from '@/components/ui/section/types';
import { type ResumeData, type SkillLevel } from '@/types/resume';

export interface SkillsFormProps {
  variant?: SectionVariant;
  defaultCollapsed?: boolean;
}

export type LocalSkill = ResumeData['skills'][0] & { _id: string; _vId?: string };

/**
 * The level picker's options, in display order (highest first, "not specified"
 * pinned to the top).
 *
 * ⚠️ **Bound to `SkillLevel` in both directions.** This was
 * `{ value: number; label: string }[]`, which binds nothing: adding a `5` to the
 * union produced no error saying the picker was missing an option — a user could
 * never select it, and an imported résumé holding `5` rendered through
 * `SKILL_LEVEL_TO_KEY[5]` as `undefined`, i.e. "not specified" — while dropping a
 * member left a stale option writing an out-of-domain value.
 *
 * ⚠️ `as const satisfies` alone guards only the **bogus** direction; the
 * `_…AreExhaustive` alias below is what makes a *missing* member a build error.
 * Both, or it is half a guard.
 *
 * ⚠️ It is no longer only a picker. Every newly added skill carries
 * `level: 0` from `EMPTY_ITEM_FIELDS`, and the `value: 0` entry here is what
 * renders that as "Not specified" — so a drift costs a wrong label on a seeded
 * value, not just a missing option.
 */
export const SKILL_LEVELS = [
  { value: 0, label: 'editor.modules.skills.levels.not_specified' },
  { value: 4, label: 'editor.modules.skills.levels.expert' },
  { value: 3, label: 'editor.modules.skills.levels.advanced' },
  { value: 2, label: 'editor.modules.skills.levels.intermediate' },
  { value: 1, label: 'editor.modules.skills.levels.basic' },
] as const satisfies readonly { value: SkillLevel; label: string }[];

export type _SkillLevelsAreExhaustive<
  Missing extends never = Exclude<SkillLevel, (typeof SKILL_LEVELS)[number]['value']>,
> = Missing;

/**
 * ⚠️ **One clause carries BOTH guards, so it needs its own pin.** Deleting
 * `as const satisfies …` — the obvious "tidy up" — widens every `value` to
 * `number`, and `Exclude<SkillLevel, number>` is `never`, so
 * `_SkillLevelsAreExhaustive` is satisfied **vacuously**. Both directions go
 * silent from one edit: measured by a reviewer, `tsc -b --force` exit 0 and the
 * whole suite green, after which dropping the `basic` option is a clean build.
 *
 * This is the `string extends Ids` lesson on a numeric union — a derived
 * constraint has to be guarded against *widening*, not only against emptying.
 * `number extends 0|1|2|3|4` is false while the literals hold and true the
 * moment they do not.
 */
export type _SkillLevelsStayLiteral<
  Widened extends never = number extends (typeof SKILL_LEVELS)[number]['value']
    ? 'SKILL_LEVELS lost `as const` — both drift guards are now vacuous'
    : never,
> = Widened;

/**
 * The subtitle key for a level, **deliberately a proper subset of the union**:
 * `0` is omitted, and that omission is how the "not specified" subtitle works —
 * `SKILL_LEVEL_TO_KEY[0]` being `undefined` is what the `item.level && …` guards
 * at the two read sites rely on.
 *
 * ⚠️ Stated in the type rather than left to `Record<number, string>`, which
 * admitted any key and demanded none.
 */
export const SKILL_LEVEL_TO_KEY: Record<Exclude<SkillLevel, 0>, string> = {
  4: 'expert',
  3: 'advanced',
  2: 'intermediate',
  1: 'basic',
};

/**
 * The `editor.modules.skills.levels.*` suffix for any stored level, `0` and
 * values outside the union included — those read as `not_specified`.
 */
export const skillLevelKey = (level: unknown): string =>
  SKILL_LEVEL_TO_KEY[level as keyof typeof SKILL_LEVEL_TO_KEY] ?? 'not_specified';
