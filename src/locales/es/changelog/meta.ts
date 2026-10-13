import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Explora las últimas actualizaciones, características y mejoras en KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Mantenimiento',
    docs: 'Documentación',
    feat: 'Características',
    fix: 'Correcciones de errores',
    other: 'Otras mejoras',
    perf: 'Rendimiento',
    refactor: 'Refactorización',
    ui: 'Interfaz de usuario',
  },
};
