// @vitest-environment jsdom
// The store persists through `localStorage`, and the property here is that its
// real load path normalises — so the real storage has to exist.
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildRealExportResume } from '@/test/realExportResume';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { sanitizeResumeData } from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * **Rehydration normalises the store.**
 *
 * `sanitizeResumeData` runs on the `setResume` paths only — JSON import,
 * Drive/GitHub sync pull, AI apply. `onRehydrateStorage` once ran
 * `sanitizePageBreaks` and nothing else, so everything already in
 * `localStorage` reached the renderers unvalidated: `basics.url` as a number
 * threw on **12 of 12 HTML previews and 12 of 12 PDF serializers**
 * (`basics.url.replace is not a function`), and `basics.name`/`label`/`email`/
 * `phone`/`summary`, `basics.image`, `work[].highlights` and the five
 * `coverLetter` fields threw on most or all of the same twenty-four. That is
 * also how the `addressSchema` and `separator` defects were reachable at all.
 *
 * ⚠️ **Driven through `persist.rehydrate()`, not by calling the sanitizer.**
 * The property is that the *store's own load path* normalises; a test that
 * called `sanitizeResumeData` on a fixture would pass identically against the
 * code before this fix, which is the shape this file exists to make impossible.
 *
 * ⚠️ **The population is derived, not listed.** Every string and `string[]`
 * path is enumerated from the fixture *after* one sanitize pass, so it is by
 * construction the set of fields `ResumeData` actually declares — the `real`
 * fixture carries keys it does not (`languages[].fluency`,
 * `meta.export.config`), and taking the
 * population before the pass would test the sanitizer's right to drop them
 * rather than its duty to coerce what it keeps. A field added to `ResumeData`
 * and to either fixture is covered here without editing this file; a list would
 * have to be maintained, and the section-inventory family of defects is
 * what happens when one is not.
 */

const STORAGE_KEY = 'resume-storage';

/** The persisted `version`, so `migrate` is not part of what this measures. */
const PERSISTED_VERSION = useResumeStore.persist.getOptions().version as number;

type Path = Array<string | number>;

const getIn = (root: unknown, path: Path): unknown =>
  path.reduce<unknown>((acc, k) => (acc as Record<string | number, unknown>)?.[k], root);

const setIn = (root: unknown, path: Path, value: unknown): void => {
  const parent = getIn(root, path.slice(0, -1)) as Record<string | number, unknown>;
  parent[path[path.length - 1]] = value;
};

/** Every path in `node` whose value is a string, and every one that is `string[]`. */
function collect(node: unknown, path: Path = []): { strings: Path[]; stringArrays: Path[] } {
  const strings: Path[] = [];
  const stringArrays: Path[] = [];
  if (Array.isArray(node)) {
    if (node.length > 0 && node.every((v) => typeof v === 'string')) {
      stringArrays.push(path);
    } else {
      node.forEach((v, i) => {
        const sub = collect(v, [...path, i]);
        strings.push(...sub.strings);
        stringArrays.push(...sub.stringArrays);
      });
    }
    return { strings, stringArrays };
  }
  if (node === null || typeof node !== 'object') return { strings, stringArrays };
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    // `_vId` is identity, not content: the sanitizer mints one for a missing or
    // blank id rather than coercing what is there, so it does not answer the
    // "is this still a string" question the rest of the walk asks.
    if (k === '_vId' || k === '_imageVId') continue;
    if (typeof v === 'string') {
      strings.push([...path, k]);
      continue;
    }
    const sub = collect(v, [...path, k]);
    strings.push(...sub.strings);
    stringArrays.push(...sub.stringArrays);
  }
  return { strings, stringArrays };
}

/** Writes `resume` to storage as the persist middleware would, then rehydrates. */
async function rehydrateWith(resume: unknown): Promise<ResumeData> {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ state: { resume }, version: PERSISTED_VERSION }),
  );
  await useResumeStore.persist.rehydrate();
  return useResumeStore.getState().resume;
}

const fixtures = {
  single: buildSingleItemResume('lunar'),
  real: buildRealExportResume('lunar'),
};

describe.each(Object.entries(fixtures))('rehydrating the %s fixture', (_name, fixture) => {
  // A fixed point of the chain, so the enumerated paths are declared fields.
  const clean = sanitizeResumeData(structuredClone(fixture) as never).sanitized;
  const { strings, stringArrays } = collect(clean);

  beforeEach(() => {
    localStorage.clear();
  });

  it('enumerates a population worth calling universal', () => {
    // Not a threshold anybody tuned — it fails loudly if the walk above ever
    // silently stops finding fields, which is the way a derived population dies.
    expect(strings.length).toBeGreaterThan(20);
    expect(stringArrays.length).toBeGreaterThan(0);
  });

  it.each(strings.map((p) => [p.join('.'), p] as const))(
    'coerces a stored number at %s back to a string',
    async (_label, path) => {
      const stored = structuredClone(clean);
      setIn(stored, path, 42);
      const out = await rehydrateWith(stored);
      expect(typeof getIn(out, path)).toBe('string');
    },
  );

  it.each(stringArrays.map((p) => [p.join('.'), p] as const))(
    'replaces a stored non-array container at %s with an array',
    async (_label, path) => {
      const stored = structuredClone(clean);
      setIn(stored, path, 'a, b');
      const out = await rehydrateWith(stored);
      expect(Array.isArray(getIn(out, path))).toBe(true);
    },
  );

  /**
   * ⚠️ **The surviving element is drawn from the field's own clean value, not a
   * literal.** An earlier draft appended `'kept'` and asserted `['kept']`, which
   * failed on the three `meta.content.order` arrays — and the code was right:
   * those hold *section keys* and `sanitizeResumeData` filters them against
   * `ALL_SECTION_KEYS` on top of the string test, so an arbitrary string is
   * supposed to be dropped. Using the field's existing contents keeps the
   * "valid entries survive" half honest for every field without this file
   * needing to know which ones carry a further whitelist.
   */
  it.each(stringArrays.map((p) => [p.join('.'), p] as const))(
    'drops a non-string element at %s and keeps the valid ones',
    async (_label, path) => {
      const survivors = getIn(clean, path) as string[];
      const stored = structuredClone(clean);
      setIn(stored, path, [42, {}, ...survivors]);
      const out = await rehydrateWith(stored);
      expect(getIn(out, path)).toEqual(survivors);
    },
  );
});

/**
 * Half two — what the change must *not* do. A normaliser that blanked the store
 * would pass every assertion above.
 */
describe('what rehydration must not do', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each(Object.entries(fixtures))('leaves a clean %s store intact', async (_name, fixture) => {
    const clean = sanitizeResumeData(structuredClone(fixture) as never).sanitized;
    const out = await rehydrateWith(structuredClone(clean));
    // `pageBreaks` is the one block `onRehydrateStorage` legitimately rewrites.
    expect({
      ...out,
      meta: { ...out.meta, content: { ...out.meta.content, pageBreaks: null } },
    }).toEqual({
      ...clean,
      meta: { ...clean.meta, content: { ...clean.meta.content, pageBreaks: null } },
    });
  });

  /**
   * ⚠️ **The `_vId` question — the one that decided the shape, and the fix's own
   * comment answers it with a measurement that does not reproduce.** That
   * comment reports "a mutation inside `onRehydrateStorage` reaches
   * `localStorage`, with no user action", on the strength of 2 storage writes
   * seen while driving `persist.rehydrate()`. Measured here against the real
   * `statusTrackingStorage`, counting writes to `resume-storage`:
   *
   * ```
   * A. writes during rehydrate: 0
   * A. stored work[0]._vId: undefined   (in memory: "zknmwv16c")
   * B. writes after an ordinary setState: 1
   * B. stored work[0]._vId now: "zknmwv16c"
   * ```
   *
   * **Rehydration writes nothing.** Zustand's `hydrate()` calls `set()` and
   * *then* runs this callback, so a mutation made here is not what the persist
   * subscription serialized. It rides along on the **next** persisted state
   * change instead — which is why B picks it up without touching `_vId` itself.
   *
   * So the fix's conclusion (identity is minted once) is right and its reason
   * is wrong, and the correct reason is the stronger one: `_vId` and everything
   * keyed on it live in the same `resume` blob and are written by the same
   * write, so they **cannot** diverge. A re-mint on a boot that never writes is
   * unobservable, because no `hiddenIds` entry referencing the new id can exist
   * until a write that stores both has happened.
   *
   * ⚠️ This also means the `sanitizePageBreaks` line that has been in this
   * callback all along does not write at load either. Inherited, not introduced.
   */
  it('mints a missing _vId in memory, and the next write persists it', async () => {
    const stored = structuredClone(fixtures.single) as unknown as Record<string, unknown>;
    const work = stored.work as Array<Record<string, unknown>>;
    delete work[0]._vId;

    const first = await rehydrateWith(stored);
    const mintedId = first.work[0]._vId;
    expect(mintedId).toBeTruthy();

    // Rehydration alone leaves storage untouched — the half the fix's comment got wrong.
    const afterRehydrate = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(afterRehydrate.state.resume.work[0]._vId).toBeUndefined();

    // The next ordinary state change carries the repair out to storage.
    useResumeStore.setState((s) => ({ resume: { ...s.resume } }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    const afterWrite = JSON.parse(localStorage.getItem(STORAGE_KEY) as string);
    expect(afterWrite.state.resume.work[0]._vId).toBe(mintedId);

    // And booting off what was written finds that id, rather than minting again.
    await useResumeStore.persist.rehydrate();
    expect(useResumeStore.getState().resume.work[0]._vId).toBe(mintedId);
  });

  /**
   * The sync-dirty question. The chain is not hash-stable on a *raw* fixture —
   * it fills in defaults (`visible`, `location: ''`, `imageVisible`) — but it is
   * idempotent on its own output, so a store changes at most once, on the first
   * load after this fix, and is stable forever after.
   */
  it.each(Object.entries(fixtures))('is idempotent on its own output (%s)', async (_n, fixture) => {
    const once = await rehydrateWith(structuredClone(fixture));
    const twice = await rehydrateWith(structuredClone(once));
    expect(twice).toEqual(once);
  });
});
