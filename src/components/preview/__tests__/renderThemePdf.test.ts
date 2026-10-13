import { paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, resolveThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import { COVER_LETTER_MAX_WORDS } from '@/constants/ai';
import { PLACEHOLDER_LETTER_EN, buildLetterResume } from '@/test/coverLetterProse';
import { buildPlaceholderResume } from '@/test/placeholderResume';
import { buildRealExportResume } from '@/test/realExportResume';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { REPO_ROOT } from '@/test/sourceFiles';
import { compileToPdf, initTypstCompiler, mapIcons, mapProfileImage } from '@/test/typstCompile';
import type { ResumeData } from '@/types/resume';
import { coverLetterWordTarget } from '@/utils/coverLetterLength';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Writes one theme's PDF to `scratch/` so a human can open it.
 *
 * This is the *inspection* half of the Typst verification story, and the only
 * thing the deleted `scripts/test-typst-compile.ts` did that the compile smoke
 * test does not — see `wiki/code/PDF_ENGINE_TYPST.md` for why that
 * script went.
 *
 * A test file rather than a `scripts/` entry point because vitest supplies the
 * two things a standalone runner would need a new dependency for: `@/`
 * resolution and `__APP_VERSION__` (`vite.config.ts`). It also supplies the
 * dummy `VITE_SUPABASE_*` values — this file's import graph still reaches
 * `src/lib/supabase.ts` through the store, exactly as the old script's did, so
 * "no `.env` needed" is a property of `vite.config.ts:27-30`, not of the
 * import graph.
 *
 * It costs `npm test` nothing: with no `RENDER_THEME` in the environment the
 * block is skipped.
 *
 * ```bash
 * RENDER_THEME=elegant npm run pdf:render
 * RENDER_THEME=lunar RENDER_FIXTURE=placeholder npm run pdf:render
 * RENDER_THEME=soft RENDER_FIXTURE=real npm run pdf:render
 * ```
 *
 * There is no theme inventory here: `SERIALIZERS` is `Record<ThemeId, …>`, so
 * an unknown id fails against the real list rather than falling into an `else`.
 */

const theme = process.env.RENDER_THEME;
const fixture = process.env.RENDER_FIXTURE ?? 'single';

/**
 * `single` is the suite's own fixture — exactly one of every array-bearing
 * field, the arity that reaches the one-element-tuple crashes. `placeholder` is
 * a new user's first export. `real` is the newest `examples/` snapshot, which
 * is the only one with realistic *density*: the other two are
 * single-entry where it counts, so neither ever shows a theme two work entries
 * back to back, and inter-entry spacing, date-column alignment down a run of
 * rows and a section header straddling a page break are invisible in both.
 *
 * ⚠️ **`real` is not a superset — reach for the right one.** It inherits the
 * snapshot's gaps (today: no `privateProjects`), and it is the *wrong* fixture
 * for the one-element-tuple crashes `single` exists to reach, because a section
 * with two entries no longer produces the one-element Typst tuple that breaks.
 * Both `placeholder` and `real` carry a profile image; `single` does not.
 */
const FIXTURES: Record<string, (themeId: string) => ResumeData> = {
  single: buildSingleItemResume,
  placeholder: buildPlaceholderResume,
  real: buildRealExportResume,
  // The two cover-letter shapes, for looking at the letter page rather than the
  // résumé: `letter-long` fills the letter page, `letter-classic` selects the
  // DIN 5008 branch. Everything else about them is the `single` fixture.
  'letter-long': (themeId) => buildSingleItemResume(themeId, { longLetter: true }),
  'letter-classic': (themeId) => buildSingleItemResume(themeId, { classicLetter: true }),
  // The placeholder résumé with a matching DIN 5008 cover letter — the pair the
  // KiwiCanopy print flyers show. Honours `RENDER_LOCALE` like `placeholder`.
  'placeholder-letter': (themeId) => buildPlaceholderLetterResume(themeId),
  // The `long` length preset and the user-range cap, in real prose, for
  // looking at what the calibrated figures actually fill. Both honour
  // `RENDER_LETTER=classic`.
  'letter-preset': (themeId) => {
    const classicLayout = process.env.RENDER_LETTER === 'classic';
    // `both`: `buildLetterResume` shows both address blocks, so this fixture
    // renders the tightest page the table knows.
    const words = coverLetterWordTarget('long', resolveThemeId(themeId), classicLayout, 1, 'both');
    return buildLetterResume(themeId, { words, classicLayout });
  },
  'letter-max': (themeId) =>
    buildLetterResume(themeId, {
      words: COVER_LETTER_MAX_WORDS,
      classicLayout: process.env.RENDER_LETTER === 'classic',
    }),
};

function buildPlaceholderLetterResume(themeId: string): ResumeData {
  const data = buildPlaceholderResume(themeId);
  const de = data.meta.theme.locale === 'de';
  data.coverLetter = {
    ...data.coverLetter,
    enabled: true,
    recipient: de
      ? {
          name: 'Frau Erika Muster',
          company: 'Muster GmbH',
          address: 'Beispielstraße 1, 10115 Berlin',
        }
      : {
          name: 'Ms Erika Muster',
          company: 'Muster GmbH',
          address: '1 Example Street, 10115 Berlin',
        },
    subject: de
      ? 'Bewerbung als Senior Softwareentwickler'
      : 'Application as Senior Software Engineer',
    date: '2026-09-12',
    paragraphs: de
      ? [
          'Sehr geehrte Frau Muster,',
          'mit großem Interesse habe ich Ihre Stellenausschreibung für die Position als Senior Softwareentwickler gelesen. Die Muster GmbH begleitet mittelständische Unternehmen seit über zwanzig Jahren bei der Digitalisierung ihrer Kernprozesse, und genau diese Verbindung aus technischem Anspruch und greifbarem Nutzen für Ihre Kunden ist der Grund, warum ich mich bei Ihnen bewerbe.',
          'In den vergangenen acht Jahren habe ich skalierbare Webanwendungen und verteilte Systeme entwickelt, zuletzt als Senior Softwareentwickler bei Google in München. Dort habe ich die Migration eines Legacy-Monolithen zu einer Microservices-Architektur geleitet und einen globalen Suchindizierungsdienst mitentworfen, der täglich über eine Milliarde Abfragen verarbeitet. Dabei habe ich gelernt, dass gute Software vor allem aus klaren Schnittstellen, ehrlichen Tests und einem Team entsteht, das sich gegenseitig den Rücken freihält.',
          'Was mich an Ihrer Ausschreibung besonders anspricht, ist die Verantwortung für den gesamten Lebenszyklus einer Anwendung: von der Anforderungsaufnahme mit Ihren Kunden über die Architektur bis zum Betrieb in der Cloud. Mit TypeScript, React, Node.js, Docker und Kubernetes bringe ich den Werkzeugkasten mit, den Sie in der Ausschreibung nennen, und mit der Leitung eines siebenköpfigen Teams die Erfahrung, Wissen weiterzugeben, ohne den Code aus der Hand zu geben.',
          'Gerne überzeuge ich Sie in einem persönlichen Gespräch davon, wie ich Ihr Team in Berlin unterstützen kann. Meine Kündigungsfrist beträgt drei Monate, ein früherer Einstieg ist nach Absprache möglich. Über eine Einladung freue ich mich sehr.',
          'Mit freundlichen Grüßen',
        ]
      : PLACEHOLDER_LETTER_EN,
    layout: {
      ...data.coverLetter.layout,
      showSender: true,
      showRecipient: true,
      // `RENDER_LETTER=classic` selects the DIN 5008 branch; default is the app's default letter layout.
      classicLayout: process.env.RENDER_LETTER === 'classic',
    },
  };
  return data;
}

describe.skipIf(!theme)('render a theme to scratch/', () => {
  it(`writes ${theme}.pdf`, async () => {
    // `Object.hasOwn`, not `SERIALIZERS[theme]` — an object index is not total
    // over `string` and reaches `Object.prototype`, so `RENDER_THEME=toString`
    // would hand back a function instead of failing.
    expect(
      Object.hasOwn(SERIALIZERS, theme!),
      `RENDER_THEME="${theme}" is not a theme. One of: ${ALL_THEME_IDS.join(', ')}`,
    ).toBe(true);
    expect(
      Object.hasOwn(FIXTURES, fixture),
      `RENDER_FIXTURE="${fixture}" is not a fixture. One of: ${Object.keys(FIXTURES).join(', ')}`,
    ).toBe(true);

    const themeId = theme as (typeof ALL_THEME_IDS)[number];
    const resume = FIXTURES[fixture](themeId);

    await initTypstCompiler();
    // The same two steps the render worker runs: the serializers emit
    // `image("/icons/<name>.svg")` and `image("/profile-image.<ext>")` for
    // files that exist only at render time. The icon fill comes from the
    // theme's own palette, as `Viewer.tsx` derives it — a hardcoded default
    // would render every theme's icons in a colour the app never produces.
    await mapIcons(
      serializeIconsMap(resume, paletteIconFills(themeId, resume.meta.theme.params?.palette)),
    );
    await mapProfileImage(resume.basics.image);

    const pdf = await compileToPdf(SERIALIZERS[themeId](resume));

    // Resolved from the repository root, not `process.cwd()`: a direct
    // `npx vitest` from a subdirectory would otherwise write a `scratch/` there
    // and print a relative path pointing at neither — and the `.gitignore`
    // entry matches at any depth, so nothing would ever show it.
    const dir = resolve(REPO_ROOT, 'scratch');
    mkdirSync(dir, { recursive: true });
    const path = resolve(dir, `${themeId}-${fixture}.pdf`);
    writeFileSync(path, pdf);

    // The point of the run is the path, not the green tick — and it goes
    // straight to the stream because vitest's reporter swallows `console.*`
    // from a passing test.
    process.stdout.write(`\nwrote ${path} (${pdf.byteLength} bytes)\n\n`);
  });
});
