import type { Translations } from '@/locales/en';

export const v_002_000_000: Translations['changelog']['entries']['v_002_000_000'] = {
  _highlights: {
    'dashboard-view': {
      badge: 'Tableau de bord',
      content:
        'Plus besoin de basculer entre l’aperçu et l’éditeur ! La toute nouvelle vue tableau de bord rassemble tout dans une interface côte à côte fluide.',
      title: 'Tableau de bord tout-en-un',
    },
  },
  feat_chronological_sort:
    'Chronologie Intelligente : Trie automatiquement toute section contenant des champs de date par ordre chronologique en un seul clic.',
  feat_dashboard_available_sections_add:
    'Ajoute des sections précédemment vides d’un seul clic directement depuis l’onglet Design.',
  feat_dashboard_raw_json_tab_memory:
    'Les onglets du tableau de bord et du JSON brut mémorisent désormais la vue sélectionnée après rechargement',
  feat_design_direct_edit_hide:
    'Il est désormais possible de masquer des sections individuelles directement depuis l’onglet de commande ou d’accéder directement à l’éditeur pour les modifier.',
  feat_flexible_layout:
    'feat : Refonte de l’interface des modèles — Mise à niveau complète de tous les thèmes pour supporter le placement dynamique des sections et la flexibilité de mise en page',
  feat_image_editor_reset:
    'Tu peux désormais réinitialiser les niveaux de zoom et de rotation séparément',
  feat_image_visibility_toggle: 'Possibilité de masquer la photo de profil sur le CV',
  feat_layout_editor_hints:
    "Ajout de conseils descriptifs pour toutes les sections de l'éditeur de mise en page pour t'aider à organiser ton contenu sans effort.",
  feat_layout_hints_sparkles:
    "feat : Introduction d'indices de mise en page (✨) dans tous les formulaires pour indiquer clairement les champs qui ne sont visibles que dans la colonne principale",
  feat_manual_page_breaks:
    'Prends le contrôle de ta mise en page avec des sauts de page manuels pour des CV multi-pages parfaits',
  feat_mobile_support:
    'Crée où que tu sois : Introduction du support mobile. Crée et peaufine ton CV en déplacement grâce à notre nouvelle interface optimisée pour le tactile.',
  feat_sidebar_flip_transition:
    'Enfin, tu as la possibilité de choisir toi-même la position de la barre latérale pour tous les thèmes à deux colonnes — gauche ou droite, avec une animation miroir fluide.',
  feat_social_profile_iconography:
    'feat : Iconographie des profils sociaux adaptée pour les types GitHub, LinkedIn et Portfolio',
  feat_theme_miniatures:
    'Miniatures haute fidélité : obtiens un aperçu parfait de chaque design avant même de le sélectionner.',
  fix_preview_loading_hang:
    "fix : Système de rendu de l'aperçu renforcé pour éviter les blocages de chargement et gérer les cas particuliers complexes",
  fix_reduced_json_internal_ids:
    "Les exports JSON réduits n'incluent plus les identifiants internes de visibilité",
  ui_categorized_changelog:
    'Refonte du journal des modifications avec des sections catégorisées pour une meilleure lisibilité',
  ui_image_editor_visuals: "Nouveau look pour l'éditeur d'images",
  ui_layout_column_filter:
    'La sélection des modèles est désormais plus intuitive grâce à un nouveau filtre par colonnes.',
  ui_localized_editor_placeholders:
    "Les espaces réservés dans l'éditeur et l'aperçu du CV pour les CV complètement vides correspondent désormais à la langue du CV au lieu de la langue de l'interface",
};
