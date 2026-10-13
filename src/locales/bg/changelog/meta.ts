import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Разгледай последните актуализации, функции и подобрения в KiwiCV.',
  title: 'История на промените',
  types: {
    chore: 'Поддръжка',
    docs: 'Документация',
    feat: 'Функции',
    fix: 'Корекции на бъгове',
    other: 'Други подобрения',
    perf: 'Производителност',
    refactor: 'Рефакториране',
    ui: 'Потребителски интерфейс',
  },
};
