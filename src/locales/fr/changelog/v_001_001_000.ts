import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Format compatible ATS assuré pour les fichiers PDF générés',
  feat_github_backup:
    "Lors de l'envoi vers GitHub (depuis l'onglet aperçu), ta configuration sera également mise à jour selon l'état actuel",
  feat_mock_data_preview:
    "Si aucune donnée n'est fournie, des données fictives seront utilisées pour remplir les modèles d'aperçu, te permettant de voir un aperçu immédiatement",
  feat_onboarding_flow: "Expérience d'intégration améliorée avec un flux de bienvenue optimisé",
  fix_link_references: 'fix : plusieurs références de liens optimisées dans les thèmes PDF et HTML',
  fix_lunar_sidebar_header:
    "Correction d'un problème où les en-têtes de la barre latérale n'étaient pas affichés dans le thème Lunar",
  fix_netlify_routing:
    "Correction d'un problème où l'actualisation des sous-pages sur Netlify entraînait une erreur 404",
  fix_welcome_modal_scroll:
    "Correction d'un problème où la fenêtre de bienvenue n'était pas défilante sur les petits écrans",
};
