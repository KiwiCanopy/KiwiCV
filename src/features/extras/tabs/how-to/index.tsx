import { TableOfContents } from '@/features/extras/TableOfContents';

import { CoreSection } from './components/CoreSection';
import { GithubSection } from './components/GithubSection';
import { HostingSection } from './components/HostingSection';
import { HowToFooter } from './components/HowToFooter';
import { PDFSection } from './components/PDFSection';
import { SyncSection } from './components/SyncSection';
import { useHowTo } from './useHowTo';

export const HowToTab = () => {
  const { t, lang, activeSection, setActiveSection } = useHowTo();

  return (
    <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[240px_1fr]">
      <aside className="md:sticky md:top-6">
        <TableOfContents t={t} activeSection={activeSection} onSectionChange={setActiveSection} />
      </aside>

      <div className="bg-card border-border/50 min-w-0 rounded-xl border p-6 shadow-sm md:p-10">
        {activeSection === 'core' && <CoreSection t={t} />}
        {activeSection === 'sync_guide' && <SyncSection t={t} />}
        {activeSection === 'pdf_guide' && <PDFSection t={t} />}
        {activeSection === 'github-connection' && <GithubSection t={t} lang={lang} />}
        {activeSection === 'hosting' && <HostingSection t={t} />}

        <HowToFooter t={t} />
      </div>
    </div>
  );
};
