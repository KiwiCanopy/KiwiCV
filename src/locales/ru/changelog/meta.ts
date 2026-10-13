import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Узнай о последних обновлениях, функциях и улучшениях в KiwiCV.',
  title: 'История изменений',
  types: {
    chore: 'Обслуживание',
    docs: 'Документация',
    feat: 'Возможности',
    fix: 'Исправления ошибок',
    other: 'Другие улучшения',
    perf: 'Производительность',
    refactor: 'Рефакторинг',
    ui: 'Интерфейс пользователя',
  },
};
