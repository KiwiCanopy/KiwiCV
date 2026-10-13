import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Przedłuż',
  get_premium: 'Zyskaj Premium',
  joined_on: 'Dołączył(a) {{date}}',
  member_fallback: 'Użytkownik',
  modals: {
    delete_account: {
      confirm_btn: 'Trwale usuń konto',
      consent_label:
        'Zgadzam się na utratę wszystkich pozostałych dni mojego Premium Pass i rozumiem, że nie można tego cofnąć.',
      description:
        'Czy na pewno chcesz usunąć swoje konto? Ta akcja jest trwała i nie można jej cofnąć.',
      error_message:
        'Nie udało się usunąć konta. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
      premium_warning: 'Twój status premium (aktywny do {{date}}) zostanie natychmiast anulowany.',
      remove_github: 'Usuń też połączenie z GitHub z tego urządzenia',
      success_message: 'Twoje konto zostało pomyślnie usunięte.',
      title: 'Usuń konto',
    },
    profile_missing: {
      description:
        'Nie znaleziono profilu użytkownika. Spróbuj się wylogować i zalogować ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z zespołem KiwiCV pod adresem {{email}} lub usuń konto, aby zacząć od nowa.',
      title: 'Nie znaleziono profilu',
    },
  },
  renew: 'Odnów',
  security_privacy: 'Bezpieczeństwo i prywatność',
  status: 'Status',
  status_free: 'Bezpłatny',
  status_pro: 'Pro',
  valid_until: 'Ważny do',
};
