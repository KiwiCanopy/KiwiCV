import { FiGithub } from 'react-icons/fi';

import { cn } from '@/utils/cn';
import { FileText, Globe, Languages, Layout } from 'lucide-react';

interface TableOfContentsProps {
  t: (key: string) => string;
  activeSection: string;
  onSectionChange: (id: string) => void;
}

export const TableOfContents = ({ t, activeSection, onSectionChange }: TableOfContentsProps) => {
  const sections = [
    { id: 'core', label: t('extras.howto.core.title'), icon: Layout },
    { id: 'sync_guide', label: t('extras.howto.sync_guide.title'), icon: Languages },
    { id: 'pdf_guide', label: t('extras.howto.pdf_guide.title'), icon: FileText },
    { id: 'github-connection', label: t('extras.howto.github.title'), icon: FiGithub },
    { id: 'hosting', label: t('extras.howto.hosting.title'), icon: Globe },
  ];

  return (
    <div className="space-y-8">
      <nav className="space-y-3">
        <h3 className="text-muted-foreground px-3 text-xs font-extrabold tracking-wider uppercase">
          {t('extras.howto.toc_title')}
        </h3>
        <ul className="space-y-1">
          {sections.map((section) => (
            <li key={section.id}>
              <button
                onClick={() => onSectionChange(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-primary/10 text-primary-strong cursor-default'
                    : 'bg-card text-muted-foreground hover:bg-background hover:text-foreground translate-y-0 hover:-translate-y-0.5',
                )}
              >
                <section.icon className="h-4 w-4" />
                <span className="text-left leading-tight">{section.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};
