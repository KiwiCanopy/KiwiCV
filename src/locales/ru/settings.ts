import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Масштаб размера шрифта',
    },
  },
  cv_defaults: {
    title: 'Настройки резюме',
  },
  danger: {
    delete_btn: 'Подтверждаю',
    delete_data: 'Удалить всё',
    delete_data_desc: 'Необратимо.',
    title: 'Опасная зона',
  },
  export: {
    available_variables: 'Переменные',
    format_tokens: 'Токены FORMAT:',
    pattern_error_brackets: 'Недопустимый шаблон: несбалансированные скобки.',
    pattern_tip: 'Формат {date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}',
    project_name: 'Название',
    project_name_desc: 'Определи основу имени проекта для своего экспорта.',
  },
  github: {
    disconnect_success: 'GitHub успешно отключен.',
    error_forbidden: 'Доступ запрещен или превышен лимит запросов',
    error_invalid_token: 'Неверный токен GitHub. Пожалуйста, проверь свой PAT.',
    error_repo_not_found: 'Репозиторий не найден',
    hide_token: 'Скрыть токен',
    modal_connect_btn: 'Подключить и синхронизировать',
    modal_description:
      'Подключи свой репозиторий GitHub, чтобы синхронизировать резюме между устройствами и развернуть его на GitHub Pages.',
    modal_pat_placeholder: 'ghp_твой_персональный_токен_доступа',
    modal_repo_placeholder: 'имя пользователя/репозиторий',
    modal_title: 'Синхронизация с GitHub',
    pat_creation_tip:
      "Не забудь выбрать 'Only select repositories' и указать желаемую дату истечения срока действия.",
    pat_security_note:
      "Совет по безопасности: Используй 'Fine-grained' Personal Access Token только с правами доступа на чтение/запись 'Contents' к твоему конкретному репозиторию для обеспечения максимальной безопасности. Ты можешь создать его по следующей ссылке: {{link}}",
    personal_token: 'Personal Access Token',
    public_repo_note:
      'В публичном репозитории или в репозитории, опубликованном через GitHub Pages, резервные копии не содержат ни скрытых тобой данных, ни твоего сопроводительного письма, ни данных из импортированных файлов. В них по-прежнему входят имена и контактные данные людей, указанных в твоих рекомендациях, и названия файлов и папок, которые ты выбираешь при экспорте и в которых может быть названа компания, в которую ты подаешь заявку. Если ты позже сделаешь приватный репозиторий публичным или опубликуешь его через GitHub Pages, то, что уже в нем есть, тоже может стать публичным.',
    remember_pat: 'Хранить токен постоянно в этом браузере',
    remember_pat_tip:
      'Если отключено, токен сохраняется только для текущей сессии и будет удален при закрытии вкладки.',
    repo_name: 'Репозиторий',
    show_token: 'Показать токен',
  },
  interface: {
    appearance: 'Внешний вид',
    install: {
      action: 'Установить KiwiCV',
      description: 'Открывай KiwiCV как любое другое приложение — в отдельном окне.',
      installed: 'Установлено на этом устройстве',
      ios_hint: 'Нажми «Поделиться», затем «На экран „Домой“».',
      label: 'Приложение',
      unsupported:
        'Если твой браузер умеет устанавливать приложения, поищи «Установить» в адресной строке или меню.',
    },
    language: 'UI-Язык',
    language_description: 'Выбери предпочитаемый язык интерфейса приложения.',
    theme_description: 'Выбери тему.',
    theme_options: {
      dark: 'Темная',
      light: 'Светлая',
      system: 'Системная',
    },
    title: 'Интерфейс',
  },
  title: 'Настройки',
};
