import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { type ResumeData, initialResumeState } from '@/types/resume';
import {
  PASSTHROUGH_MAX_BYTES,
  collectPassthrough,
  stringifyResume,
  toResumeJson,
} from '@/utils/passthrough';
import { getFilteredResumeData } from '@/utils/resume-export';
import { sanitizeResumeData } from '@/utils/validation';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * What KiwiCV cannot show, it must not destroy. Driven through the real
 * entry points — `setResume` for import, `stringifyResume` for every JSON writer.
 */

const UNKNOWN_BLOCKS = {
  kiwitalents: { availability: 'from 2027-01', travel: true, nested: [{ a: 1 }] },
  $schema: 'https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json',
  'x-scores': [1, 2, 3],
  xNull: null,
};

/** A JSON Resume file as another tool writes it: no `meta`, standard fields, unknown blocks. */
const foreignFile = () => ({
  basics: { name: 'Ada Lovelace' },
  projects: [
    {
      name: 'Engine',
      roles: ['Lead', 'Author'],
      keywords: ['math', 'computing'],
      highlights: [],
    },
  ],
  ...UNKNOWN_BLOCKS,
});

const importThenExport = (file: Record<string, unknown>) => {
  useResumeStore.getState().setResume(file as unknown as ResumeData, { silent: true });
  return JSON.parse(stringifyResume(useResumeStore.getState().resume));
};

describe('an import followed by an export', () => {
  beforeEach(() => {
    useResumeStore.getState().resetResume();
  });

  it('returns every unknown top-level key with the same value', () => {
    const exported = importThenExport(foreignFile());
    for (const [key, value] of Object.entries(UNKNOWN_BLOCKS)) {
      expect(exported[key]).toEqual(value);
    }
    expect(exported).not.toHaveProperty('passthrough');
  });

  it('keeps projects[].roles and projects[].keywords', () => {
    const exported = importThenExport(foreignFile());
    expect(exported.projects[0].roles).toEqual(['Lead', 'Author']);
    expect(exported.projects[0].keywords).toEqual(['math', 'computing']);
  });

  it('is stable: exporting the re-imported export gives the same file', () => {
    const once = importThenExport(foreignFile());
    const twice = importThenExport(once);
    expect(twice).toEqual(once);
  });

  it('survives an editor write, which re-enters setResume with the stored shape', () => {
    useResumeStore.getState().setResume(foreignFile() as unknown as ResumeData, { silent: true });
    const resume = useResumeStore.getState().resume;
    useResumeStore.getState().setResume({ ...resume, work: [] }, { silent: true });

    expect(useResumeStore.getState().resume.passthrough).toEqual(UNKNOWN_BLOCKS);
  });

  it('is replaced, not merged, by the next import', () => {
    useResumeStore.getState().setResume(foreignFile() as unknown as ResumeData, { silent: true });
    useResumeStore
      .getState()
      .setResume({ basics: { name: 'Other' }, other: 1 } as unknown as ResumeData, {
        silent: true,
      });

    expect(useResumeStore.getState().resume.passthrough).toEqual({ other: 1 });
  });

  const keptNotices = (file: Record<string, unknown>) =>
    sanitizeResumeData(file)
      .warnings.filter((w) => w.message === 'editor.errors.passthrough_kept')
      .map((w) => w.field)
      .sort();

  it('tells the user which blocks were kept, except $schema', () => {
    expect(keptNotices(foreignFile())).toEqual(['kiwitalents', 'x-scores', 'xNull']);
  });

  it("says nothing about blocks in KiwiCV's own export, which wrote them", () => {
    const ownExport = importThenExport(foreignFile());
    expect(ownExport.meta.theme).toBeDefined();
    expect(keptNotices(ownExport)).toEqual([]);
  });

  it('says nothing about blocks that were already stored', () => {
    const { sanitized } = sanitizeResumeData(foreignFile());
    const { warnings } = sanitizeResumeData(sanitized);
    expect(warnings.filter((w) => w.section === 'passthrough')).toEqual([]);
  });
});

describe('the pass-through container', () => {
  it('never holds a modelled key, whether it arrives at the top level or stored', () => {
    const everyKey = Object.fromEntries(
      Object.keys(initialResumeState).map((key) => [key, { probe: key }]),
    );
    const { sanitized } = sanitizeResumeData({ ...everyKey, passthrough: everyKey });
    expect(sanitized.passthrough).toEqual({});
  });

  it('lets modelled values win on export over a stale block of the same name', () => {
    const resume = {
      ...buildSingleItemResume('lunar'),
      passthrough: { basics: 'stale', meta: { stale: true }, keep: 1 },
    };
    const exported = toResumeJson(resume);
    expect(exported.basics).toEqual(resume.basics);
    expect(exported.meta).toEqual(resume.meta);
    expect(exported.keep).toBe(1);
  });

  it('reads a stored block KiwiCV now models as if it were top level', () => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'Ada' },
      passthrough: { volunteer: [{ organization: 'Red Cross' }], keep: 1 },
    });
    expect(sanitized.volunteer[0].organization).toBe('Red Cross');
    expect(sanitized.passthrough).toEqual({ keep: 1 });
  });

  it('lets the top level win over the stored block for the same key', () => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: 'Ada' },
      passthrough: { block: 'old' },
      block: 'new',
    });
    expect(sanitized.passthrough).toEqual({ block: 'new' });
  });

  it('skips __proto__ without touching the prototype, and keeps constructor as data', () => {
    const file = JSON.parse(
      '{"basics":{"name":"Ada"},"__proto__":{"polluted":true},"constructor":{"c":1},"ok":1}',
    );
    const { sanitized, warnings } = sanitizeResumeData(file);
    expect(Object.getPrototypeOf(sanitized.passthrough)).toBe(Object.prototype);
    expect(sanitized.passthrough).toEqual({ constructor: { c: 1 }, ok: 1 });
    expect(warnings.filter((w) => w.section === 'passthrough').map((w) => w.field)).toEqual([
      'constructor',
      'ok',
    ]);
  });

  it('clones values, so the store never aliases the imported object', () => {
    const file = { basics: { name: 'Ada' }, block: { list: [1] } };
    const { sanitized } = sanitizeResumeData(file);
    file.block.list.push(2);
    expect(sanitized.passthrough).toEqual({ block: { list: [1] } });
  });

  it('drops blocks past the size cap and names them, keeping the ones that fit', () => {
    const big = 'x'.repeat(PASSTHROUGH_MAX_BYTES);
    const { passthrough, dropped } = collectPassthrough({ small: 1, huge: big, after: 2 });
    expect(passthrough).toEqual({ small: 1, after: 2 });
    expect(dropped).toEqual(['huge']);

    const { warnings } = sanitizeResumeData({ basics: { name: 'Ada' }, huge: big });
    expect(warnings).toContainEqual({
      section: 'passthrough',
      field: 'huge',
      message: 'editor.errors.passthrough_dropped',
    });
  });

  it('keeps a block just under the cap', () => {
    const fits = 'x'.repeat(PASSTHROUGH_MAX_BYTES - 64);
    expect(collectPassthrough({ fits }).dropped).toEqual([]);
  });
});

describe('the JSON export tiers', () => {
  const resume = (): ResumeData => ({
    ...buildSingleItemResume('lunar'),
    passthrough: { kiwitalents: { salary: 'tier-sentinel' } },
  });

  it('full: pass-through at the top level', () => {
    expect(toResumeJson(resume()).kiwitalents).toEqual({ salary: 'tier-sentinel' });
  });

  it('standard: pass-through at the top level, for third-party parsers', () => {
    const standard = getFilteredResumeData(resume(), 'standard') as Record<string, unknown>;
    expect(standard.kiwitalents).toEqual({ salary: 'tier-sentinel' });
    expect(standard).not.toHaveProperty('passthrough');
    expect(standard).not.toHaveProperty('meta');
  });

  it('reduced: no pass-through, since public JSON carries only what the CV shows', () => {
    const reduced = getFilteredResumeData(resume(), 'reduced');
    expect(JSON.stringify(reduced)).not.toContain('tier-sentinel');
  });
});
