import { getAISuggestionBreakdown } from '@/utils/ai';
import { describe, expect, it } from 'vitest';

/**
 * What the rail pill, the pending bar and the Improve button all read.
 *
 * The rule it implements is one proposal per thing the user can act on: an
 * `item:` key and the `section:` container recording the same rewrite are ONE
 * proposal, not two, so the section key is suppressed when items exist.
 *
 * ⚠️ **That suppression tested a prefix, and one key does not have it.**
 * `item:basics` carries no vId, so `startsWith('item:basics:')` is false and
 * both keys counted — one Improve on Personal Details reading "2 proposals".
 * It was once unreachable, because `section:basics` graded as a no-op and
 * never recorded a proposal at all; the fix to `hasActualChanges` is what made
 * it visible. `cleanupContainerSuggestions` (`lifecycle.ts:9`) has always
 * matched both spellings — this was the copy that did not.
 */
describe('counting the proposals a section has pending', () => {
  const proposal = { originalValue: {}, improvedValue: { summary: 'x' } };

  it('counts a lone section proposal once', () => {
    const { content } = getAISuggestionBreakdown({ 'section:coverLetter': proposal }, [
      'coverLetter',
    ]);
    expect(content).toBe(1);
  });

  it('counts one rewrite of the basics once, not once per key that records it', () => {
    const { content } = getAISuggestionBreakdown(
      { 'section:basics': proposal, 'item:basics': proposal },
      ['basics'],
    );
    expect(content).toBe(1);
  });

  it('still suppresses the container for a list section, where items carry a vId', () => {
    const { content } = getAISuggestionBreakdown(
      { 'section:work': proposal, 'item:work:v1': proposal, 'item:work:v2': proposal },
      ['work'],
    );
    expect(content).toBe(2);
  });

  /** Non-vacuity: the suppression must be doing something, not filtering everything. */
  it('counts item proposals that have no container beside them', () => {
    const { content } = getAISuggestionBreakdown({ 'item:work:v1': proposal }, ['work']);
    expect(content).toBe(1);
  });
});
