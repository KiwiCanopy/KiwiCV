import { useResumeStore } from '@/store/resume/useResumeStore';
import { type CustomSection } from '@/types/resume';
import { getAISuggestionCount } from '@/utils/ai';
import { spawnSync } from 'node:child_process';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * AI on a custom section, driven from the real response schema into the real
 * store — the run `.claude/rules/ai-backend.md` asks for, copied from
 * `coverLetterImprove.test.ts`. The backend is spawned, not imported, for the
 * reason that file gives.
 */

const ID = '11111111-2222-4333-8444-555555555555';
const TOKEN = `custom:${ID}`;

const SOURCE: CustomSection = {
  id: ID,
  title: 'Hackathons',
  visible: true,
  items: [
    {
      name: 'HackZurich',
      startDate: '2023-09',
      endDate: '2023-09',
      url: 'https://hackzurich.com',
      summary: 'built a tracker',
      highlights: ['did the backend'],
      visible: true,
      _vId: 'h1',
    },
    {
      name: 'Junction',
      startDate: '2022-11',
      endDate: '2022-11',
      url: '',
      summary: 'route planner',
      highlights: [],
      visible: false,
      _vId: 'h2',
    },
  ],
};

interface Probe {
  section: { items: Array<{ _vId: string; improvedFields: Record<string, unknown> }> };
  item: { _vId: string; improvedFields: Record<string, unknown> };
  cvTranslated: {
    customSections: Array<{
      id: string;
      title: string;
      items: Array<{ _vId: string; improvedFields: Record<string, unknown> }>;
    }>;
  };
  grades: { section: boolean; cv: boolean };
}

/**
 * Fills a schema with a path-named string per leaf; arrays take the source's
 * length. `_vId` and `id` echo the source — measured on 2026-10-06, the model
 * copies them unchanged.
 */
const probeBackend = (): Probe => {
  const script = `
    import { getVertexResponseSchema } from './netlify/functions/lib/ai/generator.js';
    import { hasActualChanges, sanitizeResumeData } from './netlify/functions/lib/ai/utils.js';

    const source = sanitizeResumeData(JSON.parse(process.env.CUSTOM_SECTION));
    const fill = (node, trail, src) => {
      if (node.type === 'OBJECT') {
        return Object.fromEntries(
          Object.entries(node.properties).map(([key, child]) => [
            key,
            key === '_vId' || key === 'id'
              ? src?.[key]
              : fill(child, trail + '.' + key, src == null ? undefined : src[key]),
          ]),
        );
      }
      if (node.type === 'ARRAY') {
        const length = Array.isArray(src) ? src.length : 1;
        return Array.from({ length }, (_, i) => {
          const entry = Array.isArray(src) ? src[i] : undefined;
          return fill(node.items, trail + '[' + i + ']', entry && entry._vId ? { ...entry, improvedFields: entry } : entry);
        });
      }
      return 'rewritten ' + trail;
    };

    const section = fill(getVertexResponseSchema('section', ['${TOKEN}'], false, [], false), '$', source);
    const item = fill(getVertexResponseSchema('item', ['${TOKEN}'], false, [], false), '$', { ...source.items[0], improvedFields: source.items[0] });
    const cvTranslated = fill(
      getVertexResponseSchema('cv', ['customSections'], false, ['customSections'], true),
      '$',
      { customSections: [source] },
    );

    process.stdout.write(JSON.stringify({
      section,
      item,
      cvTranslated,
      grades: {
        section: hasActualChanges({ granularity: 'section', source, improved: section, allowReorg: false, id: '${TOKEN}' }),
        cv: hasActualChanges({ granularity: 'cv', source: { customSections: [source] }, improved: cvTranslated, allowReorg: false }),
      },
    }));
  `;
  const run = spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: { ...process.env, CUSTOM_SECTION: JSON.stringify(SOURCE) },
  });
  if (run.status !== 0) throw new Error(`the backend probe failed:\n${run.stderr || run.stdout}`);
  return JSON.parse(run.stdout) as Probe;
};

const probe = probeBackend();

const customSection = () => useResumeStore.getState().resume.customSections[0];

describe('improving a custom section, from the response schema to the store', () => {
  beforeEach(() => {
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, customSections: [structuredClone(SOURCE)] },
      ai: { ...state.ai, suggestions: {}, reorgSuggestion: null },
    }));
  });

  it('built responses that carry every entry and grade as changes', () => {
    expect(probe.section.items.map((item) => item._vId)).toEqual(['h1', 'h2']);
    expect(probe.cvTranslated.customSections[0].id).toBe(ID);
    expect(probe.cvTranslated.customSections[0].title).toMatch(/^rewritten/);
    expect(probe.grades).toEqual({ section: true, cv: true });
  });

  it('a section run proposes per entry, counts on the section, and Discard restores', () => {
    const { applyAISuggestion, declineAISuggestion } = useResumeStore.getState();
    applyAISuggestion(`section:${TOKEN}`, probe.section);

    expect(customSection().items[0].summary).toMatch(/^rewritten/);
    expect(customSection().items[1].summary).toMatch(/^rewritten/);
    expect(customSection().title).toBe('Hackathons');
    // `url` is stripped before the model and absent from the schema, so it survives.
    expect(customSection().items[0].url).toBe('https://hackzurich.com');

    const { suggestions } = useResumeStore.getState().ai;
    expect(Object.keys(suggestions).sort()).toEqual([`item:${TOKEN}:h1`, `item:${TOKEN}:h2`]);
    expect(getAISuggestionCount(suggestions, [TOKEN], null, useResumeStore.getState().resume)).toBe(
      2,
    );

    declineAISuggestion(`item:${TOKEN}:h1`);
    expect(customSection().items[0]).toEqual(SOURCE.items[0]);
    expect(customSection().items[1].summary).toMatch(/^rewritten/);
  });

  it('a translating section run writes the heading too', () => {
    useResumeStore
      .getState()
      .applyAISuggestion(
        `section:${TOKEN}`,
        { ...probe.section, title: 'Hackathon-Teilnahmen' },
        { skipSuggestions: true },
      );
    expect(customSection().title).toBe('Hackathon-Teilnahmen');
    // Entries written in the same producer survive the heading's replacement.
    expect(customSection().items[0].summary).toMatch(/^rewritten/);
  });

  it('an entry run writes that entry alone', () => {
    useResumeStore.getState().applyAISuggestion(`item:${TOKEN}:h1`, probe.item);
    expect(customSection().items[0].highlights[0]).toMatch(/^rewritten/);
    expect(customSection().items[1]).toEqual(SOURCE.items[1]);
    expect(Object.keys(useResumeStore.getState().ai.suggestions)).toEqual([`item:${TOKEN}:h1`]);
  });

  it('a whole-CV translation writes the heading and the entries, hidden ones included', () => {
    useResumeStore
      .getState()
      .applyAISuggestion('cv', probe.cvTranslated, { skipSuggestions: true });

    expect(customSection().title).toMatch(/^rewritten/);
    expect(customSection().items[1].summary).toMatch(/^rewritten/);
    expect(customSection().items[1].visible).toBe(false);
    expect(useResumeStore.getState().ai.suggestions).toEqual({});
  });

  it('a whole-CV run with proposals can restore the heading', () => {
    const { applyAISuggestion, declineAISuggestion } = useResumeStore.getState();
    applyAISuggestion('cv', probe.cvTranslated);
    expect(useResumeStore.getState().ai.suggestions).toHaveProperty(`item:${TOKEN}`);

    declineAISuggestion(`item:${TOKEN}`);
    expect(customSection().title).toBe('Hackathons');
  });

  it('a deleted custom section leaves no proposal behind in the count', () => {
    useResumeStore.getState().applyAISuggestion(`section:${TOKEN}`, probe.section);
    const { ai, resume } = useResumeStore.getState();
    expect(
      getAISuggestionCount(ai.suggestions, undefined, null, { ...resume, customSections: [] }),
    ).toBe(0);
  });

  it('deleting the section drops its proposals, which no Discard could reach', () => {
    const { applyAISuggestion } = useResumeStore.getState();
    applyAISuggestion('cv', probe.cvTranslated);
    expect(Object.keys(useResumeStore.getState().ai.suggestions)).toContain(`item:${TOKEN}`);

    useResumeStore.getState().removeCustomSection(ID);
    const keys = Object.keys(useResumeStore.getState().ai.suggestions);
    expect(keys.filter((key) => key.includes(TOKEN))).toEqual([]);
  });
});
