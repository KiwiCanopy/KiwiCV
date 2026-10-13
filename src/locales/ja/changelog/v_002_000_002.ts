import type { Translations } from '@/locales/en';

export const v_002_000_002: Translations['changelog']['entries']['v_002_000_002'] = {
  fix_tag_field_pdf_sync:
    'PDFモードでのタグフィールド更新の修正：PDFプレビューの使用時にタグ入力が正しく同期されない問題を解決しました。',
  perf_pdf_render_safety:
    'PDF生成の安定性の向上：バックグラウンドでのループを防ぎ、複雑なレイアウトの競合が発生した際に明確な復旧手順を提供する堅牢なセーフガードを実装しました。',
};
