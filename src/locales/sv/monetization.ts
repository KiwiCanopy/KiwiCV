import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Köp nu',
  canceled_message: 'Köp avbrutet.',
  description: 'Välj det Pass som passar längden på ditt jobbsökande.',
  fair_use: {
    description:
      'Ingen löpande debitering. Optimera ditt CV så mycket du vill inom ramen för vår policy för skälig användning.',
    link: 'Policy för skälig användning',
    title: 'AI-användning',
  },
  fulfillment_pending: 'Betalning mottagen! Ditt Pass aktiveras om en liten stund.',
  fulfillment_successful: 'Köp genomfört!',
  passes: {
    '1_days': {
      description: 'Testa alla AI-funktioner på din nästa jobbansökan.',
      title: '1-dagars Pass',
    },
    '7_days': {
      description: 'Snabb spurt för dina jobbansökningar.',
      title: '7-dagars Pass',
    },
    '30_days': {
      description: 'Perfekt för en hel månads jobbsökande.',
      title: '30-dagars Pass',
    },
  },
  per_day: '{{price}} per dag',
  processing_order: 'Bearbetar din beställning...',
  recommended: 'Rekommenderas',
  tabs: {},
  title: 'Fyll på ditt konto',
};
