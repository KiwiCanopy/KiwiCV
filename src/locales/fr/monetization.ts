import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Acheter maintenant',
  canceled_message: 'Achat annulé.',
  description: "Choisis le Pass qui correspond à la durée de ta recherche d'emploi.",
  fair_use: {
    description:
      'Pas de paiement à l’usage. Optimise ton CV autant que tu le souhaites dans le cadre de notre politique d’utilisation équitable.',
    link: "Politique d'utilisation équitable",
    title: "Utilisation de l'IA",
  },
  fulfillment_pending: 'Paiement reçu ! Ton Pass sera activé dans quelques instants.',
  fulfillment_successful: 'Achat effectué avec succès !',
  passes: {
    '1_days': {
      description: "Essaie toutes les fonctionnalités d'IA sur ta prochaine candidature.",
      title: 'Passe de 1 jour',
    },
    '7_days': {
      description: 'Sprint rapide pour tes candidatures.',
      title: 'Passe de 7 jours',
    },
    '30_days': {
      description: 'Parfait pour un mois complet de recherche.',
      title: 'Passe de 30 jours',
    },
  },
  per_day: '{{price}} par jour',
  processing_order: 'Traitement de ta commande...',
  recommended: 'Recommandé',
  tabs: {},
  title: 'Recharger ton compte',
};
