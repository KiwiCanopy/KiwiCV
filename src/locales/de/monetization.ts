import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Jetzt kaufen',
  canceled_message: 'Kauf abgebrochen.',
  description: 'Wähle den Pass, der zur Dauer deiner Jobsuche passt.',
  fair_use: {
    description:
      "Kein 'Pay-as-you-go'. Optimiere deinen Lebenslauf, so oft du willst, im Rahmen der Fair-Use-Policy von KiwiCV.",
    link: 'Fair-Use-Policy',
    title: 'KI-Nutzung',
  },
  fulfillment_pending: 'Zahlung erhalten! Dein Pass wird in Kürze aktiviert.',
  fulfillment_successful: 'Kauf erfolgreich abgeschlossen!',
  passes: {
    '1_days': {
      description: 'Teste alle KI-Funktionen bei deiner nächsten Bewerbung.',
      title: '1-Tages-Pass',
    },
    '7_days': {
      description: 'Schneller Sprint für deine Bewerbungen.',
      title: '7-Tage-Pass',
    },
    '30_days': {
      description: 'Perfekt für einen ganzen Monat Jobsuche.',
      title: '30-Tage-Pass',
    },
  },
  per_day: '{{price}} pro Tag',
  processing_order: 'Deine Bestellung wird bearbeitet...',
  recommended: 'Empfohlen',
  tabs: {},
  title: 'Konto aufladen',
};
