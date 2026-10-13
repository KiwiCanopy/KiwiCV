// @vitest-environment jsdom
import { EmptySectionCard } from '@/features/dashboard/design/layout/EmptySectionCard';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileText } from 'lucide-react';
import { describe, expect, it, vi } from 'vitest';

describe('EmptySectionCard', () => {
  it('adds its section by id when the plus button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = render(
      <EmptySectionCard id="skills" label="Skills" icon={FileText} onClick={onClick} />,
    );

    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledWith('skills');

    // The five raw palette hues are gone for good: the card is drawn in
    // tokens, and the section's icon carries the distinction instead.
    expect(container.innerHTML).not.toMatch(/emerald|blue-500|purple|orange|yellow/);
  });

  // Named by one translated sentence, not "Add: Skills" glued per locale.
  it('names the plus button after its section', () => {
    render(<EmptySectionCard id="skills" label="Skills" icon={FileText} onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Add Skills' })).toBeTruthy();
  });

  // A custom section title is user-typed; `$&` must not be read as a pattern.
  it('keeps a dollar sign in a user-typed title literal', () => {
    render(<EmptySectionCard id="x" label="Pay $& Perks $$" icon={FileText} onClick={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Add Pay $& Perks $$' })).toBeTruthy();
  });
});
