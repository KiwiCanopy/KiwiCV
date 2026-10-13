import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Välj ett förhandsgranskningsformat',
  fits_pages_one: 'Ryms på 1 sida',
  fits_pages_other: '{{count}} sidor',
  generating: 'Genererar förhandsgranskning…',
  generating_pdf: 'Genererar PDF...',
  open_html: 'Förhandsgranska HTML',
  open_pdf: 'Förhandsgranska PDF',
  opened: 'Förhandsgranskning öppnad',
  opening: 'Öppnar förhandsgranskning…',
  pdf_frame_title: 'PDF-förhandsgranskning',
  pdf_render_error_desc: 'Det tar längre tid än väntat att rendera din PDF.',
  pdf_render_error_hint:
    'Prova att minska teckensnittsstorleken, flytta om sektioner eller tillfälligt ändra detaljer som kan vara för långa. Det här felet orsakas ofta av en konflikt vid sidbrytning.',
  pdf_render_error_pro_tip: 'Proffstips',
  pdf_render_error_title: 'Något gick fel',
  popup_blocked: 'Din webbläsare blockerade förhandsgranskningen. Tillåt popups och försök igen.',
  render_failed:
    'KiwiCV kunde inte generera förhandsgranskningen. Försök igen eller välj ett annat format.',
  tab_title: '{{name}} – CV',
  try_again: 'Försök igen',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
