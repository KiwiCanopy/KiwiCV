const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const LOCALES = [
  'en',
  'bg',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'nl',
  'pl',
  'pt',
  'ru',
  'sv',
  'tr',
  'uk',
  'zh',
];
const NON_ENGLISH_LOCALES = LOCALES.filter((locale) => locale !== 'en');
const TRANSLATOR_DIR = path.join(ROOT_DIR, '.agent/temp_instructions/translation-handoff');

/**
 * The template heads a `t()` call may compose keys under, because
 * `check-usage.cjs` cannot resolve them statically. `check-usage.cjs:96` reads
 * this list in one direction only — an *unregistered* head is an error — so a
 * registration goes stale silently, and ten of the twenty-five entries here were
 * blessing nothing when last measured.
 *
 * `tests/i18n/dynamic-prefixes.test.cjs` closes the other direction: every entry
 * must be produced by a real call site *and* name a live English namespace.
 * Removed:
 *
 *   landing.sections.solution.                  no keys, no call site
 *   landing.sections.comparison.table.rows.     no keys, no call site
 *   landing.sections.template_showcase.themes.  no keys, no call site
 *   themes.sections.                            no keys, no call site
 *   common.date.                                keys, no call site
 *   common.pages.                               keys, no call site
 *   monetization.passes.                        keys, no call site
 *   placeholders.                               keys, no call site
 *   theme_translations.                         keys, no call site
 *
 * The first four were leftovers of the landing redesign that deleted the
 * components *and* their keys (`themes.sections.` was superseded by
 * `theme_translations.sections.`). The other six name namespaces that are alive
 * and reached some other way — `common.pages.` only ever statically, the two
 * `monetization.*` through `PricingPlanCard`'s allowlisted `${translationPath}.…`
 * composition (whose head is empty, so no prefix can ever be produced for it),
 * and `theme_translations.*` by direct property access on the imported bundle,
 * never as a `t()` key at all. A registration for a head nobody writes permits
 * nothing and hides the fact that nothing is permitted.
 *
 * ⚠️ `common.date.` is the one whose deletion needs a better reason than "no
 * call site", and the difference matters for the next namespace.
 * `useDatePicker.ts:151` composes `common.date.granularity.${granularity}` under
 * a genuine translator **alias** (`translate`, which forwards to `t`), which the
 * walk cannot see because the callee is not in `TRANSLATORS` — so
 * `dynamicPrefixCallSites` finds no site for it and the guard reads the
 * registration as dead. What makes deleting it safe is that all three keys under
 * it (`day`, `month`, `year`) are *also* referenced as static literals at
 * `useDatePicker.ts:173-175`, so removing the registration orphans nothing. A
 * future `translate(`newspace.${x}`)` with no such static backstop would read as
 * dead the same way, the guard would demand its deletion, and its keys would be
 * reachable only through a call nothing validates. Register the alias in
 * `TRANSLATORS` before relying on the guard for one.
 *
 * ⚠️ The comparison is exact equality against a template head, not a
 * `startsWith`: `check-usage.cjs` is the only place that resolves a key against
 * this list, and it reads it that way (`dynamic-prefixes.test.cjs` reads the
 * list too, but to assert its shape, not to resolve keys).
 * `dynamic-prefixes.test.cjs`'s fixture pins this with a head that
 * *narrows* a registered one (`seo.brand_new.`), which errors under exact
 * equality and would be silently blessed by a `.some(startsWith)` widening — a
 * bogus head far from every entry errors under either, so it proves nothing.
 *
 * ⚠️ **The list is now a cache of a derivable set, and it is kept on purpose.**
 * `tests/i18n/dynamic-prefixes.test.cjs` asserts it equal to
 * `[...dynamicPrefixCallSites().keys()]` in both directions, so it carries no
 * information the source does not. What it carries instead is a *human
 * checkpoint* — a new dynamic key namespace cannot appear without a line in this
 * file for a reviewer to question. Computing it would be the obvious
 * simplification and would silently delete that checkpoint.
 */
const DYNAMIC_PREFIXES = [
  'blog.categories.',
  'changelog.entries.',
  'changelog.types.',
  'editor.modules.languages.levels.',
  'editor.modules.skills.levels.',
  'editor.sections.',
  'examples.',
  'landing.pricing.free.',
  'landing.pricing.pass.',
  'landing.proof.',
  'landing.workflow.',
  'languages.',
  'legal.',
  'roadmap.items.',
  'seo.',
  'sync.providers.',
  'themes.names.',
];

const DYNAMIC_CALL_ALLOWLIST = [
  // ⚠️ `sectionLabelKey(id)` — the rail's own `Record<RailSectionKey, string>`,
  // read rather than composed. Both call sites templated `editor.sections.${id}`
  // until 2026-09-04, and that prefix is wrong for three of the fifteen rows:
  // `basics`, `profiles` and `coverLetter` live elsewhere in the bundle. Because
  // `t()` returns the path for a key it cannot find, the AI modal shipped a title
  // reading literally "Optimize editor.sections.coverLetter" in all 15 locales.
  //
  // Registered as two call sites rather than a `DYNAMIC_PREFIXES` entry because
  // the lookup lives inside the helper and the helper IS the point.
  //
  // ⚠️ This registration does NOT bind the callers. `editor.sections.` is already
  // a prefix (above, for `labelKeyForWarningSection`), so reverting either site
  // to `t(`editor.sections.${id}`)` still passes `check-usage.cjs`. Only review
  // holds them on the helper. What holds the KEYS is
  // `rail/__tests__/sectionLabelKey.test.ts`, which resolves every rail row's key
  // against the real `en` bundle; a registration only silences the checker.
  { file: 'src/components/modals/ai/edit/AIEditHeader.tsx', expression: 'labelKey' },
  { file: 'src/components/ui/section/SectionHeaderActions.tsx', expression: 'labelKey' },
  { file: 'src/components/editor/LanguageForm/LanguageFormField.tsx', expression: 'level.label' },
  { file: 'src/components/editor/SkillsForm/SkillsFormField.tsx', expression: 'level.label' },
  { file: 'src/components/modals/GlobalImportWarningsModal.tsx', expression: 'warning.message' },
  { file: 'src/components/modals/ImportWarningsModal.tsx', expression: 'warning.message' },
  // ⚠️ `editor.sections.<key>` or `editor.supersections.basics.title`, composed
  // by `labelKeyForWarningSection`. Registered as two call sites rather
  // than as a `DYNAMIC_PREFIXES` entry for the same reason as `paletteNameKey`
  // below — the prefix lives inside the helper, and the helper is the point: the
  // two modals used to compose the key themselves, with different rules, so a
  // `basics` warning rendered "Personal Details" in one and the literal string
  // `editor.sections.basics` in the other. What actually holds the property is
  // `importWarningLabels.test.ts`, which resolves every key the helper can
  // return against the real `en` bundle — a registration only silences the
  // checker.
  { file: 'src/components/modals/GlobalImportWarningsModal.tsx', expression: 'labelKey' },
  { file: 'src/components/modals/ImportWarningsModal.tsx', expression: 'labelKey' },
  { file: 'src/components/ui/date-picker/useDatePicker.ts', expression: 'key' },
  // ⚠️ The editor rail's row and group labels. `RAIL_LABEL_KEYS` is
  // `Record<RailSectionKey, string>`, so the *inventory* is a build error when it
  // drifts — but a `Record` cannot say that a value names anything, and `t()`
  // renders the path for a key it cannot find. What holds that half is
  // `rail/__tests__/railInventory.test.ts`, which resolves all fifteen row labels
  // and every group heading against the real `en` bundle, exactly as
  // `importWarningLabels.test.ts` does above. These five entries only silence the
  // checker.
  {
    file: 'src/features/dashboard/editor/EditorSectionPanel.tsx',
    expression: 'RAIL_LABEL_KEYS.coverLetter',
  },
  {
    file: 'src/features/dashboard/editor/phone/PhoneGroupRow.tsx',
    expression: 'RAIL_LABEL_KEYS[sectionKey]',
  },
  {
    file: 'src/features/dashboard/editor/phone/PhoneSectionList.tsx',
    expression: 'group.labelKey',
  },
  { file: 'src/features/dashboard/editor/rail/SectionRail.tsx', expression: 'group.labelKey' },
  {
    file: 'src/features/dashboard/editor/rail/SectionRailRow.tsx',
    expression: 'RAIL_LABEL_KEYS[sectionKey]',
  },
  // ⚠️ Same shape, same backstop. `COMPOSER_MODE_LABEL_KEYS` is
  // `Record<ComposerMode, string>`, so a fourth mode with no label is TS2741;
  // `composer/__tests__/costChip.test.tsx` is what proves the three values
  // resolve against the real `en` bundle.
  {
    file: 'src/features/dashboard/editor/composer/AIComposerBar.tsx',
    expression: 'COMPOSER_MODE_LABEL_KEYS[mode]',
  },
  // ⚠️ The cover-letter tone and length options. Both maps are `Record`s
  // over their own union, so a fifth tone or a fourth preset with no label is
  // TS2741 — and the tone union is itself pinned to the backend prompt's table
  // by `constants/__tests__/coverLetterTones.test.ts`. What no type can say is
  // that a label key NAMES something: `t()` renders the path for a key it cannot
  // find, so a plausible wrong key ships a select reading
  // `ai.cover_letter_tone_warm` in all fifteen locales.
  // `__tests__/coverLetterControlLabels.test.ts` resolves all seven against the
  // real `en` bundle; these two entries only silence the checker.
  {
    file: 'src/components/modals/ai/template/AICoverLetterControl.tsx',
    expression: 'LENGTH_LABEL_KEYS[preset]',
  },
  {
    file: 'src/components/modals/ai/template/AICoverLetterControl.tsx',
    expression: 'TONE_OPTION_LABEL_KEYS[option]',
  },
  // ⚠️ `Record<DiffMark['mark'], string>`, so a fourth mark with no name is
  // TS2741. `entryDiffPanel.test.tsx` renders all three and asserts the words
  // appear — the glyphs +, − and · are decoration, so this IS the accessible
  // name and a broken key would leave the mark unannounced rather than visibly
  // wrong.
  {
    file: 'src/features/dashboard/editor/proposals/EntryDiffRow.tsx',
    expression: 'MARK_LABEL_KEY[mark.mark]',
  },
  { file: 'src/features/dashboard/design/DesignTab.tsx', expression: 'a.nameKey' },
  { file: 'src/features/dashboard/design/DesignTab.tsx', expression: 'b.nameKey' },
  {
    file: 'src/features/dashboard/design/DesignTab.tsx',
    expression: 'activeSelectedTheme.nameKey',
  },
  // ⚠️ `themes.palettes.<themeId>.<paletteId>`, composed by `paletteNameKey`.
  // Registered as call sites rather than as a `DYNAMIC_PREFIXES` entry
  // because the prefix is inside the helper, not at the call — and the helper is
  // the point: a palette used to carry an English display string pretending to
  // be a key. What actually holds the property is stronger than either
  // registration: `locales/en/themes.ts`'s `palettes` table `satisfies
  // { [K in ThemeId]: Record<ThemePaletteIds[K], string> }`, so all forty names
  // are a build error to omit, and `paletteResolution.test.tsx` resolves every
  // one of them through this very helper.
  {
    file: 'src/features/dashboard/design/DesignTab.tsx',
    expression: 'paletteNameKey(activeSelectedTheme.id, paletteSummary.id)',
  },
  {
    file: 'src/features/dashboard/design/helpers/ColorPicker.tsx',
    expression: 'paletteNameKey(themeId, p.id)',
  },
  { file: 'src/features/dashboard/design/helpers/ThemeCard.tsx', expression: 'theme.nameKey' },
  { file: 'src/features/extras/ExtrasTabNavigation.tsx', expression: 'tab.labelKey' },
  { file: 'src/layouts/sidebar/SidebarContent.tsx', expression: 'item.label' },
  // The one shared pricing card, rendered by both the dialog and the landing
  // section. The card key is composed from catalog data, so these calls
  // cannot be static.
  {
    file: 'src/components/monetization/pricing/PricingPlanCard.tsx',
    expression: '`${translationPath}.title`',
  },
  {
    file: 'src/components/monetization/pricing/PricingPlanCard.tsx',
    expression: '`${translationPath}.description`',
  },
];

module.exports = {
  DYNAMIC_CALL_ALLOWLIST,
  DYNAMIC_PREFIXES,
  LOCALES,
  NON_ENGLISH_LOCALES,
  ROOT_DIR,
  TRANSLATOR_DIR,
};
