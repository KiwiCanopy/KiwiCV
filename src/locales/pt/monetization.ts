import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Comprar agora',
  canceled_message: 'Compra cancelada.',
  description: 'Escolhe o Pass que melhor se adapta à duração da tua procura de emprego.',
  fair_use: {
    description:
      'Sem pagamento por uso. Otimiza o teu currículo quantas vezes quiseres dentro da nossa política de uso justo.',
    link: 'Política de uso justo',
    title: 'Uso de IA',
  },
  fulfillment_pending: 'Pagamento recebido! O teu Pass será ativado em instantes.',
  fulfillment_successful: 'Compra realizada com sucesso!',
  passes: {
    '1_days': {
      description: 'Experimenta todas as funcionalidades de IA na tua próxima candidatura.',
      title: 'Pass de 1 dia',
    },
    '7_days': {
      description: 'Sprint rápido para as tuas candidaturas.',
      title: 'Pass de 7 dias',
    },
    '30_days': {
      description: 'Perfeito para um mês inteiro de procura.',
      title: 'Pass de 30 dias',
    },
  },
  per_day: '{{price}} por dia',
  processing_order: 'A processar o teu pedido...',
  recommended: 'Recomendado',
  tabs: {},
  title: 'Recarregar conta',
};
