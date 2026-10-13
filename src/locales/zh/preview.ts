import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: '选择预览格式',
  fits_pages_one: '共 1 页',
  fits_pages_other: '共 {{count}} 页',
  generating: '正在生成预览…',
  generating_pdf: '正在生成 PDF...',
  open_html: '预览 HTML',
  open_pdf: '预览 PDF',
  opened: '预览已打开',
  opening: '正在打开预览…',
  pdf_frame_title: 'PDF 预览',
  pdf_render_error_desc: '生成 PDF 的时间比预期长。',
  pdf_render_error_hint:
    '尝试减小字体大小、重新排列章节或临时修改可能过长的细节。这通常是由分页冲突引起的。',
  pdf_render_error_pro_tip: '小提示',
  pdf_render_error_title: '出错了',
  popup_blocked: '你的浏览器阻止了预览。请允许弹出窗口，然后重试。',
  render_failed: 'KiwiCV 无法生成此预览。请重试或选择其他格式。',
  tab_title: '{{name}} – 简历',
  try_again: '重新尝试预览',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
