import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { PageContainer } from '@/components/ui/PageContainer';
import { CvDefaultsSection } from '@/features/settings/sections/CvDefaultsSection';
import { DangerZoneSection } from '@/features/settings/sections/DangerZoneSection';
import { InterfaceSection } from '@/features/settings/sections/InterfaceSection';
import { SyncAndStorageSection } from '@/features/settings/sections/SyncAndStorageSection';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { useToastStore } from '@/store/ui/useToastStore';
import { useUIStore } from '@/store/ui/useUIStore';
import { localizedPath } from '@/utils/localeRouting';

export const Settings = () => {
  const { t } = useTranslation();
  const { hash } = useLocation();
  const lang = useLanguage();
  const [isEditingPattern, setIsEditingPattern] = useState(false);
  const [tempPattern, setTempPattern] = useState('');

  useEffect(() => {
    if (hash) {
      // Use a small timeout to ensure the DOM is fully rendered
      const timer = setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a subtle highlight effect
          element.classList.add('ring-2', 'ring-primary-strong', 'ring-offset-4', 'rounded-lg');
          setTimeout(() => {
            element.classList.remove(
              'ring-2',
              'ring-primary-strong',
              'ring-offset-4',
              'rounded-lg',
            );
          }, 2000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hash]);

  const addToast = useToastStore((state) => state.addToast);
  const confirm = useConfirmStore((state) => state.confirm);
  const appLanguage = useUIStore((state) => state.appLanguage);
  const setAppLanguage = useUIStore((state) => state.setAppLanguage);
  const appTheme = useUIStore((state) => state.appTheme);
  const setAppTheme = useUIStore((state) => state.setAppTheme);

  const handleSavePattern = () => {
    // Validate brackets
    let balance = 0;
    for (const char of tempPattern) {
      if (char === '{') balance++;
      if (char === '}') balance--;
      if (balance < 0) {
        addToast(t('settings.export.pattern_error_brackets'), 'error');
        return;
      }
    }
    if (balance !== 0) {
      addToast(t('settings.export.pattern_error_brackets'), 'error');
      return;
    }

    updateMeta({ export: { ...meta.export, filenamePattern: tempPattern } });
    addToast(t('common.success'), 'success');
    setIsEditingPattern(false);
  };

  const startEditingPattern = () => {
    setTempPattern(meta.export.filenamePattern);
    setIsEditingPattern(true);
  };

  const cancelEditingPattern = () => {
    setTempPattern(meta.export.filenamePattern);
    setIsEditingPattern(false);
  };

  const handleLanguageChange = (newLang: string) => {
    analytics.track(ANALYTICS_EVENTS.UI_LANGUAGE_SWITCHED, {
      from: appLanguage,
      to: newLang,
      source: 'settings',
    });
    setAppLanguage(newLang as LocaleCode);
  };

  const handleThemeChange = (theme: string) => {
    setAppTheme(theme as 'light' | 'dark' | 'system');
  };

  const meta = useResumeStore((state) => state.resume.meta);
  const updateMeta = useResumeStore((state) => state.updateMeta);

  const handleClearData = async () => {
    analytics.track(ANALYTICS_EVENTS.DATA_CLEAR_MODAL_OPENED);
    const shouldClear = await confirm({
      title: t('settings.danger.delete_data'),
      message: t('settings.danger.delete_data_desc'),
      variant: 'destructive',
      confirmText: t('settings.danger.delete_btn'),
    });

    if (shouldClear) {
      analytics.track(ANALYTICS_EVENTS.DATA_CLEAR_COMPLETED);
      // 1. Reset the store in memory first to prevent accidental persistence
      useResumeStore.getState().resetResume();

      // 2. Clear all web storage (localStorage and sessionStorage)
      localStorage.clear();
      sessionStorage.clear();

      // 3. Force a hard reload to the landing page
      window.location.href = localizedPath(lang);
    } else {
      analytics.track(ANALYTICS_EVENTS.DATA_CLEAR_CANCELLED);
    }
  };

  return (
    <PageContainer className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-3xl font-extrabold tracking-tight">
            {t('settings.title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('settings.interface.theme_description')}</p>
        </div>
      </div>

      <SyncAndStorageSection />

      <CvDefaultsSection
        title={t('settings.cv_defaults.title')}
        projectNameLabel={t('settings.export.project_name')}
        projectNameDescription={t('settings.export.project_name_desc')}
        availableVariablesLabel={t('settings.export.available_variables')}
        patternTip={t('settings.export.pattern_tip')}
        isEditingPattern={isEditingPattern}
        patternValue={meta.export.filenamePattern}
        tempPattern={tempPattern}
        onTempPatternChange={setTempPattern}
        onStartEditingPattern={startEditingPattern}
        onSavePattern={handleSavePattern}
        onCancelEditingPattern={cancelEditingPattern}
        t={t}
      />

      <InterfaceSection
        title={t('settings.interface.title')}
        description={t('settings.interface.theme_description')}
        languageLabel={t('settings.interface.language')}
        languageDescription={t('settings.interface.language_description')}
        appearanceLabel={t('settings.interface.appearance')}
        themeDescription={t('settings.interface.theme_description')}
        currentLanguage={appLanguage}
        currentTheme={appTheme}
        onLanguageChange={handleLanguageChange}
        onThemeChange={handleThemeChange}
        t={t}
      />

      <DangerZoneSection
        title={t('settings.danger.title')}
        actionTitle={t('settings.danger.delete_data')}
        description={t('settings.danger.delete_data_desc')}
        buttonLabel={t('settings.danger.delete_btn')}
        onClearData={handleClearData}
      />
    </PageContainer>
  );
};
