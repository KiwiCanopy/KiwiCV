// @vitest-environment jsdom
import { DateFormatSelector } from '@/components/ui/date-picker/DateFormatSelector';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

const translate = (_key: string, fallback: string) => fallback;

describe('DateFormatSelector', () => {
  it('keeps the option list closed until the trigger is clicked', () => {
    render(<DateFormatSelector value="month_year" onChange={vi.fn()} translate={translate} />);
    // Only the trigger renders its own label; the other options stay unmounted.
    expect(screen.queryByRole('button', { name: 'Year' })).toBeNull();
  });

  it('selects a format from the open dropdown', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<DateFormatSelector value="month_year" onChange={onChange} translate={translate} />);

    await user.click(screen.getByRole('button', { name: /month & year/i }));
    await user.click(screen.getByRole('button', { name: 'Year' }));

    expect(onChange).toHaveBeenCalledWith('year');
  });
});
