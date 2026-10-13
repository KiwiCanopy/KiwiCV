// @vitest-environment jsdom
import { AIReorganizationControl } from '@/components/modals/ai/template/AIReorganizationControl';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';

vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));

describe('AIReorganizationControl', () => {
  it('explains restructuring and keeps the checkbox operable by name', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container } = render(
      <AIReorganizationControl
        id="restructure-competencies"
        checked={false}
        onCheckedChange={onCheckedChange}
        sectionName="Competencies"
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Restructure Competencies' }));
    expect(
      screen.getByText(
        'Your competencies may be regrouped into clearer categories to better match the selected goal. You’ll review the proposal before anything changes.',
      ),
    ).toBeTruthy();

    await user.click(screen.getByRole('checkbox', { name: 'Restructure Competencies' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect((await axe(container)).violations).toEqual([]);
  });
});
