import { type ResumeStore } from '@/store/resume/types';
import { itemTarget } from '@/utils/aiTarget';
import { hasCoverLetterText } from '@/utils/coverLetter';

export interface CoverLetterStampInput {
  /** SHA-256 of the job ad this run tailored to; absent outside job-ad mode. */
  jobHash: string | undefined;
  /** This run wrote the letter's content: a drafted letter, or an Improve run on the letter itself. */
  wroteLetter: boolean;
  /** The run tailored the CV: a letter left in place may now belong to another ad. */
  tailoredCv: boolean;
}

/**
 * Records which ad the letter belongs to after a run. A letter the run wrote is
 * stamped current, including a run that returned it unchanged: the model judged
 * it fits the ad. Declining any field of its proposal restores the stamp the
 * kept letter deserves (`onDecline`, applied in `declineAISuggestion`), since a
 * letter that is partly the user's own is no longer wholly this ad's. A letter
 * a tailoring run left in place is flagged `outdated` unless drafted for that ad.
 */
export const stampCoverLetter = (state: ResumeStore, input: CoverLetterStampInput) => {
  const { jobHash, wroteLetter, tailoredCv } = input;
  if (!jobHash) return;
  const letter = state.resume.coverLetter;

  if (wroteLetter) {
    const proposal = state.ai.suggestions[itemTarget('coverLetter')];
    // A proposal still pending from an earlier run keeps the stamp it recorded,
    // which describes the user's own letter rather than the last draft.
    if (proposal && !proposal.onDecline) {
      proposal.onDecline = {
        draftedFor: letter.draftedFor,
        outdated: letter.outdated === true || letter.draftedFor !== jobHash,
      };
    }
    letter.draftedFor = jobHash;
    letter.outdated = false;
    return;
  }

  if (tailoredCv && hasCoverLetterText(letter) && letter.draftedFor !== jobHash) {
    letter.outdated = true;
  }
};
