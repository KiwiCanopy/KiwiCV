import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Продлить',
  get_premium: 'Получить Премиум',
  joined_on: 'С нами с {{date}}',
  member_fallback: 'Участник',
  modals: {
    delete_account: {
      confirm_btn: 'Удалить аккаунт навсегда',
      consent_label:
        'Я согласен с потерей всех оставшихся дней моего Premium Pass и понимаю, что это действие невозможно отменить.',
      description: 'Ты точно хочешь удалить свой аккаунт? Это действие необратимо.',
      error_message:
        'Не удалось удалить аккаунт. Попробуй еще раз или обратись в службу поддержки.',
      premium_warning: 'Твой премиум-статус (активен до {{date}}) будет немедленно аннулирован.',
      remove_github: 'Также удалить подключение к GitHub с этого устройства',
      success_message: 'Твой аккаунт был успешно удален.',
      title: 'Удалить аккаунт',
    },
    profile_missing: {
      description:
        'Профиль пользователя не найден. Попробуй выйти и войти снова. Если проблема не решится, свяжись с командой KiwiCV по адресу {{email}} или удали свою учетную запись, чтобы начать заново.',
      title: 'Профиль не найден',
    },
  },
  renew: 'Продлить',
  security_privacy: 'Безопасность и конфиденциальность',
  status: 'Статус',
  status_free: 'Бесплатно',
  status_pro: 'Pro',
  valid_until: 'Действителен до',
};
