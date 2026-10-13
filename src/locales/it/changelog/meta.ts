import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Esplora gli ultimi aggiornamenti, le funzionalità e i miglioramenti di KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Manutenzione',
    docs: 'Documentazione',
    feat: 'Funzionalità',
    fix: 'Correzioni di bug',
    other: 'Altri miglioramenti',
    perf: 'Prestazioni',
    refactor: 'Refactorizzazione',
    ui: 'Interfaccia utente',
  },
};
