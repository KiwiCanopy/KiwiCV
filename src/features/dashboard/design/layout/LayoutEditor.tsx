import { memo } from 'react';

import { isTwoColumnLayout } from '@/components/preview/themes/shared';
import { OneColumnLayoutEditor } from '@/features/dashboard/design/layout/OneColumnLayoutEditor';
import { TwoColumnLayoutEditor } from '@/features/dashboard/design/layout/TwoColumnLayoutEditor';
import { useResumeStore } from '@/store/resume/useResumeStore';

/**
 * LayoutEditor — Main entry point for section reordering/layout management.
 * Dispatches to either OneColumnLayoutEditor or TwoColumnLayoutEditor
 * based on the current theme's layout capabilities.
 */
export const LayoutEditor = memo(() => {
  const resume = useResumeStore((state) => state.resume);

  // Detect layout mode (2-column vs 1-column)
  const isTwoColumn = isTwoColumnLayout(resume.meta);

  if (isTwoColumn) {
    return <TwoColumnLayoutEditor />;
  }

  return <OneColumnLayoutEditor />;
});

LayoutEditor.displayName = 'LayoutEditor';
