import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Odkryj najnowsze aktualizacje, funkcje i ulepszenia w KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Konserwacja',
    docs: 'Dokumentacja',
    feat: 'Funkcje',
    fix: 'Poprawki błędów',
    other: 'Inne ulepszenia',
    perf: 'Wydajność',
    refactor: 'Refaktoryzacja',
    ui: 'Interfejs użytkownika',
  },
};
