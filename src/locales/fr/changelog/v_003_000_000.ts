import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'Import IA',
      content:
        "Importe ton CV ici. Une fois chargé, ce bouton devient ton puissant assistant IA pour l'optimisation. Garde un œil sur le {wardsymbol} dans l'application.",
      title: 'Import & Assistant IA',
    },
    'google-drive': {
      badge: 'Sync Cloud',
      content:
        'Synchronise ton CV en toute transparence avec Google Drive pour un accès facile partout.',
      title: 'Intégration Google Drive',
    },
    webhosting: {
      badge: 'Hébergement Web',
      content:
        'Apprends à publier ton CV en tant que site web personnel en quelques minutes seulement.',
      title: 'Hébergement Web simple',
    },
  },
  feat_ai_import_assistant:
    "Une nouvelle façon de commencer ! KiwiCV permet désormais d'importer le contenu de ton CV à l'aide de LLM externes directement depuis l'éditeur. Auparavant limitée à la visite de bienvenue, cette fonctionnalité est désormais accessible à tous, permettant une transition fluide d'un simple prompt à un CV parfaitement stylisé.",
  feat_brand_contact_modal:
    'Prendre contact ! Un nouveau formulaire de contact a été ajouté pour faciliter le partage de commentaires, le signalement de problèmes ou la suggestion de nouvelles fonctionnalités directement à KiwiCV.',
  feat_deletion_prevention:
    "Ajout de demandes de confirmation pour la suppression d'éléments dans toutes les sections afin d'éviter la perte accidentelle de données.",
  feat_google_drive_sync:
    'La synchronisation Google Drive est arrivée ! KiwiCV prend désormais en charge la synchronisation sécurisée avec ton compte Google Drive personnel, offrant encore plus de flexibilité pour garder tes données synchronisées sur tous tes appareils. Le moteur de synchronisation a été entièrement repensé pour prendre en charge plusieurs fournisseurs simultanément, tout en gardant tes données strictement sous ton contrôle pour une confidentialité maximale.',
  feat_language_aware_restore:
    'Découverte intelligente du cloud. Que tu lances une restauration dans les paramètres, que tu te connectes via Google Drive ou que tu reconfigures ta connexion GitHub, KiwiCV détecte intelligemment les sauvegardes disponibles en arrière-plan. Tu peux ainsi restaurer en un clic la version linguistique exacte dont tu as besoin.',
  feat_localized_language_display:
    "Localisation améliorée. Les sélecteurs de langue du CV sont désormais traduits dans ta langue d'interface actuelle, tandis que la sélection de la langue de l'interface reste sous sa forme native pour une meilleure accessibilité.",
  feat_robust_manual_import:
    "Importation manuelle robuste. Bien que KiwiCV propose désormais son propre modèle d'IA sécurisé pour l'importation de CV, nous continuons d'améliorer les fonctionnalités qui soutiennent l'indépendance de nos utilisateurs. Copie directement ton CV depuis n'importe quel chat d'IA (comme Gemini ou ChatGPT) – notre importateur identifie et nettoie désormais automatiquement les artefacts gênants tels que les balises de citation ou les blocs Markdown.",
  fix_design_tab_overflow:
    "Meilleure gestion des débordements et sélection de thèmes centrée dans l'onglet design pour une expérience plus équilibrée et accessible sur tous les appareils.",
  fix_intelligent_address_cc:
    "Formatage d'adresse intelligent. KiwiCV masque désormais intelligemment le code pays pour les CV nationaux. Le pays n'apparaît que lorsque ton emplacement diffère de la langue principale du CV, assurant une présentation plus épurée et professionnelle.",
  fix_pagebreaks_reset_on_edit:
    "Correction d'un problème où les sauts de page manuels étaient involontairement supprimés après modification du contenu. Ta mise en page personnalisée reste désormais exactement comme tu l'as définie.",
  fix_project_keywords_cleanup:
    'Nettoyage des données. Suppression des champs de mots-clés non fonctionnels des sections Projet et Projet privé.',
  other_language_polish:
    'Peaufiné pour un public mondial. Les formulations dans plusieurs langues ont été affinées pour rendre les flux de travail de création de CV plus intuitifs et plus faciles à naviguer pour tous.',
  perf_high_growth_optimization:
    "Conçu pour l'excellence. KiwiCV a introduit d'importantes améliorations de performance internes pour garantir une expérience fluide et réactive alors que la plateforme continue d'évoluer.",
  refactor_language_certificate:
    'Renommé la clé JSON `languages.fluency` en `certificate` pour mieux refléter son objectif, avec un repli hérité pour la compatibilité descendante.',
  refactor_sync_organization:
    "Affiné pour plus de cohérence. Le dossier de stockage cloud a été renommé de « backup » en « backups » pour s'aligner parfaitement avec la structure des données de KiwiCV. La prise en charge des anciens dossiers reste active, garantissant que tes données existantes continuent d'être correctement identifiées et synchronisées.",
  ui_enhancements:
    "Amélioration de l'expérience de création de CV. Nous avons introduit des améliorations complètes de l'interface utilisateur et des affinements de mise en page pour rendre KiwiCV plus intuitif, accessible et plus facile à naviguer dans toutes les langues prises en charge.",
  ui_improved_extras_section:
    "Mise à jour complète du manuel. La section 'Comment faire' a été repensée avec de nouveaux conseils de mise en page, la maîtrise des sauts de page et des guides de sauvegarde multilingues intelligents.",
  ui_multi_cloud_interface:
    "Gestion multi-cloud fluide. L'interface utilisateur a été affinée pour gérer élégamment plusieurs services de synchronisation à la fois, offrant une vue claire et intuitive de l'état de synchronisation de tes données.",
  ui_refined_experience:
    "Expérience utilisateur raffinée. De subtiles améliorations de l'interface utilisateur et des ajustements de mise en page ont été mis en œuvre sur l'ensemble de la plateforme pour garantir un parcours de création de CV plus poli et intuitif.",
  ui_swedish_support:
    "Välkommen ! KiwiCV prend désormais officiellement en charge le suédois. Profite d'une expérience entièrement localisée, de l'éditeur à ton CV exporté.",
};
