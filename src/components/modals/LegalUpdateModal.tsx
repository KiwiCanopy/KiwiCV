import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { LAST_LEGAL_UPDATE } from '@/constants/auth';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/lib/supabase';
import { useToastStore } from '@/store/ui/useToastStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { localizedPath } from '@/utils/localeRouting';
import { ExternalLink, ShieldAlert } from 'lucide-react';

export const LegalUpdateModal: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t, language } = useTranslation();
  const location = useLocation();
  const [checked, setChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const firstTimeLanguageSelected = useUIStore((state) => state.firstTimeLanguageSelected);

  if (!firstTimeLanguageSelected) return null;
  if (!user || !profile) return null;

  // Exclude legal pages, account, and blog pages from the blocking consent modal
  const pathname = location.pathname.toLowerCase();
  const segments = pathname.split('/');
  const isExcludedPage =
    segments.includes('privacy') ||
    segments.includes('terms') ||
    segments.includes('legal-notice') ||
    segments.includes('account') ||
    segments.includes('blog');

  if (isExcludedPage) return null;

  // Check if consent is required
  const acceptedPrivacyAt = profile.accepted_privacy_at
    ? new Date(profile.accepted_privacy_at)
    : null;
  const acceptedTermsAt = profile.accepted_terms_at ? new Date(profile.accepted_terms_at) : null;
  const lastUpdate = new Date(LAST_LEGAL_UPDATE);

  const needsConsent =
    !acceptedPrivacyAt ||
    !acceptedTermsAt ||
    acceptedPrivacyAt < lastUpdate ||
    acceptedTermsAt < lastUpdate;

  if (!needsConsent) return null;

  const handleSubmit = async () => {
    if (!checked) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('profiles')
        .update({
          accepted_terms: true,
          accepted_terms_at: now,
          accepted_privacy: true,
          accepted_privacy_at: now,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      addToast(t('legal.update.success'), 'success');
    } catch (err) {
      console.error('Error updating legal consent:', err);
      addToast(t('common.error_occurred'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentLang = language || 'en';

  return (
    <DialogFrame
      open={true}
      // Blocking consent gate: never user-dismissible. `dismissible={false}`
      // omits the close button and blocks Escape; outside-click is always blocked.
      onOpenChange={() => {}}
      dismissible={false}
      maxWidth="lg"
      zIndexClassName="z-[9999]"
      header={
        <div className="mb-6 flex items-center gap-3 px-6 pt-6">
          <div className="rounded-xl bg-amber-500/10 p-2 text-amber-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <DialogFrameTitle className="text-foreground text-lg font-black tracking-tight sm:text-xl">
            {t('legal.update.title')}
          </DialogFrameTitle>
        </div>
      }
    >
      <div className="space-y-6 px-6 pb-6">
        <DialogFrameDescription className="text-muted-foreground text-sm leading-relaxed">
          {t('legal.update.intro')}
        </DialogFrameDescription>

        <div className="rounded-2xl border border-amber-500/10 bg-amber-500/5 p-5 dark:bg-amber-500/10">
          <h4 className="mb-2 text-xs font-black tracking-wider text-amber-600 uppercase dark:text-amber-400">
            {t('legal.update.changes_title')}
          </h4>
          <p className="text-xs leading-relaxed font-medium text-amber-800/90 dark:text-amber-300/90">
            {t('legal.update.changes_desc')}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs font-bold">{t('legal.update.links_desc')}</p>
          <div className="flex flex-wrap gap-4">
            <a
              href={localizedPath(currentLang, `/terms`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-strong inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
            >
              {t('legal.update.link_terms')}
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={localizedPath(currentLang, `/privacy`)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-strong inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
            >
              {t('legal.update.link_privacy')}
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <hr className="border-border/50" />

        <div className="flex items-start gap-3">
          <input
            id="consent-checkbox"
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="border-border text-primary-strong focus:ring-primary-strong mt-0.5 h-4 w-4 cursor-pointer rounded"
          />
          <label
            htmlFor="consent-checkbox"
            className="text-muted-foreground cursor-pointer text-xs leading-relaxed select-none"
          >
            {t('legal.update.checkbox')}
          </label>
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!checked}
          loading={isSubmitting}
          loadingLabel={t('common.loading')}
          className="w-full rounded-2xl py-4 text-sm font-black"
        >
          {t('legal.update.button')}
        </Button>
      </div>
    </DialogFrame>
  );
};
