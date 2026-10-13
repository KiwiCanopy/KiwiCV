import { memo } from 'react';

import { PreviewHeader } from '@/features/dashboard/preview/PreviewHeader';
import { MemoizedViewer } from '@/features/dashboard/preview/Viewer';
import type { ViewMode } from '@/store/ui/useUIStore';

interface RightPaneProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export const RightPane = memo(({ viewMode, onViewModeChange }: RightPaneProps) => {
  return (
    <div className="bg-desk flex h-full w-full min-w-0 flex-1 flex-col">
      <PreviewHeader viewMode={viewMode} onViewModeChange={onViewModeChange} />
      <div className="relative flex flex-1 flex-col">
        <MemoizedViewer viewMode={viewMode} />
      </div>
    </div>
  );
});

RightPane.displayName = 'RightPane';
