import React from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { Briefcase, Languages, Plane, ShieldCheck } from 'lucide-react';

interface TranslationInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * A premium centered modal that invites the user to translate their CV with AI.
 * Features a hero icon and value badges for a "cool" professional feel. The
 * centered hero composition rides in DialogFrame's `header` slot rather than the
 * default title row, so the consumer keeps its full-bleed layout.
 */
export const TranslationInviteModal: React.FC<TranslationInviteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  const badges = [
    {
      icon: ShieldCheck,
      text: t('ai.translation_badge_professional'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      icon: Briefcase,
      text: t('ai.translation_badge_context'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      icon: Plane,
      text: t('ai.translation_badge_global'),
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="md"
      zIndexClassName="z-[80]"
      header={
        <div className="px-8 pt-12 text-center">
          {/* Hero Icon Section */}
          <div className="bg-primary/5 relative mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2.5rem]">
            <div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-2xl" />
            <div className="bg-primary/10 relative flex h-20 w-20 items-center justify-center rounded-[2rem] shadow-inner">
              <Languages className="text-primary-strong h-10 w-10" />
            </div>
          </div>

          <DialogFrameTitle className="text-foreground mb-3 text-2xl font-black tracking-tight">
            {t('ai.translation_invite_title')}
          </DialogFrameTitle>

          <DialogFrameDescription className="text-muted-foreground mb-8 px-2 text-sm leading-relaxed antialiased">
            {t('ai.translation_invite_message')}
          </DialogFrameDescription>

          {/* Badges Section */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {badges.map((badge, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm transition-transform hover:scale-105',
                  badge.bgColor,
                  badge.color,
                )}
              >
                <badge.icon className="h-3.5 w-3.5" />
                {badge.text}
              </div>
            ))}
          </div>
        </div>
      }
    >
      {/* Actions */}
      <div className="flex flex-col gap-3 px-8 pb-8">
        <button
          type="button"
          onClick={onConfirm}
          className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-base font-black text-amber-950 transition-all hover:from-amber-500 hover:to-amber-600 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none active:scale-[0.98]"
        >
          <span>{t('ai.translation_invite_confirm')}</span>
        </button>

        <Button
          variant="secondary"
          onClick={onClose}
          className="w-full rounded-xl py-3 text-sm font-bold"
        >
          {t('ai.translation_invite_manual')}
        </Button>
      </div>
    </DialogFrame>
  );
};
