import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Купити зараз',
  canceled_message: 'Купівлю скасовано.',
  description: 'Обери Pass, який відповідає тривалості твого пошуку роботи.',
  fair_use: {
    description:
      'Жодної оплати за кожне використання. Оптимізуй своє резюме скільки завгодно в межах Політики чесного використання KiwiCV.',
    link: 'Політики чесного використання',
    title: 'Використання ШІ',
  },
  fulfillment_pending: 'Платіж отримано! Твій Pass буде активовано за кілька хвилин.',
  fulfillment_successful: 'Купівля успішно виконана!',
  passes: {
    '1_days': {
      description: 'Спробуй усі функції ШІ для наступної подачі резюме.',
      title: '1-денний Pass',
    },
    '7_days': {
      description: 'Швидкий спринт для твоїх подач резюме.',
      title: '7-денний Pass',
    },
    '30_days': {
      description: 'Ідеально для повного місяця пошуку роботи.',
      title: '30-денний Pass',
    },
  },
  per_day: '{{price}} на день',
  processing_order: 'Обробка твого замовлення...',
  recommended: 'Рекомендовано',
  tabs: {},
  title: 'Поповнити баланс акаунта',
};
