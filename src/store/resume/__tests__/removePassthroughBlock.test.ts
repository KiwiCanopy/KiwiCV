// @vitest-environment jsdom
import { useResumeStore } from '@/store/resume/useResumeStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { toResumeJson } from '@/utils/passthrough';
import { beforeEach, describe, expect, it } from 'vitest';

/** Removing a kept block must leave no copy of it in the store. */
const SECRET = { token: 'only-in-the-extension-block' };

beforeEach(() => {
  localStorage.clear();
  const resume = {
    ...buildSingleItemResume('lunar'),
    passthrough: { $schema: 'https://example.com/schema.json', 'x-tool': SECRET },
  };
  useResumeStore.setState({ resume });
});

describe('removePassthroughBlock', () => {
  it('deletes the named block and keeps the others', () => {
    useResumeStore.getState().removePassthroughBlock('x-tool');

    const { resume } = useResumeStore.getState();
    expect(resume.passthrough).toEqual({ $schema: 'https://example.com/schema.json' });
    expect(toResumeJson(resume)).not.toHaveProperty('x-tool');
    expect(JSON.stringify(resume)).not.toContain(SECRET.token);
  });

  it('leaves the store alone for a key that is not kept', () => {
    const before = useResumeStore.getState().resume;

    useResumeStore.getState().removePassthroughBlock('not-there');

    expect(useResumeStore.getState().resume).toBe(before);
  });

  it('does not reach an inherited property', () => {
    useResumeStore.getState().removePassthroughBlock('toString');

    expect(Object.keys(useResumeStore.getState().resume.passthrough)).toHaveLength(2);
  });
});
