import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  fix_month_year_dates:
    "Une date saisie en mois et année — 03/2019 ou 03.2019 — est désormais enregistrée correctement : l'entrée se trie à sa place au lieu de finir en bas comme si elle n'avait pas de date.",
  fix_skills_reorg_empty:
    "Réorganiser tes compétences avec l'IA ne peut plus vider la rubrique Compétences. Quand l'IA ne propose aucun nouveau regroupement, tes compétences restent exactement telles quelles, l'opération ne compte pas dans ton quota quotidien et la lettre de motivation rédigée en même temps correspond à ton CV.",
  ui_entry_header_contrast:
    "Plus lisible dans l'éditeur : le poste, les dates et l'indication « Sans titre » à côté de chaque entrée repliée ressortent désormais nettement en mode clair comme en mode sombre.",
};
