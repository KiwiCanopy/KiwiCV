import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Découvre les dernières mises à jour, fonctionnalités et améliorations de KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Maintenance',
    docs: 'Documentation',
    feat: 'Fonctionnalités',
    fix: 'Corrections de bogues',
    other: 'Autres améliorations',
    perf: 'Performance',
    refactor: 'Remaniement',
    ui: 'Interface utilisateur',
  },
};
