// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { Sidebar } from '@/layouts/Sidebar';
import { useUIStore } from '@/store/ui/useUIStore';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/layouts/sidebar/SidebarContent', () => ({ SidebarContent: () => null }));

let desktop = false;
const listeners = new Set<() => void>();

beforeEach(() => {
  desktop = false;
  listeners.clear();
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('min-width') && desktop;
    },
    media: query,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }));
});

afterEach(() => {
  act(() => useUIStore.getState().setSidebarOpen(false));
  vi.unstubAllGlobals();
});

describe('Sidebar', () => {
  // A tablet rotated past `lg` with the drawer open kept the page inert.
  it('closes the phone drawer when the viewport reaches the desktop breakpoint', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>,
    );
    act(() => useUIStore.getState().setSidebarOpen(true));
    expect(useUIStore.getState().isSidebarOpen).toBe(true);

    act(() => {
      desktop = true;
      listeners.forEach((listener) => listener());
    });
    expect(useUIStore.getState().isSidebarOpen).toBe(false);
  });
});
