import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  fix_composer_translate_tick:
    '“使用 AI 优化”翻译完你的简历后，下一次运行不会再重复翻译：“同时翻译我的简历”现在会在翻译完成后自动关闭。',
  fix_pending_bar_wraps:
    '在较窄的编辑器中，待审阅的 AI 建议栏现在会让按钮自动换行，“放弃全部”不再被截断。',
  fix_skills_false_change:
    '你没有改动的技能，在“使用 AI 优化”或翻译后不再显示为已更改；放弃翻译的更改时，你的技能也不会再退回旧语言。',
  fix_skills_reorder_is_change:
    '当“使用 AI 优化”只调整了你的技能顺序时，现在会作为可审阅的更改呈现，并标出被移动的技能，而不再提示“未变更”。',
  ui_composer_addon_summary:
    '在“专业”模式下关闭 AI 栏时，将一同运行的附加项（如翻译或技能重组）现在会显示在“优化我的简历”旁边，点击即可打开 AI 栏。',
  ui_export_closes_on_success:
    '全部导出成功后，导出对话框现在会自动关闭，并显示一条确认提示，持续十秒。若任一目标失败，对话框会保持打开，方便你重试。',
  ui_export_improve_apart:
    '“导出”和“优化我的简历”现在更容易区分：“优化”位于 AI 栏的开头，页眉中的“导出”按钮也不再是绿色。当你基于职位描述或自己的指令工作时，“优化”会等到 AI 栏打开后再运行，不会对你看不到的文本执行。',
  ui_page_break_toggle_on_row:
    '分页符按钮重新出现在“设计”选项卡的每个章节行上，让你一眼就能看到新的 PDF 页面从哪里开始。',
};
