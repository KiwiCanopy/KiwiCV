// @vitest-environment jsdom
import { ExportOption } from '@/components/ui/ExportOption';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

// jsdom computes no colours, so `color-contrast` is permanently incomplete.
// Everything else that axe cannot decide is treated as a finding, because
// `form-field-multiple-labels` reports incomplete rather than violating.
const JSDOM_BLIND_RULES = new Set(['color-contrast']);

async function expectNoAxeFindings(container: HTMLElement) {
  const results = await axe(container);
  expect(results.violations).toEqual([]);
  expect(results.incomplete.map((f) => f.id).filter((id) => !JSDOM_BLIND_RULES.has(id))).toEqual(
    [],
  );
}

describe('ExportOption', () => {
  // Every consumer today (three cards in PdfFooterSection) takes this path.
  it('toggles from anywhere on the card when there is no help trigger', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <ExportOption
        label="Include footer"
        description="Adds a page footer to the PDF"
        checked={false}
        onChange={onChange}
      />,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card.tagName).toBe('LABEL');

    await user.click(card);
    await user.click(screen.getByText('Include footer'));
    await user.click(screen.getByText('Adds a page footer to the PDF'));

    expect(onChange).toHaveBeenCalledTimes(3);
    await expectNoAxeFindings(container);
  });

  it('keeps the help trigger out of the label and out of the toggle', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <ExportOption
        label="Include footer"
        description="Adds a page footer to the PDF"
        checked={false}
        onChange={onChange}
        infoHint="Where the footer appears"
      />,
    );

    for (const label of container.querySelectorAll('label')) {
      expect(label.querySelector('button')).toBeNull();
    }

    await user.click(screen.getByText('Include footer'));
    expect(onChange).toHaveBeenCalledOnce();

    await user.click(screen.getByRole('button'));
    expect(onChange).toHaveBeenCalledOnce();

    // The description is no longer part of the checkbox's name; it is its
    // description, so it is still announced.
    const checkbox = screen.getByRole('checkbox', { name: 'Include footer' });
    const describedBy = checkbox.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)?.textContent).toBe(
      'Adds a page footer to the PDF',
    );

    // The full-card target here comes from an inset ::after on the label. jsdom
    // does not lay out pseudo-elements, so this asserts the mechanism is
    // present rather than that the card is clickable; that is not claimed.
    const labelEl = container.querySelector('label') as HTMLElement;
    expect(labelEl.className).toContain('after:inset-0');

    await expectNoAxeFindings(container);
  });
});
