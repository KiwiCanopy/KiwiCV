// @vitest-environment jsdom
import { VersionRow } from '@/features/cv-library/VersionRow';
import type { CvVersion } from '@/features/cv-library/types';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const version = (overrides: Partial<CvVersion['file']> = {}): CvVersion => ({
  key: 'en:github:path:ProjectA.json',
  locale: 'en',
  source: 'github',
  isMaster: false,
  file: {
    name: 'ProjectA.json',
    label: 'ProjectA',
    updatedAt: '2026-03-04T10:00:00Z',
    theme: 'lunar',
    ...overrides,
  },
});

describe('VersionRow', () => {
  it('hands the whole version back, because restore needs the locale and the provider', () => {
    const onRestore = vi.fn();
    const target = version();

    render(
      <VersionRow
        version={target}
        index={2}
        onRestore={onRestore}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Restore' }));

    // `downloadBackup` builds the GitHub path from the locale, so a callback
    // that received only the file could not restore this row at all.
    expect(onRestore).toHaveBeenCalledWith(target);
  });

  it('offers Delete and Download .json behind the row menu', () => {
    const onDelete = vi.fn();
    const onDownload = vi.fn();
    const target = version();

    render(
      <VersionRow
        version={target}
        index={2}
        onRestore={vi.fn()}
        onDelete={onDelete}
        onDownload={onDownload}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'More actions for ProjectA' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download .json' }));
    expect(onDownload).toHaveBeenCalledWith(target);

    fireEvent.click(screen.getByRole('button', { name: 'More actions for ProjectA' }));
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).toHaveBeenCalledWith(target, 2);
  });

  it('renders the shipped preview image for a known design', () => {
    const { container } = render(
      <VersionRow
        version={version({ theme: 'lunar' })}
        index={0}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    expect(container.querySelector('img')?.getAttribute('src')).toBe('/images/previews/lunar.png');
  });

  it('falls back to a neutral tile for an unknown design rather than printing lunar', () => {
    const { container } = render(
      <VersionRow
        version={version({ theme: undefined })}
        index={0}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    // `getThemeMeta` resolves anything unknown to lunar, so a thumbnail that
    // called it unconditionally would show a confidently wrong design.
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('Design not recorded')).toBeTruthy();
  });

  it('links the tailored-for cell and the row menu to a saved posting (#54)', () => {
    render(
      <VersionRow
        version={version({
          company: 'Acme',
          position: 'Engineer',
          postingUrl: 'https://jobs.example.com/42',
        })}
        index={0}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    const link = screen.getByRole('link', {
      name: 'Open job posting for ProjectA (opens in a new tab)',
    });
    expect(link.getAttribute('href')).toBe('https://jobs.example.com/42');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.textContent).toBe('Engineer · Acme');

    fireEvent.click(screen.getByRole('button', { name: 'More actions for ProjectA' }));
    expect(screen.getByRole('link', { name: 'Open job posting' }).getAttribute('href')).toBe(
      'https://jobs.example.com/42',
    );
  });

  it('keeps plain text and no menu entry without a posting', () => {
    render(
      <VersionRow
        version={version({ company: 'Acme', position: 'Engineer' })}
        index={0}
        onRestore={vi.fn()}
        onDelete={vi.fn()}
        onDownload={vi.fn()}
      />,
    );

    expect(screen.getByText('Engineer · Acme').closest('a')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'More actions for ProjectA' }));
    expect(screen.queryByRole('link')).toBeNull();
  });
});
