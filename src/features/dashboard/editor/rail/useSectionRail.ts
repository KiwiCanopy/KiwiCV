import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

import { CUSTOM_SECTION_TITLE_ATTR } from '@/constants/focusAnchors';
import { usePendingProposals } from '@/features/dashboard/editor/proposals/usePendingProposals';
import {
  DEFAULT_RAIL_SECTION,
  RAIL_SECTION_ORDER,
  asRailSectionKey,
  editorRailOrder,
} from '@/features/dashboard/editor/rail/railSections';
import {
  type EditorSectionKey,
  type RailRowState,
  type RailSectionKey,
} from '@/features/dashboard/editor/rail/types';
import { EDITOR_RAIL_EXPANDED_MIN_WIDTH } from '@/features/dashboard/layout/constants';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { focusIfPossible, sectionHeadingAnchor } from '@/utils/focus';
import {
  type CustomSectionToken,
  type SectionKey,
  customSectionDisplayTitle,
  customSectionToken,
  findCustomSection,
  isCustomSectionToken,
} from '@/utils/layoutMetadata';

interface UseSectionRailOptions {
  /**
   * The width of the editor **pane** — the box the rail and the entry column
   * share. At split this is the resizable pane, not the whole workspace.
   */
  editorPaneWidth: number;
}

/**
 * Sections whose row shows no entry badge: `basics` is a single form and the
 * cover letter is a document, so "0" would read as "empty" rather than "not a
 * list".
 */
const UNCOUNTED_ROWS: ReadonlySet<RailSectionKey> = new Set(['basics', 'coverLetter']);

/** Work that has to wait until `?section=` has landed on `target`. */
interface PendingArrival {
  target: EditorSectionKey;
  run: () => void;
}

export function useSectionRail({ editorPaneWidth }: UseSectionRailOptions) {
  const { t, tCV } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const resume = useResumeStore((state) => state.resume);
  const addCustomSectionToStore = useResumeStore((state) => state.addCustomSection);
  const removeCustomSection = useResumeStore((state) => state.removeCustomSection);
  // ⚠️ Shared with the pending bar rather than re-derived. Two calls to
  // `getAISuggestionCount` with different scopes is how a row could read "2"
  // while the bar above it said the CV was clean.
  const { countsBySection } = usePendingProposals();
  const storedCollapsed = useUIStore((state) => state.editorRailCollapsed);
  const setEditorRailCollapsed = useUIStore((state) => state.setEditorRailCollapsed);

  // ⚠️ The two are not the same question. `activeSection` is what the panel
  // mounts; `selectedSection` is whether the user has picked one at all, which
  // is what the phone list keys off — defaulting it to Basics would mean a phone
  // never sees the list.
  const selectedSection = asRailSectionKey(searchParams.get('section'), resume);
  const activeSection = selectedSection ?? DEFAULT_RAIL_SECTION;

  // `null` means "follow the measured default"; any explicit toggle pins it.
  const measuredCollapsed = editorPaneWidth < EDITOR_RAIL_EXPANDED_MIN_WIDTH;
  const isCollapsed = storedCollapsed ?? measuredCollapsed;

  // ⚠️ The pin drops itself the moment it agrees with the measurement, which is
  // the only path back to "follow the layout" — nothing else ever writes `null`,
  // so without this a single toggle disabled the measured default permanently.
  //
  // Clearing it here is invisible: the pin and the measurement want the same
  // thing at that instant, so nothing moves. It matters afterwards — widen the
  // pane again and the rail follows the layout instead of staying stuck.
  //
  // It also covers the click-back case. `toggleCollapsed` flips whatever is
  // showing, so pressing the control until the rail matches its surroundings
  // lands on `pin === measured` and returns to auto in one click.
  //
  // ⚠️ Guarded on a real measurement. Before the workspace is measured the pane
  // reports 0, which reads as "collapsed" — clearing against that would discard
  // a pinned collapse on every single load.
  useEffect(() => {
    if (storedCollapsed === null || editorPaneWidth <= 0) return;
    if (storedCollapsed === measuredCollapsed) setEditorRailCollapsed(null);
  }, [storedCollapsed, measuredCollapsed, editorPaneWidth, setEditorRailCollapsed]);

  const rows = useMemo<RailRowState[]>(
    () =>
      RAIL_SECTION_ORDER.map((key) => ({
        sectionKey: key,
        entryCount: UNCOUNTED_ROWS.has(key)
          ? undefined
          : key === 'profiles'
            ? resume.basics.profiles.length
            : (resume[key as SectionKey]?.length ?? 0),
        proposalCount: countsBySection[key],
      })),
    [resume, countsBySection],
  );

  const customRows = useMemo<RailRowState[]>(
    () =>
      resume.customSections.map((section) => ({
        sectionKey: customSectionToken(section.id),
        label: customSectionDisplayTitle(section, t('common.untitled')),
        entryCount: section.items.length,
        proposalCount: countsBySection[customSectionToken(section.id)] ?? 0,
      })),
    [resume.customSections, countsBySection, t],
  );

  // ⚠️ react-router commits `?section=` in a transition, so the panel a handler
  // selects is not mounted when the handler returns. Focus — and a removal that
  // must not unmount the open panel before its replacement lands — waits here.
  const pendingArrival = useRef<PendingArrival | null>(null);
  useLayoutEffect(() => {
    const pending = pendingArrival.current;
    if (!pending || pending.target !== activeSection) return;
    pendingArrival.current = null;
    pending.run();
  }, [activeSection]);

  const selectSection = useCallback(
    (key: EditorSectionKey) => {
      // Never the uuid or the user's title: those are content, not a section name.
      analytics.track(ANALYTICS_EVENTS.EDITOR_SECTION_SELECTED, {
        section: isCustomSectionToken(key) ? 'custom' : key,
      });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('tab', 'editor');
      nextParams.set('section', key);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const addCustomSection = useCallback(() => {
    const token = customSectionToken(
      // The default title can reach the CV, so it is in the CV's language.
      addCustomSectionToStore(tCV('editor.custom_sections.default_title')),
    );
    pendingArrival.current = {
      target: token,
      run: () => {
        const input = document.querySelector<HTMLInputElement>(`[${CUSTOM_SECTION_TITLE_ATTR}]`);
        if (focusIfPossible(input)) input?.select();
      },
    };
    selectSection(token);
  }, [addCustomSectionToStore, selectSection, tCV]);

  /**
   * Selects the row above the deleted one, then removes the section once that
   * row's panel is mounted and hands focus to its heading — the Delete button
   * goes with the panel it lived in (UI_PATTERNS § Focus Handoff).
   */
  const deleteCustomSection = useCallback(
    (token: CustomSectionToken) => {
      const section = findCustomSection(resume, token);
      if (!section) return;
      const order = editorRailOrder(resume);
      const previous = order[order.indexOf(token) - 1] ?? DEFAULT_RAIL_SECTION;
      pendingArrival.current = {
        target: previous,
        run: () => {
          removeCustomSection(section.id);
          focusIfPossible(sectionHeadingAnchor());
        },
      };
      selectSection(previous);
    },
    [resume, removeCustomSection, selectSection],
  );

  const clearSection = useCallback(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('section');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const toggleCollapsed = useCallback(() => {
    const next = !isCollapsed;
    analytics.track(ANALYTICS_EVENTS.EDITOR_RAIL_TOGGLED, { collapsed: next });
    setEditorRailCollapsed(next);
  }, [isCollapsed, setEditorRailCollapsed]);

  return {
    activeSection,
    selectedSection,
    selectSection,
    clearSection,
    rows,
    customRows,
    addCustomSection,
    deleteCustomSection,
    isCollapsed,
    toggleCollapsed,
  };
}
