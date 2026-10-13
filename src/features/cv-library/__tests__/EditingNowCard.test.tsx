// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { EditingNowCard } from '@/features/cv-library/EditingNowCard';
import type { CvVersion } from '@/features/cv-library/types';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const master: CvVersion = {
  key: 'en:github:path:resume.json',
  locale: 'en',
  source: 'github',
  isMaster: true,
  file: { name: 'resume.json', label: 'Latest Backup', updatedAt: '2026-03-04T10:00:00Z' },
};

function renderCard(activeLanguageMaster: CvVersion | null, at = '/cvs') {
  return render(
    <MemoryRouter initialEntries={[at]}>
      <Routes>
        <Route
          path="/:lang/cvs"
          element={
            <EditingNowCard activeLanguageMaster={activeLanguageMaster} onBackupNow={vi.fn()} />
          }
        />
        <Route
          path="/cvs"
          element={
            <EditingNowCard activeLanguageMaster={activeLanguageMaster} onBackupNow={vi.fn()} />
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EditingNowCard', () => {
  it('reads "not backed up since" off the master for the draft\'s language', () => {
    renderCard(master);
    expect(screen.getByText(/Not backed up since/).textContent).toContain('2026');
  });

  it("says never backed up when the draft's language has no master", () => {
    // A German `resume.json` from last week says nothing about an English
    // draft, so the caller passes `null` and the card must not imply a backup
    // exists. Reading the newest master across every language is the bug this
    // pins: it printed a date for a language that had never been backed up.
    renderCard(null);
    expect(screen.getByText('Never backed up')).toBeTruthy();
  });

  it('shows no clock and never reads lastSavedAt', () => {
    // `lastSavedAt` is excluded from the resume store's persistence
    // (`useResumeStore.ts:66`), so it is `null` until the first edit after a
    // page load — a timestamp here would be blank exactly when a returning
    // visitor most wants to trust it. Reading the source rather than spying on
    // the store is what makes this universal: a value guard would pass for any
    // render in which the field simply happened to be null.
    const source = readFileSync(
      resolve(process.cwd(), 'src/features/cv-library/EditingNowCard.tsx'),
      'utf8',
    )
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/[^\n]*/g, '');
    expect(source).not.toMatch(/lastSavedAt/);

    renderCard(master);

    expect(screen.getByText('Saved on this device')).toBeTruthy();
    expect(screen.queryByText(/\d{1,2}:\d{2}/)).toBeNull();
  });

  it('continues editing into the unprefixed dashboard for English', () => {
    renderCard(master);
    expect(screen.getByRole('link', { name: /Continue editing/ }).getAttribute('href')).toBe(
      '/dashboard',
    );
  });

  it('keeps the locale prefix for a non-default language', () => {
    renderCard(master, '/de/cvs');
    expect(screen.getByRole('link', { name: /Continue editing/ }).getAttribute('href')).toBe(
      '/de/dashboard',
    );
  });
});
