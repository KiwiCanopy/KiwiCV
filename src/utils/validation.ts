import type {
  AddressFieldKey,
  AddressSchemaConfig,
  CustomSection,
  CustomSectionItem,
  ResumeCoverLetter,
  ResumeData,
  SkillLevel,
  ThemeParams,
} from '@/types/resume';
import {
  ALL_ADDRESS_FIELD_KEYS,
  ALL_ADDRESS_MODES,
  ALL_ADDRESS_SEPARATORS,
  ALL_BOLD_HEADERS,
  ALL_IMAGE_SHAPES,
  THEME_PARAM_DEFAULTS,
  createDefaultCoverLetter,
} from '@/types/resume';
import { stripImageMetadataCached } from '@/utils/imageMetadata';
import { createEmptyItem, customSectionItemFields, generateId } from '@/utils/items';
import {
  ALL_EMPTY_ITEM_KEYS,
  ALL_SECTION_KEYS,
  type EmptyItemKey,
  allLayoutSectionIds,
} from '@/utils/layoutMetadata';
import { isValidDate, normalizeDate } from '@/utils/normalizeDate';
import { isOngoingDateWord } from '@/utils/ongoingDate';
import { collectPassthrough } from '@/utils/passthrough';
import { isImageVisible } from '@/utils/visibility';

/**
 * Re-exported so callers that sanitize `meta.theme.params` have one import
 * surface. The declarations live in `@/types/resume`, beside `initialResumeState`,
 * because the whitelist and the store's starting values must be the **same
 * object** — two lists agreeing by luck have already drifted once.
 */
export { THEME_PARAM_DEFAULTS, type ThemeParams };

/**
 * Checks if the resume data is essentially empty.
 * A resume is "meaningfully empty" if it has no name and all major content sections are empty.
 */
export const isMeaningfullyEmpty = (
  data: Partial<ResumeData> | Record<string, unknown>,
): boolean => {
  if (!data || typeof data !== 'object') return true;

  const d = data as Record<string, unknown>;
  const basics = (d.basics as Record<string, unknown>) || {};
  const hasName = typeof basics.name === 'string' && basics.name.trim().length > 0;

  if (hasName) return false;

  const hasContent = ALL_SECTION_KEYS.some((section) => {
    const items = d[section];
    return Array.isArray(items) && items.length > 0;
  });
  // Custom sections with entries are content too.
  const hasCustomContent =
    Array.isArray(d.customSections) &&
    d.customSections.some(
      (section: unknown) =>
        !!section &&
        typeof section === 'object' &&
        Array.isArray((section as { items?: unknown }).items) &&
        ((section as { items: unknown[] }).items.length ?? 0) > 0,
    );

  return !hasContent && !hasCustomContent;
};

/**
 * Cleans up JSON text from common AI artifacts like markdown code blocks and citation tags.
 * Also attempts to extract the main JSON object if there's surrounding text.
 */
export const cleanJsonText = (text: string): string => {
  let clean = text.trim();

  // 1. Remove markdown code blocks if present (e.g., ```json ... ```)
  const codeBlockMatch = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch && codeBlockMatch[1]) {
    clean = codeBlockMatch[1].trim();
  }

  // 2. Remove common AI citation markers
  // Patterns handled: [cite_start], [cite_end], [cite: 1], [1], 【1†source】, [^1^]
  clean = clean
    .replace(/\[cite_start\]/g, '')
    .replace(/\[cite_end\]/g, '')
    .replace(/\[cite: [^\]]+\]/g, '') // Handles [cite: 1], [cite: source_name] etc
    .replace(/【\d+†source】/g, '') // ChatGPT citations
    .replace(/\[\^\d+\^\]/g, ''); // Bing/Copilot citations

  // 3. Try to extract the largest JSON object if parsing still fails or if there's junk around
  // This helps if the LLM provided text before/after the JSON without code blocks
  if (!clean.startsWith('{') || !clean.endsWith('}')) {
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      clean = clean.substring(start, end + 1);
    }
  }

  return clean.trim();
};

export interface ImportWarning {
  section: string;
  item?: string;
  field: string;
  message: string; // The translation key
  vars?: Record<string, string | number>;
}

/**
 * The translation key that heads an import warning's row, or `null` when the
 * warnings UI has no label for that `section`.
 *
 * ⚠️ **"What the warnings UI can label" was restated three times and the three
 * disagreed**. `ImportWarningsModal` read `editor.sections.<section>`;
 * `GlobalImportWarningsModal` read the same with a `basics` special case;
 * `s()`'s array branch gated its warning on `ALL_SECTION_KEYS`. So a `basics`
 * warning rendered the literal string `editor.sections.basics` in one modal and
 * "Personal Details" in the other, and the date branch — which had no gate at
 * all — rendered `editor.sections.meta`, because `t` returns the path for a key
 * it cannot find. One function, consumed by both modals *and* by both warning
 * sites, is what makes the two questions the same question.
 *
 * `editor.sections.*` holds the twelve of `ALL_SECTION_KEYS` and nothing else,
 * so the inventory is derived rather than listed — a thirteenth section is
 * covered without an edit here. `basics` is the one labelable section that is
 * not in it: it is a *supersection* in the editor's own vocabulary, and it
 * reaches the warnings as a section string from `s(basicsRaw, …)` and from the
 * `profiles` `sanitizeArray` call.
 *
 * A `null` return is a warning nobody can be told the location of, which is why
 * the two gated `warnings.push` sites in `sanitizeResumeData` treat it as "do
 * not raise" rather than as "raise it unlabelled". `meta` is the only such
 * section today.
 *
 * ⚠️ **There are THREE `warnings.push` sites in this file, not two.** The third
 * is in `validateSkills`, which hardcodes `section: 'skills'` — labelable, so no
 * live defect, and ungated because it cannot produce an unlabelable section.
 * Worth stating because `setResume` merges its output with the sanitizer's into
 * one list for one modal, so "every warning is labelable" is a property of the
 * *merged* list; `importWarningLabels.test.ts` drives `sanitizeResumeData`
 * alone, which covers two of the three. Found by the code-reviewer pass.
 */
export const labelKeyForWarningSection = (section: string): string | null => {
  if (section === 'basics') return 'editor.supersections.basics.title';
  if (section === 'passthrough') return 'editor.import_warnings_passthrough';
  if (section === 'customSections') return 'editor.custom_sections.title';
  return (ALL_SECTION_KEYS as readonly string[]).includes(section)
    ? `editor.sections.${section}`
    : null;
};

/**
 * The field names `s()` treats as ISO dates, **derived from the item inventory**
 * rather than matched by name against whatever `s()` happens to be walking.
 *
 * ⚠️ **A name heuristic applied to a settings namespace has already shipped a bug.**
 * `key.toLowerCase().includes('date')` ran over every object `s()` recurses
 * into, so `meta.theme.params.footerDate` — a three-state *label* whose values
 * are `'auto'`, `'none'`, or free text the user types — was handed to
 * `normalizeDate`/`isValidDate`. `'none'` is exactly what unchecking "show
 * footer date" writes (`PdfFooterSection.tsx:115`), and `typstFooter.ts:165`
 * treats the resulting `''` identically to `'auto'`: turn the date off, export,
 * re-import, and it is **back on**, with a warning row about a date format in a
 * field the user never typed a date into. Every free-text label
 * (`'15 January 2026'`) was blanked the same way.
 *
 * Deriving the set off `createEmptyItem` means only fields that exist on the
 * data model can opt in — `startDate`, `endDate`, `date`, `releaseDate` — and a
 * date field added to an item is covered with no edit here. It is still a match
 * on the *name*, so a `meta` key literally called `startDate` would be caught;
 * what it can no longer do is let a settings key opt itself in by containing the
 * word.
 *
 * ⚠️ The old expression's `|| key === 'releaseDate'` disjunct was dead —
 * `'releasedate'.includes('date')` is true — and reads as if it named a field
 * the heuristic misses.
 */
export const RESUME_DATE_FIELDS: ReadonlySet<string> = new Set(
  ALL_EMPTY_ITEM_KEYS.flatMap((key) =>
    Object.keys(createEmptyItem(key)).filter((field) => field.toLowerCase().includes('date')),
  ),
);

interface HasVId {
  _vId?: string;
  [key: string]: unknown;
}

/**
 * Validates and cleans up skills data.
 *
 * ⚠️ **Returns every entry it is given — it does not drop any, and it no longer
 * pretends to.** The return type carried a `skippedCount` that was
 * hardcoded `0` on *both* paths, and the walk below has no `continue`, no filter
 * and no early return: an entry either passes through unchanged
 * (`levelMatch && keywordsMatch`) or is normalised and pushed. So `setResume`'s
 * `skippedSkills` was always `0`, for as long as the field existed, and the one
 * place that read it — `ImportModal`'s `skippedSkills === 0 && warnings.length
 * === 0` — was gated on a constant.
 *
 * ⚠️ **No user-facing message was unreachable**, as was once predicted and
 * what re-deriving the consumers disproved: the dead conjunct was
 * `&&`-ed with a live one, so `welcome.import_success` still fires whenever there
 * are no warnings, and no locale key was orphaned (`i18n:check` clean before and
 * after). There is one consumer, not two — `useAIImportJob`
 * calls `setResume` and discards the return value entirely.
 *
 * `warnings` carries the one thing this path genuinely reports
 * (`editor.errors.invalid_skill_level`) and is not always empty. If dropping
 * entries is ever wanted, it is a behaviour change to the import path and needs a
 * count reintroduced with it — `validation.test.ts` pins the totality so that
 * cannot happen silently.
 */
export const validateSkills = (
  skills: Array<Record<string, unknown>>,
): { validated: ResumeData['skills']; warnings: ImportWarning[] } => {
  if (!Array.isArray(skills)) {
    return { validated: [], warnings: [] };
  }

  const validated: ResumeData['skills'] = [];
  const warnings: ImportWarning[] = [];

  skills.forEach((skill) => {
    const level = skill.level;
    const originalKeywords = skill.keywords;
    const keywords = Array.isArray(originalKeywords) ? originalKeywords : [];

    // Normalize level to 1-4 scale
    let normalizedLevel: number | undefined = undefined;
    let isMigration = false;

    if (level !== undefined && level !== null && level !== '') {
      let rawVal: number | undefined = undefined;
      if (typeof level === 'number') {
        rawVal = level;
      } else if (typeof level === 'string') {
        const parsed = parseFloat(level);
        if (!isNaN(parsed)) {
          rawVal = parsed;
        }
      }

      if (rawVal !== undefined) {
        if (rawVal >= 1 && rawVal <= 4) {
          // Already in the new 1-4 range
          normalizedLevel = Math.round(rawVal);
        } else if (rawVal > 4 && rawVal <= 100) {
          // Old 0-100 percentage range, migrate it
          isMigration = true;
          if (rawVal <= 39) {
            normalizedLevel = 1;
          } else if (rawVal <= 69) {
            normalizedLevel = 2;
          } else if (rawVal <= 89) {
            normalizedLevel = 3;
          } else {
            normalizedLevel = 4;
          }
        } else if (rawVal === 0) {
          normalizedLevel = undefined;
        }
      }
    }

    const keywordsMatch = originalKeywords === keywords;
    const levelMatch =
      (skill.level === undefined && normalizedLevel === undefined) ||
      (skill.level !== undefined &&
        normalizedLevel !== undefined &&
        Math.abs(Number(skill.level) - normalizedLevel) < 0.01) ||
      (normalizedLevel === undefined &&
        (skill.level === 0 || skill.level === '0' || skill.level === null || skill.level === ''));

    if (levelMatch && keywordsMatch) {
      validated.push(skill as unknown as ResumeData['skills'][number]);
    } else {
      // If we had a level but it's now different and it wasn't a standard migration, it's a warning
      if (skill.level !== undefined && skill.level !== null && !levelMatch && !isMigration) {
        warnings.push({
          section: 'skills',
          item: (skill.name as string) || 'Unnamed Skill',
          field: 'level',
          message: 'editor.errors.invalid_skill_level',
        });
      }

      // Correct the level and ensure keywords array
      const normalizedSkill = {
        ...skill,
        name: (skill.name as string | undefined) ?? 'Unnamed Skill',
        level: normalizedLevel as SkillLevel,
        keywords: keywords as string[],
      } as unknown as ResumeData['skills'][number];

      validated.push(normalizedSkill);
    }
  });

  return { validated, warnings };
};

const asString = (value: unknown, fallback: string): string =>
  typeof value === 'string' ? value : fallback;
const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

/** Narrow an unknown to one of a closed set of string literals, or a fallback. */
const asOneOf = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;

/**
 * Sanitizes `meta.theme.params.sectionLabels`, the user's per-section heading
 * overrides.
 *
 * ⚠️ **`s()` cannot express this and silently empties it.** The map is keyed by
 * section, so its defaults object is `{}`, and `s()` whitelists by
 * `Object.keys(defaults)` — every override is dropped. Originally the key was not
 * in the whitelist at all, so this never surfaced as *lost labels on import*; it
 * surfaced as labels being reset on every list edit (see `sanitizeThemeParams`).
 *
 * ⚠️ **The `typeof value === 'string'` check is the only boundary here, and it is
 * load-bearing twice over.** The readers hand these values straight to React
 * (`getSectionLabels` spreads them over the translated defaults) and into Typst
 * markup, so an object-shaped heading is a crash — and the key was once
 * stripped outright, so whitelisting it without narrowing would have traded a
 * reset for that crash.
 *
 * It is also what makes the `__proto__` key inert, which is why there is no
 * separate filter for it. `JSON.parse` produces `__proto__` as an own enumerable
 * property, and `result['__proto__'] = value` invokes the setter rather than
 * adding a key — but that setter **ignores a non-object value**, and a string is
 * all this check ever lets through. A `key !== '__proto__'` guard was written
 * first, then deleted: removing it failed nothing, because it could not fire.
 * One asserted boundary beats two with one decorative.
 */
export const sanitizeSectionLabels = (raw: unknown): Record<string, string> | undefined => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return undefined;

  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof value === 'string') result[key] = value;
  }
  return result;
};

/**
 * Sanitizes `meta.theme.params.addressSchema`, the custom address layout.
 *
 * ⚠️ **`s()` cannot express this either, for a different reason.** `customFields`
 * is an *array*, so `s()`'s object branch (`validation.ts:523`) does not apply and
 * the fallback copies it **verbatim** — arbitrary JSON straight into `meta`. That
 * is precisely the licence an earlier fix spent a round closing at the read sites: a `null`
 * entry, a non-array container, a missing `separator` and a prototype name for
 * `field` each produced a live crash or `undefined` in the PDF.
 *
 * Every leaf is narrowed to its declared union here, so those read-site guards
 * become defence in depth for `persist` rehydration (which does **not** run this
 * function) rather than the only thing standing between stored JSON and a crash.
 */
export const sanitizeAddressSchema = (raw: unknown): AddressSchemaConfig => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { mode: 'default' };

  const r = raw as Record<string, unknown>;
  const result: AddressSchemaConfig = { mode: asOneOf(r.mode, ALL_ADDRESS_MODES, 'default') };

  if (typeof r.presetCountry === 'string') result.presetCountry = r.presetCountry;

  if (Array.isArray(r.customFields)) {
    result.customFields = r.customFields
      .filter(
        (entry): entry is Record<string, unknown> =>
          !!entry && typeof entry === 'object' && !Array.isArray(entry),
      )
      // A field name outside the union is dropped rather than defaulted: an unknown
      // key contributes nothing to the rendered address, while defaulting it to
      // `address` would silently duplicate a line the user never asked for. A bad
      // *separator* is defaulted instead — the entry is still a field the user
      // chose, and `''` is the one separator that adds nothing.
      .filter((entry): entry is Record<string, unknown> & { field: AddressFieldKey } =>
        (ALL_ADDRESS_FIELD_KEYS as readonly unknown[]).includes(entry.field),
      )
      .map((entry) => ({
        field: entry.field,
        separator: asOneOf(entry.separator, ALL_ADDRESS_SEPARATORS, ''),
      }));
  }

  return result;
};

/**
 * Sanitizes an imported cover letter block, coercing each field to its expected
 * type and falling back to the disabled default for anything missing or malformed.
 * Paragraphs are kept as raw markdown-subset strings; non-string entries are dropped.
 */
export const sanitizeCoverLetter = (raw: unknown): ResumeCoverLetter => {
  const def = createDefaultCoverLetter();
  if (!raw || typeof raw !== 'object') return def;

  const r = raw as Record<string, unknown>;
  const layout = (r.layout as Record<string, unknown> | undefined) || {};
  const recipient = (r.recipient as Record<string, unknown> | undefined) || {};

  return {
    enabled: asBool(r.enabled, def.enabled),
    paragraphs: Array.isArray(r.paragraphs)
      ? r.paragraphs.filter((p): p is string => typeof p === 'string')
      : def.paragraphs,
    layout: {
      textAlign: layout.textAlign === 'justify' ? 'justify' : 'left',
      showSender: asBool(layout.showSender, def.layout.showSender),
      showRecipient: asBool(layout.showRecipient, def.layout.showRecipient),
      showFooter: asBool(layout.showFooter, def.layout.showFooter),
      classicLayout: asBool(layout.classicLayout, def.layout.classicLayout),
    },
    recipient: {
      name: asString(recipient.name, ''),
      company: asString(recipient.company, ''),
      address: asString(recipient.address, ''),
    },
    subject: asString(r.subject, ''),
    date: asString(r.date, ''),
  };
};

/**
 * Refines the params `s()` copied but could not narrow, and restores the two it
 * could not carry at all.
 *
 * `s()` is kept as the engine for the scalars — it already defaults them and runs
 * the date check on `footerDate` — and this runs over its output:
 *
 * - `sectionLabels` and `addressSchema` are rebuilt from the **raw** params, because
 *   `s()`'s recursion empties the first (keyed by section, so `{}` defaults) and
 *   copies the second verbatim (an array, so the verbatim copy at `:553` applies rather than the object recursion at `:523`).
 * - every remaining key is narrowed to its declared type.
 *
 * ⚠️ **All ten, not the four that were obviously broken.** `s()` copies a present
 * key **verbatim**, so before this an imported file could put any JSON at any
 * param: `imageShape`/`boldHeader*` promise two-member unions and were newly
 * admitted by the whitelist, and `fontSizeScale` was already worse —
 * `SkylineSerializer.ts:51` reads it as `params?.fontSizeScale || 1` and skyline
 * interpolates it **raw** into Typst (`size: 8pt * ${fontScale}` at five sites in
 * `helpers/typst/`), so a string closed the `text(` call and injected markup. The
 * other themes spell it `${9 * fontScale}` and merely emit `NaNpt`. Hoisting
 * `asString`/`asBool`/`asOneOf` to module scope and then narrowing half the block
 * was the actual mistake; a review caught it.
 *
 * ⚠️ **`footerDate` used to be the one exception and no longer is.** This
 * block said it "stays with `s()`, because `s()` treats any key whose name
 * contains 'date' as a date field … narrowing it here would silently drop that".
 * Dropping it was the fix: `footerDate` is a three-state *label* (`'auto'`,
 * `'none'`, or free text the user types at `PdfFooterSection.tsx:121`), not a
 * date, and `typstFooter.ts` prints it verbatim. The date check blanked `'none'`
 * and every free-text value on import, and `''` reads as `'auto'`, so switching
 * the footer date off did not survive a round trip. All ten params are narrowed
 * here now.
 *
 * ⚠️ Nothing asserted any of this until it was mutation-tested: replacing the
 * three union lines with the raw `base.*` value passed the entire suite.
 * `themeParams.test.ts` now feeds each param an out-of-type value.
 *
 * ⚠️ The **return** type carries the completeness guarantee, not the parameter.
 * `base` is the `s()` output, which is complete by construction — but it arrives
 * typed as the all-optional `ThemeParams`, and demanding `Required<>` here would
 * only push a cast up to the call site. Every key below is instead assigned
 * unconditionally with a `THEME_PARAM_DEFAULTS` fallback, so completeness is a
 * property of *this function* rather than a promise about its input.
 * `sectionLabels` is the one key that may be absent, and the type says so — which
 * is what lets `dataSlice` drop its base spread without a `|| {}`.
 *
 * @param legacyMeta the *pre-sanitize* meta, for the one legacy read below.
 */
export type SanitizedThemeParams = Omit<Required<ThemeParams>, 'sectionLabels'> &
  Pick<ThemeParams, 'sectionLabels'>;

export const sanitizeThemeParams = (
  base: ThemeParams,
  rawParams: unknown,
  legacyMeta: unknown,
): SanitizedThemeParams => {
  const raw = (rawParams && typeof rawParams === 'object' ? rawParams : {}) as Record<
    string,
    unknown
  >;
  const result: SanitizedThemeParams = {
    ...base,
    palette: asString(base.palette, THEME_PARAM_DEFAULTS.palette),
    // Narrowed like the other nine. It used to be `base.footerDate ??
    // …` with a note saying the value was left untouched because `s()` had
    // already run the date check on it — that check has since been removed, so the
    // param is a plain string setting and is narrowed as one.
    //
    // ⚠️ **Inert today, and measured as such rather than claimed to do work.**
    // `s()`'s string branch already coerces this key (its schema default
    // `'auto'` is a string), so reverting this line to `??` fails nothing. It is
    // here because "every param is narrowed here" is a cheaper rule to keep than
    // "every param except the one whose narrowing lives in another function",
    // and the type-level completeness the return type promises is proved either
    // way.
    footerDate: asString(base.footerDate, THEME_PARAM_DEFAULTS.footerDate),
    showFooter: asBool(base.showFooter, THEME_PARAM_DEFAULTS.showFooter),
    footerLocation: asString(base.footerLocation, THEME_PARAM_DEFAULTS.footerLocation),
    // `typeof` for the narrowing, `Number.isFinite` because `NaN` and `Infinity`
    // are both numbers and both reach the Typst markup as a length.
    // (`Number.isFinite` alone does not narrow — it is declared to take `unknown`.)
    fontSizeScale:
      typeof base.fontSizeScale === 'number' && Number.isFinite(base.fontSizeScale)
        ? base.fontSizeScale
        : THEME_PARAM_DEFAULTS.fontSizeScale,
    imageShape: asOneOf(base.imageShape, ALL_IMAGE_SHAPES, THEME_PARAM_DEFAULTS.imageShape),
    boldHeaderWork: asOneOf(
      base.boldHeaderWork,
      ALL_BOLD_HEADERS,
      THEME_PARAM_DEFAULTS.boldHeaderWork,
    ),
    boldHeaderEducation: asOneOf(
      base.boldHeaderEducation,
      ALL_BOLD_HEADERS,
      THEME_PARAM_DEFAULTS.boldHeaderEducation,
    ),
    addressSchema: sanitizeAddressSchema(Object.hasOwn(raw, 'addressSchema') && raw.addressSchema),
  };

  const labels = sanitizeSectionLabels(Object.hasOwn(raw, 'sectionLabels') && raw.sectionLabels);
  if (labels) {
    result.sectionLabels = labels;
  } else {
    delete result.sectionLabels;
  }

  // Pre-v3 exports stored the shape under `meta.ui`. The persist migration
  // (`store/resume/migrations.ts:69`) covers a rehydrated store; an imported *file*
  // never runs it, so the read has to live on the import path. It used to sit
  // inline in `setResume`'s merge, where it doubled as the rescue that kept this
  // one param alive — that rescue is gone and only the migration remains.
  // ⚠️ Legacy wins over `params`, matching the `||` order it replaced; in practice a
  // file that has one never has the other.
  //
  // ⚠️ **One deliberate behaviour change comes with dropping that rescue.** Because
  // `imageShape` was never in the old whitelist, its `sanitized` term was always
  // `undefined`, so the value in practice always came from the *current* store —
  // `imageShape` was sticky across an import. It no longer is: a file that omits it
  // now yields `square`, like every other param. That is the consistent reading
  // (theme name, palette and font scale have always come from the file) and it is
  // what makes the *other* direction work — before, a file that specified `circle`
  // was ignored. Asserted both ways in `themeParams.test.ts`.
  const legacyShape = (legacyMeta as { ui?: { imageShape?: unknown } } | undefined)?.ui?.imageShape;
  if (legacyShape === 'circle' || legacyShape === 'square') {
    result.imageShape = legacyShape;
  }

  return result;
};

/**
 * The import whitelist for every array-section item, derived from
 * `createEmptyItem` rather than restated.
 *
 * ⚠️ **This is the field-level, live half of the drift family.** `s()` whitelists
 * by `Object.keys(defaults)`, so a field missing from the schema is *stripped on
 * every `setResume`* — not merely absent from a new item. This used to be a
 * hand-written thirteen-entry literal with no compiler link to
 * `EMPTY_ITEM_FIELDS`, and it had already drifted on `level`:
 * it seeded `skill.level` and `language.level` as `undefined` where
 * `createEmptyItem` gives `0`.
 *
 * ⚠️ Its keys were also **singular** (`skill`, `award`, `project`) where every
 * other inventory in the repo is plural — except `privateProjects`, which was
 * already plural, so the convention it was named for did not even hold. Keying
 * on `EmptyItemKey` removes the translation step: `sanitizeArray`'s `section`
 * argument and its schema are now the same string.
 *
 * Two fields are added on top. `visible` is metadata `createEmptyItem` does not
 * carry at all — `EXPECTED_FIELDS` in `items.test.ts` pins its absence from the
 * item shape. `_vId` it *does* carry, but with a freshly generated id, and here
 * it is pinned to `''`.
 *
 * ⚠️ **Nothing asserts either reason to prefer `''`, and both are weaker than an
 * earlier draft of this comment claimed** — measured by a reviewer, who moved
 * the two additions *before* the spread (so `_vId` becomes a generated id and
 * leaves first position) and watched 547 tests across `src/utils` and
 * `src/store` stay green, `hash.test.ts` included. So:
 *
 * - The "`''` is the sentinel `sanitizeArray` compares against" reason is real
 *   but **redundant**: `sanitizeArray`'s keep-clause already rejects `''` on its
 *   own before comparing against `schema._vId`, which catches nothing more.
 * - The "first position, which is the order `getResumeHash` sees" reason is real
 *   for the hash's *input* and unobserved by anything — the hash is compared
 *   against itself, so a stable reordering shifts every hash equally.
 *
 * Written this way because it is the shape the thirteen literals had, and
 * changing key order in persisted data is a decision rather than a cleanup. Not
 * because a test would catch it.
 */
const buildItemSchema = (key: EmptyItemKey): Record<string, unknown> => ({
  ...createEmptyItem(key),
  _vId: '',
  visible: true,
});

/**
 * Sanitizes the resume data by picking only known fields defined in the schema.
 */
export const sanitizeResumeData = (
  input: Partial<ResumeData> | Record<string, unknown>,
): { sanitized: ResumeData; warnings: ImportWarning[] } => {
  const warnings: ImportWarning[] = [];

  // Unmodelled top-level keys are held, not dropped; a stored block whose
  // key KiwiCV has since learned is read as if it were top level.
  const collected = collectPassthrough((input ?? {}) as Record<string, unknown>);
  const data = { ...collected.lifted, ...input } as Record<string, unknown>;
  // No "kept" notice for KiwiCV's own export (it wrote those blocks, and the user
  // saw the notice on the first import) or for `$schema`, which most JSON Resume
  // files carry.
  const inputMeta = (input as { meta?: { theme?: unknown } } | undefined)?.meta;
  const isOwnExport = !!inputMeta?.theme && typeof inputMeta.theme === 'object';
  const noticeKeys = isOwnExport ? [] : collected.keptFromFile.filter((key) => key !== '$schema');
  for (const key of noticeKeys) {
    warnings.push({
      section: 'passthrough',
      field: key,
      message: 'editor.errors.passthrough_kept',
    });
  }
  for (const key of collected.dropped) {
    warnings.push({
      section: 'passthrough',
      field: key,
      message: 'editor.errors.passthrough_dropped',
    });
  }

  const s = (
    obj: unknown,
    defaults: Record<string, unknown>,
    section: string,
    itemTitle?: string,
  ): Record<string, unknown> => {
    if (!obj || typeof obj !== 'object') {
      return defaults;
    }
    const record = obj as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    Object.keys(defaults).forEach((key) => {
      // Legacy catch: rename fluency to certificate for Languages section
      if (key === 'certificate' && !('certificate' in record) && 'fluency' in record) {
        record['certificate'] = record['fluency'];
      }
      const isDateField = RESUME_DATE_FIELDS.has(key);
      if (key in record) {
        const value = record[key];
        const defaultValue = defaults[key];
        if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
          result[key] = s(value, defaultValue as Record<string, unknown>, section, itemTitle);
        } else if (Array.isArray(defaultValue)) {
          // ⚠️ **The array branch.** Without it an array default
          // fell through to `result[key] = value` below and a *present*
          // non-array field reached the renderers raw — `Object.keys(defaults)`
          // whitelists the key, and nothing here looked at its shape. The
          // `isDateField` branch three lines down has done this correctly for
          // longer; this is the same rule one field type over, and the third time
          // this file has had to learn it (`Object.hasOwn`,
          // `typeof === 'string'`, `city`).
          //
          // ⚠️ **Two separate properties, and the element half is the one no
          // issue named.** Measured through `setResume` — i.e.
          // the only production path in — with `buildSingleItemResume`, all
          // twelve themes, both renderers:
          //
          // - a non-array container (`"a, b"`, the shape a human or an LLM
          //   writes for highlights) threw on **12 of 12 HTML previews and 12
          //   of 12 PDF serializers** for `work.highlights` (six and six
          //   against a barer fixture).
          // - a bad *element* threw independently: `[{}]` gave `Objects are not
          //   valid as a React child` on 12/12 and `str.replace is not a
          //   function` (`escapeTypst`) on 12/12; `[42]` and `[['x']]` took the
          //   Typst half alone. **`skills.keywords` is reachable only this
          //   way** — `validateSkills` runs after `sanitizeResumeData` and
          //   already replaces a non-array container, so the container half
          //   never reaches the renderers there while the element half does.
          //
          // Every array field this function can see is a `string[]` on
          // `ResumeData` — the seven item fields (`highlights` ×4, `keywords`
          // ×2, `courses`), plus `meta.content`'s `hiddenIds`,
          // `hiddenSections`, and the four `order` / `pageBreaks` arrays, which
          // this branch now covers too. ⚠️ The one array default that is *not*
          // `string[]` is `schemas.basics.profiles`, and it is unaffected only
          // because `sanitizedProfiles` overwrites it — see the note there.
          //
          // `filter` also allocates, so the result is never the caller's array
          // and never the schema's; `structuredClone` gives the fallback its own
          // instance per item, which is the no-shared-instance rule on a new branch.
          const kept = Array.isArray(value)
            ? value.filter((element) => typeof element === 'string')
            : (structuredClone(defaultValue) as unknown[]);
          // ⚠️ **A nullish container lost nothing, and charging it `1` was a
          // false alarm the guard's own principle forbids.** `lost` used to be
          // `Array.isArray(value) ? value.length - kept.length : 1`, so
          // `"highlights": null` — the ordinary way a third party or an LLM
          // writes an empty list — raised `invalid_list_value` for content that
          // never existed. The string branch and the date branch beside it are
          // both silent for the same input, so three branches disagreed about
          // one input class. Found by the code-reviewer pass; neither new guard
          // covered it, because `sanitizerArrayFields.test.ts` asserts `null`'s
          // *value* and `arrayFieldImportWarnings.test.ts` tested `[]` and an
          // absent key but not `null`.
          const lost = Array.isArray(value)
            ? value.length - kept.length
            : value === null || value === undefined
              ? 0
              : 1;

          // ⚠️ **The warning moved here, where it belongs.** The defect
          // was first reported against `validateSkills` replacing a non-array `keywords`
          // with no notice; after the array branch above, `s()` has already done
          // that by the time `validateSkills` runs (`setResume` calls the
          // sanitizer first), so `keywordsMatch` is now always true and the
          // silent loss happens *here* — for all seven array fields, not just
          // `skills.keywords`. Emitting it at the site that does the discarding
          // covers the whole family instead of one field of it.
          //
          // ⚠️ Gated on `labelKeyForWarningSection` rather than warning
          // unconditionally. The warnings UI heads a row with the section's
          // label, and a section it has no label for renders its own translation
          // key as the heading, because `t` returns the path for a key it cannot
          // find. `meta.content`'s arrays are bookkeeping the user never
          // authored, so there is nothing to tell them about anyway.
          //
          // ⚠️ **The modal on this path is `GlobalImportWarningsModal`, not
          // `ImportWarningsModal`** — the latter is reached only from
          // `ResumeLanguageSelector`. Both reviewer passes caught the wrong
          // citation. This gate used to spell the inventory `ALL_SECTION_KEYS`
          // while the two modals spelled it two other ways; now all three are
          // one, so this branch and the date branch below can no longer
          // disagree with each other or with what either modal renders.
          //
          // ⚠️ Widening the gate to the labelable set (which includes `basics`)
          // exposed a false positive the narrower spelling had been masking, and
          // it is fixed at the source rather than re-masked: `schemas.basics` no
          // longer restates `profiles`. See the note there.
          if (lost > 0 && labelKeyForWarningSection(section) !== null) {
            warnings.push({
              section,
              item: itemTitle,
              field: key,
              message: 'editor.errors.invalid_list_value',
            });
          }
          result[key] = kept;
        } else {
          if (isDateField) {
            // ⚠️ `typeof`, not `as string`. `(value as string) || ''` keeps any
            // truthy non-string, and `original.toLowerCase()` five lines down then
            // throws — so a single `"startDate": {}` in an imported file killed the
            // **whole import**, not just that field. Reachable on every date field
            // in every section. Found in review. (It used to say "plus
            // `footerDate`"; that param no longer reaches this branch —
            // `RESUME_DATE_FIELDS` is derived from the item inventory.)
            const original = typeof value === 'string' ? value : '';
            const normalized = normalizeDate(original);

            // Standard format check
            const isStandard = isValidDate(original);
            // `''` on top of the shared inventory: an empty date is an open one
            // here, and is not something to warn about.
            const isPresentVariant = !original.trim() || isOngoingDateWord(original);

            if (
              original &&
              !isPresentVariant &&
              (!isStandard || (normalized === '' && original !== ''))
            ) {
              // We strip the unparsable date but emit a warning so the user knows.
              //
              // ⚠️ Same gate as the array branch above, for the same reason —
              // this branch had none, which is how a past bug rendered the literal
              // string `editor.sections.meta` as a warning heading. It is
              // **inert today**: every name in `RESUME_DATE_FIELDS` comes from
              // an item schema, and every item schema is walked under one of the
              // twelve section keys or under `basics` (`profiles`), all of which
              // are labelable. It stops being inert the moment a date-named
              // field is added to a block `s()` walks under an unlabelable
              // section — `meta` is the only one — which is exactly the shape
              // of that bug. It is here so the two warning sites cannot disagree,
              // not because a fixture can reach it; the assertable half of the
              // property is that no theme param carries a data date-field name
              // (`importWarningLabels.test.ts`).
              if (labelKeyForWarningSection(section) !== null) {
                warnings.push({
                  section,
                  item: itemTitle,
                  field: key,
                  message: 'editor.errors.non_standard_date',
                });
              }
              result[key] = '';
            } else {
              result[key] = original;
            }
          } else if (typeof defaultValue === 'string') {
            // ⚠️ **The string branch** — the same rule as the
            // array branch above and the date branch beside it, on the field
            // type that carries most of the résumé. A schema whose default is a
            // string says the field *is* a string; before this, `result[key] =
            // value` wrote whatever the JSON held and every unguarded string
            // method downstream threw.
            //
            // ⚠️ **This family was once described as patched at six consumers and
            // therefore closed. It is not — measured through
            // `setResume`, all twelve themes, both renderers:**
            //
            // | field | HTML | Typst | first message |
            // | --- | --- | --- | --- |
            // | `basics.url` | **12** | **12** | `basics.url.replace is not a function` |
            // | `basics.name` | 2–12 | **12** | `basics.name.replace is not a function` |
            // | `basics.label` | 2–11 | **12** | `basics.label?.toUpperCase is not a function` |
            // | `email` / `phone` / `summary` | 0–11 | **12** | `str.replace` (`escapeTypst`) |
            // | `basics.image` | 0 | 9 | `image.startsWith is not a function` |
            // | `location.city` / `countryCode` | 0 | **12** | `…?.city?.trim is not a function` |
            //
            // So the six patched producers are the ones somebody happened to
            // trip over; the theme renderers read the same stored scalars raw,
            // and `location.city?.trim()` survives in a Typst helper the first
            // fix did not reach. Hardening those sites would be a thirteenth through
            // twenty-somethingth copy of one rule — this is the boundary.
            //
            // ⚠️ Falls back to `defaultValue`, not to `''`. Every item field's
            // default *is* `''`, but `meta`'s are not: a non-string
            // `sidebarPosition` must become `'left'`, `theme.name` `'lunar'`,
            // `version` `'1.0.0'`. `''` would type-check and be wrong.
            //
            // ⚠️ **`footerDate` used to be an exception to that, and it was not
            // inert.** It defaults to `'auto'` and is a `meta` string param, but
            // the old name-matched `isDateField` sent it to the date branch,
            // which hardcodes `''`. The note here called that inert on the
            // strength of `typstFooter.ts:165` treating `''` and `'auto'`
            // identically — true, and the wrong half of the question: the values
            // being blanked were `'none'` and free text, not `'auto'`, and
            // blanking `'none'` turns the footer date back **on**. Since
            // that fix the param reaches this branch, so a non-string becomes
            // `'auto'` here and `sanitizeThemeParams` re-narrows it.
            //
            // ⚠️ **And this branch does not close the scalar boundary**, which
            // the sentence above invites a reader to assume. Numbers and
            // booleans still fall through to `result[key] = value`;
            // `fontSizeScale` and `showFooter` are re-narrowed by
            // `sanitizeThemeParams` and `skills.level` by `validateSkills`, so
            // what reaches the store raw is `languages.level` and `visible`.
            // Measured across twelve themes and both renderers: neither throws.
            //
            // ⚠️ **This does not make the store's contents trustworthy**, and
            // deleting the six consumer guards on the strength of it would be a
            // regression. This branch closes the *entry*, not the read.
            //
            // ⚠️ **The rehydration hole this note used to describe is closed.**
            // It said `sanitizeResumeData` runs on the `setResume`
            // paths only and `onRehydrateStorage` runs `sanitizePageBreaks`
            // alone, so everything already in `localStorage` reached the
            // renderers without passing through this function — which is how
            // the bad `addressSchema` and `separator` values became reachable.
            // That callback now runs this function too, so both ways into the
            // store normalise. Deleting the six is still a separate decision.
            // ⚠️ **The warning is the string-branch sibling of the array
            // and date warnings above.** A present non-string coerced away is
            // silent data loss the other two branches already report:
            // `basics.url = 42` blanked the field on 12/12 HTML previews and
            // 12/12 Typst serializers (measured) with nothing said,
            // where a bad list entry warns. Same site, same notice.
            //
            // Gated three ways, matching those siblings:
            // - **`defaultValue === ''`** restricts it to *blankable résumé
            //   fields*. `meta`'s string defaults are real settings
            //   (`sidebarPosition` `'left'`, `theme.name` `'lunar'`, `footerDate`
            //   `'auto'`), so coercing one is a narrowing, not a loss, and must
            //   stay silent — the caveat the docblock below spells out.
            // - **`value != null`** mirrors the array branch's `lost` rule:
            //   `null`/`undefined` is the ordinary "no value", not discarded
            //   content, so it charges nothing.
            // - **`labelKeyForWarningSection`** keeps it off sections the
            //   warnings UI cannot head, exactly as both siblings do.
            if (
              defaultValue === '' &&
              value !== null &&
              value !== undefined &&
              typeof value !== 'string' &&
              labelKeyForWarningSection(section) !== null
            ) {
              warnings.push({
                section,
                item: itemTitle,
                field: key,
                message: 'editor.errors.invalid_text_value',
              });
            }
            result[key] = typeof value === 'string' ? value : defaultValue;
          } else {
            result[key] = value;
          }
        }
      } else {
        const fallback = defaults[key];
        // ⚠️ **A fresh array per item, not the schema's own.** One schema
        // object serves every item in a section, so writing `defaults[key]`
        // through handed all of them the *same* `highlights` / `keywords` /
        // `courses` instance: import a résumé whose work entries have no
        // highlights, add one to the first entry, and it appeared on every
        // entry. Measured, not reasoned.
        //
        // ⚠️ This is the hazard `utils/items.ts`'s `projectFields` docblock was
        // written for — *"a shallow spread copies the same array reference into
        // every item ever created"* — one layer down, on the import path rather
        // than the create path. `EMPTY_ITEM_FIELDS` stores **factories** for
        // exactly this reason; a schema is a value, so the copy happens here.
        //
        // ⚠️ **Unconditional, and the `Array.isArray` version it replaced was
        // shape-specific with a justification about the wrong branch.** That
        // comment read "objects need no clone: the `defaultValue` branch above
        // recurses into `s()`, which allocates its own `result`" — true of the
        // `key in record` branch, and this is the `else`. Here the key is
        // *absent*, nothing recurses, and `defaults[key]` is written straight
        // through whatever its shape. Measured by a reviewer: a temporary object
        // field on the `work` schema gave two imported items the same instance,
        // and pushing into one showed in the other — the identical defect, and
        // invisible to the shared-instance guard by construction, since that walk filters on
        // `Array.isArray`.
        //
        // Cloning everything makes the next shape unexpressible rather than
        // merely absent; primitives clone for free.
        result[key] = structuredClone(fallback);
      }
    });
    return result;
  };

  /**
   * Keeps each entry's `_vId` and mints one only when it is missing or repeats an
   * earlier entry's — `hiddenIds` and AI targets address entries by it. Editors
   * pass ids through; minting here repairs foreign input, never an edit.
   */
  const sanitizeArray = <T extends HasVId>(
    data: unknown[] | undefined,
    schema: Record<string, unknown>,
    section: string,
    titleField?: string,
  ): T[] => {
    if (!data || !Array.isArray(data)) return [];

    const seen = new Set<string>();
    return data.map((item) => {
      const itemRecord =
        typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
      const existingVId = itemRecord._vId;
      const keep =
        typeof existingVId === 'string' &&
        existingVId !== '' &&
        existingVId !== schema._vId &&
        !seen.has(existingVId);

      const itemTitle = titleField ? (itemRecord[titleField] as string) : undefined;
      const sanitized = s(itemRecord, schema, section, itemTitle) as unknown as T;

      sanitized._vId = keep ? existingVId : generateId();
      seen.add(sanitized._vId);

      return sanitized;
    });
  };

  // Built per call, matching the lifetime the thirteen literals had. ⚠️ It is
  // not merely per call: `s()` returns `defaults` itself for a non-object input
  // and writes `defaults[key]` through for an absent key, so these objects are
  // reachable from the result. Hoisting them to module scope would make that
  // sharing outlive the import.
  const itemSchemas = Object.fromEntries(
    ALL_EMPTY_ITEM_KEYS.map((key) => [key, buildItemSchema(key)]),
  ) as Record<EmptyItemKey, Record<string, unknown>>;

  /**
   * User-defined sections. Entries reuse `s()` through `sanitizeArray`, so
   * dates, lists and strings get the same coercion and warnings as any section.
   * A missing or duplicate `id` is re-minted: the layout addresses a section by it.
   */
  const customItemSchema = { ...customSectionItemFields(), _vId: '', visible: true };
  const sanitizeCustomSections = (raw: unknown): CustomSection[] => {
    if (!Array.isArray(raw)) return [];
    const seen = new Set<string>();
    return raw
      .filter(
        (entry): entry is Record<string, unknown> =>
          !!entry && typeof entry === 'object' && !Array.isArray(entry),
      )
      .map((entry) => {
        const id =
          typeof entry.id === 'string' && entry.id.trim() && !seen.has(entry.id)
            ? entry.id
            : crypto.randomUUID();
        seen.add(id);
        const section: CustomSection = {
          id,
          title: asString(entry.title, ''),
          items: sanitizeArray<CustomSectionItem>(
            entry.items as unknown[],
            customItemSchema,
            'customSections',
            'name',
          ),
        };
        if (typeof entry.visible === 'boolean') section.visible = entry.visible;
        return section;
      });
  };

  const schemas = {
    basics: {
      name: '',
      label: '',
      image: '',
      email: '',
      phone: '',
      url: '',
      summary: '',
      location: { address: '', postalCode: '', city: '', countryCode: '', region: '' },
      // ⚠️ **`profiles` is deliberately absent, and removing it is a bug fix.**
      // The key was here as `[]` with a note saying only the key was
      // load-bearing, because `s()` whitelists `basics` by `Object.keys` and
      // `sanitizedProfiles` overwrites the value below regardless. The first
      // half was never true — the assembled `basics` literal writes `profiles:
      // sanitizedProfiles` explicitly, so `s()` copying the key contributes
      // nothing to the whitelist either.
      //
      // The value being discarded was not the whole story: the array
      // branch also *counts* what it drops, and `profiles` is the only array
      // default in this file whose elements are not strings. So every real
      // profiles array — `[{ network, username, url }]` — filtered to `[]` and
      // scored `lost = length`. The only thing suppressing the resulting
      // `invalid_list_value` warning was that the gate spelled its inventory
      // `ALL_SECTION_KEYS`, which excludes `basics`; collapsing the three
      // spellings onto `labelKeyForWarningSection` would have made "Personal
      // Details — profiles — invalid list value" appear on the import of any CV
      // with a profile. Measured by widening the gate alone.
    },
    meta: {
      version: '1.0.0',
      theme: {
        name: 'lunar',
        locale: 'en',
        params: THEME_PARAM_DEFAULTS,
      },
      export: {
        filenamePattern: '{name}',
        // ⚠️ Once missing, with the same consequence as the five missing
        // params: `setResume` re-filled it from `initialResumeState`, so the GitHub
        // Pages path a user typed in the export modal reverted to `/docs` on the
        // next list edit.
        hostingPath: '/docs',
      },
      content: {
        hiddenIds: [],
        hiddenSections: [],
        order: {
          oneColumn: [],
          twoColumn: {
            main: [],
            sidebar: [],
            sidebarPosition: 'left',
          },
        },
        pageBreaks: {
          oneColumn: [],
          twoColumn: {
            main: [],
            sidebar: [],
          },
        },
      },
    },
  };

  const basicsRaw = data.basics as Record<string, unknown> | undefined;

  /**
   * Trims the string fields of a `basics` block, **derived from the block
   * itself** rather than from a list of field names.
   *
   * ⚠️ **The rule is the BLOCK, not the field kind, and stating it by field kind
   * was wrong on exactly one field.** An earlier draft justified the scope as
   * "not `summary`, `highlight` or `description` — body text a user wrote". But
   * `basics.summary` *is* body text, written in `BasicsFormTextArea`, and it is
   * trimmed here and on the typed path both. The architect pass measured the
   * divergence: `basics.summary` trimmed, `work[0].summary`,
   * `work[0].highlights[0]` and `coverLetter.paragraphs[0]` not. So the honest
   * statement is the scope itself — **the identity and contact block:
   * `basics`'s own scalars and `basics.location`** — and the field-kind
   * argument is deleted rather than repaired, because it is what would be used
   * to justify the next carve-out.
   *
   * ⚠️ **And not `basics.profiles`**, despite "every string field of a `basics`
   * block", which this said until a reviewer checked. Profiles go through
   * `sanitizeArray`, so `network` / `username` / `url` are untrimmed —
   * and `profile.network?.toLowerCase()` in `JavaScriptHTML` is one of the reads
   * still left unhardened.
   *
   * The untrimmed-value defects this repo has actually shipped are all in that block, which is why the boundary is drawn there.
   *
   * ⚠️ And there is a seventh consumer the six do not include, measured rather than
   * reasoned: swiss-grid splits the name on `' '` and renders `parts[0]` as its
   * first line. `'  Ada Lovelace  '.split(' ')` is
   * `['', '', 'Ada', 'Lovelace', '', '']` — six parts, so the `length < 2`
   * single-line branch is *not* taken, and the name block renders an **empty
   * first line** above `' ADA LOVELACE  '`. Both outputs; the same code is in
   * `SwissGridHTML.tsx` and `SwissGridSerializer.ts`. A padded name is the only
   * input that reaches it, which is why trimming belongs at the boundary rather
   * than in a `renderName` guard.
   *
   * ⚠️ Runs **after** `s()`, so it only ever sees strings — the string branch
   * above guarantees that. A `value?.trim()` here would be the same shipped
   * regression a third time.
   *
   * ⚠️ It does not retire the consumer-side trims — but the reason once given here
   * is gone. It read "this function is not on the rehydration path,
   * so a padded value already in `localStorage` never passes through here";
   * `onRehydrateStorage` now runs this function, so a stored padded value does
   * reach this trim on the next load. What still argues for keeping the consumer
   * trims is that they answer the *read*, which is a different question from the
   * boundary — see the string branch.
   */
  const trimStrings = <T extends Record<string, unknown>>(block: T): T =>
    Object.fromEntries(
      Object.entries(block).map(([key, value]) => [
        key,
        typeof value === 'string' ? value.trim() : value,
      ]),
    ) as T;

  const sanitizedBasics = trimStrings(
    s(basicsRaw, schemas.basics, 'basics') as Record<string, unknown>,
  );
  // An imported photo is stored as given, metadata and all; strip it.
  if (typeof sanitizedBasics.image === 'string') {
    sanitizedBasics.image = stripImageMetadataCached(sanitizedBasics.image);
  }
  const sanitizedLocation = trimStrings(
    s(basicsRaw?.location, schemas.basics.location, 'basics') as ResumeData['basics']['location'] &
      Record<string, unknown>,
  ) as ResumeData['basics']['location'];
  const sanitizedProfiles = sanitizeArray<ResumeData['basics']['profiles'][number]>(
    basicsRaw?.profiles as unknown[],
    itemSchemas.profiles,
    'basics',
    'network',
  );

  const sanitized = {
    basics: {
      ...sanitizedBasics,
      location: sanitizedLocation,
      profiles: sanitizedProfiles,
    } as ResumeData['basics'],
    work: sanitizeArray<ResumeData['work'][number]>(
      data.work as unknown[],
      itemSchemas.work,
      'work',
      'name',
    ),
    volunteer: sanitizeArray<ResumeData['volunteer'][number]>(
      data.volunteer as unknown[],
      itemSchemas.volunteer,
      'volunteer',
      'organization',
    ),
    education: sanitizeArray<ResumeData['education'][number]>(
      data.education as unknown[],
      itemSchemas.education,
      'education',
      'institution',
    ),
    awards: sanitizeArray<ResumeData['awards'][number]>(
      data.awards as unknown[],
      itemSchemas.awards,
      'awards',
      'title',
    ),
    certificates: sanitizeArray<ResumeData['certificates'][number]>(
      data.certificates as unknown[],
      itemSchemas.certificates,
      'certificates',
      'name',
    ),
    publications: sanitizeArray<ResumeData['publications'][number]>(
      data.publications as unknown[],
      itemSchemas.publications,
      'publications',
      'name',
    ),
    skills: sanitizeArray<ResumeData['skills'][number]>(
      data.skills as unknown[],
      itemSchemas.skills,
      'skills',
      'name',
    ),
    languages: sanitizeArray<ResumeData['languages'][number]>(
      data.languages as unknown[],
      itemSchemas.languages,
      'languages',
      'language',
    ),
    interests: sanitizeArray<ResumeData['interests'][number]>(
      data.interests as unknown[],
      itemSchemas.interests,
      'interests',
      'name',
    ),
    references: sanitizeArray<ResumeData['references'][number]>(
      data.references as unknown[],
      itemSchemas.references,
      'references',
      'name',
    ),
    projects: sanitizeArray<ResumeData['projects'][number]>(
      data.projects as unknown[],
      itemSchemas.projects,
      'projects',
      'name',
    ),
    privateProjects: sanitizeArray<ResumeData['privateProjects'][number]>(
      data.privateProjects as unknown[],
      itemSchemas.privateProjects,
      'privateProjects',
      'name',
    ),
    coverLetter: sanitizeCoverLetter(data.coverLetter),
    customSections: sanitizeCustomSections(data.customSections),
    passthrough: collected.passthrough,
    meta: s(data.meta, schemas.meta, 'meta') as unknown as ResumeData['meta'],
  };

  // A hidden photo has one store, `basics:image` in `hiddenIds`. A file
  // from before that writes `basics.imageVisible: false`, which `s()` drops.
  if (basicsRaw?.imageVisible === false) {
    const hiddenIds = sanitized.meta.content.hiddenIds;
    if (isImageVisible(hiddenIds)) hiddenIds.push('basics:image');
  }

  // The params `s()` could not carry or could not narrow. Same shape as the
  // `basics.location` / `basics.profiles` / `coverLetter` overrides above.
  const rawMeta = data.meta as Record<string, unknown> | undefined;
  const rawParams = (rawMeta?.theme as Record<string, unknown> | undefined)?.params;
  sanitized.meta.theme.params = sanitizeThemeParams(
    sanitized.meta.theme.params,
    rawParams,
    rawMeta,
  );

  // Strict Layout Order Filtering
  // This removes stale/invalid keys (like 'profiles') before they reach the store
  if (sanitized.meta?.content?.order) {
    // Built-in keys plus the tokens of the custom sections this resume has.
    const validKeys = new Set<string>(allLayoutSectionIds(sanitized));
    const order = sanitized.meta.content.order;

    if (Array.isArray(order.oneColumn)) {
      order.oneColumn = order.oneColumn.filter((k) => validKeys.has(k));
    }
    if (order.twoColumn) {
      if (Array.isArray(order.twoColumn.main)) {
        order.twoColumn.main = order.twoColumn.main.filter((k) => validKeys.has(k));
      }
      if (Array.isArray(order.twoColumn.sidebar)) {
        order.twoColumn.sidebar = order.twoColumn.sidebar.filter((k) => validKeys.has(k));
      }
    }
  }

  return { sanitized, warnings };
};
