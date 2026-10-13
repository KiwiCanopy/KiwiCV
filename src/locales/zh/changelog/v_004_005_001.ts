import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  fix_month_year_dates:
    '以月份和年份输入的日期（03/2019 或 03.2019）现在会被正确保存，条目会排在应有的位置，而不会像没有日期一样排到最后。',
  fix_skills_reorg_empty:
    '使用 AI 重新整理技能时，不会再清空技能模块。当 AI 没有提出新的分组时，你的技能保持原样，此次运行不计入每日配额，同时生成的求职信也与你的简历一致。',
  ui_entry_header_contrast:
    '编辑器中更易阅读：每个折叠条目旁的职位、日期和“(无标题)”占位文字，现在在浅色和深色模式下都清晰可见。',
};
