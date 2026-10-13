import { useCallback, useState } from 'react';

import { ImportWarningsModal } from '@/components/modals/ImportWarningsModal';
import { InfoBox } from '@/components/ui/InfoBox';
import { LocaleSelect } from '@/components/ui/LocaleSelect';
import { Section } from '@/components/ui/Section';
import { useCloudRestorePrompt } from '@/hooks/useCloudRestorePrompt';
import { useTranslation } from '@/hooks/useTranslation';
import { useTranslationInvite } from '@/hooks/useTranslationInvite';
import { LANGUAGES, type LocaleCode } from '@/locales';
import { ANALYTICS_EVENTS, analytics } from '@/services/analytics';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { useConfirmStore } from '@/store/ui/useConfirmStore';
import { cn } from '@/utils/cn';
import { type ImportWarning, isMeaningfullyEmpty } from '@/utils/validation';
import { ChevronDown, CircleQuestionMark, Languages } from 'lucide-react';

interface ResumeLanguageSelectorProps {
  variant?: 'default' | 'minimal' | 'compact';
  showHelp?: boolean;
}

/**
 * How long the cloud check may run before it gets a blocking dialog. Short
 * enough that nobody scrolls away first, long enough that a local-only or
 * cached check never flashes a dialog for nothing.
 */
const DISCOVERY_DIALOG_DELAY_MS = 400;

export function ResumeLanguageSelector({
  variant = 'default',
  showHelp = false,
}: ResumeLanguageSelectorProps) {
  const { t, cvLanguage } = useTranslation();
  const resume = useResumeStore((state) => state.resume);
  const updateMeta = useResumeStore((state) => state.updateMeta);
  const { checkAndRestoreLocale } = useCloudRestorePrompt();
  const { inviteToTranslate, modals: translationInviteModals } = useTranslationInvite();
  const confirm = useConfirmStore((state) => state.confirm);

  const [isLoading, setIsLoading] = useState(false);
  const [importWarnings, setImportWarnings] = useState<ImportWarning[]>([]);
  const [showWarningsModal, setShowWarningsModal] = useState(false);
  const currentLocale = cvLanguage;

  const handleLocaleChange = useCallback(
    async (newLocale: string) => {
      if (newLocale === currentLocale) return;

      analytics.track(ANALYTICS_EVENTS.RESUME_LANGUAGE_CHANGED, {
        from: currentLocale,
        to: newLocale,
        isMeaningfullyEmpty: isMeaningfullyEmpty(resume),
      });

      // 1. Always update the local state first for UI responsiveness
      updateMeta({
        theme: {
          ...resume.meta.theme,
          locale: newLocale as LocaleCode,
        },
      });

      // 2. Check for backups in the new language across all cloud services.
      //    Discovery costs a round trip per connected provider and per backup
      //    file, so it can easily run for seconds. Past a short grace period it
      //    gets the blocking loading dialog `performSync` uses, so whatever
      //    comes next — the restore prompt, the warnings, the translation
      //    invite — replaces it in place instead of ambushing a user who has
      //    already scrolled on.
      setIsLoading(true);

      // Held in an object because a `let` assigned only inside the timeout
      // callback stays narrowed to `null` for the checks below.
      const loadingDialog: { resolve: ((value: boolean | null) => void) | null } = {
        resolve: null,
      };

      const dismissLoadingDialog = () => {
        // Only ever close our own dialog: once discovery opens a prompt of its
        // own, that prompt owns the slot and closing it would answer it.
        const state = useConfirmStore.getState();
        if (loadingDialog.resolve && state.resolve === loadingDialog.resolve) {
          state.close();
        }
        loadingDialog.resolve = null;
      };

      const dialogTimer = window.setTimeout(() => {
        // Discovery may have got there first with its own prompt.
        if (useConfirmStore.getState().isOpen) return;
        confirm({
          title: t('sync.checking'),
          // No language name in the copy: interpolating one forces every
          // inflected locale into a declension it cannot express from a bare
          // noun, and the title plus the selector already say which language.
          message: t('sync.checking_locale_msg'),
          isLoading: true,
          confirmText: '',
          cancelText: '',
          showCloseButton: false,
          closeOnConfirm: false,
        });
        loadingDialog.resolve = useConfirmStore.getState().resolve;
      }, DISCOVERY_DIALOG_DELAY_MS);

      try {
        const { imported, warnings } = await checkAndRestoreLocale(newLocale);

        // Close before branching, so the next modal is never briefly stacked
        // on top of the spinner it is meant to replace.
        window.clearTimeout(dialogTimer);
        dismissLoadingDialog();

        if (imported && warnings.length > 0) {
          setImportWarnings(warnings);
          setShowWarningsModal(true);
        } else if (!imported && !isMeaningfullyEmpty(resume)) {
          // No backup was restored and CV is not empty -> Offer AI translation
          await inviteToTranslate(newLocale as LocaleCode);
        }
      } catch (error) {
        console.error('[LanguageSelector] Cloud restore check failed:', error);
      } finally {
        window.clearTimeout(dialogTimer);
        dismissLoadingDialog();
        setIsLoading(false);
      }
    },
    [currentLocale, updateMeta, resume, checkAndRestoreLocale, inviteToTranslate, confirm, t],
  );

  const modal = (
    <>
      <ImportWarningsModal
        isOpen={showWarningsModal}
        onClose={() => setShowWarningsModal(false)}
        warnings={importWarnings}
      />
      {translationInviteModals}
    </>
  );

  // The chrome variant: no visible label, sized to sit in the dashboard header
  // beside the Edit/Design tabs without pushing Back up and Export off-screen.
  // The `<select>` keeps its accessible name from `LocaleSelect`'s sr-only
  // label, and `showHelp` carries the "this is the CV's language, not the app's"
  // explanation that the dropped visible label used to imply.
  if (variant === 'compact') {
    return (
      <div className="relative flex shrink-0 items-center gap-1" aria-busy={isLoading || undefined}>
        {showHelp && (
          <InfoBox
            position="bottom"
            content={t('editor.resume_language.help')}
            label={t('editor.resume_language.help_label')}
          >
            {/* ⚠️ `p-1`, not `p-2`: 16px icon + 8px padding = the 24px the
                `InfoBox` trigger floors at, so the hover circle and the click
                target are the same box. At `p-2` it was 32px — overflowing the
                trigger by 4px each side, and once the trigger grew to fit it,
                costing this header 8px it does not have at 768px. */}
            <div className="text-muted-foreground hover:text-primary-strong hover:bg-primary/5 cursor-help rounded-full p-1 transition-colors">
              <CircleQuestionMark className="h-4 w-4" aria-hidden="true" />
            </div>
          </InfoBox>
        )}

        {/* The trigger shows the two-letter code; the list still shows
            "EN — English", because picking a language you cannot read from a
            list of bare codes is guesswork.
            A native `<select>` renders the selected option's own text when
            closed, so the two cannot differ — the real control is therefore
            kept, made transparent, and stretched over a painted trigger. That
            preserves the keyboard behaviour, the accessible name and the
            platform picker on a phone, none of which a hand-rolled listbox
            would get for free. */}
        <span
          className={cn(
            // ⚠️ `--input`, not `--border`. This is a control, and `--border` is
            // the decorative divider token at 1.35:1 — it drew the CV language
            // picker as if it were a rule, while the sidebar's UI-language
            // select next to it used the control edge at 3.83:1. Two language
            // settings, two treatments, and the weaker one was on the setting
            // that changes the exported document rather than the interface.
            'border-input bg-card text-foreground relative flex h-9 shrink-0 items-center gap-1 rounded-lg border px-2.5 text-sm font-semibold',
            'focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-1',
            isLoading && 'opacity-60',
          )}
        >
          <span aria-hidden="true">{currentLocale.toUpperCase()}</span>
          <ChevronDown className="text-muted-foreground h-3.5 w-3.5" aria-hidden="true" />

          <select
            value={currentLocale}
            onChange={(event) => handleLocaleChange(event.target.value as LocaleCode)}
            disabled={isLoading}
            aria-label={t('editor.resume_language.title')}
            title={isLoading ? t('common.loading') : undefined}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
          >
            {LANGUAGES.map((language) => (
              <option key={language.code} value={language.code}>
                {language.code.toUpperCase()} — {language.label}
              </option>
            ))}
          </select>
        </span>

        {isLoading && (
          <span className="sr-only" role="status" aria-live="polite">
            {t('common.loading')}
          </span>
        )}
        {modal}
      </div>
    );
  }

  const minimal = variant === 'minimal';

  const content = (
    <div className={minimal ? '' : 'space-y-6'}>
      <div className="flex items-center justify-between gap-4 sm:gap-8">
        <div className="min-w-0 space-y-1">
          <h3 className="text-foreground text-sm font-extrabold">
            {t('editor.resume_language.title')}
          </h3>
          {minimal && (
            <p className="text-muted-foreground text-sm">
              {t('editor.resume_language.help_settings')}
            </p>
          )}
        </div>

        <LocaleSelect
          label={t('editor.resume_language.title')}
          showLabel={false}
          value={currentLocale}
          onValueChange={(language) => language && handleLocaleChange(language)}
          disabled={isLoading}
          title={isLoading ? t('common.loading') : undefined}
          wrapperClassName="w-48 shrink-0"
          className="font-semibold"
        />
      </div>
    </div>
  );

  if (minimal)
    return (
      <>
        {content}
        {modal}
      </>
    );

  return (
    <Section
      title={t('editor.resume_language.header')}
      icon={<Languages className="h-5 w-5" />}
      collapsible={true}
      defaultCollapsed={false}
    >
      {content}
      {modal}
    </Section>
  );
}
