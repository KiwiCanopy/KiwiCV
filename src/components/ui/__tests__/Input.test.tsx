// @vitest-environment jsdom
import { Input } from '@/components/ui/Input';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

describe('Input', () => {
  it('associates its label and validation message with the input', async () => {
    const { container } = render(
      <Input label="Website" value="" onChange={vi.fn()} error="Enter a valid URL" />,
    );
    const input = screen.getByRole('textbox', { name: 'Website' });
    const error = screen.getByText('Enter a valid URL');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(error.id);
    expect((await axe(container)).violations).toEqual([]);
  });

  // #62: a warning shown on blur, after focus has left, must still be announced.
  it('announces a warning through a live region mounted before it appears', async () => {
    const { container, rerender } = render(
      <Input label="Job posting link" value="" onChange={vi.fn()} warning={null} />,
    );
    const region = screen.getByRole('status');
    expect(region.textContent).toBe('');

    rerender(
      <Input label="Job posting link" value="x" onChange={vi.fn()} warning="Not a web address" />,
    );

    expect(screen.getByRole('status')).toBe(region);
    expect(region.textContent).toBe('Not a web address');
    expect(region.getAttribute('aria-live')).toBe('polite');
    const input = screen.getByRole('textbox', { name: 'Job posting link' });
    expect(input.getAttribute('aria-describedby')).toContain(region.id);
    // A warning does not block, so the field is not marked invalid.
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('keeps the warning out of the live region while an error shows', () => {
    render(
      <Input label="Website" value="" onChange={vi.fn()} error="Enter a valid URL" warning="Odd" />,
    );

    expect(screen.getByRole('status').textContent).toBe('');
  });
});
