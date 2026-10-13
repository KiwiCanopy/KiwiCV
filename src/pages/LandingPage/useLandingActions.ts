import { useNavigate } from 'react-router-dom';

import { type EditorNavState } from '@/features/dashboard/editor/useEditorSections';
import { useLanguage } from '@/hooks/useLanguage';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useImportModalStore } from '@/store/ui/useImportModalStore';
import { localizedPath } from '@/utils/localeRouting';
import { isMeaningfullyEmpty } from '@/utils/validation';

/** The landing sections that can send a visitor into the editor. */
export type CTASource = 'hero' | 'closing_cta';

export function useLandingActions() {
  const navigate = useNavigate();
  const lang = useLanguage();
  const openImport = useImportModalStore((state) => state.open);
  // Reads this browser's persisted CV only; a cloud CV on another device still sees "Create".
  const hasCv = useResumeStore((state) => !isMeaningfullyEmpty(state.resume));

  const goToEditor = (source: CTASource = 'hero') => {
    analytics.track(ANALYTICS_EVENTS.PAGE_VIEWED, { page: 'dashboard', source });
    // Straight into Basics: the visitor already chose "create" over "import" here.
    // A returning visitor's CV is not a blank start, so it gets neither the event nor the focus.
    const isBlank = !hasCv;
    if (isBlank) {
      analytics.track(ANALYTICS_EVENTS.CV_STARTED_BLANK, { source: `landing_${source}` });
    }
    navigate(localizedPath(lang, `/dashboard?tab=editor&section=basics`), {
      state: { focusBasicsName: isBlank } satisfies EditorNavState,
    });
  };

  const handleOpenImport = () => {
    openImport('import_choice', 'landing');
  };

  return {
    hasCv,
    goToEditor,
    openImport: handleOpenImport,
  };
}
