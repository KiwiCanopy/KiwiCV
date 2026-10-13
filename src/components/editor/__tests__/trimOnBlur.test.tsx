// @vitest-environment jsdom
import { trimOnBlur } from '@/components/editor/BasicsForm/trimOnBlur';
import { useBasicsForm } from '@/components/editor/BasicsForm/useBasicsForm';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { initialResumeState } from '@/types/resume';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * The typed half of the trimmed-`basics` invariant. The sanitizer covers
 * import, sync and AI apply; `updateBasics` is the path it does not see, and
 * `onChange` cannot trim because it fires per keystroke.
 */

const blur = (name: string, value: string) =>
  ({ target: { name, value } }) as unknown as React.FocusEvent<HTMLInputElement>;

describe('trimOnBlur', () => {
  it('re-emits the trimmed value through the same onChange', () => {
    const onChange = vi.fn();
    trimOnBlur<HTMLInputElement>(onChange)(blur('name', '  Ada Lovelace  '));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0].target).toEqual({ name: 'name', value: 'Ada Lovelace' });
  });

  /**
   * ⚠️ Half two, and it is not implied by the case above: a wrapper that always
   * called `onChange` would pass that one and write to the store on every blur
   * of every untouched field, dirtying undo history and the unsaved-changes
   * flag.
   */
  it('does not call onChange when there is nothing to trim', () => {
    const onChange = vi.fn();
    trimOnBlur<HTMLInputElement>(onChange)(blur('name', 'Ada Lovelace'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('leaves the interior alone', () => {
    const onChange = vi.fn();
    trimOnBlur<HTMLInputElement>(onChange)(blur('summary', '  two   spaces  '));
    expect(onChange.mock.calls[0][0].target.value).toBe('two   spaces');
  });
});

/**
 * ⚠️ The synthesised event carries `name` and `value` and nothing else, so this
 * pins that those are all `handleChange` reads. A `handleChange` that grew a
 * third read would silently get `undefined` from every blur — the failure would
 * be in the store, not in a stack trace. Driven through the real hook rather
 * than by reading the source, because the source is what would change.
 */
describe('useBasicsForm.handleChange accepts what trimOnBlur emits', () => {
  const setup = () => {
    act(() => {
      useResumeStore.getState().setResume(structuredClone(initialResumeState));
    });
    return renderHook(() => useBasicsForm({ defaultCollapsed: true }));
  };

  it('writes a trimmed scalar', () => {
    const { result } = setup();
    act(() => {
      trimOnBlur<HTMLInputElement>(result.current.handleChange)(blur('name', '  Ada  '));
    });
    expect(useResumeStore.getState().resume.basics.name).toBe('Ada');
  });

  /**
   * The dotted-name branch: `handleChange` splits on `.` and merges into
   * `basics.location`. A synthesised event missing `name` would write the whole
   * location block away rather than one field.
   */
  it('writes a trimmed location field without dropping its siblings', () => {
    const { result } = setup();
    act(() => {
      result.current.handleChange(
        blur('location.region', 'England') as unknown as React.ChangeEvent<HTMLInputElement>,
      );
    });
    act(() => {
      trimOnBlur<HTMLInputElement>(result.current.handleChange)(blur('location.city', ' London '));
    });

    const { location } = useResumeStore.getState().resume.basics;
    expect(location.city).toBe('London');
    expect(location.region).toBe('England');
  });
});
