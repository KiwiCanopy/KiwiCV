import { useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/ui/PageContainer';
import { EditorLayoutContext } from '@/features/dashboard/layout/EditorLayoutContext';
import { ExtrasTabNavigation } from '@/features/extras/ExtrasTabNavigation';
import { AboutTab } from '@/features/extras/tabs/AboutTab';
import { ChangelogTab } from '@/features/extras/tabs/ChangelogTab';
import { RoadmapTab } from '@/features/extras/tabs/RoadmapTab';
import { HowToTab } from '@/features/extras/tabs/how-to';
import type { ExtrasTabId } from '@/features/extras/types';
import { useTranslation } from '@/hooks/useTranslation';

// Pinned-wide layout for the Extras tabs; see the comment at the provider.
const WIDE_LAYOUT = { width: 1024, isStandard: true, isSocial: true };

export function Extras() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: ExtrasTabId =
    tabParam === 'roadmap' || tabParam === 'changelog' || tabParam === 'about' ? tabParam : 'howto';

  const setActiveTab = (tab: ExtrasTabId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('v');
    if (tab !== 'howto') {
      newParams.delete('section');
    }
    if (tab === 'howto') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', tab);
    }
    setSearchParams(newParams, { replace: true });
  };

  return (
    <PageContainer className="px-6">
      {/* Page Header */}
      <div className="mb-12 space-y-4 text-center">
        <h1 className="text-foreground text-4xl font-extrabold tracking-tight md:text-5xl">
          {t('extras.page_title')}
        </h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed">
          {t('extras.page_description')}
        </p>
      </div>

      <ExtrasTabNavigation activeTab={activeTab} onTabChange={setActiveTab} t={t} />

      <div className="border-border/50 -mx-6 mb-12 border-b" />

      {/* Section/Accordion/SectionGroup style themselves via the editor's
          container-width context and fall back to the NARROW editor-column
          look when no provider is mounted — bare headers, count badges
          wrapped onto their own line, left-rule content. That layout exists
          for the editor's cramped sidebar (its action clusters run to five
          44px controls); these tabs have no such clusters, and the wide
          bordered-card layout reads better here at EVERY width, phones
          included. So the value is pinned wide instead of measured. */}
      <EditorLayoutContext.Provider value={WIDE_LAYOUT}>
        {activeTab === 'howto' && <HowToTab />}
        {activeTab === 'roadmap' && <RoadmapTab />}
        {activeTab === 'changelog' && <ChangelogTab />}
        {activeTab === 'about' && <AboutTab />}
      </EditorLayoutContext.Provider>
    </PageContainer>
  );
}
