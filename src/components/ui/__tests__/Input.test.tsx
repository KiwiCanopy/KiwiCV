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
});
