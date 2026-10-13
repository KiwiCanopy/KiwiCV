// @vitest-environment jsdom
import { MemoryRouter } from 'react-router-dom';

import { useEditorBreakpoints } from '@/features/dashboard/layout/EditorLayoutContext';
import { LeftPane } from '@/features/dashboard/layout/LeftPane';
import { EDITOR_RAIL_WIDTH } from '@/features/dashboard/layout/constants';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: null, profile: null }) }));

/**
 * Probes stand in for the two tab bodies. Each one sits exactly where the real
 * forms/design controls sit — inside its layer's `EditorLayoutProvider` — so it
 * reads the same context value they would, without pulling fourteen forms and
 * the whole design editor into a layout test.
 */
const Probe = ({ id }: { id: string }) => {
  const { width, isStandard, isSocial } = useEditorBreakpoints();

  return (
    <div
      data-testid={id}
      data-width={String(width)}
      data-standard={String(isStandard)}
      data-social={String(isSocial)}
    />
  );
};

vi.mock('@/features/dashboard/editor/EditorSectionPanel', () => ({
  EditorSectionPanel: () => <Probe id="editor-probe" />,
}));

vi.mock('@/features/dashboard/design/DesignTab', () => ({
  DesignTab: () => <Probe id="design-probe" />,
}));

type Callback = (entries: { contentRect: { width: number } }[]) => void;

const observers: { callback: Callback; elements: Set<Element> }[] = [];

class RecordingResizeObserver {
  private entry: { callback: Callback; elements: Set<Element> };

  constructor(callback: Callback) {
    this.entry = { callback, elements: new Set() };
    observers.push(this.entry);
  }

  observe(element: Element) {
    this.entry.elements.add(element);
  }

  unobserve(element: Element) {
    this.entry.elements.delete(element);
  }

  disconnect() {
    this.entry.elements.clear();
  }
}

const isHidden = (element: Element) => !!element.closest('.hidden');

/**
 * The smallest layout engine that can tell the regression apart. jsdom measures
 * nothing, so each observed element is handed `paneWidth` minus the explicit
 * pixel widths of its **siblings** — which is exactly how the flex row behaves.
 *
 * That is the whole point of the guard: the rail is a sibling of the measured
 * column and subtracts its 246px, but a provider that wrapped the pane again
 * would contain the rail rather than sit beside it, and would be handed the
 * full pane width.
 */
const layOut = (paneWidth: number) => {
  act(() => {
    for (const observer of observers) {
      for (const element of observer.elements) {
        if (!element.isConnected) continue;

        let width = isHidden(element) ? 0 : paneWidth;

        if (width > 0) {
          for (const sibling of Array.from(element.parentElement?.children ?? [])) {
            if (sibling === element) continue;
            const fixed = (sibling as HTMLElement).style.width;
            if (fixed.endsWith('px')) width -= Number.parseFloat(fixed);
          }
        }

        observer.callback([{ contentRect: { width } }]);
      }
    }
  });
};

const flags = (testId: string) => {
  const probe = document.querySelector(`[data-testid="${testId}"]`);
  if (!probe) throw new Error(`missing probe: ${testId}`);

  return {
    width: Number(probe.getAttribute('data-width')),
    isStandard: probe.getAttribute('data-standard') === 'true',
    isSocial: probe.getAttribute('data-social') === 'true',
  };
};

/**
 * Chosen so the two answers straddle the `isSocial` threshold: the pane is 850
 * (social), the entry column beside a 246px rail is 604 (standard, not social).
 * A regression that hands the column the pane's width flips a flag, not just a
 * number.
 */
const PANE_WIDTH = 850;
const COLUMN_WIDTH = PANE_WIDTH - EDITOR_RAIL_WIDTH;

/** Lets `LeftPane`'s 150ms preload mount the inactive tab layer. */
const preloadOtherTab = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 200));
  });
};

beforeEach(() => {
  observers.length = 0;
  vi.stubGlobal('ResizeObserver', RecordingResizeObserver);
  useResumeStore.setState({ resume: buildSingleItemResume('lunar') });
  useUIStore.setState({ editorRailCollapsed: false });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const renderPane = (activeTab: 'editor' | 'design') =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <LeftPane
        activeTab={activeTab}
        workspaceLayout="split"
        workspaceWidth={1400}
        editorPaneWidth={900}
      />
    </MemoryRouter>,
  );

describe('the width the editor forms are told they have', () => {
  it('excludes the section rail', () => {
    renderPane('editor');
    layOut(PANE_WIDTH);

    const rail = document.querySelector('[data-editor-rail]');
    const column = document.querySelector('[data-editor-measured-column]');

    // Structural half: the rail must not be inside the measured element. A
    // provider that wrapped the pane would satisfy every number below only
    // because this test fabricates them.
    expect(rail).not.toBeNull();
    expect(column).not.toBeNull();
    expect(column!.contains(rail!)).toBe(false);

    // Numeric half: `isStandard` (> 560) but not `isSocial` (> 650). Those two
    // flags are what `ProfileItem` reads to put network+username on one line and
    // the URL on its own, and what `TagField` reads to keep highlights one per
    // line with the remove button inside the card.
    expect(flags('editor-probe')).toEqual({
      width: COLUMN_WIDTH,
      isStandard: true,
      isSocial: false,
    });
  });

  it('is the whole pane on the Design tab, which has no rail', () => {
    renderPane('design');
    layOut(PANE_WIDTH);

    expect(flags('design-probe')).toEqual({
      width: PANE_WIDTH,
      isStandard: true,
      isSocial: true,
    });
  });
});

describe('switching tabs with both layers mounted', () => {
  it('keeps the hidden layer on its last real width instead of zero', async () => {
    const view = renderPane('editor');
    await preloadOtherTab();
    layOut(PANE_WIDTH);
    expect(flags('editor-probe').width).toBe(COLUMN_WIDTH);

    // `LeftPane` hides the inactive layer rather than unmounting it, so the
    // editor column is now a `display:none` box measuring 0. Applying that would
    // drop every editor consumer to its narrowest layout behind the user's back.
    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <LeftPane
          activeTab="design"
          workspaceLayout="split"
          workspaceWidth={1400}
          editorPaneWidth={900}
        />
      </MemoryRouter>,
    );
    layOut(PANE_WIDTH);

    expect(flags('editor-probe')).toEqual({
      width: COLUMN_WIDTH,
      isStandard: true,
      isSocial: false,
    });
    expect(flags('design-probe').width).toBe(PANE_WIDTH);
  });
});
