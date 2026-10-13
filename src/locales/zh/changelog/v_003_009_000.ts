import type { Translations } from '@/locales/en';

export const v_003_009_000: Translations['changelog']['entries']['v_003_009_000'] = {
  chore_login_stability: '强化了登录会话的持久性，防止意外断开连接，确保更稳定的登录状态。',
  fix_translation_after_import: '导入数据后，现在可以立即将简历翻译成 any 其他语言。',
  fix_two_column_sidebar_position: '在编辑器中修改条目时，双栏布局的侧边栏位置现在可以正确保留。',
  refactor_pdf_rendering:
    '我们使用 Typst 从头重构了整个 PDF 渲染引擎，提供更快、更稳定且更高质量的导出体验，助你在求职申请中留下更深刻的印象。',
  ui_polish: '精细调整了网站各处的界面细节，为你提供更流畅、更清爽的的视觉体验。',
};
