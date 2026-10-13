import type { Translations } from '@/locales/en';

export const v_004_000_000: Translations['changelog']['entries']['v_004_000_000'] = {
  _highlights: {
    'kiwicv-rebrand': {
      badge: 'Rebrand 🥝',
      content:
        'CVCanvas devient KiwiCV 🥝✨ ! Nous avons fait évoluer notre nom pour offrir à notre éditeur une identité propre et indépendante. En tant que membre de la famille KiwiCanopy, tes outils puissants, tes données locales et tes CV enregistrés restent 100 % intacts.',
      title: 'Nouveau nom, caractère unique',
    },
  },
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  chore_product_tour:
    "Retrait de l'ancienne visite guidée. La fenêtre « Nouveautés » reste active.",
  chore_security:
    "Améliorations de routine de la sécurité et de la confidentialité sous le capot, notamment des contrôles plus stricts lors de la suppression d'un compte.",
  feat_accessibility:
    "Un grand pas pour l'accessibilité : KiwiCV fonctionne désormais parfaitement avec les lecteurs d'écran et peut être utilisé de A à Z au clavier seul, y compris pour déplacer des sections et des entrées sans souris.",
  feat_design_settings:
    "Les paramètres de design sont plus simples : les actions secondaires de section sont regroupées dans un petit menu au lieu d'encombrer chaque ligne.",
  feat_export_and_preview:
    "Les exportations indiquent désormais la progression du téléchargement, et l'aperçu PDF se répare automatiquement au lieu d'afficher une page blanche en cas de problème.",
  feat_interface_redesign:
    "KiwiCV arbore un tout nouveau look : une page d'accueil rafraîchie, un espace de travail plus pur et un affichage mobile enfin pensé pour ton téléphone.",
  feat_translations:
    "Comblement des dernières lacunes dans les quinze langues : une poignée de messages et d'étiquettes qui apparaissaient encore en anglais sont désormais traduits.",
  fix_ai_import:
    'Correction des importations IA qui pouvaient se bloquer à mi-parcours ou prélever des crédits deux fois.',
  fix_drive_connection:
    "Résolution du problème où Google Drive s'affichait connecté alors qu'il ne fonctionnait plus, et empêchement d'une ancienne connexion de suivre vers un autre compte Google dans le même navigateur.",
  fix_editor_layout:
    "Plusieurs corrections de mise en page dans l'éditeur : les titres et lignes ne sautent plus à la ligne sans raison, la vue en deux colonnes s'empile mieux sur petit écran et l'annulation d'un glisser-déposer remet tout en place.",
  ui_kiwicv_rebrand:
    "Bienvenue sur KiwiCV ! Nous disons au revoir à l'ancien nom CVCanvas et rejoignons avec fierté la famille KiwiCanopy 🥝. Ton éditeur de CV prône une confidentialité maximale, un design unique et une qualité supérieure.",
};
