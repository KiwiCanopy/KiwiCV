import { migrateResumeStore } from '@/store/resume/migrations';
import { createDefaultCoverLetter } from '@/types/resume';
import { describe, expect, it } from 'vitest';

describe('migrateResumeStore', () => {
  describe('v5 -> v6 (cover letter)', () => {
    it('seeds a disabled default cover letter when the store has none', () => {
      const state = { resume: { basics: { name: 'Ada' }, skills: [] } };

      const migrated = migrateResumeStore(state, 5) as {
        resume: { coverLetter: unknown };
      };

      expect(migrated.resume.coverLetter).toEqual(createDefaultCoverLetter());
    });

    it('provides the documented defaults (disabled, footer on, left align)', () => {
      const migrated = migrateResumeStore({ resume: { skills: [] } }, 5) as {
        resume: { coverLetter: ReturnType<typeof createDefaultCoverLetter> };
      };

      const cl = migrated.resume.coverLetter;
      expect(cl.enabled).toBe(false);
      expect(cl.paragraphs).toEqual([]);
      expect(cl.layout).toEqual({
        textAlign: 'left',
        showSender: false,
        showRecipient: false,
        showFooter: true,
        classicLayout: false,
      });
      expect(cl.recipient).toEqual({ name: '', company: '', address: '' });
      expect(cl.subject).toBe('');
      expect(cl.date).toBe('');
    });

    it('does not overwrite an existing cover letter', () => {
      const existing = {
        enabled: true,
        paragraphs: ['Dear team,'],
        layout: {
          textAlign: 'justify',
          showSender: true,
          showRecipient: true,
          showFooter: false,
          classicLayout: true,
        },
        recipient: { name: 'Jane Doe', company: 'Acme', address: '1 Main St' },
        subject: 'Application',
        date: '2026-07-24',
      };
      const state = { resume: { basics: { name: 'Ada' }, coverLetter: existing } };

      const migrated = migrateResumeStore(state, 5) as {
        resume: { coverLetter: unknown };
      };

      expect(migrated.resume.coverLetter).toBe(existing);
    });

    it('leaves other resume content untouched', () => {
      const state = {
        resume: { basics: { name: 'Ada' }, work: [{ name: 'Acme' }], skills: [] },
      };

      const migrated = migrateResumeStore(state, 5) as {
        resume: { basics: { name: string }; work: Array<{ name: string }> };
      };

      expect(migrated.resume.basics.name).toBe('Ada');
      expect(migrated.resume.work).toEqual([{ name: 'Acme' }]);
    });

    it('does not seed a cover letter from version 6 on', () => {
      const state = { resume: { basics: { name: 'Ada' } } };

      const migrated = migrateResumeStore(state, 6) as {
        resume: { coverLetter?: unknown };
      };

      expect(migrated.resume.coverLetter).toBeUndefined();
    });

    it('tolerates a missing resume object', () => {
      expect(() => migrateResumeStore({}, 5)).not.toThrow();
      expect(() => migrateResumeStore(null, 5)).not.toThrow();
    });
  });

  describe('version <= 6: pass-through and JSON Resume fields', () => {
    const v6Resume = () => ({
      basics: { name: 'Ada' },
      projects: [{ name: 'Engine', highlights: [] }],
      privateProjects: [{ name: 'Home', highlights: ['x'] }],
      languages: [{ language: 'German', certificate: 'C2', level: 5 }],
      coverLetter: { enabled: false },
    });

    it('seeds an empty pass-through block', () => {
      const migrated = migrateResumeStore({ resume: v6Resume() }, 6) as {
        resume: { passthrough: unknown };
      };
      expect(migrated.resume.passthrough).toEqual({});
    });

    it('adds roles and keywords to existing project items without touching their content', () => {
      const migrated = migrateResumeStore({ resume: v6Resume() }, 6) as {
        resume: ReturnType<typeof v6Resume> & {
          projects: Array<Record<string, unknown>>;
          privateProjects: Array<Record<string, unknown>>;
        };
      };

      expect(migrated.resume.projects[0]).toEqual({
        name: 'Engine',
        highlights: [],
        roles: [],
        keywords: [],
      });
      expect(migrated.resume.privateProjects[0]).toMatchObject({ roles: [], keywords: [] });
      expect(migrated.resume.languages).toEqual(v6Resume().languages);
    });

    it('runs from a store several versions behind (v2)', () => {
      const migrated = migrateResumeStore({ resume: v6Resume() }, 2) as {
        resume: { passthrough: unknown; projects: Array<Record<string, unknown>> };
      };
      expect(migrated.resume.passthrough).toEqual({});
      expect(migrated.resume.projects[0].roles).toEqual([]);
    });

    it('adds nothing of its own from version 7 on', () => {
      const resume = { ...v6Resume(), customSections: [] };
      const migrated = migrateResumeStore({ resume: structuredClone(resume) }, 7) as {
        resume: unknown;
      };
      expect(migrated.resume).toEqual(resume);
    });
  });

  describe('version <= 7: custom sections', () => {
    const section = { id: 'a1', title: 'Talks', items: [{ name: 'Keynote' }] };

    it('lifts a pass-through copy into the field, before seeding', () => {
      const resume = { basics: {}, passthrough: { customSections: [section], keep: 1 } };
      const migrated = migrateResumeStore({ resume }, 7) as {
        resume: { customSections: unknown; passthrough: unknown };
      };
      expect(migrated.resume.customSections).toEqual([section]);
      expect(migrated.resume.passthrough).toEqual({ keep: 1 });
    });

    it('seeds an empty list when there is nothing to lift', () => {
      const migrated = migrateResumeStore({ resume: { basics: {}, passthrough: {} } }, 7) as {
        resume: { customSections: unknown };
      };
      expect(migrated.resume.customSections).toEqual([]);
    });

    it('runs from a store several versions behind (v2) without losing anything', () => {
      const migrated = migrateResumeStore({ resume: { basics: {} } }, 2) as {
        resume: { customSections: unknown; passthrough: unknown };
      };
      expect(migrated.resume.customSections).toEqual([]);
      expect(migrated.resume.passthrough).toEqual({});
    });

    it('adds nothing of its own from version 8 on', () => {
      const resume = { basics: {}, customSections: [section], passthrough: {} };
      const migrated = migrateResumeStore({ resume: structuredClone(resume) }, 8) as {
        resume: unknown;
      };
      expect(migrated.resume).toEqual(resume);
    });
  });

  describe('version <= 8: one store for a hidden photo', () => {
    const store = (imageVisible: unknown, hiddenIds: string[] = []) => ({
      resume: { basics: { image: 'x', imageVisible }, meta: { content: { hiddenIds } } },
    });
    type Migrated = {
      resume: { basics: Record<string, unknown>; meta: { content: { hiddenIds: string[] } } };
    };

    it('folds imageVisible: false into hiddenIds and drops the field', () => {
      const migrated = migrateResumeStore(store(false), 8) as Migrated;
      expect(migrated.resume.meta.content.hiddenIds).toEqual(['basics:image']);
      expect(migrated.resume.basics).not.toHaveProperty('imageVisible');
    });

    it('drops imageVisible: true without hiding anything, and never doubles the hash', () => {
      expect(
        (migrateResumeStore(store(true), 8) as Migrated).resume.meta.content.hiddenIds,
      ).toEqual([]);
      expect(
        (migrateResumeStore(store(false, ['basics:image']), 8) as Migrated).resume.meta.content
          .hiddenIds,
      ).toEqual(['basics:image']);
    });

    it('keeps the hide when the stored meta has no content', () => {
      const migrated = migrateResumeStore(
        { resume: { basics: { image: 'x', imageVisible: false } } },
        8,
      ) as Migrated;
      expect(migrated.resume.meta.content.hiddenIds).toEqual(['basics:image']);
    });

    it('runs from a store several versions behind (v2)', () => {
      const migrated = migrateResumeStore(store(false), 2) as Migrated;
      expect(migrated.resume.meta.content.hiddenIds).toEqual(['basics:image']);
      expect(migrated.resume.basics).not.toHaveProperty('imageVisible');
    });

    it('is a no-op at the current version (9)', () => {
      const migrated = migrateResumeStore(store(false), 9) as Migrated;
      expect(migrated.resume.basics.imageVisible).toBe(false);
    });
  });
  describe('version <= 9: a proposal carries no toggle state', () => {
    const store = () => ({
      resume: { basics: { name: 'Ada' } },
      ai: {
        suggestions: {
          'item:basics': {
            originalValue: { summary: 'Mine' },
            improvedValue: { summary: 'Theirs' },
            isOriginalActive: { summary: false },
            timestamp: 1,
          },
          cv: { originalValue: {}, improvedValue: {}, isOriginalActive: {}, timestamp: 1 },
        },
      },
    });
    type Migrated = { ai: { suggestions: Record<string, Record<string, unknown>> } };

    it('drops isOriginalActive and keeps the rest of every proposal', () => {
      const migrated = migrateResumeStore(store(), 9) as Migrated;
      expect(migrated.ai.suggestions['item:basics']).toEqual({
        originalValue: { summary: 'Mine' },
        improvedValue: { summary: 'Theirs' },
        timestamp: 1,
      });
      expect(migrated.ai.suggestions.cv).not.toHaveProperty('isOriginalActive');
    });

    it('runs from a store several versions behind (v5)', () => {
      const migrated = migrateResumeStore(store(), 5) as Migrated;
      expect(migrated.ai.suggestions['item:basics']).not.toHaveProperty('isOriginalActive');
    });

    it('tolerates a store with no ai block', () => {
      expect(() => migrateResumeStore({ resume: {} }, 9)).not.toThrow();
    });

    it('is a no-op at the current version (10)', () => {
      const migrated = migrateResumeStore(store(), 10) as Migrated;
      expect(migrated.ai.suggestions['item:basics']).toHaveProperty('isOriginalActive');
    });
  });
});
