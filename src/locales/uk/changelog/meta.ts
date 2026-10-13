import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Дізнайся про останні оновлення, функції та покращення в KiwiCV.',
  title: 'Історія змін (Changelog)',
  types: {
    chore: 'Обслуговування',
    docs: 'Документація',
    feat: 'Нові функції',
    fix: 'Виправлення помилок',
    other: 'Інші покращення',
    perf: 'Продуктивність',
    refactor: 'Рефакторинг',
    ui: 'Інтерфейс користувача',
  },
};
