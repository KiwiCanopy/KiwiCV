import type { ResumeData } from '@/types/resume';
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { migrateToNewLayoutStructure } from '../layout/structure';
import { sanitizeCoverLetter, sanitizeResumeData, validateSkills } from '../validation';

const EXAMPLES_DIR = path.resolve(__dirname, '../../../examples');
const snapshotFiles = fs
  .readdirSync(EXAMPLES_DIR)
  .filter((f) => f.startsWith('resume_') && f.endsWith('.json'))
  .sort();

function loadSnapshot(filename: string): Record<string, unknown> {
  const filePath = path.join(EXAMPLES_DIR, filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

describe('Resume Validation & Migration', () => {
  describe('Global Snapshot Integrity', () => {
    it.each(snapshotFiles)('should be valid and importable: %s', (filename) => {
      const data = loadSnapshot(filename);
      const { sanitized } = sanitizeResumeData(data as unknown as ResumeData);

      expect(sanitized).toBeDefined();
      expect(sanitized.meta).toBeDefined();
      expect(sanitized.meta.version).toBeDefined();
      expect(typeof sanitized.meta.version).toBe('string');
    });
  });

  describe('sanitizeResumeData', () => {
    it('should validate the v3.1.0 example with zero warnings', () => {
      const resume310 = loadSnapshot('resume_3_1_0.json');
      const { sanitized, warnings } = sanitizeResumeData(resume310 as unknown as ResumeData);

      expect(warnings).toHaveLength(0);
      expect(sanitized.meta.version).toBe('3.1.0');

      // We cast to Record<string, unknown> to check for keys that should have been stripped
      const meta = sanitized.meta as unknown as Record<string, unknown>;
      expect(meta.ui).toBeUndefined();
      expect(meta.lastModified).toBeUndefined();

      const config = (meta.export as Record<string, unknown>)?.config as Record<string, unknown>;
      expect(config?.clean).toBeUndefined();
    });

    it('should correctly migrate legacy v2.0.0 sectionOrder to order.oneColumn', () => {
      const rawData = loadSnapshot('resume_2_0_0.json');
      const migratedMeta = migrateToNewLayoutStructure(
        rawData.meta as unknown as ResumeData['meta'],
      );
      const { sanitized } = sanitizeResumeData({
        ...rawData,
        meta: migratedMeta,
      } as unknown as ResumeData);

      expect(sanitized.meta.version).toBe('2.0.0');
      expect(sanitized.meta.content.order.oneColumn).toBeDefined();
      expect(sanitized.meta.content.order.oneColumn.length).toBeGreaterThan(0);
      expect(sanitized.meta.content.order.oneColumn).toContain('work');

      const content = sanitized.meta.content as unknown as Record<string, unknown>;
      expect(content.sectionOrder).toBeUndefined();
    });

    it('should hold unknown top-level keys in pass-through and strip unknown meta keys', () => {
      const resume310 = loadSnapshot('resume_3_1_0.json');
      const dirtyData = {
        ...resume310,
        extraKey: 'kept, never rendered',
        meta: {
          ...(resume310.meta as Record<string, unknown>),
          unknownMetaKey: 'should be gone',
        },
      };

      const { sanitized } = sanitizeResumeData(dirtyData as unknown as ResumeData);

      expect((sanitized as unknown as Record<string, unknown>).extraKey).toBeUndefined();
      expect(sanitized.passthrough).toEqual({ extraKey: 'kept, never rendered' });
      expect((sanitized.meta as unknown as Record<string, unknown>).unknownMetaKey).toBeUndefined();
    });

    it('seeds projects[].roles and projects[].keywords on every snapshot', () => {
      let checked = 0;
      for (const filename of snapshotFiles) {
        const { sanitized } = sanitizeResumeData(loadSnapshot(filename));
        for (const item of [...sanitized.projects, ...sanitized.privateProjects]) {
          expect(Array.isArray(item.roles)).toBe(true);
          expect(Array.isArray(item.keywords)).toBe(true);
          checked += 1;
        }
      }
      expect(checked).toBeGreaterThan(0);
    });

    it('should ensure vId generation for items missing them', () => {
      const resume310 = loadSnapshot('resume_3_1_0.json');
      const dataWithMissingId = {
        ...resume310,
        work: [{ name: 'Test Corp', position: 'Developer' }],
      };

      const { sanitized } = sanitizeResumeData(dataWithMissingId as unknown as ResumeData);

      expect(sanitized.work[0]._vId).toBeDefined();
      expect(typeof sanitized.work[0]._vId).toBe('string');
    });

    // A copied entry block in an edited export must not share its id: one hide
    // would hide both, and AI apply would reach only the first.
    it('keeps existing vIds and re-mints a repeated one', () => {
      const { sanitized } = sanitizeResumeData({
        work: [
          { _vId: 'kept', name: 'A' },
          { _vId: 'kept', name: 'Copy of A' },
          { _vId: 'other', name: 'B' },
        ],
      });

      const ids = sanitized.work.map((item) => item._vId);
      expect(ids[0]).toBe('kept');
      expect(ids[1]).not.toBe('kept');
      expect(ids[2]).toBe('other');
      expect(new Set(ids).size).toBe(3);
    });

    it('re-mints a non-string vId', () => {
      const { sanitized } = sanitizeResumeData({ work: [{ _vId: 5, name: 'A' }] });
      expect(typeof sanitized.work[0]._vId).toBe('string');
      expect(sanitized.work[0]._vId).not.toBe('5');
    });

    it('should preserve two-column sidebar position during sanitization', () => {
      const { sanitized } = sanitizeResumeData({
        meta: {
          version: '3.8.1',
          theme: {
            name: 'lunar',
            locale: 'en',
            params: {},
          },
          export: {
            filenamePattern: '{name}',
          },
          content: {
            hiddenIds: [],
            hiddenSections: [],
            order: {
              oneColumn: [],
              twoColumn: {
                main: ['work'],
                sidebar: ['skills'],
                sidebarPosition: 'right',
              },
            },
          },
        },
      } as unknown as ResumeData);

      expect(sanitized.meta.content.order.twoColumn.sidebarPosition).toBe('right');
    });

    it('should preserve section locations during sanitization', () => {
      const { sanitized } = sanitizeResumeData({
        work: [{ name: 'Test Corp', position: 'Developer', location: 'Berlin' }],
        volunteer: [{ organization: 'Open Source', position: 'Mentor', location: 'Remote' }],
        education: [
          { institution: 'TU Berlin', studyType: 'B.Sc.', area: 'CS', location: 'Berlin' },
        ],
        awards: [
          { title: 'Hackathon Winner', date: '2024', awarder: 'Hack Berlin', location: 'Munich' },
        ],
        projects: [
          {
            name: 'Canvas',
            description: '',
            highlights: [],
            startDate: '',
            endDate: '',
            url: '',
            entity: 'Northwind',
            location: 'Remote',
            type: '',
          },
        ],
        privateProjects: [
          {
            name: 'Side Quest',
            description: '',
            highlights: [],
            startDate: '',
            endDate: '',
            url: '',
            entity: 'Personal',
            location: 'Vienna',
            type: '',
          },
        ],
      } as unknown as ResumeData);

      expect(sanitized.work[0].location).toBe('Berlin');
      expect(sanitized.volunteer[0].location).toBe('Remote');
      expect(sanitized.education[0].location).toBe('Berlin');
      expect(sanitized.awards[0].location).toBe('Munich');
      expect(sanitized.projects[0].location).toBe('Remote');
      expect(sanitized.privateProjects[0].location).toBe('Vienna');
    });

    it('should correctly migrate skills level from 0-100 to 1-4 range during import', () => {
      const rawSkills = [
        { name: 'React', level: 85 }, // 70-89 -> Level 3
        { name: 'Vue', level: 95 }, // 90-100 -> Level 4
        { name: 'Angular', level: 50 }, // 40-69 -> Level 2
        { name: 'Svelte', level: 20 }, // 0-39 -> Level 1
        { name: 'Ember', level: 0 }, // 0 -> undefined
        { name: 'jQuery', level: 3 }, // 1-4 -> Level 3 (stays 3 since it's already in 1-4)
      ];

      const { validated, warnings } = validateSkills(rawSkills);

      expect(warnings).toHaveLength(0);
      expect(validated[0].level).toBe(3);
      expect(validated[1].level).toBe(4);
      expect(validated[2].level).toBe(2);
      expect(validated[3].level).toBe(1);
      expect(validated[4].level).toBeUndefined();
      expect(validated[5].level).toBe(3);
    });

    /**
     * ⚠️ **The property the deleted `skippedCount` misrepresented.**
     * `validateSkills` returned a `skippedCount` hardcoded `0` on both paths while
     * having no `continue`, filter or early return, so `setResume`'s
     * `skippedSkills` was always `0`. Deleting the field removes the false claim;
     * this pins the true one, so that adding a drop later cannot be silent — which
     * is the only way the deletion could turn into data loss.
     *
     * ⚠️ **The fixture must exercise both branches or it is vacuous.** An entry
     * passes through untouched only when `levelMatch && keywordsMatch`, and
     * `keywordsMatch` is a *reference* comparison that requires `keywords` to
     * already be an array — so an entry with no `keywords` at all always takes the
     * normalising branch. A fixture built only from `{ name, level }` objects would
     * leave the pass-through branch untested, and a `continue` added there would
     * not be caught.
     */
    it('returns every entry it is given, from both branches, in order', () => {
      const passThrough = { name: 'Go', level: 2, keywords: ['api'] };
      const rawSkills = [
        passThrough, // already valid: pushed unchanged
        { name: 'React', level: 85 }, // out of range + no keywords: normalised
        { name: 'Rust', level: 'not a number' }, // unparsable level: normalised + warns
        { name: 'Zig', level: null, keywords: 'a, b' }, // non-array keywords: normalised
        { level: 3 }, // no name at all: normalised to 'Unnamed Skill'
      ];

      const { validated, warnings } = validateSkills(rawSkills);

      expect(validated).toHaveLength(rawSkills.length);
      expect(validated.map((s) => s.name)).toEqual(['Go', 'React', 'Rust', 'Zig', 'Unnamed Skill']);

      // Control 1: the pass-through branch really is taken, so the length
      // assertion above is not satisfied by five trips through one branch.
      expect(validated[0]).toBe(passThrough);

      // Control 2: the normalising branch really is taken, so "every entry
      // survives" is not the trivial claim that nothing happens here.
      expect(validated[1]).not.toBe(rawSkills[1]);
      expect(validated[1].level).toBe(3);
      expect(validated[3].keywords).toEqual([]);

      // Control 3: this path does report something, via `warnings` — the field
      // that replaced `skippedCount` as the only signal it genuinely produces.
      expect(warnings.map((w) => w.message)).toContain('editor.errors.invalid_skill_level');
    });
  });

  describe('cover letter sanitization', () => {
    it('returns a disabled default when no cover letter is present', () => {
      const { sanitized } = sanitizeResumeData({ basics: { name: 'Ada' } } as ResumeData);

      expect(sanitized.coverLetter).toEqual({
        enabled: false,
        paragraphs: [],
        layout: {
          textAlign: 'left',
          showSender: false,
          showRecipient: false,
          showFooter: true,
          classicLayout: false,
        },
        recipient: { name: '', company: '', address: '' },
        subject: '',
        date: '',
      });
    });

    it('preserves a well-formed imported cover letter', () => {
      const coverLetter = {
        enabled: true,
        paragraphs: ['Dear **team**,', 'I am _excited_ to apply.'],
        layout: {
          textAlign: 'justify' as const,
          showSender: true,
          showRecipient: true,
          showFooter: false,
          classicLayout: true,
        },
        recipient: { name: 'Jane Doe', company: 'Acme', address: '1 Main St' },
        subject: 'Application for Engineer',
        date: '2026-07-24',
      };

      const { sanitized } = sanitizeResumeData({
        basics: { name: 'Ada' },
        coverLetter,
      } as unknown as ResumeData);

      expect(sanitized.coverLetter).toEqual(coverLetter);
    });

    it('coerces malformed fields and drops non-string paragraphs', () => {
      const result = sanitizeCoverLetter({
        enabled: 'yes', // not a boolean -> default false
        paragraphs: ['keep', 42, null, 'also keep'],
        layout: {
          textAlign: 'center', // invalid enum -> left
          showFooter: 'nope', // not a boolean -> default true
        },
        recipient: { name: 'Jane', company: 123 },
        subject: undefined,
        date: 42,
      });

      expect(result.enabled).toBe(false);
      expect(result.paragraphs).toEqual(['keep', 'also keep']);
      expect(result.layout.textAlign).toBe('left');
      expect(result.layout.showFooter).toBe(true);
      expect(result.recipient.name).toBe('Jane');
      expect(result.recipient.company).toBe('');
      expect(result.subject).toBe('');
      expect(result.date).toBe('');
    });

    it('falls back to the default for non-object input', () => {
      expect(sanitizeCoverLetter(null).enabled).toBe(false);
      expect(sanitizeCoverLetter('nope').paragraphs).toEqual([]);
    });
  });
});
