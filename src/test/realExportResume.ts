import { applyThemeLayout } from '@/test/fixtureLayout';
import { REPO_ROOT } from '@/test/sourceFiles';
import type { ResumeData } from '@/types/resume';
import { readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const EXAMPLES_DIR = resolve(REPO_ROOT, 'examples');
const SNAPSHOT = /^resume_(\d+)_(\d+)_(\d+)\.json$/;

/**
 * The newest `examples/resume_<major>_<minor>_<patch>.json`.
 *
 * ⚠️ **Resolved at read time rather than pinned, and that is a decision, not
 * laziness.** `examples/*.json` are versioned snapshots written by
 * `scripts/model-snapshot.cjs`, so a fixture hard-coded to `resume_4_0_1.json`
 * would age the moment 4.1.0 is cut and then quietly render a stale data model
 * — silently, because a stale snapshot still compiles. The two options were
 * "pin and re-point at each release" and "resolve the newest and accept a
 * fixture that changes under you".
 *
 * Resolving wins **because this fixture is an inspection input and never an
 * assertion oracle.** Nothing compares its output to a stored expectation, so
 * "changes under you" costs nothing and is in fact the point: you open the PDF
 * to look at the *current* data model at realistic density. A pin would fail in
 * the one direction that matters — quietly, and exactly at a release.
 *
 * ⚠️ Sorted numerically per component, not lexically. `resume_3_10_0` sorts
 * before `resume_3_9_0` as a string, and the repo is nine minors into a series
 * that has already shipped `3_9_0`.
 */
export function newestSnapshotFilename(): string {
  const ranked = readdirSync(EXAMPLES_DIR)
    .map((name) => ({ name, parts: SNAPSHOT.exec(name) }))
    .filter((entry): entry is { name: string; parts: RegExpExecArray } => entry.parts !== null)
    .map(({ name, parts }) => ({ name, version: [+parts[1], +parts[2], +parts[3]] }))
    .sort(
      (a, b) =>
        b.version[0] - a.version[0] || b.version[1] - a.version[1] || b.version[2] - a.version[2],
    );

  if (ranked.length === 0) {
    // Loud rather than a fixture that returns an empty resume and renders a
    // blank page: a rename of the snapshot convention should stop this fixture,
    // not degrade it.
    throw new Error(
      `No resume_<major>_<minor>_<patch>.json in ${EXAMPLES_DIR}. Found: ${readdirSync(EXAMPLES_DIR).join(', ')}`,
    );
  }

  return ranked[0].name;
}

/**
 * A **real export** at realistic density — the fixture the other two are not.
 *
 * `buildSingleItemResume` is one-of-everything by construction (the arity that
 * reaches the one-element-tuple crashes, and it must stay that way), and the
 * placeholder resume is single-entry where it counts: one work, one education,
 * one project. So nothing in the repository rendered **two work entries back to
 * back**, and inter-entry spacing, date-column alignment down a run of rows,
 * a section header straddling a page break, and a theme's rhythm at real
 * density were all invisible.
 *
 * That capability existed once — the deleted `scripts/test-typst-compile.ts`
 * compiled a real export — and restoring it is what this is.
 *
 * ⚠️ **The headline datapoint that motivated this does not reproduce; the gap is
 * real anyway.** It was a leftover `scratch/test-soft.pdf` at **16 pages** against
 * `soft-single`'s 3, cited as evidence that a real export drives soft somewhere the
 * fixtures never reach. Measured: `soft-real` is **2 pages**
 * (plain 3, lunar 2, timeless 3) — that leftover came from the deleted script
 * running `resume_3_8_1.json` against an older soft, so treat it as history,
 * not as a page-count expectation. What justifies this fixture is density, not
 * length: four work entries in a row is a thing no other fixture renders.
 *
 * Three things the snapshot needs on the way in, each of which makes the
 * fixture silently useless if skipped:
 *
 * - **The layout.** The snapshot ships `twoColumn: { main: [], sidebar: [] }`,
 *   which renders six themes' worth of empty documents that compile perfectly.
 *   `applyThemeLayout` is that trap, shared rather than re-copied.
 * - **The locale.** The snapshot's is `de`. Set explicitly so the rendered PDF
 *   is not silently a German-language inspection of an English fixture.
 * - **The image.** The snapshot's `basics.image` is `''`. Pointed at
 *   `public/`'s mock image so the profile-image path is exercised —
 *   `mapProfileImage` already resolves `public/` paths.
 *
 * ⚠️ **Not every section is dense, and the gaps are the snapshot's.** The
 * current newest carries 4 work / 3 education / 2 volunteer / 2 projects, but
 * **no `privateProjects` at all**, so that section renders empty here. This
 * fixture inherits whatever the snapshot happens to hold; it is not a
 * guaranteed-density fixture, and adding one would mean authoring data rather
 * than reading a real export, which is the thing being restored.
 */
export function buildRealExportResume(themeId: string): ResumeData {
  const data = JSON.parse(
    readFileSync(resolve(EXAMPLES_DIR, newestSnapshotFilename()), 'utf-8'),
  ) as ResumeData;

  data.meta.theme.name = themeId;
  data.meta.theme.locale = 'en';
  data.basics.image = '/images/mok_image.png';

  applyThemeLayout(data, themeId);

  return data;
}
