// @vitest-environment jsdom
import { Field } from '@/components/ui/Field';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

describe('Field', () => {
  it('associates label, help, warning, and error with the control', async () => {
    const { container } = render(
      <Field
        label="Email"
        description="Used for replies"
        warning="Check the spelling"
        error="Enter a valid email"
      >
        {(controlProps) => <input {...controlProps} />}
      </Field>,
    );
    const input = screen.getByRole('textbox', { name: 'Email' });
    const describedBy = input.getAttribute('aria-describedby') ?? '';

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(describedBy.split(' ')).toHaveLength(3);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('announces a required control as required', () => {
    render(
      <Field label="Email" required>
        {(controlProps) => <input {...controlProps} />}
      </Field>,
    );

    expect(screen.getByRole('textbox', { name: 'Email' }).getAttribute('aria-required')).toBe(
      'true',
    );
  });

  it('leaves an optional control unmarked', () => {
    render(<Field label="Email">{(controlProps) => <input {...controlProps} />}</Field>);

    expect(screen.getByRole('textbox', { name: 'Email' }).hasAttribute('aria-required')).toBe(
      false,
    );
  });
});
