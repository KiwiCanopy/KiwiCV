import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'Choisis un format de prévisualisation',
  fits_pages_one: 'Tient sur 1 page',
  fits_pages_other: '{{count}} pages',
  generating: 'Génération de la prévisualisation…',
  generating_pdf: 'Génération du PDF...',
  open_html: "Prévisualiser l'HTML",
  open_pdf: 'Prévisualiser le PDF',
  opened: 'Prévisualisation ouverte',
  opening: 'Ouverture de la prévisualisation…',
  pdf_frame_title: 'Aperçu du PDF',
  pdf_render_error_desc: 'La génération de ton PDF prend plus de temps que prévu.',
  pdf_render_error_hint:
    'Essaie de réduire la taille de la police, de réorganiser les sections ou de modifier temporairement les détails qui pourraient être trop longs. Cela est souvent dû à un conflit de saut de page.',
  pdf_render_error_pro_tip: 'Conseil',
  pdf_render_error_title: 'Un problème est survenu',
  popup_blocked:
    'Ton navigateur a bloqué la prévisualisation. Autorise les pop-ups, puis réessaye.',
  render_failed:
    "KiwiCV n'a pas pu générer cette prévisualisation. Réessaye ou choisis un autre format.",
  tab_title: '{{name}} – CV',
  try_again: 'Réessayer la prévisualisation',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
