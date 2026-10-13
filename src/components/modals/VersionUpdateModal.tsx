import React from 'react';
import { useNavigate } from 'react-router-dom';

import { VersionUpdateChangelog } from '@/components/modals/version-update/VersionUpdateChangelog';
import { VersionUpdateHighlights } from '@/components/modals/version-update/VersionUpdateHighlights';
import { useVersionUpdateContent } from '@/components/modals/version-update/useVersionUpdateContent';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { localizedPath } from '@/utils/localeRouting';
import { History, Sparkles } from 'lucide-react';

interface VersionUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
  missedVersions?: string[];
}

export const VersionUpdateModal: React.FC<VersionUpdateModalProps> = ({
  isOpen,
  onClose,
  version,
  missedVersions = [],
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = useLanguage();

  const { highlights, allParsedEntries, grouped, types } = useVersionUpdateContent(
    version,
    missedVersions,
  );

  const handleFullChangelog = () => {
    onClose();
    navigate(localizedPath(lang, `/extras?tab=changelog&v=${version}`));
  };

  const hasHighlights = highlights.length > 0;

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="2xl"
      zIndexClassName="z-[100]"
      header={
        <div className="relative px-6 pt-10 pb-12 sm:px-12">
          {/* Background Accents. Clipped to the modal bounds by their own inset
              layer: DialogFrame's scroll region is overflow-y-auto (so x computes
              to auto too), and the -bottom-24 accent would otherwise add empty
              scroll space and a spurious horizontal scrollbar. Not clipped on the
              header root, which would swallow the InfoCard hover tooltips. */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="bg-primary/10 absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-50 blur-3xl" />
            <div className="bg-secondary/10 absolute -right-24 -bottom-24 h-64 w-64 rounded-full opacity-50 blur-3xl" />
          </div>

          {/* Header */}
          <div
            className={cn('relative z-10 space-y-3 text-center', hasHighlights ? 'mb-8' : 'mb-6')}
          >
            <div className="bg-primary/10 text-primary-strong border-primary-strong/20 mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black tracking-widest uppercase">
              {version.endsWith('.0.0') ? (
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
              ) : (
                <History className="h-3.5 w-3.5" />
              )}
              v{version}
            </div>
            <DialogFrameTitle
              className={cn(
                'text-foreground leading-tight font-black tracking-tighter',
                hasHighlights ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl',
              )}
            >
              {t('updates.title_hero')}
            </DialogFrameTitle>
            <DialogFrameDescription className="text-muted-foreground mx-auto max-w-md text-sm leading-relaxed font-medium sm:text-base">
              {t('updates.tagline')}
            </DialogFrameDescription>
          </div>

          {hasHighlights && (
            <VersionUpdateHighlights
              highlights={highlights}
              onFullChangelog={handleFullChangelog}
            />
          )}

          <VersionUpdateChangelog
            hasHighlights={hasHighlights}
            grouped={grouped}
            types={types}
            totalEntries={allParsedEntries.length}
            missedVersionCount={missedVersions.length}
            onFullChangelog={handleFullChangelog}
          />

          {/* Footer */}
          <div className="border-border/60 relative z-10 mt-6 flex items-center justify-end border-t pt-4">
            <button
              type="button"
              onClick={handleFullChangelog}
              className="text-primary-strong hover:text-foreground text-[10px] font-black tracking-widest uppercase transition-colors"
            >
              {t('updates.view_changelog')}
            </button>
          </div>
        </div>
      }
    >
      {null}
    </DialogFrame>
  );
};
