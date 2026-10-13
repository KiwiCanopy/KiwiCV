// @vitest-environment jsdom
import { CvDefaultsSection } from '@/features/settings/sections/CvDefaultsSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

function renderSection(overrides: Partial<Parameters<typeof CvDefaultsSection>[0]> = {}) {
  const handlers = {
    onTempPatternChange: vi.fn(),
    onStartEditingPattern: vi.fn(),
    onSavePattern: vi.fn(),
    onCancelEditingPattern: vi.fn(),
  };
  render(
    <CvDefaultsSection
      title="CV Defaults"
      projectNameLabel="Project name pattern"
      projectNameDescription="How new files are named."
      availableVariablesLabel="Available variables"
      patternTip="Tip goes here."
      isEditingPattern={false}
      patternValue="{name}"
      tempPattern="{name}"
      t={(k) => k}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe('CvDefaultsSection', () => {
  it('starts editing from the edit control when not editing', async () => {
    const user = userEvent.setup();
    const { onStartEditingPattern } = renderSection();

    await user.click(screen.getByRole('button', { name: 'common.edit' }));
    expect(onStartEditingPattern).toHaveBeenCalledTimes(1);
  });

  it('saves and cancels from their controls while editing', async () => {
    const user = userEvent.setup();
    const { onSavePattern, onCancelEditingPattern } = renderSection({ isEditingPattern: true });

    await user.click(screen.getByRole('button', { name: 'common.save' }));
    expect(onSavePattern).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'common.cancel' }));
    expect(onCancelEditingPattern).toHaveBeenCalledTimes(1);
  });

  it('disables the pattern input until editing begins', () => {
    renderSection({ isEditingPattern: false });
    const input = screen.getByPlaceholderText('{date-YYYYMMDD}_{theme}_{name}') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });
});
