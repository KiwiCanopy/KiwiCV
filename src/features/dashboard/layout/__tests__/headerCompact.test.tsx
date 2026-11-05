// @vitest-environment jsdom
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { DashboardLayout } from '@/features/dashboard/layout/DashboardLayout';
import { MainLayout } from '@/layouts/MainLayout';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, hasDrivePermission: null, profile: null }),
}));

async function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/other" element={<p>other page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
  return screen.findByRole('banner');
}

/**
 * jsdom has no layout or media queries, so this cannot prove the row fits at 320px: that is
 * the measurement in UI_PATTERNS § Mobile Adaptation (#23). It pins that the variant exists
 * and that each element the measured budget counts on carries it, through the real tree.
 */
describe('dashboard header below 360px', () => {
  it('defines the variant at the measured threshold', () => {
    const css = readFileSync(resolve(process.cwd(), 'src/index.css'), 'utf8');
    // Anchored, so a commented-out line does not count: Tailwind emits nothing for an unknown variant.
    expect(css).toMatch(/^@custom-variant header-compact \(@media \(max-width: 359\.98px\)\);$/m);
  });

  it('compacts the header, the tab row, the tab track and the action row', async () => {
    const header = await renderAt('/dashboard');
    expect(header.classList).toContain('header-compact:px-2');

    const tab = header.querySelector('#header-tabs [aria-pressed]');
    const track = tab?.parentElement;
    expect(track?.classList).toContain('header-compact:w-20');
    expect(track?.classList).toContain('header-compact:[&_button]:px-0');
    expect(track?.parentElement?.classList).toContain('header-compact:gap-1');

    const row = document.getElementById(EXPORT_TRIGGER_ANCHOR_ID)?.parentElement?.parentElement;
    expect(row?.classList).toContain('header-compact:gap-1');
    expect(row?.classList).toContain('header-compact:[&_button]:w-9');
    // Both buttons floor at 40px, so without this `w-9` does nothing and the slack is gone.
    expect(row?.classList).toContain('header-compact:[&_button]:min-w-0');
    expect(row?.classList).toContain('header-compact:[&_button]:px-0');
    expect(row?.classList).toContain('header-compact:[&_button]:justify-center');
    expect([...(row?.querySelectorAll('button') ?? [])].map((b) => b.textContent)).toEqual([
      'Back up',
      'Export',
    ]);
  });

  it('leaves the header padding alone off the dashboard', async () => {
    const header = await renderAt('/other');
    expect(header.classList).not.toContain('header-compact:px-2');
  });
});
