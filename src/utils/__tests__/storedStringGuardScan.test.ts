import { named, sourceFiles } from '@/test/sourceFiles';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The forward half of the stored-string guard (`storedStringFields.test.ts` is
 * the boundary half): a **new** read of a stored string must not be written as
 * `value?.trim()`.
 *
 * That idiom is the repo's single most repeated defect. `?.` guards `undefined`
 * and `null`; a stored field is arbitrary JSON, so a number, an object or an
 * array reaches `.trim` and throws. It has shipped four times — an address
 * key, `separator`, `city` (where the *fix* introduced it), and the two
 * `coverLetterTypst` reads recorded as already fixed and which were not,
 * killing all twelve Typst serializers until this round.
 *
 * ⚠️ **The scan is scoped by the property, not by a path** (the scope-by-property
 * rule, `.claude/rules/testing.md`), and it imports **nothing from the
 * application** — a scan whose own module graph can be taken down by the code it
 * scans cannot be shown to work.
 *
 * ⚠️ It is a forward guard and nothing else — a source scan can never see a
 * file that does not match, so it catches the site written tomorrow and pins
 * nothing about today (the render-then-scan rule).
 *
 * ⚠️ And "the reads that exist are covered behaviourally" would be a false
 * claim, so it is not made here. `storedStringFields.test.ts` covers the
 * **boundary**: it feeds a non-string through `sanitizeResumeData`, which now
 * blanks it, so the themes in that file never see one. The unguarded reads
 * inside the themes are reachable from **rehydrated** state and are not
 * asserted anywhere.
 *
 * ⚠️ **It deliberately does not forbid `.trim()` outright.** `x.trim()` on a
 * value the same expression just proved is a string is correct and common, and
 * a rule that banned it would be routed around rather than obeyed. What is
 * forbidden is exactly the two shapes that *look* guarded and are not:
 * `x?.trim()` and `(x || '').trim()`. The second was missing from the first
 * draft and the architect pass found it — same idiom, same receiver class, and
 * it sits in the very file whose `?.trim()` reads were fixed.
 */

const SRC = join(process.cwd(), 'src');

/** Every `.ts`/`.tsx` under `src`, tests excluded — they may assert the idiom. */
const walk = (dir: string): string[] =>
  sourceFiles(dir, { extensions: ['.ts', '.tsx'], skip: [named('__tests__'), /\.test\.tsx?$/] });

/**
 * `?.trim()`, and deliberately only that.
 *
 * ⚠️ **A wider regex here was measured and rejected, and the measurement is the
 * point.** `?.(trim|toLowerCase|toUpperCase|split|replace|startsWith|slice)\(`
 * finds **22** sites in `src`, of which **19** are not stored-résumé reads at
 * all — `className?.replace`, `user?.email?.split`, `props.href?.startsWith`,
 * `new Intl.Locale(bcp47).region?.toUpperCase()`, a regex match result. A scan
 * that is 19/22 noise is scoped by a **syntax**, not by the property, and it
 * gets an allowlist bolted on and then routed around. That is the
 * scope-by-property rule broken the other way: too wide rather than too narrow.
 *
 * `.trim()` is different in kind: in this repo it is the *blank-test* idiom,
 * and its receiver is a stored value essentially every time. It is also the
 * exact shape that has shipped four times (an address key, `separator`, `city`,
 * and the two `coverLetterTypst` reads recorded as fixed). So this catches one
 * spelling of one bug, honestly, rather than pretending to cover a class.
 *
 * ⚠️ **The split is 16 noise / 6 real, not 19 / 3 — my classification was
 * wrong and the code-reviewer pass recounted it.** The three I named were
 * `basics.label?.toUpperCase()` ×2 and `profile.network?.toLowerCase()`. Three
 * more are stored-résumé reads too:
 *
 * - `SwissGridHTML.tsx:127` and `:232` — `labels.contact?.toUpperCase()` /
 *   `labels.about?.toUpperCase()`. `getSectionLabels` spreads
 *   `meta.theme.params.sectionLabels` **last**, and `sanitizeSectionLabels`
 *   filters to strings on the `setResume` path only, so a rehydrated
 *   `{ contact: 42 }` reaches `.toUpperCase()`.
 * - `RawJsonData.tsx:34` — `basics.name?.replace(/\s+/g, '_')`, read straight
 *   off the store.
 *
 * All six are reachable from rehydrated state and are left for one fix of the
 * whole class rather than half-fixed; that fix is still open.
 */
const UNGUARDED = /\?\.trim\(|\|\|\s*['"]['"]\)\.trim\(/;

/**
 * The sites that already match and are tracked for the class fix rather than
 * fixed here. It **only shrinks**: a new one fails the baseline case below, and a
 * fixed one fails the no-stale-entries case.
 *
 * ⚠️ This is a baseline, not an allowlist, and the difference is the direction.
 * An allowlist names files the scan skips, so it hides whatever else is in
 * them; this names the exact offending lines and refuses to grow. It is the
 * pattern `bare-literal-baseline.js` and `eslint-legacy-baseline.js` already
 * use in this repo.
 *
 * ⚠️ **They are not this guard's to fix, and the reviewer finding that surfaced them
 * framed them as the scan's miss.** Measured: `sanitizeCoverLetter`
 * (`validation.ts:391`) already runs `asString` over `subject`, `date` and
 * every `recipient` field and filters `paragraphs` to strings, so **none of
 * these is reachable from an import** — unlike `basics.location.city`, which
 * `s()` once wrote through raw. They are reachable from **rehydrated**
 * state alone, which is the same class as the thirty-odd raw string-method
 * reads in the twelve themes. Fixing five of thirty-five buys false
 * confidence; the class gets one fix, and that fix is still open.
 *
 * ⚠️ Measured on a rehydrated fixture, all twelve Typst
 * serializers, `coverLetter.enabled`: `subject`, `date`, a `paragraphs`
 * element, `recipient.address` (`.split`) and `recipient.name` (`line.trim`)
 * each threw on **12 of 12**. Five entry points — the finding named three plus
 * one.
 */
const KNOWN_UNFIXED: readonly string[] = [
  'components/preview/themes/shared/coverLetterTypst.ts:126',
  'components/preview/themes/shared/coverLetterTypst.ts:174',
];

/**
 * Strip block and line comments, so a doc comment quoting the idiom is not a hit.
 *
 * ⚠️ **Newlines are preserved, and the first draft did not preserve them.**
 * Replacing a block comment with `''` collapses every line it spanned, so every
 * reported line number after the first docblock in a file was wrong — this scan
 * named `coverLetterTypst.ts:33` for a read that lives at `:73`. A guard whose
 * output cannot be navigated to is a guard nobody acts on. Found by running it.
 */
const stripComments = (source: string): string =>
  source
    .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ''))
    .replace(/^(\s*)\/\/.*$/gm, '$1');

const offenders = (): string[] =>
  walk(SRC).flatMap((path) =>
    stripComments(readFileSync(path, 'utf8'))
      .split('\n')
      .flatMap((line, index) =>
        UNGUARDED.test(line) ? [`${path.slice(SRC.length + 1)}:${index + 1} ${line.trim()}`] : [],
      ),
  );

describe('no stored string is read through an optional chain', () => {
  const located = () => offenders().map((entry) => entry.split(' ')[0]);

  it('has no offender outside the baseline', () => {
    expect(located().filter((site) => !KNOWN_UNFIXED.includes(site))).toEqual([]);
  });

  /** The baseline only shrinks — a stale entry is as much a failure as a new one. */
  it('has no stale baseline entry', () => {
    expect(KNOWN_UNFIXED.filter((site) => !located().includes(site))).toEqual([]);
  });

  /**
   * ⚠️ The positive control, and it is what stops the case above being vacuous
   * three separate ways — the walk could find no files, the comment stripper
   * could eat every line, or the regex could match nothing at all. A count pin
   * would catch none of those: it asserts the walk ran, not that it can
   * see anything.
   */
  it('finds the idiom when it is there', () => {
    const source = 'const city = basics.location?.city?.trim() || "";';
    expect(UNGUARDED.test(source)).toBe(true);
    // The sibling spelling — same idiom, same receiver class, and the one the
    // first draft of this regex was blind to.
    expect(UNGUARDED.test("const subject = (coverLetter.subject || '').trim();")).toBe(true);
    expect(UNGUARDED.test('const d = (x || "").trim();')).toBe(true);
    expect(UNGUARDED.test('const city = typeof raw === "string" ? raw.trim() : "";')).toBe(false);
    expect(UNGUARDED.test('const name = user?.email?.split("@")[0];')).toBe(false);
    expect(stripComments(`// ${source}\nconst ok = 1;`)).not.toContain('?.trim');
    // ⚠️ And the line count must survive, or every reported line number after a
    // docblock is wrong — which it was, by forty lines, until this was fixed.
    expect(stripComments('/* a\nb\nc */\nx').split('\n')).toHaveLength(4);
    expect(stripComments('// one\n// two\nx').split('\n')).toHaveLength(3);
    expect(stripComments(`/* ${source} */\nconst ok = 1;`)).not.toContain('?.trim');
    expect(stripComments(source)).toContain('?.trim');
  });

  it('walks a plausible number of files and reaches the deepest theme helpers', () => {
    const files = walk(SRC);
    expect(files.length).toBeGreaterThan(100);
    expect(files).toContain(join(SRC, 'components/preview/themes/shared/coverLetterTypst.ts'));
    expect(files).toContain(
      join(
        SRC,
        'components/preview/themes/twoColumn/lunar/helpers/typst/achievementsReferences.ts',
      ),
    );
  });
});
