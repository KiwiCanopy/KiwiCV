import { useLayoutEffect, useRef } from 'react';
import { FiGithub } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

import { Globe, Info, Sparkles } from 'lucide-react';

import { renderWithLinks } from '../utils';

interface HostingSectionProps {
  t: (key: string) => string;
}

export const HostingSection = ({ t }: HostingSectionProps) => {
  const location = useLocation();
  const optionARef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (location.hash === '#option-a' && optionARef.current) {
      setTimeout(() => {
        optionARef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
      <div className="scroll-mt-20">
        <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
          {t('extras.howto.hosting.title')}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {t('extras.howto.hosting.intro')}
        </p>
      </div>

      <div className="space-y-12">
        {/* Option A: Manual */}
        <div id="option-a" ref={optionARef} className="scroll-mt-24 space-y-6">
          <h3 className="text-foreground flex items-center gap-2 text-xl font-extrabold">
            <span className="bg-primary/10 text-primary-strong flex h-8 w-8 items-center justify-center rounded-lg text-sm">
              A
            </span>
            {t('extras.howto.hosting.manual_title')}
          </h3>

          <div className="border-muted relative ml-[15px] space-y-8 border-l-2 pt-2 pb-2">
            <div className="relative pl-10">
              <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3">
                  <h4 className="text-foreground text-lg font-semibold">
                    {t('extras.howto.hosting.netlify_drop_title')}
                  </h4>
                  <a
                    href="https://app.netlify.com/drop"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <Sparkles className="h-3 w-3" />
                    {t('common.go_live')}
                  </a>
                </div>
                <p className="text-foreground/80 leading-relaxed">
                  {renderWithLinks(t('extras.howto.hosting.netlify_drop_desc'))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Option B: Automated */}
        <div className="space-y-6">
          <h3 className="text-foreground flex items-center gap-2 text-xl font-extrabold">
            <span className="bg-primary/10 text-primary-strong flex h-8 w-8 items-center justify-center rounded-lg text-sm">
              B
            </span>
            {t('extras.howto.hosting.automated_title')}
          </h3>

          <div className="border-muted relative ml-[15px] space-y-12 border-l-2 pt-2 pb-2">
            <div className="relative pl-10">
              <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
                <Globe className="h-4 w-4" />
              </div>
              <div className="space-y-3 pt-1">
                <h4 className="text-foreground text-lg font-semibold">
                  {t('extras.howto.hosting.netlify_title')}
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  {t('extras.howto.hosting.netlify_desc')}
                </p>
              </div>
            </div>

            <div className="relative pl-10">
              <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
                <FiGithub className="h-4 w-4" />
              </div>
              <div className="space-y-3 pt-1">
                <h4 className="text-foreground text-lg font-semibold">
                  {t('extras.howto.hosting.github_pages_title')}
                </h4>
                <p className="text-foreground/80 leading-relaxed">
                  {t('extras.howto.hosting.github_pages_desc')}
                </p>
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800/50 dark:bg-amber-950/30">
                  <p className="flex gap-2 text-sm leading-relaxed text-amber-800 dark:text-amber-200">
                    <span className="mt-0.5 shrink-0">⚠️</span>
                    <span>{t('extras.howto.hosting.privacy_warning')}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-border/50 mt-8 space-y-4 border-t pt-8">
        <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-950/30">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
          <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
            {t('extras.howto.hosting.push_folder_hint')}
          </p>
        </div>

        <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800/50 dark:bg-red-950/30">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <p className="text-sm leading-relaxed text-red-800 dark:text-red-200">
            {t('extras.howto.hosting.sensitive_data_warning')}
          </p>
        </div>
      </div>
    </div>
  );
};
