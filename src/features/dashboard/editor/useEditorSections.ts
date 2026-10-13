import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

import { useSectionRail } from '@/features/dashboard/editor/rail/useSectionRail';
import { DASHBOARD_PHONE_MAX_WIDTH } from '@/features/dashboard/layout/constants';
import { type DashboardWorkspaceLayout } from '@/features/dashboard/layout/useDashboardWorkspace';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { isMeaningfullyEmpty } from '@/utils/validation';

/** Router state the landing CTA hands the editor. */
export interface EditorNavState {
  focusBasicsName?: boolean;
}

interface UseEditorSectionsOptions {
  workspaceLayout: DashboardWorkspaceLayout;
  workspaceWidth: number;
  /**
   * The editor pane's own width. ⚠️ Not interchangeable with `workspaceWidth`:
   * the phone split below is a question about the whole workspace, the rail's
   * default is a question about the pane the rail lives in.
   */
  editorPaneWidth: number;
}

/**
 * Everything `EditorTab` needs to decide *what* to show: engagement, the rail's
 * selection, and the phone list/detail split. The rendering lives in `EditorTab`
 * and `EditorSectionPanel`.
 */
export function useEditorSections({
  workspaceLayout,
  workspaceWidth,
  editorPaneWidth,
}: UseEditorSectionsOptions) {
  const resume = useResumeStore((state) => state.resume);
  const hasData = !isMeaningfullyEmpty(resume);
  const rail = useSectionRail({ editorPaneWidth });
  const panelRef = useRef<HTMLDivElement>(null);

  // On a truly fresh resume (no data, no section targeted yet) show only the
  // start panel — the rail stays hidden until the user engages (picks a section
  // via the CTA/deep-link, or has any content).
  // react-router commits navigations in a transition, so the `?section=basics`
  // the CTA writes cannot mount BasicsForm before the click handler returns.
  // This local flag can, and is dropped again as soon as the URL catches up.
  const [ctaEngaged, setCtaEngaged] = useState(false);
  if (ctaEngaged && rail.selectedSection) setCtaEngaged(false);

  const isEngaged = hasData || !!rail.selectedSection || ctaEngaged;

  // A 246px sidebar next to a 375px viewport is not a layout, so phones get the
  // list/detail pair instead. Measured off the dashboard workspace, never a
  // viewport breakpoint — a collapsed app sidebar changes this at the same
  // window width.
  const isPhone =
    workspaceLayout === 'phone' ||
    (workspaceWidth > 0 && workspaceWidth <= DASHBOARD_PHONE_MAX_WIDTH);
  const showPhoneList = isPhone && !rail.selectedSection && !ctaEngaged;

  // Set only by the start-panel CTA, or by the landing CTA through router state.
  // A plain deep link arriving with ?section=… must not steal focus.
  const location = useLocation();
  const navigate = useNavigate();
  const arrivedToFocus = Boolean((location.state as EditorNavState | null)?.focusBasicsName);
  const pendingFocusRef = useRef(arrivedToFocus);

  // Consumed once: `history.state` survives a reload, which must not re-steal focus.
  useEffect(() => {
    if (!arrivedToFocus) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [arrivedToFocus, location.pathname, location.search, navigate]);

  const focusBasicsName = () => {
    const field = document.querySelector<HTMLInputElement>(
      '[data-editor-section="basics"] input[name="name"]',
    );

    if (!field) return false;

    // Scroll the field itself rather than the panel container: the section
    // header sits flush with the sticky chrome, which would hide the input
    // under it. Instant, not smooth — `behavior: 'smooth'` never moves this
    // nested scroller, and an animation would race the on-screen keyboard
    // anyway.
    field.focus({ preventScroll: true });
    field.scrollIntoView({ block: 'center' });

    return true;
  };

  useEffect(() => {
    if (!rail.selectedSection) return;

    const timeoutId = window.setTimeout(() => {
      if (pendingFocusRef.current) {
        // The CTA owns the viewport for this pass. Re-running the focus is a
        // no-op when it already landed, and covers the case where the field was
        // not mounted yet.
        pendingFocusRef.current = false;
        focusBasicsName();
        return;
      }

      // Only the selected section is mounted now, so there is nothing to scroll
      // *to* — the panel just has to start at the top of the new section.
      // ⚠️ `scrollTop`, not `scrollTo`: jsdom does not implement `Element.scrollTo`
      // and throws, and a smooth scroll never moves this nested scroller anyway.
      if (panelRef.current) panelRef.current.scrollTop = 0;
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [rail.selectedSection]);

  const startWithBasics = () => {
    analytics.track(ANALYTICS_EVENTS.CV_STARTED_BLANK, { source: 'editor_start_panel' });

    pendingFocusRef.current = true;
    // Mount BasicsForm synchronously, before this handler returns. Focusing an
    // input outside the gesture that triggered it does not raise the on-screen
    // keyboard on iOS Safari, and that keyboard is the only unmistakable
    // "something happened" signal on a phone.
    flushSync(() => setCtaEngaged(true));
    focusBasicsName();

    rail.selectSection('basics');
  };

  return { ...rail, hasData, isEngaged, isPhone, showPhoneList, panelRef, startWithBasics };
}
