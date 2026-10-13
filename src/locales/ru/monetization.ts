import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Купить сейчас',
  canceled_message: 'Покупка отменена.',
  description: 'Выбери Pass, соответствующий продолжительности твоего поиска работы.',
  fair_use: {
    description:
      'Никакой оплаты за каждое использование. Оптимизируй свое резюме столько раз, сколько захочешь, в рамках нашей политики добросовестного использования.',
    link: 'Правила добросовестного использования',
    title: 'Использование ИИ',
  },
  fulfillment_pending: 'Платеж получен! Твой Pass будет активирован через несколько мгновений.',
  fulfillment_successful: 'Покупка успешно завершена!',
  passes: {
    '1_days': {
      description: 'Попробуй все функции ИИ для следующего отклика.',
      title: 'Pass на 1 день',
    },
    '7_days': {
      description: 'Быстрый спринт для отправки откликов.',
      title: 'Pass на 7 дней',
    },
    '30_days': {
      description: 'Идеально на целый месяц поиска работы.',
      title: 'Pass на 30 дней',
    },
  },
  per_day: '{{price}} в день',
  processing_order: 'Обработка твоего заказа...',
  recommended: 'Рекомендуется',
  tabs: {},
  title: 'Пополнить баланс',
};
