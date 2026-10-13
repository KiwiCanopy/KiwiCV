import { useEffect, useState } from 'react';

import { DesignTab } from '@/features/dashboard/design/DesignTab';
import { EditorTab } from '@/features/dashboard/editor/EditorTab';
import type { DashboardTabMode } from '@/features/dashboard/layout/DashboardTabs';
import { EditorLayoutProvider } from '@/features/dashboard/layout/EditorLayoutProvider';
import { type DashboardWorkspaceLayout } from '@/features/dashboard/layout/useDashboardWorkspace';
import { LoaderCircle } from 'lucide-react';

interface LeftPaneProps {
  activeTab: DashboardTabMode;
  workspaceLayout: DashboardWorkspaceLayout;
  workspaceWidth: number;
  /** This pane's own width — what the rail and the entry column divide up. */
  editorPaneWidth: number;
}

export const LeftPane = ({
  activeTab,
  workspaceLayout,
  workspaceWidth,
  editorPaneWidth,
}: LeftPaneProps) => {
  const [hasMountedOther, setHasMountedOther] = useState(false);

  useEffect(() => {
    // Preload the other tab after the initial paint
    const timeoutId = setTimeout(() => {
      setHasMountedOther(true);
    }, 150);

    return () => clearTimeout(timeoutId);
  }, []);

  const isEditor = activeTab === 'editor';
  const isDesign = activeTab === 'design';

  return (
    <div className="bg-workspace flex h-full min-h-0 w-full min-w-0 flex-col border-r lg:w-auto lg:flex-1">
      <div className="relative flex w-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Editor Tab Layer: Mount immediately if active, otherwise wait for
            preload. ⚠️ It owns its own scrolling — the section rail has to stay
            put while the section panel scrolls, so this layer must not be one
            scroller around both. It also owns its own `EditorLayoutProvider`,
            because the rail is part of this pane and must not count towards the
            width the entry column reports. */}
        {(isEditor || hasMountedOther) && (
          <div className={!isEditor ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
            <EditorTab
              workspaceLayout={workspaceLayout}
              workspaceWidth={workspaceWidth}
              editorPaneWidth={editorPaneWidth}
            />
          </div>
        )}

        {/* Design Tab Layer: Mount immediately if active, otherwise wait for
            preload. No rail here, so its measured column *is* the pane. */}
        {(isDesign || hasMountedOther) && (
          <div className={!isDesign ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
            <EditorLayoutProvider className="flex min-h-0 min-w-0 flex-1 flex-col">
              <div className="clean-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
                <DesignTab />
              </div>
            </EditorLayoutProvider>
          </div>
        )}

        {/* Show a loader only if the INITIAL active tab hasn't mounted yet (should be near instant) */}
        {!isEditor && !isDesign && (
          <div className="bg-background/70 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="border-border/50 bg-card/90 rounded-full border p-3 shadow-sm">
              <LoaderCircle className="text-primary-strong h-5 w-5 animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
