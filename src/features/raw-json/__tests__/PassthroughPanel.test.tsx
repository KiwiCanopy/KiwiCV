// @vitest-environment jsdom
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { PassthroughPanel } from '@/features/raw-json/PassthroughPanel';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, vars?: Record<string, string>) => (vars?.name ? `${key}:${vars.name}` : key),
    language: 'en',
  }),
}));

const seed = (passthrough: Record<string, unknown>) =>
  useResumeStore.setState({
    resume: { ...buildSingleItemResume('lunar'), passthrough },
    isSyncingData: false,
  });

const renderPanel = () =>
  render(
    <>
      <PassthroughPanel />
      <ConfirmModal />
    </>,
  );

/** Rendered and not inside a collapsed (`hidden`) disclosure panel. */
const isShown = (node: HTMLElement | null) => !!node && !node.closest('[hidden]');

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /raw_json\.passthrough\.title/ }));
};

beforeEach(() => {
  localStorage.clear();
  seed({ $schema: 'https://example.com/schema.json', 'x-tool': { a: 1 } });
});

afterEach(() => {
  useConfirmStore.getState().close();
});

describe('PassthroughPanel', () => {
  it('renders nothing while no block is kept', () => {
    seed({});
    const { container } = render(<PassthroughPanel />);
    expect(container.innerHTML).toBe('');
  });

  it('is collapsed by default and lists every block with its size once opened', async () => {
    const user = userEvent.setup();
    renderPanel();

    const trigger = screen.getByRole('button', { name: /raw_json\.passthrough\.title/ });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(isShown(screen.queryByText('x-tool'))).toBe(false);

    await openPanel(user);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(isShown(screen.getByText('$schema'))).toBe(true);
    expect(isShown(screen.getByText('x-tool'))).toBe(true);
    // `{"a":1}` is 7 bytes; a block never reads as zero.
    expect(screen.getAllByText('0.1 kB')).toHaveLength(2);
  });

  it('shows a block’s JSON behind its own disclosure', async () => {
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    expect(screen.queryByLabelText('x-tool')).toBeNull();
    await user.click(screen.getByRole('button', { name: /^x-tool/ }));

    expect(screen.getByLabelText('x-tool').textContent).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('removes a block only after confirmation, and reports it without claiming backups are clean', async () => {
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.click(screen.getByRole('button', { name: 'common.remove_named:$schema' }));
    const dialog = await screen.findByRole('alertdialog');
    expect(dialog.textContent).toContain('raw_json.passthrough.remove_confirm_title:$schema');
    expect(useResumeStore.getState().resume.passthrough).toHaveProperty('$schema');

    await user.click(screen.getByRole('button', { name: 'common.remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(useResumeStore.getState().resume.passthrough).toEqual({ 'x-tool': { a: 1 } });
    expect(isShown(screen.getByText('raw_json.passthrough.removed_title:$schema'))).toBe(true);
    expect(isShown(screen.getByText('raw_json.passthrough.removed_desc'))).toBe(true);
    // Focus lands on the remove button that took the removed row's place.
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: 'common.remove_named:x-tool' }),
      ),
    );
  });

  it('keeps the block when the confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.click(screen.getByRole('button', { name: 'common.remove_named:x-tool' }));
    await user.click(await screen.findByRole('button', { name: 'common.cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(useResumeStore.getState().resume.passthrough).toHaveProperty('x-tool');
    expect(screen.queryByText(/removed_title/)).toBeNull();
  });

  it('stays mounted after the last block goes, with focus on its own trigger', async () => {
    seed({ only: true });
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.click(screen.getByRole('button', { name: 'common.remove_named:only' }));
    await user.click(await screen.findByRole('button', { name: 'common.remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(useResumeStore.getState().resume.passthrough).toEqual({});
    expect(isShown(screen.getByText('raw_json.passthrough.removed_title:only'))).toBe(true);
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole('button', { name: /raw_json\.passthrough\.title/ }),
      ),
    );
  });

  it('removes a block while a sync runs', async () => {
    useResumeStore.setState({ isSyncingData: true });
    const user = userEvent.setup();
    renderPanel();
    await openPanel(user);

    await user.click(screen.getByRole('button', { name: 'common.remove_named:x-tool' }));
    await screen.findByRole('alertdialog');
    await user.click(screen.getByRole('button', { name: 'common.remove' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(useResumeStore.getState().resume.passthrough).not.toHaveProperty('x-tool');
  });
});
