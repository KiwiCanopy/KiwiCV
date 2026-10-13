import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/ui/PageContainer';
import { PassthroughPanel } from '@/features/raw-json/PassthroughPanel';
import { RawJsonTabs } from '@/features/raw-json/RawJsonTabs';
import { RawJsonViewer } from '@/features/raw-json/RawJsonViewer';
import type { RawJsonTabId } from '@/features/raw-json/types';
import { useTranslation } from '@/hooks/useTranslation';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useImportModalStore } from '@/store/ui/useImportModalStore';
import { toResumeJson } from '@/utils/passthrough';
import { getFilteredResumeData } from '@/utils/resume-export';
import { Upload } from 'lucide-react';

export const RawJsonData = () => {
  const { t } = useTranslation();
  const syncVersion = useResumeStore((state) => state.syncVersion);
  const resume = useResumeStore((state) => state.resume);
  const openImportModal = useImportModalStore((state) => state.open);

  useEffect(() => {
    syncVersion();
  }, [syncVersion]);

  const reducedResume = getFilteredResumeData(resume, 'reduced');
  const cleanResume = getFilteredResumeData(resume, 'standard');

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: RawJsonTabId =
    tabParam === 'reduced' || tabParam === 'standard' || tabParam === 'full' ? tabParam : 'full';

  const project_name =
    useResumeStore((state) => state.resume.basics.name)
      ?.replace(/\s+/g, '_')
      .toLowerCase() || 'resume';

  const tabs = [
    {
      id: 'reduced',
      label: t('raw_json.reduced'),
      title: t('raw_json.reduced_title'),
      desc: t('raw_json.reduced_desc'),
      data: reducedResume,
      descColor: 'text-muted-foreground',
      filename: `${project_name}.json`,
    },
    {
      id: 'standard',
      label: t('raw_json.standard'),
      title: t('raw_json.standard_title'),
      desc: t('raw_json.standard_desc'),
      data: cleanResume,
      descColor: 'text-muted-foreground',
      filename: `${project_name}.json`,
    },
    {
      id: 'full',
      label: t('raw_json.full'),
      title: t('raw_json.full_title'),
      desc: t('raw_json.full_desc'),
      data: toResumeJson(resume),
      descColor: 'text-muted-foreground',
      filename: `${project_name}_full.json`,
    },
  ] as const;

  const currentTab = tabs.find((t) => t.id === activeTab)!;
  const setActiveTab = (tab: RawJsonTabId) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('tab', tab);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <PageContainer className="flex h-[calc(100vh-8rem)] min-h-0 flex-col px-6">
      <div className="mb-8 flex shrink-0 flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-extrabold">{t('sidebar.raw_json')}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* ⚠️ Primary, and through the `Button` primitive rather than
              hand-rolled classes — the fill/edge rule already lives there, and
              a fourth copy of it is how the two roles drift apart again.

              Primary because this is the ONLY action in the page's header; the
              download beside the JSON is a bare icon inside the viewer's own
              chrome. Import is what someone came here to do, and it was dressed
              as the alternative to something that is not on the page.

              Not the landing hero's answer: there "Create your CV" owns the one
              primary and import really is the second choice. Primary is scarce
              per surface, which is why it belongs to import here and not
              there. */}
          <Button
            variant="primary"
            onClick={() => openImportModal('import_choice', 'raw_json')}
            className="min-h-11 gap-2 whitespace-nowrap"
          >
            <Upload className="h-4 w-4" />
            <span className="hidden text-sm font-medium sm:inline">{t('editor.import')}</span>
          </Button>
          <RawJsonTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      </div>

      <PassthroughPanel />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden pb-4">
        <RawJsonViewer tab={currentTab} />
      </div>
    </PageContainer>
  );
};

export default RawJsonData;
