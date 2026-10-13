import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Wybierz format podglądu',
  fits_pages_one: 'Mieści się na 1 stronie',
  fits_pages_other: 'Stron: {{count}}',
  generating: 'Generowanie podglądu…',
  generating_pdf: 'Generowanie PDF...',
  open_html: 'Podgląd HTML',
  open_pdf: 'Podgląd PDF',
  opened: 'Otwarto podgląd',
  opening: 'Otwieranie podglądu…',
  pdf_frame_title: 'Podgląd PDF',
  pdf_render_error_desc: 'Renderowanie dokumentu PDF trwa dłużej niż oczekiwano.',
  pdf_render_error_hint:
    'Spróbuj zmniejszyć rozmiar czcionki, zmienić kolejność sekcji lub tymczasowo zmodyfikować szczegóły, które mogą być zbyt długie. Często jest to spowodowane konfliktem przy podziale stron.',
  pdf_render_error_pro_tip: 'Wskazówka',
  pdf_render_error_title: 'Coś poszło nie tak',
  popup_blocked:
    'Twoja przeglądarka zablokowała podgląd. Zezwól na wyskakujące okienka i spróbuj ponownie.',
  render_failed:
    'KiwiCV nie mogło wygenerować tego podglądu. Spróbuj ponownie lub wybierz inny format.',
  tab_title: '{{name}} – CV',
  try_again: 'Spróbuj ponownie otworzyć podgląd',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
