import type { Translations } from '@/locales/en';

export const preview: Translations['preview'] = {
  choose_format: 'プレビューのフォーマットを選択',
  fits_pages_one: '1 ページに収まる',
  fits_pages_other: '{{count}} ページ',
  generating: 'プレビューを生成しています…',
  generating_pdf: 'PDFを生成中...',
  open_html: 'HTML プレビュー',
  open_pdf: 'PDF プレビュー',
  opened: 'プレビューが開きました',
  opening: 'プレビューを開いています…',
  pdf_frame_title: 'PDF プレビュー',
  pdf_render_error_desc: 'PDFの生成に時間がかかっています。',
  pdf_render_error_hint:
    'フォントサイズを小さくする、セクションを並べ替える、または長すぎる可能性のある詳細を一時的に変更してみてください。これは多くの場合、改ページの関係で発生します。',
  pdf_render_error_pro_tip: 'ヒント',
  pdf_render_error_title: '問題が発生しました',
  popup_blocked:
    'ブラウザによってプレビューの表示がブロックされました。ポップアップを許可してから、もう一度お試しください。',
  render_failed:
    'KiwiCV でプレビューを生成できませんでした。もう一度試すか、別のフォーマットを選択してください。',
  tab_title: '{{name}} – 履歴書',
  try_again: 'プレビューを再試行',
  view_html: 'HTML',
  view_pdf: 'PDF',
};
