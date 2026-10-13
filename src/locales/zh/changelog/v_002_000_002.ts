import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    '修复 PDF 模式下的标签字段更新：解决了使用 PDF 预览时标签输入无法正确同步的问题。',
  perf_pdf_render_safety:
    '增强 PDF 生成稳定性：实现了一个健壮的安全防护机制，可防止后台死循环，并在复杂的布局冲突期间提供清晰的恢复步骤。',
};
