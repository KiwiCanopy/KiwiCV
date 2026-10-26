// @vitest-environment jsdom
import {
  type CoverLetterRequestInput,
  buildCoverLetterRequest,
  coverLetterBlocker,
} from '@/components/modals/ai/edit/coverLetterRequest';
import { COVER_LETTER_PAGE_WORDS } from '@/components/preview/letterCapacity';
import { letterFurniture } from '@/components/preview/letterCapacity';
import { resolveThemeId } from '@/components/preview/themeIds';
import { COVER_LETTER_LENGTH_PRESETS } from '@/constants/ai';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { hasCoverLetterText } from '@/utils/coverLetter';
import * as lengthUtils from '@/utils/coverLetterLength';
import { coverLetterWordTarget } from '@/utils/coverLetterLength';
import { describe, expect, it, vi } from 'vitest';

/**
 * The one place a control decides whether this run asks for a letter.
 *
 * ⚠️ **`null` is the load-bearing return.** `normalizeCoverLetterRequest` reads a
 * block with an empty job description as `null` — "no letter was asked for" —
 * so a caller that sent its block whenever its panel was mounted would report a
 * failed letter on every ordinary tailoring run. That natural spelling was
 * specifically guarded against on the server, and this file is the guard on the
 * client side of the boundary.
 */

const resume = structuredClone(initialResumeState);

const base = (): CoverLetterRequestInput => ({
  mode: 'job_description',
  isWholeCV: true,
  draftCoverLetter: true,
  jobDescription: 'Senior Frontend Engineer, Berlin. React, TypeScript.',
  targetLang: 'en',
  length: 'medium',
  tone: 'confident',
  matchStyle: false,
  styleSample: '',
  resume,
});

describe('buildCoverLetterRequest', () => {
  it('asks for a letter when the tick, the target, the mode and the ad all agree', () => {
    const request = buildCoverLetterRequest(base());

    expect(request).toMatchObject({
      jobDescription: 'Senior Frontend Engineer, Berlin. React, TypeScript.',
      targetLang: 'en',
      tone: 'confident',
    });
    expect(request?.styleSample).toBeUndefined();
  });

  it.each<[string, Partial<CoverLetterRequestInput>]>([
    ['the tick is off', { draftCoverLetter: false }],
    ['the target is not the whole CV', { isWholeCV: false }],
    ['the run is not tailoring to an ad', { mode: 'professional' }],
    ['the ad is empty', { jobDescription: '' }],
    ['the ad is only whitespace', { jobDescription: '   \n  ' }],
  ])('asks for no letter at all when %s', (_reason, patch) => {
    expect(buildCoverLetterRequest({ ...base(), ...patch })).toBeNull();
  });

  it('resolves the preset to a word count off the page-capacity table', () => {
    const request = buildCoverLetterRequest(base());

    // lunar, themed layout, scale 1, and NEITHER address block — the resume
    // defaults, `createDefaultCoverLetter` included. The fraction itself never
    // crosses the boundary.
    //
    // ⚠️ `.none`, not `.both`. The default letter shows no address blocks, so
    // it prints on the largest page the table has; reading `.both` here is the
    // 2026-09-08 defect written down as an assertion.
    expect(request?.wordTarget).toBe(
      Math.round(COVER_LETTER_LENGTH_PRESETS.medium * COVER_LETTER_PAGE_WORDS.lunar.themed.none),
    );
    expect(typeof request?.wordTarget).toBe('number');
  });

  /**
   * ⚠️ **One variable per case, against the exact number.** This began as a
   * single case that changed the theme, the layout AND the font scale together
   * and asserted only `not.toBe` — which proves that *at least one* of the
   * three reaches `coverLetterWordTarget`. Mutation-proved: hardcoding the
   * scale, or the layout, or the theme individually left it green. The bug it
   * would have missed is silent and billed — a letter sized for scale 1 on a
   * CV rendered at 1.4 overflows the page and costs two AI requests.
   */
  it.each<[string, (resume: ResumeData) => void]>([
    ['the theme', (resume) => void (resume.meta.theme.name = 'elegant')],
    ['the layout', (resume) => void (resume.coverLetter.layout.classicLayout = true)],
    ['the font scale', (resume) => void (resume.meta.theme.params.fontSizeScale = 1.2)],
    // ⚠️ On `elegant`, not the default `lunar`. Lunar's themed columns are
    // `sender: 815, recipient: 815` — identical — so a swapped pair produced
    // the same number and these two cases were green either way
    // (code-reviewer, 2026-09-08). Elegant reads 850 against 835.
    [
      'the sender block',
      (resume) => {
        resume.meta.theme.name = 'elegant';
        resume.coverLetter.layout.showSender = true;
      },
    ],
    [
      'the recipient block',
      (resume) => {
        resume.meta.theme.name = 'elegant';
        resume.coverLetter.layout.showRecipient = true;
      },
    ],
  ])('reads %s the letter will actually render at', (_what, mutate) => {
    const changed = structuredClone(initialResumeState);
    mutate(changed);

    expect(buildCoverLetterRequest({ ...base(), resume: changed })?.wordTarget).toBe(
      coverLetterWordTarget(
        'medium',
        resolveThemeId(changed.meta.theme.name),
        changed.coverLetter.layout.classicLayout,
        changed.meta.theme.params.fontSizeScale ?? 1,
        letterFurniture(changed.coverLetter.layout),
      ),
    );
  });

  /**
   * ⚠️ **The mapping, against the table rather than against itself.** The
   * per-variable cases above recompute their expectation through
   * `letterFurniture`, so they pin that the toggles are READ and nothing more:
   * swapping `sender` and `recipient` inside it left them green, because both
   * sides moved together (code-reviewer, 2026-09-08). These two read the
   * literal column out of `COVER_LETTER_PAGE_WORDS`.
   *
   * `elegant`, not the default `lunar`, for the same reason the swap survived:
   * lunar's themed columns are `sender: 815, recipient: 815`, identical, so no
   * assertion on that theme can tell the two apart.
   */
  it('reads the sender and recipient blocks as different columns', () => {
    const withBlock = (block: 'showSender' | 'showRecipient') => {
      const resume = structuredClone(initialResumeState);
      resume.meta.theme.name = 'elegant';
      resume.coverLetter.layout[block] = true;
      return buildCoverLetterRequest({ ...base(), resume })?.wordTarget;
    };
    const fraction = COVER_LETTER_LENGTH_PRESETS.medium;

    expect(withBlock('showSender')).toBe(
      Math.round(fraction * COVER_LETTER_PAGE_WORDS.elegant.themed.sender),
    );
    expect(withBlock('showRecipient')).toBe(
      Math.round(fraction * COVER_LETTER_PAGE_WORDS.elegant.themed.recipient),
    );
    // 850 against 835 — if these ever tie, this case has stopped proving anything.
    expect(withBlock('showSender')).not.toBe(withBlock('showRecipient'));
  });

  /**
   * The argument ORDER, which no value assertion above can see: `(preset,
   * themeId, classicLayout, fontScale, furniture)` puts two string-typed
   * parameters side by side, and swapping them is a compile-time no-op.
   *
   * ⚠️ `furniture` is a third string-typed parameter, and it is last rather
   * than beside the other two on purpose — `fontScale` separates them, so the
   * only compile-clean swap remains the original `preset`/`themeId` pair this
   * case was written for.
   */
  it('passes the preset, theme, layout, scale and furniture in that order', () => {
    const spy = vi.spyOn(lengthUtils, 'coverLetterWordTarget');
    const changed = structuredClone(initialResumeState);
    changed.meta.theme.name = 'elegant';
    changed.coverLetter.layout.classicLayout = true;
    changed.meta.theme.params.fontSizeScale = 1.2;

    buildCoverLetterRequest({ ...base(), length: 'long', resume: changed });

    // Fifth is the furniture — 'none', since `changed` leaves both address
    // blocks at their default off. Sixth is the unit, derived from
    // `targetLang`; `base()` is an English letter, so `words`.
    expect(spy).toHaveBeenCalledWith('long', 'elegant', true, 1.2, 'none', 'words');
    spy.mockRestore();
  });

  /**
   * ⚠️ The unit is positional too, and it is the one argument whose wrong value
   * is invisible: a character target resolved as words is simply a short
   * letter, in a language nobody here reads.
   */
  it('resolves the target in characters when the letter is Chinese or Japanese', () => {
    const spy = vi.spyOn(lengthUtils, 'coverLetterWordTarget');

    for (const targetLang of ['zh', 'ja']) {
      buildCoverLetterRequest({ ...base(), targetLang, length: 'long' });
      expect(spy).toHaveBeenLastCalledWith(
        'long',
        expect.anything(),
        expect.anything(),
        expect.anything(),
        expect.anything(),
        'characters',
      );
    }
    spy.mockRestore();
  });

  /**
   * ⚠️ A junk preset does NOT fail loudly. `COVER_LETTER_LENGTH_PRESETS[bogus]`
   * is `undefined`, so `wordTarget` is `NaN`, which `JSON.stringify` sends as
   * `null`, which the server reads as a finite 0 and clamps to the minimum — a
   * silent 100-word letter, billed, instead of the length the user picked.
   * `useFlowStore` persists to sessionStorage, so this is arbitrary JSON on
   * read-back, exactly as the tone is.
   */
  it('replaces a length preset the capacity table does not define', () => {
    const request = buildCoverLetterRequest({ ...base(), length: 'enormous' });

    expect(Number.isFinite(request?.wordTarget)).toBe(true);
    expect(request?.wordTarget).toBe(buildCoverLetterRequest({ ...base() })?.wordTarget);
  });

  it('sends the sample instead of the tone, never both', () => {
    const request = buildCoverLetterRequest({
      ...base(),
      matchStyle: true,
      styleSample: '  I write in short, direct sentences.  ',
    });

    expect(request?.styleSample).toBe('I write in short, direct sentences.');
    expect(request?.tone).toBeUndefined();
  });

  /**
   * ⚠️ **Asks for NO letter, rather than one in a voice the user did not pick.**
   *
   * This used to fall back to the tone, which meant choosing "My writing style"
   * and pasting nothing spent two billed requests on a Professional letter. The
   * UI refuses before the run now; this is the boundary that cannot rely on it.
   * Sending neither block is not an option either — that reaches
   * `getCoverLetterPrompt` as `UNKNOWN_LETTER_TONE`, a `LETTER_BAD_REQUEST` no
   * retry can clear.
   */
  it('asks for no letter when "my writing style" is chosen with nothing pasted', () => {
    expect(buildCoverLetterRequest({ ...base(), matchStyle: true, styleSample: '   ' })).toBeNull();
  });

  it('replaces a tone the prompt does not define', () => {
    // `useFlowStore` persists to sessionStorage, so this is arbitrary JSON by
    // the time it is read back.
    expect(buildCoverLetterRequest({ ...base(), tone: 'sarcastic' })?.tone).toBe('professional');
  });

  it('writes the letter in the language this run translates the CV into', () => {
    expect(buildCoverLetterRequest({ ...base(), targetLang: 'de' })?.targetLang).toBe('de');
  });
});

describe('coverLetterBlocker', () => {
  it('refuses only the mode, which is the one with nothing to write from', () => {
    expect(coverLetterBlocker({ mode: 'professional' })).toBe('mode');
    expect(coverLetterBlocker({ mode: 'custom' })).toBe('mode');
    expect(coverLetterBlocker({ mode: null })).toBe('mode');
    expect(coverLetterBlocker({ mode: 'job_description' })).toBeNull();
  });

  /**
   * ⚠️ An existing letter is NOT a refusal, and this is the assertion that says
   * so. It once was: a draft would have overwritten the letter, so the run
   * was blocked. It cannot overwrite any more — the letter arrives as an
   * `item:coverLetter` proposal keeping the previous one as `originalValue`
   * (`applyHandlers.applyCvSuggestion`) — and refusing left a second application
   * with no route to a fresh letter that did not begin with emptying the old one
   * by hand, which is the dead end this removes.
   */
  it('lets a run replace a letter that already exists', () => {
    expect(coverLetterBlocker({ mode: 'job_description' })).toBeNull();
  });
});

describe('hasCoverLetterText', () => {
  it('counts a subject the user typed, not only the body', () => {
    const letter = structuredClone(initialResumeState.coverLetter);
    expect(hasCoverLetterText(letter)).toBe(false);

    letter.subject = 'Application for Senior Frontend Engineer';
    expect(hasCoverLetterText(letter)).toBe(true);
  });

  it('does not count the empty paragraphs a fresh letter carries', () => {
    const letter = structuredClone(initialResumeState.coverLetter);
    letter.paragraphs = ['', '   ', ''];
    expect(hasCoverLetterText(letter)).toBe(false);

    letter.paragraphs = ['', 'Dear Hiring Manager,'];
    expect(hasCoverLetterText(letter)).toBe(true);
  });
});
