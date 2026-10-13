import type { Translations } from '@/locales/en';

export const v_002_000_000: Translations['changelog']['entries']['v_002_000_000'] = {
  _highlights: {
    'dashboard-view': {
      badge: '仪表盘',
      content: '不再需要在预览和编辑器之间切换！全新的仪表盘视图将一切整合在一个无缝的并排界面中。',
      title: '全能仪表盘',
    },
  },
  feat_chronological_sort:
    '智能时间轴：仅需点击一次，即可自动按时间顺序排列任何包含日期字段的栏目。',
  feat_dashboard_available_sections_add: '从“设计”选项卡直接一键添加之前为空的章节。',
  feat_dashboard_raw_json_tab_memory: 'Dashboard 和原始 JSON 标签页现在会在刷新后记住所选视图',
  feat_design_direct_edit_hide:
    '你现在可以直接从布局顺序选项卡隐藏简历的各个章节，或直接跳转到编辑器中的相应位置进行编辑。',
  feat_flexible_layout: '模板引擎革新 — 全面升级所有主题，以支持完全动态的章节放置 and 布局灵活性',
  feat_image_editor_reset: '你现在可以分别重置缩放和旋转级别',
  feat_image_visibility_toggle: '可以在简历中隐藏个人资料照片',
  feat_layout_editor_hints: '在布局编辑器中为所有栏目添加了描述性提示，助你轻松组织简历内容。',
  feat_layout_hints_sparkles: '在所有表单中引入了布局提示 (✨)，以清楚地指示仅在主列中可见的字段',
  feat_manual_page_breaks: '通过手动分页符掌控你的布局，打造完美的多页简历',
  feat_mobile_support:
    '随时随地，开启创作：正式支持移动端。通过我们全新的触控优化界面，在旅途中也能轻松创建和完善你的简历。',
  feat_sidebar_flip_transition:
    '终于可以自行决定所有双栏布局 of 侧边栏位置了——左侧或右侧，都没问题，还还配有平滑的镜像动画。',
  feat_social_profile_iconography: '为 GitHub、LinkedIn 和作品集类型精心匹配了社交资料图标',
  feat_theme_miniatures: '高保真主题预览：在选择之前，先睹为快每一款设计的精美排版。',
  fix_preview_loading_hang: '强化了预览渲染系统，以防止加载中挂起，并处理复杂的边缘情况',
  fix_reduced_json_internal_ids: '精简 JSON 导出不再包含内部可见性 ID',
  ui_categorized_changelog: '重新设计了更新日志，通过分类部分提高可读性',
  ui_image_editor_visuals: '全新的图像编辑器视觉设计',
  ui_layout_column_filter: '新增单栏 and 双栏布局筛选器，让模板选择体验更加直观。',
  ui_localized_editor_placeholders:
    '对于完全空白的简历，编辑器和简历预览中的占位符现在匹配简历语言，而不是 UI 语言',
};
