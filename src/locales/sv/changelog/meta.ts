import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Utforska de senaste uppdateringarna, funktionerna och förbättringarna i KiwiCV.',
  title: 'Ändringslogg',
  types: {
    chore: 'Underhåll',
    docs: 'Dokumentation',
    feat: 'Funktioner',
    fix: 'Buggfixar',
    other: 'Övriga förbättringar',
    perf: 'Prestanda',
    refactor: 'Refaktorisering',
    ui: 'Användargränssnitt',
  },
};
