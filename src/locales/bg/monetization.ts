import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Купи сега',
  canceled_message: 'Покупката е отменена.',
  description: 'Избери Pass, който отговаря на продължителността на търсенето ти на работа.',
  fair_use: {
    description:
      'Без заплащане за всяка заявка. Оптимизирай автобиографията си колкото искаш в рамките на нашата политика за добросъвестно ползване.',
    link: 'Политика за добросъвестно ползване',
    title: 'Ползване на ИИ',
  },
  fulfillment_pending: 'Плащането е получено! Твоят Pass ще бъде активиран след малко.',
  fulfillment_successful: 'Успешно изпълнение на поръчката!',
  passes: {
    '1_days': {
      description: 'Изпробвай всички функции с ИИ за следващата си кандидатура.',
      title: '1-дневен Pass',
    },
    '7_days': {
      description: 'Бърз спринт за твоите кандидатури за работа.',
      title: '7-дневен Pass',
    },
    '30_days': {
      description: 'Перфектен за цял месец търсене на работа.',
      title: '30-дневен Pass',
    },
  },
  per_day: '{{price}} на ден',
  processing_order: 'Обработка на поръчката ти...',
  recommended: 'Препоръчано',
  tabs: {},
  title: 'Зареждане на акаунта',
};
