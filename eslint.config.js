import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import {
  controlEdgeIsFrameNotAffordance,
  directClsxAndRawRadixDialog,
  directClsxOnly,
  legacyControlClasses,
  rawRadixDialogOnly,
} from './eslint-legacy-baseline.js';

// Deprecated lucide-react aliases that still resolve. The canonical names are
// CircleAlert, TriangleAlert, CircleCheck, CircleQuestionMark, LoaderCircle,
// and CircleX. CircleHelp is listed because lucide re-exports it as an alias of
// CircleQuestionMark, so migrating onto it only defers the rename.
const DEPRECATED_LUCIDE_ALIASES = [
  'AlertCircle',
  'AlertTriangle',
  'CheckCircle2',
  'CircleHelp',
  'HelpCircle',
  'Loader2',
  'XCircle',
];

const CLSX_GUARD = {
  name: 'clsx',
  message: 'Import cn from @/utils/cn instead — it applies tailwind-merge on top of clsx.',
};

const RADIX_DIALOG_GUARD = [
  {
    name: '@radix-ui/react-dialog',
    message:
      'Compose DialogFrame from @/components/ui/DialogFrame instead of building a dialog shell by hand. It owns Dialog.Root and re-exports DialogClose.',
  },
  {
    name: '@radix-ui/react-alert-dialog',
    message:
      "Compose DialogFrame with role='alertdialog' from @/components/ui/DialogFrame instead of building an alert dialog by hand. It owns AlertDialog.Root.",
  },
];

const LUCIDE_GUARD = [
  {
    name: 'lucide-react',
    importNames: DEPRECATED_LUCIDE_ALIASES,
    message:
      'Use the canonical lucide name (CircleAlert, TriangleAlert, CircleCheck, CircleQuestionMark, LoaderCircle, CircleX).',
  },
  // Not a deprecated alias — a semantic ban. The app used Wand2 and FilePenLine
  // interchangeably for "AI", so changelog copy saying "look for this icon"
  // pointed at a symbol the editor never showed. `Sparkles` is now the one AI
  // symbol; the wand stays banned so it cannot come back as a second one.
  //
  // ⚠️ `WandSparkles` must be named explicitly: it IS `Wand2`, renamed upstream,
  // and `importNames` matches a spelling rather than a module export identity.
  {
    name: 'lucide-react',
    importNames: ['Wand2', 'WandSparkles'],
    message:
      'Use Sparkles for AI, matching AISuggestButton, the AI composer and the AI modal headers. A wand is not a second AI icon. For a bonus badge use Gift.',
  },
];

const restrictedImports = (...guards) => ({
  'no-restricted-imports': ['error', { paths: guards.flat() }],
});

/**
 * Theme rendering must be a pure function of the résumé it is handed.
 *
 * ⚠️ `paths` matches an import specifier **exactly**; only `patterns` can ban a
 * subtree or a relative spelling. That gap is why
 * `preview/__tests__/themeStoreIsolation.test.ts` had to hand-roll a scan, and
 * why the first version of that scan was defeated by
 * `'../../../../../store/resume/useResumeStore'` — AGENTS.md §7 bans relative
 * paths in prose, and nothing enforced it. This is the enforcement; the test is
 * the backstop that also follows one hop through a helper.
 *
 * `useTranslation` is listed because it subscribes to the résumé store and hands
 * back a `cvLocale` whose `addressSchema` is always `default` — importing it into
 * a theme reintroduces the store leak and the stuck `default` schema at once.
 * No theme file uses it.
 */
const THEME_PURITY_PATTERNS = [
  {
    group: ['@/store/*', '@/store/**', '**/store/resume/*', '@/hooks/useTranslation'],
    message:
      'Theme components and serializers must render only the résumé passed to them. Read settings off the `data` argument, or off the `cvLocale` from getBoundFormatters/useBoundFormatters. See preview/__tests__/themeStoreIsolation.test.ts.',
  },
];

// Flat config rejects a block with an empty `files`, so an emptied baseline
// list drops its block instead of failing the run. Emptying a list is the goal
// state for every guard, not an error.
const baselineExemption = (files, rules) => (files.length > 0 ? [{ files, rules }] : []);

// Selectors shared by the main config and by the control-edge baseline below.
// Hoisted because `no-restricted-syntax` is all-or-nothing per config block:
// exempting one selector for a file means re-declaring the rule WITHOUT it, and
// the old `baselineExemption(..., 'off')` shape would have taken the --primary
// guard down with it on 17 files.
const RESTRICTED_SYNTAX = [
  {
    selector: 'Literal[value=/btn-3d\\b|badge-primary-3d/]',
    message:
      'src/styles/legacy-controls.css is being removed — use the Button, IconButton, or token-based surfaces instead.',
  },
  {
    selector: 'TemplateElement[value.raw=/btn-3d\\b|badge-primary-3d/]',
    message:
      'src/styles/legacy-controls.css is being removed — use the Button, IconButton, or token-based surfaces instead.',
  },
  // ⚠️ `--primary` is the FILL only. Anything drawn rather than painted —
  // text, borders, rings, strokes — takes `--primary-strong`, which is the
  // darker sibling that clears 4.5:1 as text on all three light surfaces.
  // The fill cannot: it is 2.92:1 on `--background` and 2.76:1 on
  // `--secondary`. Without this guard the two roles quietly re-merge one
  // call site at a time and the fill can never be bright again.
  {
    selector:
      'Literal[value=/\\b(text|border|ring|stroke|fill|decoration|shadow|outline|divide|caret|from|to|via)(-(t|r|b|l|x|y|s|e|offset))?-primary(\\/[0-9]+)?(?![\\w-])/]',
    message:
      'Use -primary-strong for anything drawn (text, border, ring, stroke, gradient stops). --primary is the fill: bg-* and accent-* only.',
  },
  {
    selector:
      'TemplateElement[value.raw=/\\b(text|border|ring|stroke|fill|decoration|shadow|outline|divide|caret|from|to|via)(-(t|r|b|l|x|y|s|e|offset))?-primary(\\/[0-9]+)?(?![\\w-])/]',
    message:
      'Use -primary-strong for anything drawn (text, border, ring, stroke, gradient stops). --primary is the fill: bg-* and accent-* only.',
  },
];

// ⚠️ Errors on new code; `controlEdgeOnDecorativeToken` freezes what already
// exists. That list only shrinks.
const CONTROL_EDGE_SYNTAX = [
  // ⚠️ `--input` is the control edge, `--border` the decorative divider.
  // This fires only when the element that IS the control states
  // `border-border` itself — a `button`, or anything carrying `onClick`.
  //
  // That narrowness is deliberate and was measured, not guessed. An audit
  // listed three offenders; two turned out to be misfiled. `ThemeCard`
  // puts its border on a preview frame INSIDE the button, and
  // `EmptySectionCard`'s dashed edge wraps a non-interactive card whose
  // real control is an inner button on `border-current/15`. A grep-based
  // sweep would have "fixed" both non-problems. A rule that cannot see a
  // nested frame is the correct trade: it never fires wrongly, and the
  // cases it cannot decide stay a human judgement instead of becoming a
  // disabled comment.
  {
    // One selector, not two: a `<button onClick>` satisfies both halves and
    // would otherwise report the same node twice.
    // `:not(:has(... border-input ...))` is what keeps this honest. A
    // className naming BOTH tokens is a deliberate conditional — that is
    // exactly `OptionCard`'s `isButton ? 'border-input' : 'border-border'`
    // — and flagging it would have forced a disable comment onto the one
    // component that gets this right.
    selector:
      "JSXOpeningElement:matches([name.name='button'], :has(JSXAttribute[name.name='onClick'])):not(:has(JSXAttribute[name.name='className'] Literal[value=/(^|\\s)border-input(\\/[0-9]+)?(?![\\w-])/])) > JSXAttribute[name.name='className'] Literal[value=/(^|\\s)border-border(\\/[0-9]+)?(?![\\w-])/]",
    message:
      "This element is the control, so its edge is --input, not --border. `border-border` is the decorative divider: 1.35:1 in light and 1.89:1 in dark against --card, both under 1.4.11's 3:1. Use `border-input`.",
  },
  {
    // One selector, not two: a `<button onClick>` satisfies both halves and
    // would otherwise report the same node twice.
    // `:not(:has(... border-input ...))` is what keeps this honest. A
    // className naming BOTH tokens is a deliberate conditional — that is
    // exactly `OptionCard`'s `isButton ? 'border-input' : 'border-border'`
    // — and flagging it would have forced a disable comment onto the one
    // component that gets this right.
    selector:
      "JSXOpeningElement:matches([name.name='button'], :has(JSXAttribute[name.name='onClick'])):not(:has(JSXAttribute[name.name='className'] TemplateElement[value.raw=/(^|\\s)border-input(\\/[0-9]+)?(?![\\w-])/])) > JSXAttribute[name.name='className'] TemplateElement[value.raw=/(^|\\s)border-border(\\/[0-9]+)?(?![\\w-])/]",
    message:
      "This element is the control, so its edge is --input, not --border. `border-border` is the decorative divider: 1.35:1 in light and 1.89:1 in dark against --card, both under 1.4.11's 3:1. Use `border-input`.",
  },
];

export default tseslint.config(
  // `.claude/worktrees` holds throwaway checkouts of this same repository, so
  // linting it means linting a second copy of every source file — and a
  // worktree that outlives its session breaks `npm run lint` outright: two
  // candidate tsconfig roots, and typed linting refuses to guess.
  // ⚠️ `.netlify` holds `netlify dev`'s bundled function output — vendored
  // dependencies, not source. It is gitignored but present on any machine that
  // has run the `kiwicv-netlify` launch config, and `npm run release` lints
  // with `--max-warnings=0`, so a warning inside a vendored bundle blocked the
  // release outright. Using the documented dev server must not make the repo
  // unreleasable.
  { ignores: ['dist', '.agent', '.claude/worktrees', '.netlify'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      ...restrictedImports(CLSX_GUARD, RADIX_DIALOG_GUARD, LUCIDE_GUARD),
      'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX, ...CONTROL_EDGE_SYNTAX],
    },
  },
  // Permanent exemptions: these files own the sanctioned wrapper the guard
  // points everyone else at.
  {
    files: ['src/utils/cn.ts'],
    rules: restrictedImports(RADIX_DIALOG_GUARD, LUCIDE_GUARD),
  },
  // DialogFrame owns the centred modal shell; Sheet owns the edge-anchored
  // drawer. Both compose Radix dialog directly so nothing else has to.
  {
    files: ['src/components/ui/DialogFrame.tsx', 'src/components/ui/Sheet.tsx'],
    rules: restrictedImports(CLSX_GUARD, LUCIDE_GUARD),
  },
  // Frozen pre-existing violations. Each list only shrinks; see
  // eslint-legacy-baseline.js. The deprecated-lucide guard has no baseline and
  // stays on everywhere else.
  ...baselineExemption(legacyControlClasses, { 'no-restricted-syntax': 'off' }),
  ...baselineExemption(directClsxOnly, restrictedImports(RADIX_DIALOG_GUARD, LUCIDE_GUARD)),
  ...baselineExemption(rawRadixDialogOnly, restrictedImports(CLSX_GUARD, LUCIDE_GUARD)),
  ...baselineExemption(directClsxAndRawRadixDialog, restrictedImports(LUCIDE_GUARD)),
  // Re-declares the rule WITHOUT the control-edge selector, so these files keep
  // every other guard. A permanent exemption, not a baseline — see
  // controlEdgeIsFrameNotAffordance for why each entry is correct as it stands.
  ...baselineExemption(controlEdgeIsFrameNotAffordance, {
    'no-restricted-syntax': ['error', ...RESTRICTED_SYNTAX],
  }),
  // Theme rendering must not reach global state — see THEME_PURITY_PATTERNS.
  // Repeats the three `paths` guards because a later `no-restricted-imports`
  // replaces the earlier one wholesale rather than merging with it.
  {
    files: ['src/components/preview/themes/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [CLSX_GUARD, RADIX_DIALOG_GUARD, LUCIDE_GUARD].flat(),
          patterns: THEME_PURITY_PATTERNS,
        },
      ],
    },
  },
  // Theme files, editor forms, and store use dynamic JSON Resume data — `any` is appropriate here
  {
    files: ['to_implement/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      // Theme components use closure variables (palette, fonts) making extraction impractical
      'react-hooks/static-components': 'off',
    },
  },
);
