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
  page_break_named: 'Разделител на страница преди „{{name}}“',
  page_break_removal_tooltip:
    'Премахване на новия лист преди тази секция (важа само за PDF версията)',
  page_break_tooltip: 'Добавяне на нов лист преди тази секция (важа само за PDF версията)',
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
  swap_column_named: 'Премести „{{name}}“ в другата колона',
  template: 'Шаблон',
};
