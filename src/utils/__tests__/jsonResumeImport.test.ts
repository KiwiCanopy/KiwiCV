import { levelFromFluency, sanitizeResumeData, validateSkills } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/** A stock JSON Resume v1 file, as the probe in #13 measured it. */
const importJsonResume = (input: Record<string, unknown>) =>
  sanitizeResumeData({ basics: { name: 'A' }, ...input } as never);

describe('JSON Resume v1 import (#13)', () => {
  it('warns that work.description is not kept', () => {
    const { warnings } = importJsonResume({
      work: [{ name: 'Co', position: 'Dev', description: 'Ships things', summary: 'S' }],
    });

    expect(warnings).toEqual([
      {
        section: 'work',
        item: 'Co',
        field: 'description',
        message: 'editor.errors.field_not_kept',
      },
    ]);
  });

  it('does not warn for a work entry without a description', () => {
    const { warnings } = importJsonResume({
      work: [{ name: 'Co', position: 'Dev', description: '  ', summary: 'S' }],
    });

    expect(warnings).toEqual([]);
  });

  it('reads fluency as a level, not a certificate', () => {
    const { sanitized } = importJsonResume({
      languages: [
        { language: 'English', fluency: 'Native speaker' },
        { language: 'German', fluency: 'Full Professional Proficiency' },
        { language: 'French', fluency: 'B2' },
        { language: 'Spanish', fluency: 'Elementary proficiency' },
      ],
    });

    expect(sanitized.languages.map(({ level, certificate }) => ({ level, certificate }))).toEqual([
      { level: 5, certificate: '' },
      { level: 4, certificate: '' },
      { level: 2, certificate: '' },
      { level: 1, certificate: '' },
    ]);
  });

  it('keeps an unrecognised fluency as the certificate rather than losing it', () => {
    const { sanitized } = importJsonResume({
      languages: [{ language: 'English', fluency: 'TOEFL 110' }],
    });

    expect(sanitized.languages[0]).toMatchObject({ certificate: 'TOEFL 110', level: 0 });
  });

  it('keeps an old KiwiCV export’s fluency as its certificate beside its level', () => {
    const { sanitized } = importJsonResume({
      languages: [{ language: 'English', fluency: 'Professional (C1)', level: 4 }],
    });

    expect(sanitized.languages[0]).toMatchObject({ certificate: 'Professional (C1)', level: 4 });
  });

  it.each([
    ['Mother tongue', 5],
    ['Bilingual', 5],
    ['fluent', 4],
    ['C2', 4],
    ['Professional working proficiency', 3],
    ['C1', 3],
    ['Limited working proficiency', 2],
    ['conversational', 2],
    ['A1', 1],
    ['Basic', 1],
    ['TOEFL 110', undefined],
    ['', undefined],
  ])('maps the fluency %j to %s', (fluency, level) => {
    expect(levelFromFluency(fluency)).toBe(level);
  });

  it('maps a word skill level onto the 1–4 scale without a warning', () => {
    const { validated, warnings } = validateSkills([
      { name: 'Web', level: 'Master', keywords: [] },
      { name: 'SQL', level: 'intermediate', keywords: [] },
    ]);

    expect(validated.map((skill) => skill.level)).toEqual([4, 2]);
    expect(warnings).toEqual([]);
  });

  it('still clears and warns for a word it does not know', () => {
    const { validated, warnings } = validateSkills([
      { name: 'Web', level: 'Wizard', keywords: [] },
    ]);

    expect(validated[0].level).toBeUndefined();
    expect(warnings).toHaveLength(1);
  });
});
