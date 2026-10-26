import { useResumeStore } from '@/store/resume/useResumeStore';
import { createDefaultCoverLetter } from '@/types/resume';
import { beforeEach, describe, expect, it } from 'vitest';

/**
 * The stamp follows the letter's content: a letter the run wrote is current,
 * and declining that proposal hands the kept letter back its own stamp.
 */

const A = 'a'.repeat(64);
const B = 'b'.repeat(64);
const OLD = { subject: 'Old', paragraphs: ['Written for A'] };
const NEW = { subject: 'New', paragraphs: ['Written for B'] };

const letter = () => useResumeStore.getState().resume.coverLetter;
const store = () => useResumeStore.getState();

/** The letter as a run that drafted one leaves it: content applied, proposal pending. */
const seedDraftedForB = () =>
  useResumeStore.setState((state) => ({
    resume: {
      ...state.resume,
      coverLetter: { ...createDefaultCoverLetter(), ...NEW, draftedFor: A, outdated: false },
    },
    ai: {
      ...state.ai,
      suggestions: { 'item:coverLetter': { originalValue: OLD, improvedValue: NEW, timestamp: 1 } },
    },
  }));

beforeEach(() => {
  seedDraftedForB();
  store().stampCoverLetter({ jobHash: B, wroteLetter: true, tailoredCv: true });
});

describe('a letter the run wrote', () => {
  it('is stamped for the new ad', () => {
    expect(letter()).toMatchObject({ draftedFor: B, outdated: false });
  });

  it('stays stamped once accepted', () => {
    store().acceptAllSuggestions('item:coverLetter');
    expect(letter()).toMatchObject({ ...NEW, draftedFor: B, outdated: false });
  });

  it('gets its old stamp back, flagged, when the whole proposal is declined', () => {
    store().declineAISuggestion('item:coverLetter');
    expect(letter()).toMatchObject({ ...OLD, draftedFor: A, outdated: true });
  });

  it('is flagged when only part of the proposal is declined', () => {
    store().declineAISuggestion('item:coverLetter', 'paragraphs');
    expect(letter()).toMatchObject({ paragraphs: OLD.paragraphs, draftedFor: A, outdated: true });
  });
});

describe('a letter the run left in place', () => {
  it('is not flagged by a run that did not tailor the CV', () => {
    useResumeStore.setState((state) => ({
      resume: { ...state.resume, coverLetter: { ...createDefaultCoverLetter(), ...OLD } },
      ai: { ...state.ai, suggestions: {} },
    }));
    store().stampCoverLetter({ jobHash: B, wroteLetter: false, tailoredCv: false });
    expect(letter().outdated).toBeUndefined();
  });
});
