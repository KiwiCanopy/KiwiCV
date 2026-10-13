import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Продовжити',
  get_premium: 'Отримати Premium',
  joined_on: 'З нами з {{date}}',
  member_fallback: 'Учасник',
  modals: {
    delete_account: {
      confirm_btn: 'Видалити акаунт назавжди',
      consent_label:
        'Я погоджуюся з втратою всіх днів мого Premium Pass, що залишилися, й розумію, що цю дію неможливо скасувати.',
      description:
        'Ти справді хочеш видалити свій акаунт? Ця дія є остаточною і її неможливо скасувати.',
      error_message:
        'Не вдалося видалити акаунт. Будь ласка, спробуй ще раз або звернись до служби підтримки.',
      premium_warning: 'Твій статус преміум (активний до {{date}}) буде негайно скасовано.',
      remove_github: 'Також видалити підключення до GitHub з цього пристрою',
      success_message: 'Твій акаунт успішно видалено.',
      title: 'Видалити акаунт',
    },
    profile_missing: {
      description:
        'Твій профіль користувача не знайдено в базі даних. Будь ласка, спробуй вийти та увійти знову. Якщо проблема не зникає, зв’яжись з командою KiwiCV за адресою {{email}} або видали свій акаунт, щоб почати спочатку.',
      title: 'Профіль не знайдено',
    },
  },
  renew: 'Поновити',
  security_privacy: 'Безпека та конфіденційність',
  status: 'Статус',
  status_free: 'Безкоштовний',
  status_pro: 'Pro',
  valid_until: 'Дійсний до',
};
