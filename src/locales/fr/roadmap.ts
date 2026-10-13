import type { Translations } from '@/locales/en';

export const roadmap: Translations['roadmap'] = {
  contact_subtitle:
    "Aide KiwiCV à construire l'espace de travail ultime pour les CV. Tes idées guident la feuille de route — créons ensemble quelque chose d'extraordinaire.",
  contact_text: "Une vision pour l'avenir ?",
  intro: 'Voici les fonctionnalités prévues pour les futures versions.',
  items: {
    ai_cover_letters: {
      desc: 'Rédige et perfectionne une lettre de motivation grâce à l’IA, adaptée à ton CV et au poste visé.',
      title: 'Lettres de motivation avec IA',
    },
    cloud_sync: {
      desc: 'Sauvegarde et restaure tes CV via ton propre stockage Google Drive ou GitHub.',
      title: 'Sauvegarde et restauration dans le cloud',
    },
    layout_switch: {
      desc: 'Déplace des sections entre les colonnes, change la position de la barre latérale et ajoute des sauts de page manuels.',
      title: 'Mise en page flexible du CV',
    },
    live_preview: {
      desc: "Modifie ton CV à côté d'un aperçu en direct au format HTML ou PDF.",
      title: 'Aperçu du CV en direct',
    },
    llm_integration: {
      desc: "Importe un CV existant avec l'IA et adapte son contenu pour une offre d'emploi spécifique.",
      title: "Importation et adaptation assistées par l'IA",
    },
    matching_cover_letters: {
      desc: 'Crée des lettres de motivation qui correspondent visuellement au modèle de CV choisi.',
      title: 'Lettres de motivation assorties',
    },
    mobile_support: {
      desc: "Poursuite de l'amélioration des flux de travail d'édition et d'aperçu sur petit écran.",
      title: 'Autres améliorations mobiles',
    },
    mobile_support_v1: {
      desc: 'Modifie ton CV avec des commandes tactiles sur ton téléphone.',
      title: 'Édition mobile tactile',
    },
    more_themes: {
      desc: 'Ajoute des modèles professionnels supplémentaires sans modifier ton contenu existant.',
      title: 'Plus de modèles de CV',
    },
  },
  mail: 'E-mail',
  status: {
    planned: 'Planifié',
    released: 'Publié',
  },
  suggest_via: 'Suggérer une fonctionnalité via',
  title: 'Feuille de route',
};
