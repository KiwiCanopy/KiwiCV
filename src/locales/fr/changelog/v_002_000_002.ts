import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'Correction de TagField en mode PDF : Résolution d’un problème où les entrées de tags ne se synchronisaient pas correctement lors de l’utilisation de l’aperçu PDF.',
  perf_pdf_render_safety:
    'Stabilité accrue de la génération PDF : Mise en place d’un garde-fou robuste qui empêche les boucles en arrière-plan et propose des étapes de récupération claires en cas de conflits de mise en page.',
};
