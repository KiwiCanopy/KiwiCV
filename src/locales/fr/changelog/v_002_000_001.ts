import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Reste informé : Ajout d'une fenêtre 'Quoi de neuf' qui met en évidence les dernières fonctionnalités et améliorations après une mise à jour.",
  fix_html_preview_scrolling:
    "Résolution d'un problème où le panneau de prévisualisation HTML pouvait devenir non défilable sur certains navigateurs.",
  fix_onboarding_tour_mobile_overlay:
    "Résolution d'un problème de positionnement où la carte de visite guidée pouvait recouvrir les éléments mis en évidence sur les petits écrans.",
  fix_sidebar_position_placeholders:
    "Correction d'un problème empêchant d'inverser la barre latérale avec les données d'exemple.",
  fix_ui_header_action_bubbling:
    "Actions d'édition fluides : Le basculement de la visibilité ou l'ajout de nouveaux éléments dans les en-têtes de section ne déclenche plus d'expansion ou de réduction indésirable.",
  perf_ats_rendering_optimization:
    "Optimisation ATS : le contenu de la colonne principale est désormais prioritaire pour les lecteurs d'écran dans tous les thèmes à deux colonnes.",
  refactor_backend_cleanup:
    'Nettoyage du backend et des métadaten en supprimant les clés obsolètes des fichiers JSON générés pour une structure de données plus serrée.',
  refactor_package_upgrades:
    'Optimisation majeure sous le capot avec une mise à jour vers Node 24 (depuis Node 22) et Vite 8 pour une expérience plus sécurisée et moderne.',
  ui_interactive_3d_buttons:
    "Unification du design : Le système de boutons tactiles 3D a été harmonisé sur l'ensemble de l'application pour un ressenti plus cohérent et premium.",
  ui_section_field_ordering:
    "Champs du formulaire d'édition réorganisés pour s'aligner sur la hiérarchie visuelle du CV rendu.",
};
