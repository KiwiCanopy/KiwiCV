import React, { useCallback, useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { SiGithub } from 'react-icons/si';

import { LegalCheckbox } from '@/components/auth/LegalCheckbox';
import { LoginBenefits } from '@/components/auth/LoginBenefits';
import { Button } from '@/components/ui/Button';
import { DialogFrameTitle } from '@/components/ui/DialogFrame';
import { BRAND_CONFIG } from '@/config/brand';
import { RESPONSIBLE_NAME } from '@/constants/contact';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/utils/cn';
import { localizedPath as buildLocalizedPath } from '@/utils/localeRouting';

export interface AuthViewProps {
  /**
   * Optional custom description shown under the title.
   * Defaults to auth.welcome_subtitle.
   */
  description?: string;
  /**
   * Whether to show the GitHub alternative button.
   */
  allowGHAlternative?: boolean;
  /**
   * Callback when GitHub alternative is selected.
   */
  onSelectGH?: () => void;
  /**
   * Layout variant.
   * 'page': Full-screen layout used in /login
   * 'modal': Two-panel layout used inside modals
   * 'inline': Simplified layout (no left panel) used in Account page
   */
  variant?: 'page' | 'modal' | 'inline';
  /**
   * Optional className for the root container.
   */
  className?: string;
  /**
   * Optional callback for when the login is successful.
   */
  onSuccess?: () => void;
  /**
   * Whether Google Drive scopes are required for this login action.
   */
  requireDrive?: boolean;
  /**
   * Render the visible heading as the enclosing dialog's accessible name.
   *
   * Only valid inside a `DialogFrame`, and only from one place per dialog:
   * Radix allows exactly one title. Set it instead of giving the frame an
   * sr-only header, which would name the dialog with a second, hidden copy of
   * the same string — see the `DialogFrameTitle` contract.
   */
  ownsDialogTitle?: boolean;
}

/**
 * A centralized view for all authentication entry points.
 * Unifies the "Marketing Benefits" (left) and "Auth Action" (right) panes.
 */
export const AuthView: React.FC<AuthViewProps> = ({
  description,
  allowGHAlternative,
  onSelectGH,
  variant = 'page',
  className,
  onSuccess,
  requireDrive = false,
  ownsDialogTitle = false,
}) => {
  const { googleSignin } = useAuth();
  const { t } = useTranslation();
  const lang = useLanguage();

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const localizedPath = useCallback((path: string) => buildLocalizedPath(lang, path), [lang]);

  const handleLogin = async () => {
    setIsSubmitting(true);
    try {
      await googleSignin(acceptedTerms, acceptedPrivacy, { requireDrive });
      onSuccess?.();
    } catch (error) {
      console.error('Auth failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isInline = variant === 'inline';
  const isPage = variant === 'page';
  const Heading = ownsDialogTitle ? DialogFrameTitle : 'h2';

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row',
        isPage ? 'bg-background min-h-screen' : 'bg-transparent',
        className,
      )}
    >
      {/* Left Panel: Marketing Value Proposition (Only if not inline) */}
      {!isInline && (
        <div
          className={cn(
            // `pb-12` below `md` used to clear the benefit badges; `LoginBenefits`
            // is desktop-only now, so on a phone this panel is a heading alone
            // and that padding was empty space above the sign-in buttons.
            'bg-primary/10 relative flex w-full flex-col p-4 pt-6 pb-4 md:p-12 lg:p-16',
            variant === 'modal' ? 'md:w-[45%] md:p-12' : 'md:w-[40%]',
          )}
        >
          <div className="from-primary-strong/10 pointer-events-none absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />

          <div className="relative z-10 flex h-full flex-col">
            <div className="mb-2 block md:mb-10">
              <h2 className="text-foreground text-2xl leading-tight font-extrabold tracking-tight sm:text-3xl md:text-4xl">
                {t('auth.sign_in_now')}
              </h2>
            </div>

            <LoginBenefits requireDrive={requireDrive} />

            {/* Decorative element for full-page feel */}
            {isPage && (
              <div className="mt-auto hidden pt-12 md:block">
                <div className="bg-primary/20 h-px w-24" />
                <p className="text-muted-foreground mt-4 text-xs font-medium tracking-widest uppercase opacity-40">
                  © {new Date().getFullYear()} {RESPONSIBLE_NAME}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Right Panel: Auth Action */}
      <div
        className={cn(
          'bg-card relative flex flex-col p-4 md:flex-1 md:justify-center md:p-12 lg:p-16',
          isPage ? '-mt-4 md:mt-0 md:rounded-none md:pt-24 lg:pt-32' : 'pt-2 pb-8',
          isInline && 'bg-transparent p-0 md:p-0 lg:p-0',
        )}
      >
        {/* Transition Masks (Flowing Purple into White) - Hidden in inline */}
        {!isInline && (
          <>
            <div className="from-primary-strong/10 absolute inset-y-0 left-0 hidden w-[240px] bg-gradient-to-r to-transparent opacity-100 md:block" />
            <div className="from-primary-strong/10 absolute inset-x-0 top-0 block h-48 bg-gradient-to-b to-transparent opacity-100 md:hidden" />
          </>
        )}

        <div className="relative z-10 mx-auto w-full max-w-sm space-y-4">
          <div className="text-center">
            {!isInline && (
              // Sized directly rather than centred inside a larger box: the mark
              // used to be 40px inside a 64px square, which read smaller than it
              // was. Matches the h-12 hero treatment on MigrationGateway.
              <img
                src={BRAND_CONFIG.assets.symbol}
                alt={t('common.logo_alt')}
                className="mx-auto mb-6 h-14 w-auto object-contain"
              />
            )}
            {/* Inside a dialog this heading *is* the accessible name. Radix
                renders Dialog.Title as an h2, so the element is unchanged. */}
            <Heading
              className={cn(
                'text-foreground font-black tracking-tight',
                isInline ? 'text-xl' : 'text-xl sm:text-2xl md:text-3xl',
              )}
            >
              {t('auth.sign_in_google')}
            </Heading>
            <p className="text-muted-foreground mt-1 text-sm leading-relaxed italic opacity-80">
              {description || t('auth.welcome_subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <LegalCheckbox
                id={`${variant}-accepted-terms`}
                checked={acceptedTerms}
                onChange={setAcceptedTerms}
                label={t('auth.accept_terms_label')}
                linkText={t('auth.terms_link')}
                linkUrl={localizedPath('/terms?tab=terms')}
              />
              <LegalCheckbox
                id={`${variant}-accepted-privacy`}
                checked={acceptedPrivacy}
                onChange={setAcceptedPrivacy}
                label={t('auth.accept_privacy_label')}
                linkText={t('auth.privacy_link')}
                linkUrl={localizedPath('/privacy?tab=privacy')}
              />
            </div>

            <div className="pt-1">
              <Button
                variant="primary"
                onClick={handleLogin}
                disabled={!acceptedTerms || !acceptedPrivacy}
                loading={isSubmitting}
                loadingLabel={t('auth.signing_in')}
                disabledReason={
                  !acceptedTerms || !acceptedPrivacy ? t('auth.consent_mandatory') : undefined
                }
                wrapperClassName="w-full"
                className="h-14 w-full gap-4 rounded-2xl text-base font-black"
              >
                {/* Literal white, not a token: `FcGoogle` is Google's
                    full-colour mark, which their brand guidelines require on a
                    light surface. On `bg-card` it would sit on a dark plate in
                    dark mode. This is the one place a fixed colour is correct. */}
                <div className="rounded-full bg-white p-1 shadow-sm">
                  <FcGoogle className="h-6 w-6" />
                </div>
                {t('auth.sign_in_google')}
              </Button>
            </div>

            {requireDrive && (
              <p
                className={cn(
                  'text-muted-foreground text-xs leading-relaxed opacity-60',
                  isInline ? 'text-left' : 'text-center md:text-left',
                )}
              >
                {t('auth.permission_modal_hint')}
              </p>
            )}

            {allowGHAlternative && onSelectGH && (
              <div className="border-border/50 flex flex-col items-center border-t pt-4">
                <p className="text-muted-foreground mb-3 text-[11px] font-medium italic opacity-70">
                  {t('auth.gh_alternative_desc')}
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onSelectGH}
                  className="rounded-xl text-xs font-bold"
                >
                  <SiGithub className="h-4 w-4" />
                  {t('auth.setup_gh')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
