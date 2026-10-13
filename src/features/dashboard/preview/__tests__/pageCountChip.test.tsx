// @vitest-environment jsdom
import { PreviewHeader } from '@/features/dashboard/preview/PreviewHeader';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

const setStatus = (pdfPageCount: number | null, isPdfRenderError = false) =>
  useResumeStore.setState({ pdfPageCount, isPdfRenderError });

const renderHeader = (viewMode: 'pdf' | 'html' = 'pdf') =>
  render(<PreviewHeader viewMode={viewMode} onViewModeChange={() => {}} />);

beforeEach(() => {
  setStatus(null);
});

/**
 * The chip's whole contract is when it stays *silent*. A page count that lingers
 * from the previous compile, or appears beside a failed render, tells the user
 * their CV is a length it is not — which is worse than saying nothing, because
 * "fits one page" is a claim people act on.
 */
describe('the preview page-count chip', () => {
  it('says nothing while the count is unknown', () => {
    setStatus(null);
    renderHeader();
    expect(screen.queryByText(/page/i)).toBeNull();
  });

  it('says nothing when the render failed, even with a count from before', () => {
    setStatus(3, true);
    renderHeader();
    expect(screen.queryByText(/page/i)).toBeNull();
  });

  it('says nothing in HTML mode, which has no pages', () => {
    setStatus(2);
    renderHeader('html');
    expect(screen.queryByText(/page/i)).toBeNull();
  });

  it('shows the singular for a one-page CV', () => {
    setStatus(1);
    renderHeader();
    expect(screen.getByText('Fits 1 page')).toBeTruthy();
  });

  it('shows the count for a longer CV', () => {
    setStatus(3);
    renderHeader();
    expect(screen.getByText('3 pages')).toBeTruthy();
  });
});
