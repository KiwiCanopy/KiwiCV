import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal: '保持知情：添加了“新功能”弹窗，在更新后重点介绍最新的功能和改进。',
  fix_html_preview_scrolling: '解决了在某些浏览器中 HTML 预览面板可能会变得无法滚动的问题。',
  fix_onboarding_tour_mobile_overlay:
    '修复了在小屏幕上引导卡由于遮挡高亮元素而导致的位置显示问题。',
  fix_sidebar_position_placeholders: '修复了使用示例数据预览时无法切换侧边栏位置的问题。',
  fix_ui_header_action_bubbling:
    '无缝编辑器操作：在切换显示/隐藏或在标题中添加新项目时，不再触发不必要的展开或折叠。',
  perf_ats_rendering_optimization:
    'ATS 解析优化：在所有双栏主题中，主列内容现在始终被屏幕阅读器优先读取。',
  refactor_backend_cleanup:
    '清理了后端 and 元数据，从生成的 JSON 文件中删除了弃用的键，以确保数据结构更加紧凑。',
  refactor_package_upgrades:
    '重大的底层优化，升级到 Node 24（从 Node 22 升级）和 Vite 8，带来更安全、更现代的体验。',
  ui_interactive_3d_buttons:
    '设计统一：全应用统一了 3D 触感按钮系统，带来更一致、更高端的操作体验。',
  ui_section_field_ordering: '重新整理了编辑器表单字段，使其与呈现的简历的视觉层次结构保持一致。',
};
