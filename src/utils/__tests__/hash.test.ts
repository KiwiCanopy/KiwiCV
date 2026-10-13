import { type ResumeData, initialResumeState } from '@/types/resume';
import { getResumeHash, getSectionItemHash, isResumeDigest } from '@/utils/hash';
import { createEmptyItem } from '@/utils/items';
import { ALL_SECTION_KEYS, type SectionKey } from '@/utils/layout/constants';
import { type EmptyItemKey } from '@/utils/layoutMetadata';
import { describe, expect, it } from 'vitest';

/**
 * `getSectionItemHash` produces the id every hidden item is tracked by in
 * `meta.content.hiddenIds`. Two properties matter, and only one of them is
 * obvious:
 *
 * 1. The id must survive editing an item. A user hides an entry, then fixes a
 *    typo in its summary — the entry must stay hidden.
 * 2. The id must be derived from a *stable* field, not the item's contents.
 *
 * Both hold via the `_vId` early return. The `switch` below it is the fallback
 * for items without one, and it was missing cases for `certificates` and
 * `privateProjects` — those fell through to `JSON.stringify(item)`, where
 * property 1 fails outright. This suite pins the early return, pins the
 * per-section identity fields, and guards the section list against drift, in
 * the same spirit as the other inventory drift tests.
 */

/** An item shaped like a real one for `section`, minus the `_vId`. */
function itemWithoutVId(section: EmptyItemKey): Record<string, unknown> {
  const { _vId: _discarded, ...rest } = createEmptyItem(section);
  return rest;
}

describe('getSectionItemHash — the `_vId` early return', () => {
  it.each(ALL_SECTION_KEYS)('prefers `_vId` over any content field for %s', (section) => {
    expect(getSectionItemHash(section, { _vId: 'stable-id', name: 'anything' })).toBe(
      `${section}:stable-id`,
    );
  });

  it.each(ALL_SECTION_KEYS)('keeps the id stable when %s content is edited', (section) => {
    const before = getSectionItemHash(section, { ...itemWithoutVId(section), _vId: 'stable-id' });
    const after = getSectionItemHash(section, {
      ...itemWithoutVId(section),
      _vId: 'stable-id',
      name: 'edited',
      summary: 'edited too',
      startDate: '2020-01-01',
      issuer: 'edited issuer',
    });

    expect(after).toBe(before);
  });

  it('ignores a non-string `_vId` and falls back to the identity fields', () => {
    const hashed = getSectionItemHash('work', { _vId: 42, name: 'Acme', startDate: '2020' });

    expect(hashed).not.toBe('work:42');
    expect(hashed).toBe(getSectionItemHash('work', { name: 'Acme', startDate: '2020' }));
  });

  it('ignores an empty `_vId`, which is the schema default in validation.ts', () => {
    const hashed = getSectionItemHash('work', { _vId: '', name: 'Acme', startDate: '2020' });

    expect(hashed).toBe(getSectionItemHash('work', { name: 'Acme', startDate: '2020' }));
  });
});

/**
 * The drift guard. `ALL_SECTION_KEYS` is the canonical inventory; an array
 * section absent from the `switch` hashes over its entire JSON, so any edit
 * silently orphans the hidden-item id. That is exactly what `certificates` and
 * `privateProjects` did before this suite existed.
 */
describe('getSectionItemHash — every array section has an explicit case', () => {
  it.each(ALL_SECTION_KEYS)('does not hash %s over its whole JSON', (section) => {
    const base = itemWithoutVId(section);
    const edited = { ...base, _unrelated: 'a field no identity key names' };

    expect(getSectionItemHash(section, edited)).toBe(getSectionItemHash(section, base));
  });

  it.each([
    ['certificates', { name: 'AWS SAA', issuer: 'Amazon' }, { date: '2024-01-01', url: 'u' }],
    ['privateProjects', { name: 'Side app', startDate: '2023' }, { description: 'rewritten' }],
  ] as const)('identifies %s by its identity fields alone', (section, identity, noise) => {
    expect(getSectionItemHash(section, { ...identity, ...noise })).toBe(
      getSectionItemHash(section, identity),
    );
  });

  it.each([
    ['certificates', { name: 'AWS SAA', issuer: 'Amazon' }, { name: 'AWS SAA', issuer: 'Google' }],
    ['privateProjects', { name: 'App', startDate: '2023' }, { name: 'App', startDate: '2024' }],
  ] as const)('distinguishes two different %s entries', (section, first, second) => {
    expect(getSectionItemHash(section, first)).not.toBe(getSectionItemHash(section, second));
  });

  it('namespaces the hash by section, so identical items never collide', () => {
    const item = { name: 'Same', startDate: '2020' };

    expect(getSectionItemHash('projects', item)).not.toBe(
      getSectionItemHash('privateProjects', item),
    );
  });
});

/**
 * The complement to the drift guard above. That one proves a *non*-identity
 * field cannot change the hash; this one proves each identity field *can* —
 * so narrowing a section's key (dropping `studyType` from education, say)
 * fails here rather than silently making two distinct entries share a hidden
 * state. Every key of `ALL_SECTION_KEYS` is listed.
 *
 * Note these keys are deliberately coarse: two certificates with the same name
 * and issuer, or two projects with the same name and start date, collide by
 * design. That is pre-existing and uniform across sections, and unreachable in
 * practice because `_vId` short-circuits before the `switch`.
 */
const IDENTITY_FIELDS: Record<(typeof ALL_SECTION_KEYS)[number], readonly string[]> = {
  work: ['name', 'startDate'],
  education: ['institution', 'studyType'],
  skills: ['name'],
  projects: ['name', 'startDate'],
  privateProjects: ['name', 'startDate'],
  certificates: ['name', 'issuer'],
  volunteer: ['organization', 'position'],
  awards: ['title', 'awarder'],
  publications: ['name', 'publisher'],
  languages: ['language'],
  interests: ['name'],
  references: ['name'],
};

describe('getSectionItemHash — identity fields', () => {
  it('covers every section in the canonical inventory', () => {
    expect(Object.keys(IDENTITY_FIELDS).sort()).toEqual([...ALL_SECTION_KEYS].sort());
  });

  it.each(
    // `Object.entries` widens the key to `string`; `IDENTITY_FIELDS` is a
    // `Record` over `ALL_SECTION_KEYS`, so the narrowing restates nothing.
    (Object.entries(IDENTITY_FIELDS) as [SectionKey, readonly string[]][]).flatMap(
      ([section, fields]) => fields.map((field) => [section, field] as const),
    ),
  )('%s changes its hash when `%s` changes', (section, field) => {
    const base = { ...itemWithoutVId(section), [field]: 'original' };
    const changed = { ...base, [field]: 'different' };

    expect(getSectionItemHash(section as never, changed)).not.toBe(
      getSectionItemHash(section as never, base),
    );
  });
});

/**
 * The profile picture is not an array item, so its id is a bare literal rather
 * than a base64 key. `toggleItemVisibility('basics:image', {})` in
 * `useBasicsForm` is the only call site and passes an empty object; two
 * consumers (`themes/shared/sections.ts`, `useBasicsForm`) then compare the
 * literal `'basics:image'` against `hiddenIds` directly. The literal is the
 * contract between them.
 */
describe('getSectionItemHash — the profile-picture special case', () => {
  it('returns the bare marker for the empty item its only call site passes', () => {
    expect(getSectionItemHash('basics:image', {})).toBe('basics:image');
  });

  it('is unaffected by unrelated fields on the item', () => {
    expect(getSectionItemHash('basics:image', { anything: 1 })).toBe('basics:image');
  });

  it('would be broken by a `_vId`, which is why no call site passes one', () => {
    // Documents the precedence rather than endorsing it: the early return fires
    // before the `basics:image` case, so a `_vId` here yields an id the two
    // literal-string consumers would never match.
    expect(getSectionItemHash('basics:image', { _vId: 'image' })).toBe('basics:image:image');
  });
});

/**
 * `_vId` has been stamped on every item since the initial commit — by the
 * editor's add action, and backfilled by `sanitizeArray` on import — and no
 * persisted store version ever shipped without it. So the `switch` is a
 * fallback for data that does not occur in practice. It is still tested above,
 * because "unreachable" is a property of today's call sites, not of this
 * function.
 */
describe('getSectionItemHash — encoding', () => {
  it('survives non-ASCII identity fields', () => {
    expect(() => getSectionItemHash('work', { name: '株式会社', startDate: '2020' })).not.toThrow();
  });

  it('distinguishes non-ASCII entries rather than collapsing them', () => {
    expect(getSectionItemHash('skills', { name: 'Größe' })).not.toBe(
      getSectionItemHash('skills', { name: 'Grosse' }),
    );
  });
});

describe('getResumeHash', () => {
  it('is stable for identical data', async () => {
    const resume = structuredClone(initialResumeState);

    expect(await getResumeHash(resume)).toBe(await getResumeHash(structuredClone(resume)));
  });

  it('changes when any field changes, which is what sync change-detection needs', async () => {
    const before = structuredClone(initialResumeState);
    const after = structuredClone(initialResumeState);
    after.basics.name = 'Ada Lovelace';

    expect(await getResumeHash(after)).not.toBe(await getResumeHash(before));
  });

  it('is a SHA-256 hex digest of the serialized resume, not an encoding of it', async () => {
    const resume: ResumeData = structuredClone(initialResumeState);
    resume.basics.name = '株式会社 Größe';

    // SHA-256 of the UTF-8 JSON, computed independently of the implementation.
    const { createHash } = await import('node:crypto');
    const expected = createHash('sha256').update(JSON.stringify(resume), 'utf8').digest('hex');
    expect(await getResumeHash(resume)).toBe(expected);
  });

  it('produces what isResumeDigest recognises, and nothing longer or encoded is', async () => {
    const digest = await getResumeHash(structuredClone(initialResumeState));

    expect(isResumeDigest(digest)).toBe(true);
    expect(isResumeDigest(`${digest}0`)).toBe(false);
    expect(isResumeDigest(`${digest}:Ada_CV`)).toBe(false);
    expect(isResumeDigest(btoa('{"basics":{}}'))).toBe(false);
  });
});
