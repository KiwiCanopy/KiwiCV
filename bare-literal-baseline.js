/**
 * User-visible English strings that deliberately do not go through `t()`,
 * frozen on 2026-07-22 so `scripts/find-bare-literals.cjs` can fail the suite
 * on anything new.
 *
 * This list only shrinks. `tests/lint/bare-literals.test.mjs` fails on a stale
 * entry as well as on an unlisted finding, so an exemption cannot outlive the
 * literal it covers.
 *
 * Matched on file and exact string, not line number: a literal that moves
 * within its file is the same decision, and pinning lines would turn every
 * unrelated edit into a baseline update.
 *
 * **Adding an entry is a decision, not a formality.** The default is to route
 * the string through `src/locales/`. An entry here has to say why that would be
 * wrong.
 */
/**
 * Section-heading fallbacks in the HTML themes: `title={labels.awards || 'Awards'}`.
 * `labels` comes from `getSectionLabels`, which already resolves every key from
 * the CV's `theme_translations` over `DEFAULT_SECTION_LABELS`, so the literal is
 * an English restatement of that default and prints only when a user override is
 * the empty string. Frozen per file and string rather than exempted by directory,
 * so a new theme repeating the pattern is a fresh decision.
 */
const headingFallbacks = (dir, headings) =>
  headings.map((heading) => ({
    file: `src/components/preview/themes/${dir}/${heading === 'Work Experience' ? 'Work' : heading}.tsx`,
    value: heading,
    reason:
      'English fallback for a section label already resolved from cvLocale; prints only for an empty override (cvLanguage domain)',
  }));

const ALL_HEADINGS = [
  'Awards',
  'Certificates',
  'Education',
  'Interests',
  'Languages',
  'Projects',
  'Publications',
  'References',
  'Skills',
  'Volunteer',
  'Work Experience',
];

export const bareLiteralBaseline = [
  // --- Generated CV output, not product chrome -----------------------------
  //
  // These render into the user's exported CV, whose language is `cvLanguage`
  // and is chosen separately from the UI locale. Routing them through `t()`
  // would print the *interface* language into the document — a German CV with
  // English section labels is the bug, not the fix. Localising them properly
  // means the `theme_translations` layer in `src/locales/*/`, which is a
  // scoping decision the owner has not taken.
  //
  // They are still English in a non-English CV, which is a real defect. It is
  // tracked separately from the product-chrome i18n work.
  {
    file: 'src/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Education.tsx',
    value: 'Institution',
    reason: 'CV output placeholder for an empty institution field (cvLanguage domain)',
  },
  {
    file: 'src/components/preview/themes/oneColumn/javascript/helpers/HTML/main/Work.tsx',
    value: 'Company',
    reason: 'CV output placeholder for an empty company field (cvLanguage domain)',
  },
  ...headingFallbacks('oneColumn/javascript/helpers/HTML/main', ALL_HEADINGS),
  ...headingFallbacks('oneColumn/timeless/helpers/HTML/main', ALL_HEADINGS),
  // The soft main Languages header already falls back to '', not English.
  ...headingFallbacks(
    'twoColumn/soft/helpers/HTML/main',
    ALL_HEADINGS.filter((heading) => heading !== 'Languages'),
  ),
  ...headingFallbacks('twoColumn/soft/helpers/HTML/side', ALL_HEADINGS),
  {
    file: 'src/utils/validation.ts',
    value: 'Unnamed Skill',
    reason:
      'Written into the resume data as the name of a nameless skill on import, so it prints on the CV (cvLanguage domain)',
  },
  {
    file: 'src/components/preview/themes/oneColumn/javascript/JavaScriptHTML.tsx',
    value: 'Ln 42, Col 21',
    reason: 'Decorative chrome of the code-editor template, alongside UTF-8 and JavaScript',
  },
  {
    file: 'src/components/preview/themes/oneColumn/javascript/JavaScriptHTML.tsx',
    value: 'Ready to interview',
    reason: 'Status-bar text in the code-editor template; printed on the CV, cvLanguage domain',
  },

  // --- Reproductions of another product's interface ------------------------
  {
    file: 'src/features/extras/tabs/how-to/components/GithubSection.tsx',
    value: 'Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained tokens',
    reason:
      "Reproduces GitHub's own settings path; translating it would send users somewhere that does not exist",
  },
];
