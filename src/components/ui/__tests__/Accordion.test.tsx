// @vitest-environment jsdom
import { AccordionItem } from '@/components/ui/Accordion';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

describe('AccordionItem', () => {
  it('exposes disclosure state and names contextual actions', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    const onToggleVisibility = vi.fn();
    const { container } = render(
      <AccordionItem title="Experience" onDelete={onDelete} onToggleVisibility={onToggleVisibility}>
        <p>Panel content</p>
      </AccordionItem>,
    );
    const disclosure = screen.getByRole('button', { name: 'Experience' });

    expect(disclosure.getAttribute('aria-expanded')).toBe('false');
    // While collapsed the panel is not rendered, so aria-controls must not
    // point at an element that does not exist.
    expect(disclosure.hasAttribute('aria-controls')).toBe(false);

    await user.click(disclosure);
    expect(disclosure.getAttribute('aria-expanded')).toBe('true');
    expect(
      document.getElementById(disclosure.getAttribute('aria-controls') ?? '')?.textContent,
    ).toContain('Panel content');

    await user.click(screen.getByRole('button', { name: /Hide “Experience”/ }));
    await user.click(screen.getByRole('button', { name: /Delete “Experience”/ }));
    expect(onToggleVisibility).toHaveBeenCalledOnce();
    expect(onDelete).toHaveBeenCalledOnce();
    expect((await axe(container)).violations).toEqual([]);
  });
});
