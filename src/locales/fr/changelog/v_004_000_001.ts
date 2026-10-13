import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  fix_migration_notice:
    "Si tu accèdes encore à KiwiCV via son ancienne adresse web, l'avis indique désormais la date exacte à laquelle cette adresse cessera de fonctionner : 31 octobre 2026.",
  fix_mobile_checkout:
    "Balayer les cartes de tarifs sur smartphone ne déclenche plus l'achat par accident. Seul le bouton permet désormais de démarrer la commande.",
  fix_preview_reliability:
    "La prévisualisation ne reste plus bloquée sur un chargement infini. Un pop-up bloqué t'informe désormais de la situation, un rendu qui bloque s'arrête avec une explication claire, et la prévisualisation continue de fonctionner même lorsqu'un service externe est lent ou inaccessible.",
  fix_save_status:
    "La mention « Enregistré sur cet appareil » reflète désormais l'état réel du stockage, au lieu d'afficher la même confirmation quel que soit le résultat.",
  fix_translations:
    'Correction de treize textes contenant des caractères du mauvais alphabet (des caractères cyrilliques dans des mots espagnols et turcs, des caractères coréens et japonais en chinois) et comblement des dernières lacunes dans les quinze langues.',
  perf_preview_speed:
    "La première prévisualisation s'affiche bien plus vite. KiwiCV chargeait auparavant toutes les polices pouvant être nécessaires avant de pouvoir afficher quoi que ce soit, y compris deux polices très lourdes en chinois et en japonais. Celles-ci ne sont désormais chargées que si ton CV utilise réellement ces caractères.",
  ui_polish:
    "Un Polish visuel : les titres utilisent une vraie police extra-grasse plutôt qu'un rendu artificiellement épaissi par le navigateur, les libellés de formulaires et espaces réservés sont plus lisibles, et les cartes de sections partagent un accent uniforme.",
};
