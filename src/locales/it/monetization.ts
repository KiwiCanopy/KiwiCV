import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Acquista ora',
  canceled_message: 'Acquisto annullato.',
  description: 'Scegli il Pass più adatto alla durata della tua ricerca di lavoro.',
  fair_use: {
    description:
      'Nessun costo a consumo. Ottimizza il tuo CV quanto vuoi nell’ambito della nostra politica di utilizzo corretto.',
    link: 'Politica di uso corretto',
    title: "Utilizzo dell'IA",
  },
  fulfillment_pending: 'Pagamento ricevuto! Il tuo Pass verrà attivato a momenti.',
  fulfillment_successful: 'Acquisto completato con successo!',
  passes: {
    '1_days': {
      description: 'Prova tutte le funzionalità di IA sulla tua prossima candidatura.',
      title: 'Pass da 1 giorno',
    },
    '7_days': {
      description: 'Sprint rapido per le tue candidature.',
      title: 'Pass da 7 giorni',
    },
    '30_days': {
      description: 'Perfetto per un intero mese di ricerca.',
      title: 'Pass da 30 giorni',
    },
  },
  per_day: '{{price}} al giorno',
  processing_order: 'Elaborazione del tuo ordine...',
  recommended: 'Consigliato',
  tabs: {},
  title: 'Ricarica il tuo account',
};
