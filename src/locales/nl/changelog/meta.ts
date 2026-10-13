import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Ontdek de nieuwste updates, functies en verbeteringen in KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Onderhoud',
    docs: 'Documentatie',
    feat: 'Functies',
    fix: 'Bugfixes',
    other: 'Andere verbeteringen',
    perf: 'Prestaties',
    refactor: 'Refactoring',
    ui: 'Gebruikersinterface',
  },
};
