import {
  flattenDiscovery,
  selectMasterForLocale,
  selectPinnedMasters,
} from '@/features/cv-library/flattenDiscovery';
import type { BackupDiscoveryMap, BackupFile } from '@/store/library/useCvLibraryStore';
import { describe, expect, it } from 'vitest';

const file = (overrides: Partial<BackupFile> & { name: string }): BackupFile => ({
  label: overrides.name.replace(/\.json$/, ''),
  ...overrides,
});

const pin = (data: BackupDiscoveryMap, localeFilter: string, activeLocale = 'en') =>
  selectPinnedMasters(flattenDiscovery(data).versions, { localeFilter, activeLocale });

describe('flattenDiscovery', () => {
  it('unwinds locale -> source -> files, carrying both onto every row', () => {
    const data: BackupDiscoveryMap = {
      en: {
        github: [file({ name: 'alpha.json', updatedAt: '2026-01-02T00:00:00Z' })],
        google_drive: [file({ name: 'beta.json', id: 'b', updatedAt: '2026-01-03T00:00:00Z' })],
      },
      de: { github: [file({ name: 'gamma.json', updatedAt: '2026-01-01T00:00:00Z' })] },
    };

    const { versions } = flattenDiscovery(data);

    expect(versions.map((v) => [v.file.name, v.locale, v.source])).toEqual([
      ['beta.json', 'en', 'google_drive'],
      ['alpha.json', 'en', 'github'],
      ['gamma.json', 'de', 'github'],
    ]);
  });

  it('namespaces the row key by locale and source', () => {
    const shared = file({ name: 'resume.json' });
    const { versions } = flattenDiscovery({
      en: { github: [shared] },
      de: { github: [shared] },
    });

    expect(new Set(versions.map((v) => v.key)).size).toBe(2);
  });

  it('marks resume.json as the master and everything else as a version', () => {
    const { versions } = flattenDiscovery({
      en: { github: [file({ name: 'resume.json' }), file({ name: 'ProjectA.json' })] },
    });

    expect(versions.find((v) => v.file.name === 'resume.json')?.isMaster).toBe(true);
    expect(versions.find((v) => v.file.name === 'ProjectA.json')?.isMaster).toBe(false);
  });

  it('sorts undated files last while preserving their discovery order', () => {
    const { versions } = flattenDiscovery({
      en: {
        github: [
          file({ name: 'undated-first.json' }),
          file({ name: 'dated.json', updatedAt: '2026-01-01T00:00:00Z' }),
          file({ name: 'undated-second.json' }),
        ],
      },
    });

    expect(versions.map((v) => v.file.name)).toEqual([
      'dated.json',
      'undated-first.json',
      'undated-second.json',
    ]);
  });

  it('returns an empty library for no discovery data', () => {
    expect(flattenDiscovery(null)).toEqual({ versions: [] });
  });
});

describe('selectPinnedMasters', () => {
  const TWO_LANGUAGES: BackupDiscoveryMap = {
    en: {
      github: [
        file({ name: 'resume.json', updatedAt: '2026-01-01T00:00:00Z' }),
        file({ name: 'Contoso.json', updatedAt: '2026-01-04T00:00:00Z' }),
      ],
    },
    de: { github: [file({ name: 'resume.json', updatedAt: '2026-05-01T00:00:00Z' })] },
  };

  it('pins only the selected language, and lists every other language', () => {
    const { pinned, listed } = pin(TWO_LANGUAGES, 'en');

    expect(pinned.map((v) => v.locale)).toEqual(['en']);
    // The German master is newer, and used to win the pinned slot for an
    // English view. It is an ordinary row now.
    expect(listed.map((v) => [v.locale, v.file.name])).toContainEqual(['de', 'resume.json']);
  });

  it('pins one master per language for "All languages", active language first', () => {
    const { pinned } = pin(TWO_LANGUAGES, 'all', 'en');

    // Recency would put `de` first; the language the editor is in wins.
    expect(pinned.map((v) => v.locale)).toEqual(['en', 'de']);
    expect(pin(TWO_LANGUAGES, 'all', 'de').pinned.map((v) => v.locale)).toEqual(['de', 'en']);
  });

  it('orders the languages the editor is not in by recency', () => {
    const { pinned } = pin(
      {
        en: { github: [file({ name: 'resume.json', updatedAt: '2026-01-01T00:00:00Z' })] },
        de: { github: [file({ name: 'resume.json', updatedAt: '2026-02-01T00:00:00Z' })] },
        fr: { github: [file({ name: 'resume.json', updatedAt: '2026-06-01T00:00:00Z' })] },
      },
      'all',
      'en',
    );

    expect(pinned.map((v) => v.locale)).toEqual(['en', 'fr', 'de']);
  });

  it('never pins a tailored version, however much newer it is than the master', () => {
    const { pinned, listed } = pin(
      {
        en: {
          github: [
            file({ name: 'resume.json', updatedAt: '2026-01-01T00:00:00Z' }),
            file({
              name: 'Alex_Weber_Product_Designer_Figma.json',
              updatedAt: '2026-07-01T00:00:00Z',
            }),
          ],
        },
      },
      'all',
    );

    // The pinned row means "the copy every device syncs to", not "the newest
    // file", so the tailored version stays an ordinary row.
    expect(pinned.map((v) => v.file.name)).toEqual(['resume.json']);
    expect(listed.map((v) => v.file.name)).toEqual(['Alex_Weber_Product_Designer_Figma.json']);
  });

  it('pins the newer of two providers holding a master for one language, and lists the other', () => {
    const { pinned, listed } = pin(
      {
        en: {
          github: [file({ name: 'resume.json', updatedAt: '2026-01-01T00:00:00Z' })],
          google_drive: [
            file({ name: 'resume.json', id: 'drive-master', updatedAt: '2026-04-01T00:00:00Z' }),
          ],
        },
      },
      'all',
    );

    expect(pinned).toHaveLength(1);
    expect(pinned[0].source).toBe('google_drive');
    expect(listed.map((v) => v.source)).toEqual(['github']);
  });

  it('pins nothing when the language filter names a language with no master', () => {
    expect(pin(TWO_LANGUAGES, 'fr').pinned).toEqual([]);
  });

  it('partitions: nothing is both pinned and listed, and nothing is lost', () => {
    const { versions } = flattenDiscovery(TWO_LANGUAGES);
    const { pinned, listed } = selectPinnedMasters(versions, {
      localeFilter: 'all',
      activeLocale: 'en',
    });

    const keys = [...pinned, ...listed].map((v) => v.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(new Set(keys)).toEqual(new Set(versions.map((v) => v.key)));
  });
});

describe('selectMasterForLocale', () => {
  const { versions } = flattenDiscovery({
    en: { github: [file({ name: 'resume.json', updatedAt: '2026-01-01T00:00:00Z' })] },
    de: { github: [file({ name: 'resume.json', updatedAt: '2026-05-01T00:00:00Z' })] },
    fr: { github: [file({ name: 'Stage.json', updatedAt: '2026-06-01T00:00:00Z' })] },
  });

  it('reads the master of the language asked for, not the newest one', () => {
    expect(selectMasterForLocale(versions, 'en')?.locale).toBe('en');
  });

  it('returns null for a language that has files but no master', () => {
    expect(selectMasterForLocale(versions, 'fr')).toBeNull();
  });

  it('returns null for a language with nothing at all', () => {
    expect(selectMasterForLocale(versions, 'pl')).toBeNull();
  });
});
