// @vitest-environment jsdom
import { AIImportView } from '@/components/modals/ai/import/AIImportModal';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * ⚠️ **The import modal's own status call site, which nothing bound.**
 *
 * `AIImportModal.tsx` hands `AIStatusView` four values the edit modal does not —
 * `successTitle`, `successDescription`, `processingNote` and its `onRetry` — and
 * every one is OPTIONAL on `AIStatusViewProps`. Deleting any of those lines
 * typechecked and left all 3,396 tests green: `AIStatusView`'s own tests render
 * it directly, and `import/__tests__/` had no suite that rendered this modal at
 * all. A later split made it worse by adding a second optional hop (the router now hands
 * the branch to `AIStatusProcessing`), so a dropped prop had two places to
 * vanish silently.
 *
 * That is the same trap — a guard that pins a callee does not bind the call
 * site — and `.claude/rules/testing.md` says to render the composed thing.
 * `AIImportView` is where the JSX lives; `AIImportModal` only wraps it in the
 * dialog frame and the post-success navigation.
 */

let context: Record<string, unknown>;

/** Not under test, and it reaches the router and the language context. */
vi.mock('@/components/modals/InsufficientPremiumAccessModal', () => ({
  InsufficientPremiumAccessModal: () => null,
}));

vi.mock('@/components/modals/ai/import/useAIImport', () => ({
  useAIImport: () => context,
}));

const baseContext = () => ({
  activeStyle: 'professional',
  errorMessage: '',
  handleFileChange: vi.fn(),
  isDailyLimitReached: false,
  isUpgradeModalOpen: false,
  resetState: vi.fn(),
  setIsUpgradeModalOpen: vi.fn(),
  setStep: vi.fn(),
  status: 'processing',
  step: 'processing',
});

beforeEach(() => {
  context = baseContext();
});

const renderImport = () => render(<AIImportView onBack={vi.fn()} onSuccess={vi.fn()} />);

describe('AIImportView hands the status view its import-only copy', () => {
  /**
   * ⚠️ The note is the only thing telling the user not to close the tab, and a
   * closed tab loses the run. `AIStatusView.test.tsx` binds the router→leaf hop
   * for this prop; this binds the hop above it.
   */
  it('warns the user to keep the page open while the document is processed', () => {
    renderImport();

    expect(screen.getByText('Keep this page open while your document is processed.')).toBeTruthy();
  });

  /**
   * Without these the panel silently falls back to the EDIT modal's wording —
   * "Optimized! Your content has been successfully improved." — on a run that
   * imported a document rather than improving one.
   */
  it('titles and describes the success panel in the import flow’s own words', () => {
    context = { ...baseContext(), status: 'success' };
    renderImport();

    expect(screen.getByText('Imported!')).toBeTruthy();
    expect(
      screen.getByText('Your document has been successfully processed and imported.'),
    ).toBeTruthy();
    expect(screen.queryByText('Optimized!')).toBeNull();
  });

  /**
   * ⚠️ The costliest optional prop to lose, and the least visible: `AIStatusView`
   * renders Continue only when `onSuccess` is truthy, so dropping it leaves a
   * successful import on a success panel with no way forward and no navigation
   * to the editor — through a green `tsc -b` and every assertion above.
   */
  it('offers a way out of the success panel, and takes it', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    const resetState = vi.fn();
    context = { ...baseContext(), status: 'success', resetState };
    render(<AIImportView onBack={vi.fn()} onSuccess={onSuccess} />);

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(resetState).toHaveBeenCalledTimes(1);
  });

  /**
   * ⚠️ Back to the style step, NOT a re-run. The import modal has no generate
   * handler to retry with — the file has to go through style selection again —
   * so a dropped `onRetry` would leave an error state with no way forward but
   * "Back", which resets the whole flow and discards the upload.
   */
  it('sends a failed import back to the style step rather than resetting it', async () => {
    const user = userEvent.setup();
    const setStep = vi.fn();
    const resetState = vi.fn();
    context = { ...baseContext(), status: 'error', errorMessage: 'Boom', setStep, resetState };
    renderImport();

    // The real message, not `common.error_occurred` — `errorMessage` is optional too.
    expect(screen.getByText('Boom')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(setStep).toHaveBeenCalledWith('style');
    expect(resetState).not.toHaveBeenCalled();
  });

  /**
   * ⚠️ Dropping `onBack` does not remove the button — `AIStatusView` renders it
   * unconditionally and calls `onBack?.()`. It leaves a Back that does nothing,
   * which is the quietest failure of the nine optional props here.
   */
  it('leaves the error state by resetting the flow', async () => {
    const user = userEvent.setup();
    const resetState = vi.fn();
    context = { ...baseContext(), status: 'error', errorMessage: 'Boom', resetState };
    renderImport();

    await user.click(screen.getByRole('button', { name: 'Back' }));
    expect(resetState).toHaveBeenCalledTimes(1);
  });

  /**
   * ⚠️ `target` and `mode` are the other two optional props this call site
   * passes, and they reach nothing a user can see — they only shape the
   * `AI_SUGGESTION_*` payloads. Dropping either typechecks and leaves every
   * assertion above green while the events silently start reporting `null`,
   * which is the same class as the four props above.
   */
  it('attributes the run in the analytics payload', async () => {
    const user = userEvent.setup();
    const track = vi.spyOn(analytics, 'track').mockImplementation(() => {});
    context = { ...baseContext(), status: 'success', activeStyle: 'literal' };
    renderImport();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(track).toHaveBeenCalledWith(
      ANALYTICS_EVENTS.AI_SUGGESTION_CONFIRMED,
      expect.objectContaining({ mode: 'literal', ai_scope: 'cv', ai_target: 'cv' }),
    );
    track.mockRestore();
  });
});
