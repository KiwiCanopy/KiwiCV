import type { Translations } from '@/locales/en';

export const roadmap: Translations['roadmap'] = {
  contact_subtitle:
    '帮助 KiwiCV 打造终极简历工作空间。你的想法驱动着路线图 — 让我们共同创造非凡的作品。',
  contact_text: '对未来有蓝图吗？',
  intro: '以下是未来版本计划的功能。',
  items: {
    ai_cover_letters: {
      desc: '利用 AI 起草并润色求职信，使其与你的简历及申请的职位精准匹配。',
      title: 'AI 辅助求职信',
    },
    cloud_sync: {
      desc: '通过你自己的 Google Drive 或 GitHub 存储备份和恢复简历。',
      title: '云端备份与恢复',
    },
    layout_switch: {
      desc: '在列之间移动板块、切换侧边栏位置并添加手动分页符。',
      title: '灵活的简历布局',
    },
    live_preview: {
      desc: '在实时 HTML 或 PDF 预览旁进行编辑。',
      title: '简历实时预览',
    },
    llm_integration: {
      desc: '使用 AI 导入现有简历并针对特定职位描述定制其内容。',
      title: 'AI 辅助导入与定制',
    },
    matching_cover_letters: {
      desc: '创建与你选择的简历模板视觉匹配的求职信。',
      title: '配套求职信',
    },
    mobile_support: {
      desc: '持续改进小屏编辑和预览工作流。',
      title: '更多移动端改进',
    },
    mobile_support_v1: {
      desc: '在手机上通过触控友好的控件编辑你的简历。',
      title: '触控友好的移动端编辑',
    },
    more_themes: {
      desc: '添加更多专业模板，无需更改你现有的内容。',
      title: '更多简历模板',
    },
  },
  mail: '邮件',
  status: {
    planned: '计划中',
    released: '已发布',
  },
  suggest_via: '通过以下方式建议新功能',
  title: '路线图',
};
