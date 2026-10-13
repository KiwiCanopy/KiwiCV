import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Verlengen',
  get_premium: 'Premium worden',
  joined_on: 'Lid sinds {{date}}',
  member_fallback: 'Lid',
  modals: {
    delete_account: {
      confirm_btn: 'Account permanent verwijderen',
      consent_label:
        'Ik ga ermee akkoord dat ik alle resterende dagen van mijn Premium Pass verlies en ik begrijp dat dit niet ongedaan kan worden gemaakt.',
      description:
        'Weet je zeker dat je je account wilt verwijderen? Deze actie is permanent en kan niet ongedaan worden gemaakt.',
      error_message:
        'Account verwijderen mislukt. Probeer het opnieuw of neem contact op met de ondersteuning.',
      premium_warning: 'Je premium-status (actief tot {{date}}) wordt onmiddellijk geannuleerd.',
      remove_github: 'Ook de GitHub-koppeling van dit apparaat verwijderen',
      success_message: 'Je account is succesvol verwijderd.',
      title: 'Account verwijderen',
    },
    profile_missing: {
      description:
        'Je gebruikersprofiel is niet gevonden. Probeer uit te loggen en opnieuw in te loggen. Als het probleem aanhoudt, neem dan contact op met het KiwiCV-team via {{email}} of verwijder je account om opnieuw te beginnen.',
      title: 'Profiel niet gevonden',
    },
  },
  renew: 'Verlengen',
  security_privacy: 'Beveiliging en privacy',
  status: 'Status',
  status_free: 'Gratis',
  status_pro: 'Pro',
  valid_until: 'Geldig tot',
};
