import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: '确保生成的 PDF 文件具有 ATS 友好格式',
  feat_github_backup: '推送到 GitHub 时（从预览选项卡），你的配置也将根据当前状态进行更新',
  feat_mock_data_preview: '如果未提供数据，将使用模拟数据填写预览模板，让你立即看到预览',
  feat_onboarding_flow: '通过改进的欢迎流程增强了入职体验',
  fix_link_references: 'fix：优化了 PDF 和 HTML 主题中的多个链接引用',
  fix_lunar_sidebar_header: '修复了 Lunar 主题中未显示侧边栏标题的问题',
  fix_netlify_routing: '修复了在 Netlify 上刷新子页面导致 404 错误的问题',
  fix_welcome_modal_scroll: '修复了欢迎模式在较小屏幕上无法滚动的问题',
};
