// @vitest-environment jsdom
import { BasicsFormField } from '@/components/editor/BasicsForm/BasicsFormField';
import { BasicsFormTextArea } from '@/components/editor/BasicsForm/BasicsFormTextArea';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

/**
 * That the trim is actually **wired** to the two field components.
 *
 * ⚠️ **`trimOnBlur.test.tsx` does not cover this, and the architect pass proved
 * it with two mutations that both left the whole suite green (1990/106):**
 * deleting `onBlur={trimOnBlur(onChange)}` from *both* components, and dropping
 * the `if (onBlur) onBlur(e)` forward inside the shared `Input`. That file
 * exercises the closure and `useBasicsForm.handleChange` in isolation and never
 * renders either component, so the entire typed-path half of the trim fix — whose whole
 * justification is "a field added later is covered by construction" — was held
 * by nothing.
 *
 * This is the lesson recorded before and restated in a later commit
 * message ("pinning the callee leaves the call site free"), made one
 * directory over on the same day.
 *
 * ⚠️ So the assertions go through `render` + `fireEvent.blur`, i.e. through the
 * real `Input` / `TextArea`, which is what makes them fail on the *second*
 * mutation as well as the first. A test that called `trimOnBlur` directly would
 * pass while the prop was unplugged.
 */

const PADDED = '  Ada Lovelace  ';

describe('the basics field components trim on blur', () => {
  it('BasicsFormField re-emits the trimmed value through onChange', () => {
    const onChange = vi.fn();
    render(<BasicsFormField label="Full Name" name="name" value="" onChange={onChange} />);

    const input = screen.getByLabelText('Full Name');
    fireEvent.change(input, { target: { value: PADDED } });
    fireEvent.blur(input);

    expect(onChange.mock.calls.map((call) => call[0].target.value)).toContain('Ada Lovelace');
  });

  it('BasicsFormTextArea re-emits the trimmed value through onChange', () => {
    const onChange = vi.fn();
    render(<BasicsFormTextArea label="Summary" name="summary" value="" onChange={onChange} />);

    const textarea = screen.getByLabelText('Summary');
    fireEvent.change(textarea, { target: { value: PADDED } });
    fireEvent.blur(textarea);

    expect(onChange.mock.calls.map((call) => call[0].target.value)).toContain('Ada Lovelace');
  });

  /**
   * ⚠️ Half two. Both cases above use `toContain` because the underlying
   * `Input` / `TextArea` also fire their own deferred `onChange` on blur, so
   * there are legitimately two calls. That makes "did the trimmed value ever
   * appear" the only honest assertion — and it means a component that emitted
   * the trimmed value *first* and the raw one *second* would pass it while
   * storing the raw one. This pins the order: the last write wins, and it must
   * be the trimmed one.
   */
  it('emits the trimmed value last, so it is the one that lands', () => {
    const onChange = vi.fn();
    render(<BasicsFormField label="Full Name" name="name" value="" onChange={onChange} />);

    const input = screen.getByLabelText('Full Name');
    fireEvent.change(input, { target: { value: PADDED } });
    fireEvent.blur(input);

    const values = onChange.mock.calls.map((call) => call[0].target.value);
    expect(values.length).toBeGreaterThan(0);
    expect(values[values.length - 1]).toBe('Ada Lovelace');
  });

  /**
   * The control: a value with nothing to trim must not produce an extra write.
   * Without it, "the trimmed value is emitted" is satisfied by a component that
   * re-emits on every blur of every untouched field.
   */
  it('does not add a write when there is nothing to trim', () => {
    const onChange = vi.fn();
    render(<BasicsFormField label="Full Name" name="name" value="Ada" onChange={onChange} />);

    const input = screen.getByLabelText('Full Name');
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });
});
