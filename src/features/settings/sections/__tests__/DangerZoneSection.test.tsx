// @vitest-environment jsdom
import { DangerZoneSection } from '@/features/settings/sections/DangerZoneSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderSection(overrides: Partial<Parameters<typeof DangerZoneSection>[0]> = {}) {
  const onClearData = vi.fn();
  render(
    <DangerZoneSection
      title="Danger Zone"
      actionTitle="Delete all data"
      description="This wipes everything from this browser."
      buttonLabel="Delete Everything"
      onClearData={onClearData}
      {...overrides}
    />,
  );
  return { onClearData };
}

describe('DangerZoneSection', () => {
  it('triggers the clear-data flow when the destructive button is clicked', async () => {
    const user = userEvent.setup();
    const { onClearData } = renderSection();

    // The button is only the trigger; the confirmation lives in the parent's
    // onClearData. The migration must keep that single call intact.
    await user.click(screen.getByRole('button', { name: /delete everything/i }));
    expect(onClearData).toHaveBeenCalledTimes(1);
  });

  it('keeps the destructive button in the accessibility tree', () => {
    renderSection();
    expect(screen.getByRole('button', { name: /delete everything/i })).toBeTruthy();
  });
});
