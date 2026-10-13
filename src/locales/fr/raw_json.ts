import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Copier dans le presse-papier',
  data_label: 'Données brutes',
  download: 'Télécharger JSON',
  full: 'Complet',
  full_desc: "Meta + drapeaux de visibilité (Idéal pour l'import dans KiwiCV)",
  full_title: 'État Complet',
  passthrough: {
    desc: "Conservées pour que d'autres outils puissent encore lire ton fichier. Incluses dans tes exports JSON et dans tes sauvegardes Drive et GitHub privées ; jamais affichées sur ton CV ni envoyées à l'IA.",
    remove_confirm_message:
      'Les fichiers que tu exportes depuis KiwiCV ne contiendront plus ce bloc. Cette action est irréversible.',
    remove_confirm_title: 'Retirer « {{name}} » ?',
    removed_desc:
      "Ta prochaine synchronisation remplace ta sauvegarde actuelle. Les instantanés précédents, ainsi que les versions antérieures conservées par Drive et GitHub, le contiennent encore jusqu'à ce que tu les supprimes là-bas.",
    removed_title: '« {{name}} » retiré de ce navigateur',
    title: "Données supplémentaires d'un fichier importé",
  },
  reduced: 'Réduit',
  reduced_desc: 'éléments cachés supprimés',
  reduced_title: 'JSON Réduit',
  standard: 'Standard',
  standard_desc: 'Sans Meta, tout inclus',
  standard_title: 'JSON Standard',
};
