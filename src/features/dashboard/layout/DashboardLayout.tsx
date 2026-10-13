import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';

import { ResumeLanguageSelector } from '@/components/editor/ResumeLanguageSelector';
import { AIEditModal } from '@/components/modals/ai/edit/AIEditModal';
import { ResizableDivider } from '@/components/ui/ResizableDivider';
import { AIComposerBar } from '@/features/dashboard/editor/composer/AIComposerBar';
import { PendingProposalsBar } from '@/features/dashboard/editor/proposals/PendingProposalsBar';
import { DashboardHeaderActions } from '@/features/dashboard/layout/DashboardHeaderActions';
import { type DashboardTabMode, DashboardTabs } from '@/features/dashboard/layout/DashboardTabs';
import { LeftPane } from '@/features/dashboard/layout/LeftPane';
import { RightPane } from '@/features/dashboard/layout/RightPane';
import { DASHBOARD_PANE_MIN_WIDTH } from '@/features/dashboard/layout/constants';
import { useDashboardWorkspace } from '@/features/dashboard/layout/useDashboardWorkspace';
import { useSaveFailureToast } from '@/features/dashboard/layout/useSaveFailureToast';
import { MobilePreviewAction } from '@/features/dashboard/preview/MobilePreviewAction';
import { usePortalTarget } from '@/hooks/usePortalTarget';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';
import { isMeaningfullyEmpty } from '@/utils/validation';
import { LoaderCircle, TriangleAlert } from 'lucide-react';

// Persistence-status line, driven by the resume store's real saveStatus instead
// of a hardcoded "saved" label. One consumer: the desktop tab
// switcher below. It used to be shared with a mobile top bar that no longer
// exists.
const SaveStatusLine = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const saveStatus = useResumeStore((state) => state.saveStatus);

  // Perceivable at every width, unlike the line below — see the hook.
  useSaveFailureToast();

  // ⚠️ UNREACHABLE today. `setSaveStatus` is only ever called with `'saved'`
  // or `'error'` (`store/resume/useResumeStore.ts:34,37`); `'saving'` exists in
  // the `SaveStatus` union but nothing assigns it, because the persist write is
  // synchronous and has no transient state. Kept rather than deleted: the union
  // permits it and an async persist would want it. Do not cite it as a live
  // state — an earlier revision did, and argued from a flicker that
  // cannot happen.
  if (saveStatus === 'saving') {
    return (
      <p className={cn('text-muted-foreground flex items-center gap-1', className)}>
        <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
        {t('dashboard.save_status.saving')}
      </p>
    );
  }

  if (saveStatus === 'error') {
    return (
      <p className={cn('text-danger flex items-center gap-1', className)} role="alert">
        <TriangleAlert className="h-3 w-3" aria-hidden="true" />
        {t('dashboard.save_status.error')}
      </p>
    );
  }

  // ⚠️ The resting state draws NOTHING. "Saved on this device · 13:16" sat under
  // the CV name on every screen, for every second of every session, to report
  // the state the app is in essentially always. Autosave working is not news;
  // it is the baseline the user already assumes.
  //
  // ⚠️ The other two states stay, and that distinction is the whole point of not
  // deleting this component. `saving` is transient and self-clearing, and
  // `error` is the one thing here a user must not miss — it keeps `role="alert"`
  // so it is announced rather than merely drawn. Removing the line wholesale
  // would have taken the failure signal out with the noise.
  return null;
};

export const DashboardLayout = () => {
  const workspaceRef = useRef<HTMLDivElement>(null);
  const editorPaneWidthRef = useRef(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const headerTabsTarget = usePortalTarget('header-tabs');
  const showToast = useToastStore((state) => state.addToast);
  const editorPaneWidth = useUIStore((state) => state.editorPaneWidth);
  const setEditorPaneWidth = useUIStore((state) => state.setEditorPaneWidth);
  const isDragging = useUIStore((state) => state.isDragging);
  const viewMode = useUIStore((state) => state.viewMode);
  const setViewMode = useUIStore((state) => state.setViewMode);
  const { layout, width: workspaceWidth, measured } = useDashboardWorkspace(workspaceRef);

  useEffect(() => {
    editorPaneWidthRef.current = editorPaneWidth;
  }, [editorPaneWidth]);

  useEffect(() => {
    if (layout !== 'split') return;
    const minWidth = DASHBOARD_PANE_MIN_WIDTH;
    const maxWidth = workspaceWidth - minWidth;
    const currentWidth = editorPaneWidthRef.current;
    const healedWidth = Math.max(minWidth, Math.min(currentWidth, maxWidth));
    if (healedWidth !== currentWidth) setEditorPaneWidth(healedWidth);
  }, [layout, setEditorPaneWidth, workspaceWidth]);

  // What the editor pane is actually *rendered* at, which is the number the rail
  // has to reason about. ⚠️ Not `editorPaneWidth` on its own: at split the pane's
  // style clamps the stored width to `[480, workspace - 480]`, so a stored value
  // outside that range is not what the user sees. Off split the pane is the whole
  // workspace (`w-full flex-1`).
  const renderedEditorPaneWidth =
    layout === 'split'
      ? Math.max(
          DASHBOARD_PANE_MIN_WIDTH,
          Math.min(editorPaneWidth, workspaceWidth - DASHBOARD_PANE_MIN_WIDTH),
        )
      : workspaceWidth;

  const tabParam = searchParams.get('tab');
  const requestedTab: DashboardTabMode =
    tabParam === 'design' ? 'design' : tabParam === 'preview' ? 'preview' : 'editor';
  const activeTab: DashboardTabMode =
    requestedTab === 'preview' && layout !== 'workspace' ? 'editor' : requestedTab;

  useEffect(() => {
    if (!measured || requestedTab !== 'preview' || layout === 'workspace') return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', 'editor');
    setSearchParams(nextParams, { replace: true });
  }, [layout, measured, requestedTab, searchParams, setSearchParams]);

  const setActiveTab = (tab: DashboardTabMode) => {
    if (tab === 'preview' && layout !== 'workspace') return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams, { replace: true });
  };

  useEffect(() => {
    if (searchParams.get('payment') !== 'success') return;
    analytics.track(ANALYTICS_EVENTS.PURCHASE_COMPLETED);
    showToast(t('monetization.fulfillment_successful'), 'success');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('payment');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, showToast, t]);

  const hasContent = !isMeaningfullyEmpty(resume);
  const tabSwitcher = (
    <div className="flex min-w-0 items-center gap-2">
      {/* ⚠️ The CV's name and its save status both used to sit here. The name is
          already on My CVs, in the browser tab, and on the document itself in
          the preview beside this; a truncated copy of it in the chrome told the
          user something they were looking at. The status is gone for a separate
          reason — see `SaveStatusLine`, which still renders when saving or when
          a save FAILS.

      */}
      <DashboardTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        showPreview={layout === 'workspace'}
      />
      {/* The CV's own language, beside the tabs rather than inside the editor
          pane: it belongs to the document, not to whichever section the rail
          has open. Shown at every width — the trigger is two letters wide, so
          it no longer needs the second row it used to fall back to. */}
      <ResumeLanguageSelector variant="compact" showHelp={true} />
      {/* ⚠️ This renders LAST, and the ordering IS the fix — keep anything you
          add above it, not below. It draws nothing at rest, so it occupies no
          box; an earlier revision placed it first and claimed the slot was
          reserved, which a component returning `null` cannot do. Ahead of the
          tabs, it displaced them and the language selector by its own width
          plus this row's `gap-2`.

          ⚠️ The trigger is a save FAILURE, not routine autosave. `'saving'` is
          never assigned, so the only reachable render is `error` — which means
          the displacement was persistent rather than a flicker, and it moved
          the tabs at the exact moment the user needed to read a failure notice
          beside them. Worse than the transient jump first claimed, not better.

          This line is now the wide-screen echo of a failure, not the only
          notice of one — the toast in `SaveStatusLine` is what actually carries
          it, at every width.

          `#header-tabs` (`Header.tsx`) is `justify-between` with both groups
          `shrink-0`, so nothing BEFORE this moves. Growth is absorbed by the
          free space in the middle, and past that the right-hand group (Back up,
          Export) clips rather than shifts — `MainLayout` is `overflow-hidden`.
          That ceiling is order-independent and predates this change. */}
      <SaveStatusLine className="hidden text-[0.7rem] lg:flex" />
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-0 flex-col overflow-hidden">
      {headerTabsTarget && createPortal(tabSwitcher, headerTabsTarget)}
      <DashboardHeaderActions />

      {/* Above the split row, not inside the editor pane: it acts on the whole
          CV, so it must not look like it belongs to whichever section the rail
          has open. Editor tab only — Design and Preview have nothing for it to
          rewrite. */}
      {hasContent && activeTab === 'editor' && (
        <>
          <AIComposerBar isPhone={layout === 'phone'} workspaceWidth={workspaceWidth} />
          <PendingProposalsBar />
        </>
      )}

      <div
        ref={workspaceRef}
        className="relative flex min-h-0 flex-1 overflow-hidden"
        style={{ '--editor-width': `${editorPaneWidth}px` } as React.CSSProperties}
        data-workspace-layout={layout}
      >
        {layout === 'workspace' && activeTab === 'preview' ? (
          <RightPane viewMode={viewMode} onViewModeChange={setViewMode} />
        ) : (
          <div
            className={cn(
              'flex h-full min-w-0 flex-col',
              layout === 'split' ? 'w-[var(--editor-width)] shrink-0' : 'w-full flex-1',
              !isDragging && 'transition-[width] duration-200',
            )}
            style={
              layout === 'split'
                ? {
                    width: `clamp(${DASHBOARD_PANE_MIN_WIDTH}px, var(--editor-width), calc(100% - ${DASHBOARD_PANE_MIN_WIDTH}px))`,
                  }
                : undefined
            }
          >
            <LeftPane
              activeTab={activeTab === 'design' ? 'design' : 'editor'}
              workspaceLayout={layout}
              workspaceWidth={workspaceWidth}
              editorPaneWidth={renderedEditorPaneWidth}
            />
          </div>
        )}

        {layout === 'split' && (
          <>
            <ResizableDivider containerRef={workspaceRef} containerWidth={workspaceWidth} />
            <RightPane viewMode={viewMode} onViewModeChange={setViewMode} />
          </>
        )}

        {isDragging && <div className="absolute inset-0 z-[100] cursor-col-resize" />}
      </div>

      {measured && layout === 'phone' && <MobilePreviewAction />}
      <AIEditModal />
    </div>
  );
};
