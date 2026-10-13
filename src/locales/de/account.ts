import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Verlängern',
  get_premium: 'Premium holen',
  joined_on: 'Beigetreten am {{date}}',
  member_fallback: 'Mitglied',
  modals: {
    delete_account: {
      confirm_btn: 'Konto unwiderruflich löschen',
      consent_label:
        'Ich bin damit einverstanden, alle verbleibenden Tage meines Premium-Passes zu verlieren, und ich verstehe, dass dies nicht rückgängig gemacht werden kann.',
      description:
        'Bist du sicher, dass du dein Konto löschen möchtest? Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden.',
      error_message:
        'Konto konnte nicht gelöscht werden. Bitte versuche es erneut oder kontaktiere den Support.',
      premium_warning: 'Dein Premium-Status (aktiv bis {{date}}) wird sofort beendet.',
      remove_github: 'Auch die GitHub-Verbindung von diesem Gerät entfernen',
      success_message: 'Dein Konto wurde erfolgreich gelöscht.',
      title: 'Konto löschen',
    },
    profile_missing: {
      description:
        'Dein Benutzerprofil wurde nicht in der Datenbank gefunden. Bitte versuche, dich ab- und wieder anzumelden. Wenn das Problem weiterhin besteht, kontaktiere das KiwiCV Team unter {{email}} oder lösche dein Konto, um neu zu beginnen.',
      title: 'Profil nicht gefunden',
    },
  },
  renew: 'Erneuern',
  security_privacy: 'Datenschutz & Privatsphäre',
  status: 'Status',
  status_free: 'Kostenlos',
  status_pro: 'Pro',
  valid_until: 'Gültig bis',
};
