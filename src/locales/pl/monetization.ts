import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Kup teraz',
  canceled_message: 'Zakup anulowany.',
  description: 'Wybierz Pass, który pasuje do czasu trwania Twoich poszukiwań pracy.',
  fair_use: {
    description:
      'Brak opłat za każde użycie. Optymalizuj swoje CV dowolną liczbę razy w ramach naszej polityki sprawiedliwego korzystania.',
    link: 'Zasady uczciwego użytkowania',
    title: 'Korzystanie z AI',
  },
  fulfillment_pending: 'Płatność otrzymana! Twój Pass zostanie aktywowany za chwilę.',
  fulfillment_successful: 'Zakup zakończony pomyślnie!',
  passes: {
    '1_days': {
      description: 'Wypróbuj wszystkie funkcje AI przy następnej aplikacji.',
      title: 'Pass 1-dniowy',
    },
    '7_days': {
      description: 'Szybki sprint przy wysyłaniu aplikacji.',
      title: 'Pass 7-dniowy',
    },
    '30_days': {
      description: 'Idealny na pełny miesiąc poszukiwań pracy.',
      title: 'Pass 30-dniowy',
    },
  },
  per_day: '{{price}} dziennie',
  processing_order: 'Przetwarzanie zamówienia...',
  recommended: 'Polecany',
  tabs: {},
  title: 'Doładuj konto',
};
