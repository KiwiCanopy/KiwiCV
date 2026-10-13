import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: '人工智能导入',
      content:
        '在此导入你的简历。加载后，此按钮将变为强大的 AI 助手。请留意应用中的 {wardsymbol}。',
      title: '导入和人工智能助手',
    },
    'google-drive': {
      badge: '云端同步',
      content: '将你的简历无缝同步到 Google Drive，随时随地轻松访问。',
      title: 'Google Drive 集成',
    },
    webhosting: {
      badge: '网页托管',
      content: '了解如何在几分钟内将你的简历发布为个人网站。',
      title: '简单网页托管',
    },
  },
  feat_ai_import_assistant:
    '开启简历的新方式！KiwiCV 现在支持直接在编辑器中借助外部大语言模型 (LLM) 导入简历内容。此功能此前仅在新手引导中提供，现在已向所有人开放——实现从简单提示词到精美简历的无缝转换。',
  feat_brand_contact_modal:
    '欢迎联系！新增了联系方式，以便更轻松地直接向 KiwiCV 分享反馈、报告问题或建议新功能。',
  feat_deletion_prevention: '在所有部分添加了项目删除确认提示，以防止意外数据丢失。',
  feat_google_drive_sync:
    'Google Drive 同步功能现已推出！KiwiCV 现在支持与你的个人 Google Drive 进行安全同步，为你在各设备间保持数据同步提供更多灵活性。同步引擎经过全面重构，可同时支持多个供应商，同时确保你的数据严格受你控制，以实现最大的隐私保护。',
  feat_language_aware_restore:
    '智能云端发现。无论你是在设置中启动恢复、通过 Google Drive 登录，还是重新设置 GitHub 连接，KiwiCV 都会在后台智能识别可用的备份。只需点击一下，你就能恢复所需的准确语言版本。',
  feat_localized_language_display:
    '增强本地化。简历语言选择器现在会翻译成你当前的界面语言，而界面语言设置则保留其原生形式，以提高可访问性。',
  feat_robust_manual_import:
    '强大的手动导入。虽然 KiwiCV 现在为简历导入提供了自己的安全 AI 模型，但 we 仍在继续增强支持用户独立性的功能。直接从任何 AI 聊天（如 Gemini 或 ChatGPT）复制你的简历——我们的导入器现在可以自动识别并清理干扰性的伪影，如引用标签或 Markdown 块。',
  fix_design_tab_overflow:
    '改进了设计选项卡中的水平溢出处理并居中了主题选择，在所有设备上提供更平衡且易于操作的体验。',
  fix_intelligent_address_cc:
    '更智能的地址格式。KiwiCV 现在会智能隐藏国内简历的国家代码。仅当你的所在地与简历的主语言区域不符时还会显示国家，从而确保版面更加简洁专业。',
  fix_pagebreaks_reset_on_edit:
    '修复了编辑简历内容后手动分页符被意外重置的问题。你的自定义布局现在会完全保持你设置的样子。',
  fix_project_keywords_cleanup: '数据清理。删除了项目和私人项目部分中冗余且无功能的关键字字段。',
  other_language_polish:
    '为全球用户打造。优化了多种语言的表述，使简历制作流程对每个人都更加直观且易于操作。',
  perf_high_growth_optimization:
    '精益求精。KiwiCV 引入了重大的底层性能改进，以确保平台在不断演进和增长的过程中，依然能提供流畅且响应迅速的体验。',
  refactor_language_certificate:
    '将 JSON 键 `languages.fluency` 重命名为 `certificate` 以更好地反映其用途，并提供旧版回退以实现向后兼容。',
  refactor_sync_organization:
    "为保持一致性而优化。云端存储文件夹已从 'backup' 重命名为 'backups'，以完美契合 KiwiCV 的数据结构。系统将继续支持旧文件夹，确保你的现有数据能够被正确识别并同步。",
  ui_enhancements:
    '提升简历制作体验。我们引入了全面的 UI 增强和布局优化，使 KiwiCV 在所有支持的语言中更加直观、易于访问且更易于导航。',
  ui_improved_extras_section:
    "手册全面更新。'如何操作'部分已完全重构，新增了布局技巧、分页符掌握方法以及智能多语言备份指南。",
  ui_multi_cloud_interface:
    '无缝的多云管理。用户界面经过优化，可同时优雅地处理多个同步服务，为你提供清晰直观的数据同步状态视图。',
  ui_refined_experience:
    '更精致的用户体验。平台全线实施了细微的 UI 增强和布局调整，确简历制作流程更加考究且符合直觉。',
  ui_swedish_support:
    'Välkommen! KiwiCV 现在正式支持瑞典语。从编辑器到导出的简历，尽享完全本地化的体验。',
};
