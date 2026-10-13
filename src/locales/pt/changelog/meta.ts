import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'Explora as últimas atualizações, funcionalidades e melhorias no KiwiCV.',
  title: 'Changelog',
  types: {
    chore: 'Manutenção',
    docs: 'Documentação',
    feat: 'Funcionalidades',
    fix: 'Correções de erros',
    other: 'Outras melhorias',
    perf: 'Desempenho',
    refactor: 'Refatoração',
    ui: 'Interface de utilizador',
  },
};
