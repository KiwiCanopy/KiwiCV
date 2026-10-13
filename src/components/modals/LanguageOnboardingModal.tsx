import React, { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DialogFrame, DialogFrameDescription, DialogFrameTitle } from '@/components/ui/DialogFrame';
import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { BRAND_CONFIG } from '@/config/brand';
import { type LocaleCode, locales } from '@/locales';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { lookupTranslation } from '@/utils/translationLookup';

export const LanguageOnboardingModal: React.FC = () => {
  const { appLanguage, setAppLanguage, firstTimeLanguageSelected, setFirstTimeLanguageSelected } =
    useUIStore();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  const [selectedUILang, setSelectedUILang] = useState<LocaleCode>(appLanguage || 'en');
  const [selectedCVLang, setSelectedCVLang] = useState<LocaleCode>(
    (resume.meta.theme.locale as LocaleCode) || 'en',
  );

  // If already selected, do not show
  if (firstTimeLanguageSelected) return null;

  // Translated against the language being previewed in the select, not the
  // stored app language — the copy follows the choice before it is committed.
  const translate = (fullPath: string) =>
    lookupTranslation(locales[selectedUILang] ?? locales.en, fullPath) ?? fullPath;

  const tUI = (path: string) => {
    const fullPath = `welcome.onboarding_lang.${path}`;
    const value = translate(fullPath);
    return value === fullPath ? path : value;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 1. Save UI language
    setAppLanguage(selectedUILang);
    // 2. Save CV language
    updateMeta({
      theme: {
        ...resume.meta.theme,
        locale: selectedCVLang,
      },
    });
    // 3. Mark onboarding selection as complete
    setFirstTimeLanguageSelected(true);
  };

  return (
    <DialogFrame
      open={true}
      // First-run language gate: never user-dismissible, so `dismissible={false}`
      // omits the close button and blocks Escape. Outside-click is always blocked.
      onOpenChange={() => {}}
      dismissible={false}
      closeLabel={translate('common.close_dialog')}
      maxWidth="lg"
      zIndexClassName="z-[9999]"
      header={
        <div className="flex items-start gap-4 p-5 pb-6 sm:p-6 sm:pb-6">
          <div className="bg-muted border-border flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border p-2.5">
            <img
              src={BRAND_CONFIG.assets.symbol}
              alt={translate('common.logo_alt')}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <DialogFrameTitle className="text-foreground text-xl font-semibold tracking-tight">
              {tUI('title')}
            </DialogFrameTitle>
            <DialogFrameDescription className="text-muted-foreground mt-1 text-sm leading-6">
              {tUI('description')}
            </DialogFrameDescription>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col px-5 pb-5 sm:px-6 sm:pb-6">
        <div className="mb-6 space-y-3">
          <div className="bg-muted/50 border-border space-y-2 rounded-xl border p-4">
            <LocaleSelect
              label={tUI('ui_label')}
              value={selectedUILang}
              onValueChange={(language) => language && setSelectedUILang(language)}
              className="font-medium"
            />
            <p className="text-muted-foreground text-xs leading-5">{tUI('ui_desc')}</p>
          </div>

          <div className="bg-muted/50 border-border space-y-2 rounded-xl border p-4">
            <LocaleSelect
              label={tUI('cv_label')}
              value={selectedCVLang}
              onValueChange={(language) => language && setSelectedCVLang(language)}
              className="font-medium"
            />
            <p className="text-muted-foreground text-xs leading-5">{tUI('cv_desc')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-muted-foreground text-xs leading-5">{tUI('note')}</p>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            {tUI('cta')}
          </Button>
        </div>
      </form>
    </DialogFrame>
  );
};
