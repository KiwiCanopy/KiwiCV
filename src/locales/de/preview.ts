import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Wähle ein Vorschauformat',
  fits_pages_one: 'Passt auf 1 Seite',
  fits_pages_other: '{{count}} Seiten',
  generating: 'Vorschau wird generiert…',
  generating_pdf: 'PDF wird generiert...',
  open_html: 'Vorschau HTML',
  open_pdf: 'Vorschau PDF',
  opened: 'Vorschau geöffnet',
  opening: 'Vorschau wird geöffnet…',
  pdf_frame_title: 'PDF-Vorschau',
  pdf_render_error_desc: 'Das Erstellen deiner PDF dauert länger als erwartet.',
  pdf_render_error_hint:
    'Versuche, die Schriftgröße zu verringern, Abschnitte umzuordnen oder Details deines Lebenslaufs, welche zu lang sein könnten, temporär zu ändern. Der derzeitige Fehler wird oft durch einen Seitenumbruch-Konflikt verursacht.',
  pdf_render_error_pro_tip: 'Pro-Tipp',
  pdf_render_error_title: 'Etwas ist schiefgelaufen',
  popup_blocked: 'Dein Browser hat die Vorschau blockiert. Erlaube Popups und versuche es erneut.',
  render_failed:
    'KiwiCV konnte diese Vorschau nicht generieren. Versuche es erneut oder wähle ein anderes Format.',
  tab_title: '{{name}} – Lebenslauf',
  try_again: 'Vorschau erneut versuchen',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
