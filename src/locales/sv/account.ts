import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Förläng',
  get_premium: 'Skaffa Premium',
  joined_on: 'Medlem sedan {{date}}',
  member_fallback: 'Medlem',
  modals: {
    delete_account: {
      confirm_btn: 'Radera kontot permanent',
      consent_label:
        'Jag är införstådd med att förlora alla återstående dagar av mitt Premium Pass och jag förstår att detta inte kan ångras.',
      description:
        'Är du säker på att du vill radera ditt konto? Detta är permanent och kan inte ångras.',
      error_message: 'Det gick inte att radera kontot. Försök igen eller kontakta support.',
      premium_warning: 'Din premiumstatus (aktiv till {{date}}) kommer att avslutas omedelbart.',
      remove_github: 'Ta även bort GitHub-anslutningen från denna enhet',
      success_message: 'Ditt konto har raderats.',
      title: 'Radera konto',
    },
    profile_missing: {
      description:
        'Användarprofilen hittades inte. Försök att logga ut och logga in igen. Om problemet kvarstår, kontakta KiwiCV-teamet via {{email}} eller ta bort ditt konto för att börja om.',
      title: 'Profilen hittades inte',
    },
  },
  renew: 'Förnya',
  security_privacy: 'Säkerhet & Integritet',
  status: 'Status',
  status_free: 'Gratis',
  status_pro: 'Pro',
  valid_until: 'Giltig till',
};
