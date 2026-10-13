import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: '探索 KiwiCV 的最新更新、功能和改进。',
  title: '更新日志',
  types: {
    chore: '日常维护',
    docs: '文档更新',
    feat: '新功能',
    fix: '问题修复',
    other: '其他改进',
    perf: '性能优化',
    refactor: '代码重构',
    ui: '用户界面',
  },
};
