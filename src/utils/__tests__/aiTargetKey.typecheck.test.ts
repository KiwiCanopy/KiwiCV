import type { ComponentProps } from 'react';

import type { AISuggestButton } from '@/components/ui/AISuggestButton';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { getAITrackingParams } from '@/utils/ai';
import { type AITargetKey, isAITargetKey, itemTarget, sectionTarget } from '@/utils/aiTarget';
import { describe, expect, expectTypeOf, it } from 'vitest';

/**
 * Every target the app takes is an `AITargetKey`, so a misspelled key fails to
 * compile. The `@ts-expect-error` lines are checked by `npx tsc -b` (never
 * `tsc --noEmit`, which checks nothing here): widen `AITargetKey` to `string` and
 * each becomes an unused directive, `TS2578`. The body never runs; it is
 * referenced below so `noUnusedLocals` is satisfied without touching the store.
 */
function _misspelledTargetsDoNotCompile() {
  const store = useResumeStore.getState();

  // Positive control: without these the negatives could pass on an empty domain.
  store.openAIModal('cv');
  store.openAIModal(sectionTarget('work'));
  store.openAIModal(itemTarget('work', 'v1'));
  store.acceptAllSuggestions('cv');
  void store.ai.suggestions[itemTarget('basics')];

  // @ts-expect-error the whole-CV key is lowercase.
  store.openAIModal('CV');
  // @ts-expect-error a bare section name is not a target.
  store.openAIModal('work');
  // @ts-expect-error `items:` is not a kind.
  store.acceptAllSuggestions('items:work');
  // @ts-expect-error a suggestion is recorded under a target, never a section name.
  void store.ai.suggestions['work'];
  // @ts-expect-error the analytics label takes a target too.
  getAITrackingParams('Cv');
  // @ts-expect-error the AI button's target is a key, not a section name.
  const buttonTarget: ComponentProps<typeof AISuggestButton>['target'] = 'work';
  void buttonTarget;

  const fromStorage: string = 'section:work';
  // @ts-expect-error an outside `string` enters through `isAITargetKey`, not as-is.
  store.openAIModal(fromStorage);
  if (isAITargetKey(fromStorage)) store.openAIModal(fromStorage);
}

describe('AITargetKey', () => {
  it('is enforced by @ts-expect-error, which tsc checks in both directions', () => {
    expect(typeof _misspelledTargetsDoNotCompile).toBe('function');
    expectTypeOf<AITargetKey>().not.toEqualTypeOf<string>();
    expectTypeOf(sectionTarget('work')).toExtend<AITargetKey>();
    expectTypeOf(itemTarget('work', 'v1')).toExtend<AITargetKey>();
  });
});
