import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Kopiëren',
  data_label: 'Ruwe gegevens',
  download: 'JSON downloaden',
  full: 'Volledig',
  full_desc: 'zichtbaarheidsvlaggen (Beste voor import in KiwiCV)',
  full_title: 'Volledige Status',
  passthrough: {
    desc: "Bewaard zodat andere tools je bestand nog kunnen lezen. Zit in je JSON-exports en in je back-ups in Drive en in privé-repository's op GitHub; wordt nooit op je CV getoond of naar de AI verzonden.",
    remove_confirm_message:
      'Bestanden die je uit KiwiCV exporteert, bevatten dit blok niet meer. Dit kan niet ongedaan worden gemaakt.',
    remove_confirm_title: '“{{name}}” verwijderen?',
    removed_desc:
      'Je volgende synchronisatie vervangt je huidige back-up. Eerdere momentopnamen en oudere versies die Drive en GitHub bewaren, bevatten het nog tot je ze daar verwijdert.',
    removed_title: '“{{name}}” verwijderd uit deze browser',
    title: 'Extra gegevens uit een geïmporteerd bestand',
  },
  reduced: 'Gereduceerd',
  reduced_desc: 'verborgen items verwijderd',
  reduced_title: 'Gereduceerde JSON',
  standard: 'Standaard',
  standard_desc: 'geen meta',
  standard_title: 'Standaard JSON',
};
