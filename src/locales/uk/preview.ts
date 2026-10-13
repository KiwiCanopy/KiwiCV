import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Обери формат перегляду',
  fits_pages_one: 'Займає 1 сторінку',
  fits_pages_other: 'Сторінок: {{count}}',
  generating: 'Генерація перегляду…',
  generating_pdf: 'Генерація PDF...',
  open_html: 'Перегляд HTML',
  open_pdf: 'Перегляд PDF',
  opened: 'Перегляд відкрито',
  opening: 'Відкриття перегляду…',
  pdf_frame_title: 'Попередній перегляд PDF',
  pdf_render_error_desc: 'Рендеринг твого PDF займає більше часу, ніж зазвичай.',
  pdf_render_error_hint:
    'Спробуй зменшити розмір шрифту, перевпорядкувати розділи або тимчасово скоротити занадто довгі деталі. Ця помилка часто викликана конфліктом розриву сторінок.',
  pdf_render_error_pro_tip: 'Корисна порада',
  pdf_render_error_title: 'Щось пішло не так',
  popup_blocked: 'Твій браузер заблокував перегляд. Дозволь спливаючі вікна та спробуй знову.',
  render_failed:
    'KiwiCV не вдалося згенерувати цей перегляд. Спробуй ще раз або обери інший формат.',
  tab_title: '{{name}} – Резюме',
  try_again: 'Спробувати перегляд знову',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
