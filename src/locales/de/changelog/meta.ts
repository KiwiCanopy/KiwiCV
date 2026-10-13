import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Entdecke die neuesten Updates, Funktionen und Verbesserungen in KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Wartung',
    docs: 'Dokumentation',
    feat: 'Features',
    fix: 'Fehlerbehebungen',
    other: 'Sonstige Verbesserungen',
    perf: 'Performance',
    refactor: 'Refactoring',
    ui: 'Benutzeroberfläche',
  },
};
