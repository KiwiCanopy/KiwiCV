import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: 'Privé',
  choice_ai_desc:
    "Importe un fichier TXT, PDF ou Word. Rien n'est utilisé pour entraîner des modèles.",
  choice_ai_paid: 'Payant',
  choice_ai_title: 'Import IA',
  choice_direct_desc: "J'ai mon CV au format KiwiCV.",
  choice_direct_title: 'Importer en fichier .json',
  cloud_sync_desc:
    'Gère gratuitement des versions multilingues et des sauvegardes cloud dans ton propre cloud privé.',
  import_error: "Échec de l'importation du fichier. Format invalide.",
  import_success: 'CV importé avec succès !',
  import_success_with_warnings: 'CV importé avec quelques avertissements.',
  onboarding_lang: {
    cta: "C'est parti !",
    cv_desc:
      'Contrôle les titres de section générés automatiquement, les formats de date et les textes de mise en page.',
    cv_label: 'Langue du CV',
    description:
      "Personnalisons ton espace de travail. Sélectionne la langue de l'interface et celle du CV que tu prévois d'écrire.",
    note: 'Les deux paramètres peuvent être modifiés à tout moment par la suite.',
    title: 'Bienvenue sur KiwiCV',
    ui_desc: 'Affiche les menus, options et guides dans cette langue.',
    ui_label: "Langue de l'interface",
  },
  tagline:
    'Les CV standard échouent face aux algorithmes. Crée facilement des versions parfaitement adaptées en un seul endroit.',
  title_import: 'Importer ton CV',
};
