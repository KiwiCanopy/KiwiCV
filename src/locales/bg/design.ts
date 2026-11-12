import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Активни полета (Плъзни за пренареждане)',
  address_schema_apply_template: 'Прилагане на шаблон',
  address_schema_available_fields: 'Налични полета (Кликни за добавяне)',
  address_schema_desc:
    'Форматирай оформлението и разделителите на адресния блок независимо от езика на автобиографията.',
  address_schema_mode_custom: 'Персонализирано',
  address_schema_mode_default: 'На базата на езика',
  address_schema_mode_default_desc:
    'Схемата автоматично се адаптира към езика на твоето CV. Ако той се различава от зададения език на интерфейса, се добавя и кодът на държавата. За повече опции за персонализиране избери „{customLayout}“.',
  address_schema_mode_label: 'Режим на оформление',
  address_schema_no_active_fields:
    'Няма активни полета. Кликни върху полетата по-долу, за да ги добавиш.',
  address_schema_preset_european: 'Европейски стил',
  address_schema_preset_us_ca: 'Стил за САЩ/Канада (US/CA)',
  address_schema_restore: 'Възстановяване на настройките по подразбиране',
  address_schema_separator_comma: 'Запетая',
  address_schema_separator_dash: 'Тире',
  address_schema_separator_space: 'Интервал',
  address_schema_title: 'Управление на адресната схема',
  address_schema_toggle_separator: 'Пrevklučvane na razdelitelja meždu zapetaâ i interval',
  bold_header: {
    desc: 'Избери кои детайли да се показват с удебелен шрифт (главен ред)',
    title: 'Режим за удебелено заглавие',
  },
  color_chooser: 'Цветова схема',
  column_empty: 'Няма секции',
  design_filter: {
    one_column: 'Една колона',
    two_column: 'Две колони',
  },
  empty_sections_subtitle:
    'Тези секции все още са празни. Наистина ли няма какво да добавиш? Всеки детайл е от значение.',
  empty_sections_title: 'Допълнителни налични секции',
  example_section: 'Примерен раздел',
  formatting: 'форматиране',
  groups: {
    details: 'Детайли',
    layout: 'Оформление',
    typography: 'Типография',
  },
  layout_flip: 'Огледално оформление',
  layout_main_column: 'Основна колона',
  layout_side_column: 'Странична лента',
  layout_swap_tooltip: 'Преместване в другата колона',
  more_actions_named: 'Още действия за „{{name}}“',
  page_break_disabled_first: 'Нов лист не е наличен за първия елемент',
  page_break_disabled_hidden: 'Нов лист не е наличен за скрити секции',
  page_break_named: 'Нов лист преди „{{name}}“',
  page_break_removal_tooltip:
    'Премахване на новия лист преди тази секция (важи само за PDF версията)',
  page_break_tooltip: 'Добавяне на нов лист преди тази секция (важи само за PDF версията)',
  pdf_footer: {
    date: 'Включи дата',
    desc: 'Вмъкни ред за подпис, място и дата в долната част',
    location: 'Включи местоположение',
    show: 'Покажи фотъра',
    title: 'PDF футър',
  },
  section_reordering: {
    hint: 'Секциите се появяват в автобиографията ти в този ред. Плъзни ред за дръжката, за да го преместиш.',
    hint_touch:
      'Секциите се появяват в автобиографията ти в този ред. Използвай стрелките, за да преместиш ред, или задръж дръжката му и плъзни.',
    title: 'Ред на разделите',
  },
  signature: {
    add: 'Добави подпис',
    backup_delete_failed:
      'Подписът ти е премахнат от това устройство, но резервното му копие не можа да се изтрие. Изтрий сам KiwiCV/signature/signature.json в Google Drive или signature/signature.json в GitHub.',
    backup_failed:
      'Подписът ти е запазен на това устройство, но резервното копие не можа да се актуализира.',
    backup_github_history:
      'Премахването го изтрива от хранилището ти; по-старите версии в историята му го запазват.',
    backup_label: 'Запази копие и в {{targets}}',
    backup_note:
      'Запазен на това устройство и в {{targets}}. PDF файловете, които създаваш, го съдържат.',
    backup_unreachable:
      'Запазен на това устройство. Резервното ти копие в момента е недостъпно. PDF файловете, които създаваш, го съдържат.',
    change: 'Промени',
    commit_removed: 'Премахване на резервното копие на подписа',
    commit_saved: 'Създаване на резервно копие на подписа',
    crop_description:
      'Изрежи, завърти или обърни изображението. След това фонът на хартията се премахва.',
    crop_title: 'Изрежи подписа си',
    device_note:
      'Запазен само на това устройство, извън резервните копия и синхронизацията. PDF файловете, които създаваш, го съдържат.',
    dialog_title: 'Твоят подпис',
    draw_hint: 'Рисувай с мишка, пръст или писалка.',
    draw_label: 'Поле за рисуване на подписа',
    edit_label: 'Промени подписа',
    face_unavailable: 'Този стил не може да покаже всички букви от това име.',
    footer_off: 'Показва се в PDF футъра, който е изключен.',
    preview_alt: 'Твоят подпис',
    restore_found: 'Резервното ти копие съдържа запазен подпис.',
    restore_use: 'Използвай го',
    row_empty: 'Няма подпис на това устройство',
    row_label: 'Подпис',
    tab_draw: 'Рисувай',
    tab_type: 'Въведи',
    tab_upload: 'Качи',
    type_name: 'Име',
    type_style: 'Стил',
    type_unavailable:
      'Ръкописните стилове не могат да покажат всички букви от това име. Нарисувай го или го качи.',
    upload_another: 'Избери друго',
    upload_choose: 'Избери изображение',
    upload_empty:
      'В това изображение не е намерен подпис. Най-добре работи тъмна химикалка на бяла хартия.',
    upload_hint:
      'Снимка или сканиране на бяла хартия. Фонът се премахва на това устройство. Можеш и да поставиш изображение. От приложението Preview в macOS първо експортирай подписа като PNG.',
    upload_ready: 'Подписът е готов. Провери го и запази.',
    upload_too_large: 'Изображението е твърде голямо (макс. {{size}} МБ).',
    upload_unreadable: 'Този файл не може да се прочете като изображение. Опитай с PNG или JPG.',
    upload_working: 'Премахване на фона…',
  },
  swap_column_named: 'Премести „{{name}}“ в другата колона',
  template: 'Шаблон',
};
