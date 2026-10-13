// @vitest-environment jsdom
import { ImportWarningsModal } from '@/components/modals/ImportWarningsModal';
import type { ImportWarning } from '@/utils/validation';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const WARNINGS: ImportWarning[] = [
  { section: 'work', item: 'Acme', field: 'startDate', message: 'warn.missing_date' },
];

function renderModal(overrides = {}) {
  const props = { isOpen: true, onClose: vi.fn(), warnings: WARNINGS, ...overrides };
  render(<ImportWarningsModal {...props} />);
  return props;
}

describe('ImportWarningsModal', () => {
  it('names the dialog by its warnings title and lists the warning', () => {
    renderModal();
    expect(screen.getByRole('dialog', { name: /import_warnings_title/i })).toBeTruthy();
    expect(screen.getByText('startDate')).toBeTruthy();
    expect(screen.getByText('warn.missing_date')).toBeTruthy();
  });

  it('stays closed when there are no warnings', () => {
    renderModal({ warnings: [] });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('closes from the acknowledge button', async () => {
    const user = userEvent.setup();
    const props = renderModal();
    await user.click(screen.getByRole('button', { name: /common\.success/i }));
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  /**
   * This modal read `editor.sections.<section>` with no `basics` case
   * while `GlobalImportWarningsModal` had one, so the same warning was labelled
   * "Personal Details" there and rendered the literal string
   * `editor.sections.basics` here. Both files now assert the same expectations
   * against the shared inventory.
   *
   * ⚠️ Rendering the component is the point — the helper's own unit coverage
   * lives in `importWarningLabels.test.ts` and says nothing about the call here.
   */
  it.each([
    ['work', 'editor.sections.work'],
    ['skills', 'editor.sections.skills'],
    ['basics', 'editor.supersections.basics.title'],
  ])('heads a %s warning with %s', (section, expected) => {
    renderModal({ warnings: [{ section, field: 'f', message: 'warn.m' }] });
    expect(screen.getByText(expected)).toBeTruthy();
  });

  it('falls back to the raw section for one it has no label for', () => {
    renderModal({ warnings: [{ section: 'meta', field: 'f', message: 'warn.m' }] });
    expect(screen.getByText('meta')).toBeTruthy();
    expect(screen.queryByText('editor.sections.meta')).toBeNull();
  });
});
