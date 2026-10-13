import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Выбери формат предпросмотра',
  fits_pages_one: 'Занимает 1 страницу',
  fits_pages_other: 'Страниц: {{count}}',
  generating: 'Генерация предпросмотра…',
  generating_pdf: 'Генерация PDF...',
  open_html: 'Предпросмотр HTML',
  open_pdf: 'Предпросмотр PDF',
  opened: 'Предпросмотр открыт',
  opening: 'Открытие предпросмотра…',
  pdf_frame_title: 'Предпросмотр PDF',
  pdf_render_error_desc: 'Создание PDF занимает больше времени, чем ожидалось.',
  pdf_render_error_hint:
    'Попробуй уменьшить размер шрифта, переставить разделы или временно изменить детали, которые могут быть слишком длинными. Часто это вызвано конфликтом разрыва страницы.',
  pdf_render_error_pro_tip: 'Совет',
  pdf_render_error_title: 'Что-то пошло не так',
  popup_blocked:
    'Твой браузер заблокировал предпросмотр. Разреши всплывающие окна и попробуй снова.',
  render_failed:
    'KiwiCV не удалось создать этот предпросмотр. Попробуй еще раз или выбери другой формат.',
  tab_title: '{{name}} – Резюме',
  try_again: 'Попробовать предпросмотр еще раз',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
