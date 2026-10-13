// @vitest-environment jsdom
import { StatePanel } from '@/components/ui/StatePanel';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';

describe('StatePanel', () => {
  it('announces errors immediately and marks loading busy', async () => {
    const { container, rerender } = render(
      <StatePanel variant="error" title="Backup failed" description="Try again." />,
    );

    expect(screen.getByRole('alert').textContent).toContain('Backup failed');

    rerender(<StatePanel variant="loading" title="Creating backup" />);
    expect(screen.getByRole('status').textContent).toContain('Creating backup');
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
    expect((await axe(container)).violations).toEqual([]);
  });

  it('announces loading, success, and warning without being asked', () => {
    for (const variant of ['loading', 'success', 'warning'] as const) {
      const { unmount } = render(<StatePanel variant={variant} title="Working" />);
      expect(screen.getByRole('status')).toBeTruthy();
      unmount();
    }
  });

  it('stays silent for the resting empty and disabled states', () => {
    for (const variant of ['empty', 'disabled'] as const) {
      const { unmount } = render(<StatePanel variant={variant} title="Nothing here" />);
      expect(screen.queryByRole('status')).toBeNull();
      expect(screen.queryByRole('alert')).toBeNull();
      unmount();
    }
  });

  it('lets a caller force announcement on a resting state', () => {
    render(<StatePanel variant="empty" title="No backups yet" announce />);

    expect(screen.getByRole('status').textContent).toContain('No backups yet');
  });

  it('announces the description, where the specific information lives', () => {
    render(
      <StatePanel variant="error" title="Import failed" description="The file was not readable." />,
    );

    expect(screen.getByRole('alert').textContent).toContain('Import failed');
    expect(screen.getByRole('alert').textContent).toContain('The file was not readable.');
  });

  it('does not duplicate the title in the visible panel', () => {
    render(<StatePanel variant="success" title="Backup complete" />);

    // The live region carries a copy for the announcement, so the visible
    // heading and the announced text are separate nodes with the same text.
    expect(screen.getAllByText('Backup complete')).toHaveLength(2);
    expect(screen.getByRole('status').className).toContain('sr-only');
  });
});
