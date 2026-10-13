import { FiGithub } from 'react-icons/fi';
import { Link } from 'react-router-dom';

import { localizedPath } from '@/utils/localeRouting';
import { Key, RefreshCcw } from 'lucide-react';

interface GithubSectionProps {
  t: (key: string) => string;
  lang: string;
}

export const GithubSection = ({ t, lang }: GithubSectionProps) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-8 duration-300">
      <div>
        <h2 className="text-foreground mb-4 text-3xl font-extrabold tracking-tight">
          {t('extras.howto.github.title')}
        </h2>
        <p className="text-foreground/80 text-lg leading-relaxed">
          {t('extras.howto.github.intro')}
        </p>
      </div>

      <div className="border-muted relative ml-[15px] space-y-12 border-l-2 pt-4 pb-4">
        <div className="relative pl-10">
          <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
            <FiGithub className="h-5 w-5" />
          </div>
          <div className="space-y-3 pt-1">
            <h4 className="text-foreground text-lg font-semibold">
              1. {t('extras.howto.github.step1_title')}
            </h4>
            <p className="text-foreground/80 text-base leading-relaxed">
              {t('extras.howto.github.step1_desc')}
            </p>
            <div className="mt-4">
              <a
                href="https://github.com/new?name=kiwicv&visibility=private"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t('extras.howto.github.create_repo_link')}
              </a>
            </div>
          </div>
        </div>

        <div className="relative pl-10">
          <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
            <Key className="h-4 w-4" />
          </div>
          <div className="space-y-3 pt-1">
            <h4 className="text-foreground text-lg font-semibold">
              2. {t('extras.howto.github.step2_title')}
            </h4>
            <p className="text-foreground/80 text-base leading-relaxed">
              {t('extras.howto.github.step2_desc')}
            </p>

            <div className="bg-muted/30 border-border/50 rounded-lg border p-4">
              <p className="text-muted-foreground bg-background rounded border p-3 font-mono text-sm">
                Settings &gt; Developer settings &gt; Personal access tokens &gt; Fine-grained
                tokens
              </p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-950/30">
              <p className="flex gap-2 text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                <span className="mt-0.5 shrink-0">🔒</span>
                <span>{t('extras.howto.github.pat_security_tip')}</span>
              </p>
            </div>
            <div className="mt-4">
              <a
                href="https://github.com/settings/personal-access-tokens/new"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t('extras.howto.github.create_pat_link')}
              </a>
            </div>
          </div>
        </div>

        <div className="relative pl-10">
          <div className="bg-primary text-primary-foreground absolute top-0 -left-[17px] flex h-8 w-8 items-center justify-center rounded-full shadow-sm">
            <RefreshCcw className="h-4 w-4" />
          </div>
          <div className="space-y-3 pt-1">
            <h4 className="text-foreground text-lg font-semibold">
              3. {t('extras.howto.github.step3_title')}
            </h4>
            <p className="text-foreground/80 text-base leading-relaxed">
              {t('extras.howto.github.step3_desc')}
            </p>

            <div className="mt-4">
              <Link
                to={localizedPath(lang, `/settings`)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t('extras.howto.github.go_to_settings')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
