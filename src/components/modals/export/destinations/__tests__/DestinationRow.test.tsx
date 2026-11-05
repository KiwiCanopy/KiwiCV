// @vitest-environment jsdom
import { DestinationRow } from '@/components/modals/export/destinations/DestinationRow';
import { type DestinationRunState } from '@/components/modals/export/types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function renderRow(run: DestinationRunState) {
  render(
    <DestinationRow
      icon={null}
      label="Google Drive"
      description="Uploads the package."
      checked
      disabled={false}
      run={run}
      onCheckedChange={() => {}}
    />,
  );
}

describe('DestinationRow notice (#41)', () => {
  it('shows a finished run’s notice beside its status', () => {
    renderRow({ status: 'done', notice: 'Went to MyCV_2.' });

    expect(screen.getByText('sync.export_dialog.status_done')).toBeTruthy();
    expect(screen.getByText('Went to MyCV_2.')).toBeTruthy();
  });

  it('adds nothing to a finished run without one', () => {
    renderRow({ status: 'done' });

    expect(
      screen.getByText('sync.export_dialog.status_done').closest('div')?.querySelector('p'),
    ).toBeNull();
  });
});
