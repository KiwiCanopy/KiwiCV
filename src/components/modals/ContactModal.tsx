import React, { useState } from 'react';

import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { CONTACT_EMAIL } from '@/constants/contact';
import { useTranslation } from '@/hooks/useTranslation';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useToastStore } from '@/store/ui/useToastStore';
import { cn } from '@/utils/cn';
import { Check, Copy, HeartHandshake, Mail } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const addToast = useToastStore((state) => state.addToast);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      analytics.track(ANALYTICS_EVENTS.CONTACT_MODAL_OPENED);
    }
  }, [isOpen]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(CONTACT_EMAIL);
    setCopied(true);
    addToast(t('common.copied'), 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DialogFrame
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      maxWidth="md"
      zIndexClassName="z-[120]"
      header={
        <div className="relative p-8">
          {/* Decorative background element */}
          <div className="bg-primary/5 absolute -top-24 -right-24 h-48 w-48 rounded-full blur-3xl" />
          <div className="bg-primary/5 absolute -bottom-24 -left-24 h-48 w-48 rounded-full blur-3xl" />

          <div className="relative flex flex-col items-center space-y-6 text-center">
            {/* Icon Area */}
            <div className="bg-primary/10 text-primary-strong ring-primary-strong/5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm ring-8">
              <HeartHandshake className="h-8 w-8" aria-hidden="true" />
            </div>

            {/* Text Area */}
            <div className="space-y-3">
              <DialogFrameTitle className="text-2xl font-bold tracking-tight sm:text-3xl">
                {t('legal.contact.title')}
              </DialogFrameTitle>
              <DialogFrameDescription className="text-muted-foreground text-base leading-relaxed">
                {t('legal.contact.message')}
              </DialogFrameDescription>
            </div>

            {/* Support Identifier & Email Copy */}
            <div className="flex flex-col items-center gap-2 pt-2">
              <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                {t('legal.contact.support_label')}
              </span>
              <div className="flex items-center gap-2">
                <code className="bg-accent/50 text-foreground rounded-lg px-3 py-1.5 font-mono text-sm font-medium">
                  {CONTACT_EMAIL}
                </code>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300',
                    copied
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-background hover:bg-accent border-input hover:border-primary-strong/30 text-muted-foreground hover:text-primary-strong border shadow-sm',
                  )}
                  title={t('common.copied')}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {/* Primary Action */}
            <div className="w-full">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary-strong flex w-full items-center justify-center gap-3 rounded-xl py-4 text-base font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <Mail className="h-5 w-5" aria-hidden="true" />
                {t('legal.contact.button')}
              </a>
              <p className="text-muted-foreground mt-3 text-xs font-medium">
                {t('legal.contact.prompt')}
              </p>
            </div>

            {/* Secondary Action: Back/Close */}
            <div className="w-full pt-2">
              <button
                type="button"
                onClick={onClose}
                className="border-input bg-card text-foreground hover:bg-muted focus-visible:ring-primary-strong w-full rounded-xl border py-3 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t('common.back')}
              </button>
            </div>
          </div>
        </div>
      }
    >
      {null}
    </DialogFrame>
  );
};
