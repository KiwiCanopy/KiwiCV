import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/ui/PageContainer';
import { EditorImportHint } from '@/features/dashboard/editor/EditorImportHint';
import { EditorSectionPanel } from '@/features/dashboard/editor/EditorSectionPanel';
import { EditorStartPanel } from '@/features/dashboard/editor/EditorStartPanel';
import { PhoneSectionList } from '@/features/dashboard/editor/phone/PhoneSectionList';
import { SectionRail } from '@/features/dashboard/editor/rail/SectionRail';
import { useEditorSections } from '@/features/dashboard/editor/useEditorSections';
import { EditorLayoutProvider } from '@/features/dashboard/layout/EditorLayoutProvider';
import { type DashboardWorkspaceLayout } from '@/features/dashboard/layout/useDashboardWorkspace';
import { useTranslation } from '@/hooks/useTranslation';
import { useImportModalStore } from '@/store/ui/useImportModalStore';
import { ChevronLeft } from 'lucide-react';

interface EditorTabProps {
  workspaceLayout: DashboardWorkspaceLayout;
  workspaceWidth: number;
  editorPaneWidth: number;
}

export const EditorTab = ({ workspaceLayout, workspaceWidth, editorPaneWidth }: EditorTabProps) => {
  const { t } = useTranslation();
  const openImportModal = useImportModalStore((state) => state.open);
  const {
    activeSection,
    selectSection,
    clearSection,
    rows,
    customRows,
    addCustomSection,
    deleteCustomSection,
    isCollapsed,
    toggleCollapsed,
    hasData,
    isEngaged,
    isPhone,
    showPhoneList,
    panelRef,
    startWithBasics,
  } = useEditorSections({ workspaceLayout, workspaceWidth, editorPaneWidth });

  const showRail = isEngaged && !isPhone;

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
      {/* Visually hidden, deliberately. The tab bar already says Edit and the
          rail plus the section heading say where you are, so a 24px title and a
          subtitle repeating the landing page were spending a whole row to
          restate the chrome around them. The heading itself stays: it is the
          pane's only `h1`, and without it the rail's `h2` and the section's
          `h2` would open the document at level two. */}
      <h1 className="sr-only">{t('dashboard.edit')}</h1>

      <div className="flex min-h-0 flex-1">
        {/* A sibling of the measured column, never inside it: the rail is part
            of this pane but none of its 246px is available to the forms, so it
            must not count towards the width they are told they have. */}
        {showRail && (
          <SectionRail
            rows={rows}
            customRows={customRows}
            activeSection={activeSection}
            isCollapsed={isCollapsed}
            onSelect={selectSection}
            onAddCustomSection={addCustomSection}
            onToggleCollapsed={toggleCollapsed}
          />
        )}

        {/* The scroller *is* the measured element, so the padding and the
            scrollbar gutter come off the width before any form sees it. */}
        <EditorLayoutProvider
          elementRef={panelRef}
          className="clean-scrollbar min-h-0 min-w-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6"
        >
          {/* ⚠️ Phones clear the fixed preview button, not just the fold:
              `MobilePreviewAction` is `bottom-4` and 44px tall, so 48px of
              padding leaves it parked on top of the last section row. */}
          <PageContainer maxWidth="full" className={isPhone ? 'pb-24' : 'pb-12'}>
            {!isEngaged && (
              <EditorStartPanel
                onCreate={startWithBasics}
                onImport={() => openImportModal('import_choice', 'editor')}
              />
            )}

            {/* The landing CTA skips the start panel, so its import choice stays
                one click away until the CV holds anything. */}
            {isEngaged && !hasData && (
              <EditorImportHint onImport={() => openImportModal('import_choice', 'editor')} />
            )}

            {isEngaged && showPhoneList && (
              <PhoneSectionList
                rows={rows}
                customRows={customRows}
                onSelect={selectSection}
                onAddCustomSection={addCustomSection}
              />
            )}

            {isEngaged && !showPhoneList && (
              <>
                {isPhone && (
                  <Button variant="quiet" size="sm" onClick={clearSection} className="mb-3">
                    <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {t('editor.rail.back_to_sections')}
                  </Button>
                )}
                <EditorSectionPanel
                  section={activeSection}
                  onDeleteCustomSection={deleteCustomSection}
                />
              </>
            )}
          </PageContainer>
        </EditorLayoutProvider>
      </div>
    </div>
  );
};
