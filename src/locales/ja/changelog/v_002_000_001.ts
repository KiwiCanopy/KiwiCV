import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    '最新情報をチェック：アップデート後の新機能や改善点をハイライトする「新機能のご案内」モーダルを追加しました。',
  fix_html_preview_scrolling:
    '特定のブラウザでHTMLプレビューパネルがスクロールできなくなる問題を修正しました。',
  fix_onboarding_tour_mobile_overlay:
    '小さな画面でオンボーディングツアーのカードがハイライトされた要素に重なってしまう位置の問題を修正しました。',
  fix_sidebar_position_placeholders:
    'サンプルデータでのプレビュー時にサイドバーの位置を入れ替えられない不具合を修正しました。',
  fix_ui_header_action_bubbling:
    'シームレスなエディタ操作：セクションヘッダーでの表示/非表示の切り替えや新規項目の追加時に、意図しないセクションの開閉が発生しなくなりました。',
  perf_ats_rendering_optimization:
    'ATS読み取りの最適化：すべての2カラムテーマにおいて、メインカラムのコンテンツが優先的に読み取られるようになりました。',
  refactor_backend_cleanup:
    '生成されたJSONファイルから非推奨のキーを削除し、データ構造を合理化するためにバックエンドとメタデータをクリーンアップしました。',
  refactor_package_upgrades:
    'Node 24（Node 22からアップグレード）およびVite 8へのアップグレードによる、内部の大幅な最適化。より安全で現代的な体験を実現しました。',
  ui_interactive_3d_buttons:
    'デザインの統一：アプリケーション全体で3Dタクタイルボタンシステムを統一し、より一貫性のある高級感溢れる操作感を実現しました。',
  ui_section_field_ordering:
    'エディタの入力フォームの項目を整理し、レンダリングされた履歴書の視覚的な階層に合わせるように調整しました。',
};
