import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Copia negli appunti',
  data_label: 'Dati grezzi',
  download: 'Scarica JSON',
  full: 'Completo',
  full_desc: "flag di visibilità (Ideale per l'importazione in KiwiCV)",
  full_title: 'Stato Completo App',
  passthrough: {
    desc: "Conservati perché altri strumenti possano ancora leggere il tuo file. Inclusi nelle tue esportazioni JSON e nei backup su Drive e su GitHub privato; mai mostrati nel tuo CV né inviati all'IA.",
    remove_confirm_message:
      'I file che esporti da KiwiCV non conterranno più questo blocco. Questa azione non può essere annullata.',
    remove_confirm_title: 'Rimuovere «{{name}}»?',
    removed_desc:
      'La prossima sincronizzazione sostituisce il tuo backup attuale. Gli snapshot precedenti e le versioni più vecchie conservate da Drive e GitHub lo contengono ancora finché non li elimini lì.',
    removed_title: '«{{name}}» rimosso da questo browser',
    title: 'Dati aggiuntivi da un file importato',
  },
  reduced: 'Ridotto',
  reduced_desc: 'elementi nascosti rimossi',
  reduced_title: 'JSON Ridotto',
  standard: 'Standard',
  standard_desc: 'senza metadati',
  standard_title: 'JSON Standard',
};
