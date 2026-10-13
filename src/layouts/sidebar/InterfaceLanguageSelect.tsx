import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { type LocaleCode } from '@/locales';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useUIStore } from '@/store/ui/useUIStore';
import { cn } from '@/utils/cn';

export function InterfaceLanguageSelect({ isCollapsed }: { isCollapsed?: boolean }) {
  const { t } = useTranslation();
  const appLanguage = useUIStore((state) => state.appLanguage);
  const setAppLanguage = useUIStore((state) => state.setAppLanguage);

  const handleChange = (nextLanguage: LocaleCode) => {
    analytics.track(ANALYTICS_EVENTS.UI_LANGUAGE_SWITCHED, {
      from: appLanguage,
      to: nextLanguage,
      source: 'sidebar',
    });
    setAppLanguage(nextLanguage);
  };

  return (
    <LocaleSelect
      label={t('settings.interface.language')}
      showLabel={false}
      value={appLanguage}
      onValueChange={(nextLanguage) => nextLanguage && handleChange(nextLanguage)}
      title={isCollapsed ? t('settings.interface.language') : undefined}
      wrapperClassName={cn(isCollapsed ? 'w-11' : 'w-full')}
      className={cn(
        // Nav zone, not a form: the shared LocaleSelect defaults to a card
        // fill and an --input edge, which rendered a white chip on the dark
        // rail. Overridden here rather than in the primitive — everywhere else
        // it really is a form control.
        'bg-nav-active text-nav-foreground-strong border-nav-border hover:bg-nav cursor-pointer transition-colors',
        isCollapsed ? 'px-1 text-xs font-semibold' : 'px-3 text-sm',
      )}
    />
  );
}
