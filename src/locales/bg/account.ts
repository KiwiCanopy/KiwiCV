import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Удължаване',
  get_premium: 'Вземи Премиум',
  joined_on: 'Член от {{date}}',
  member_fallback: 'Потребител',
  modals: {
    delete_account: {
      confirm_btn: 'Постоянно изтриване на акаунт',
      consent_label:
        'Съгласен съм да загубя всички оставащи дни от моя Premium Pass и разбирам, че това не може да бъде отменено.',
      description:
        'Наистина ли искаш да изтриеш акаунта си? Това действие е постоянно и не може да бъде отменено.',
      error_message:
        'Неуспешно изтриване на акаунта. Моля, опитай отново или се свържи с поддръжката.',
      premium_warning: 'Твоят премиум статус (активен до {{date}}) ще бъде незабавно анулиран.',
      remove_github: 'Премахване и на връзката с GitHub от това устройство',
      success_message: 'Акаунтът ти беше изтрит успешно.',
      title: 'Изтриване на акаунт',
    },
    profile_missing: {
      description:
        'Потребителският профил не беше намерен. Моля, опитай да излезеш и да влезеш отново. Ако проблемът продължи, свържи се с екипа на KiwiCV на {{email}} или изтрий акаунта си, за да започнеш отначало.',
      title: 'Профилът не е намерен',
    },
  },
  renew: 'Подновяване',
  security_privacy: 'Сигурност и поверителност',
  status: 'Статус',
  status_free: 'Безплатно',
  status_pro: 'Pro',
  valid_until: 'Валидно до',
};
