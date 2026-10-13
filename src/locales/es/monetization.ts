import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Comprar ahora',
  canceled_message: 'Compra cancelada.',
  description: 'Elige el Pass que se adapte a la duración de tu búsqueda de empleo.',
  fair_use: {
    description:
      'Sin pago por uso. Optimiza tu currículum tanto como quieras dentro de nuestra política de uso justo.',
    link: 'Política de uso justo',
    title: 'Uso de IA',
  },
  fulfillment_pending: '¡Pago recibido! Tu Pass se activará en unos momentos.',
  fulfillment_successful: '¡Compra completada con éxito!',
  passes: {
    '1_days': {
      description: 'Prueba todas las funciones de IA en tu próxima solicitud.',
      title: 'Pass de 1 día',
    },
    '7_days': {
      description: 'Sprint rápido para tus solicitudes de empleo.',
      title: 'Pass de 7 días',
    },
    '30_days': {
      description: 'Perfecto para un mes entero de búsqueda.',
      title: 'Pass de 30 días',
    },
  },
  per_day: '{{price}} al día',
  processing_order: 'Procesando tu pedido...',
  recommended: 'Recomendado',
  tabs: {},
  title: 'Recargar cuenta',
};
