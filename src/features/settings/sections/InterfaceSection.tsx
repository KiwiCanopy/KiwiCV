import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { InstallAppRow } from '@/features/settings/sections/InstallAppRow';
import { SettingsCard } from '@/features/settings/shared/SettingsCard';
import { type LocaleCode } from '@/locales';
import { Globe, Monitor, Moon, Sun } from 'lucide-react';

interface InterfaceSectionProps {
  title: string;
  description: string;
  languageLabel: string;
  languageDescription: string;
  appearanceLabel: string;
  themeDescription: string;
  currentLanguage: string;
  currentTheme: 'light' | 'dark' | 'system';
  onLanguageChange: (lang: string) => void;
  onThemeChange: (theme: string) => void;
  t: (key: string) => string;
}

export const InterfaceSection = ({
  title,
  description,
  languageLabel,
  languageDescription,
  appearanceLabel,
  themeDescription,
  currentLanguage,
  currentTheme,
  onLanguageChange,
  onThemeChange,
  t,
}: InterfaceSectionProps) => {
  return (
    <SettingsCard title={title} icon={<Globe className="text-muted-foreground h-5 w-5" />}>
      <div className="space-y-8">
        {/* The select needs a fixed 12rem to hold the widest `CODE — Endonym`
            option, which leaves too little for the description on a phone —
            so the row stacks below sm rather than squeezing either side. */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-0.5">
            <label className="text-foreground text-sm font-semibold">{languageLabel}</label>
            <p className="text-muted-foreground text-sm">{languageDescription}</p>
          </div>
          <LocaleSelect
            label={languageLabel}
            showLabel={false}
            value={currentLanguage as LocaleCode}
            onValueChange={(language) => language && onLanguageChange(language)}
            wrapperClassName="w-48 shrink-0"
          />
        </div>

        <div className="border-border border-t" />

        <div className="flex flex-col items-end justify-between gap-4 md:flex-row md:items-center">
          <div className="w-full md:w-auto">
            <p className="text-foreground mb-1 block text-sm font-semibold">{appearanceLabel}</p>
            <p className="text-muted-foreground text-sm">{themeDescription || description}</p>
          </div>
          <div className="flex w-full max-w-[400px] flex-1 justify-end md:w-auto">
            <SegmentedToggle
              value={currentTheme}
              onChange={onThemeChange}
              className="w-full"
              options={[
                {
                  value: 'light',
                  label: t('settings.interface.theme_options.light'),
                  icon: <Sun className="h-4 w-4" />,
                },
                {
                  value: 'dark',
                  label: t('settings.interface.theme_options.dark'),
                  icon: <Moon className="h-4 w-4" />,
                },
                {
                  value: 'system',
                  label: t('settings.interface.theme_options.system'),
                  icon: <Monitor className="h-4 w-4" />,
                },
              ]}
            />
          </div>
        </div>

        <div className="border-border border-t" />

        <InstallAppRow t={t} />
      </div>
    </SettingsCard>
  );
};
