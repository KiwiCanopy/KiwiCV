// @vitest-environment jsdom
import { GlobalImportWarningsModal } from '@/components/modals/GlobalImportWarningsModal';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const closeWarnings = vi.fn();
let storeValue: {
  isOpen: boolean;
  warnings: Array<{ section: string; field: string; message: string; item?: string }>;
  isCritical: boolean;
  closeWarnings: () => void;
};

vi.mock('@/store/ui/useImportWarningsStore', () => ({
  useImportWarningsStore: () => storeValue,
}));

function setup(overrides: Partial<typeof storeValue> = {}) {
  storeValue = {
    isOpen: true,
    warnings: [{ section: 'work', field: 'startDate', message: 'warn.missing_date' }],
    isCritical: false,
    closeWarnings,
    ...overrides,
  };
  render(<GlobalImportWarningsModal />);
}

describe('GlobalImportWarningsModal', () => {
  it('shows the warnings title when not critical', () => {
    setup();
    expect(screen.getByRole('dialog', { name: /import_warnings_title/i })).toBeTruthy();
  });

  it('shows the error title when critical', () => {
    setup({ isCritical: true });
    expect(screen.getByRole('dialog', { name: /import_error_title/i })).toBeTruthy();
  });

  it('renders nothing when closed', () => {
    setup({ isOpen: false });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('continues via closeWarnings', async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole('button', { name: /common\.continue/i }));
    expect(closeWarnings).toHaveBeenCalledTimes(1);
  });

  /**
   * The two modals disagreed about "what the warnings UI can label", so
   * this is asserted in both files with the same expectations. The mock `t`
   * returns the key it is given, which is also what the real `t` does for a key
   * it cannot find — so these cases read the *chosen* key directly.
   *
   * ⚠️ Rendering the component is the point. `labelKeyForWarningSection` has its
   * own unit coverage in `importWarningLabels.test.ts`; that proves nothing about
   * the line in this file that calls it.
   */
  it.each([
    ['work', 'editor.sections.work'],
    ['skills', 'editor.sections.skills'],
    ['basics', 'editor.supersections.basics.title'],
  ])('heads a %s warning with %s', (section, expected) => {
    setup({ warnings: [{ section, field: 'f', message: 'warn.m' }] });
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('falls back to the raw section for one it has no label for', () => {
    setup({ warnings: [{ section: 'meta', field: 'f', message: 'warn.m' }] });
    expect(screen.getByText('meta')).toBeTruthy();
    expect(screen.queryByText('editor.sections.meta')).toBeNull();
  });
});
