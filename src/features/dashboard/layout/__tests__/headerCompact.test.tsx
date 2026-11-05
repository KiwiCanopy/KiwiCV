// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { EXPORT_TRIGGER_ANCHOR_ID } from '@/constants/focusAnchors';
import { DashboardHeaderActions } from '@/features/dashboard/layout/DashboardHeaderActions';
import { DashboardTabs } from '@/features/dashboard/layout/DashboardTabs';
import { render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

/**
 * jsdom has no layout and no media queries, so this cannot prove the row fits
 * at 320px (#23). It pins the wiring only: the variant exists, and each call
 * site the measured budget counts on still uses it. Tailwind emits nothing for
 * an undefined variant, and no other check notices.
 */
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: null, loading: false, hasDrivePermission: null, profile: null }),
}));

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('dashboard header below 360px', () => {
  it('defines the variant at the measured threshold', () => {
    expect(source('src/index.css')).toContain(
      '@custom-variant header-compact (@media (max-width: 359.98px));',
    );
  });

  it('narrows Back up and Export to 36px with a 4px gap', () => {
    render(
      <MemoryRouter>
        <div id="header-actions" />
        <DashboardHeaderActions />
      </MemoryRouter>,
    );

    const row = document.getElementById(EXPORT_TRIGGER_ANCHOR_ID)?.parentElement?.parentElement;
    expect(row?.className).toContain('header-compact:gap-1');
    expect(row?.className).toContain('header-compact:[&_button]:w-9');
    expect(row?.className).toContain('header-compact:[&_button]:px-0');
    // Both buttons sit in the row the selector reaches.
    expect(row?.querySelectorAll('button')).toHaveLength(2);
  });

  it('narrows the tab track to two 36px segments', () => {
    render(<DashboardTabs activeTab="editor" onTabChange={vi.fn()} />);

    const track = screen.getAllByRole('button')[0].parentElement;
    expect(track?.className).toContain('header-compact:w-20');
    expect(track?.className).toContain('header-compact:[&_button]:px-0');
  });

  it('tightens the tab row and the dashboard header padding', () => {
    expect(source('src/features/dashboard/layout/DashboardLayout.tsx')).toContain(
      'header-compact:gap-1 flex min-w-0 items-center gap-2',
    );
    expect(source('src/layouts/MainLayout.tsx')).toContain("isDashboard ? 'header-compact:px-2' :");
  });
});
