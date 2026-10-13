import type { Translations } from '@/locales/en';

export const v_002_000_000: Translations['changelog']['entries']['v_002_000_000'] = {
  _highlights: {
    'dashboard-view': {
      badge: 'ダッシュボード',
      content:
        'プレビューとエディターを切り替える必要はもうありません！まったく新しいダッシュボードビューは、すべてをシームレスなサイドバイサイドインターフェースに統合します。',
      title: 'オールインワン・ダッシュボード',
    },
  },
  feat_chronological_sort:
    'スマート・クロノロジー：日付フィールドを含むセクションを、ワンクリックで自動的に時系列順に並べ替えることができます。',
  feat_dashboard_available_sections_add:
    'これまで未入力だったセクションを、デザインタブからワンクリックで直接追加できるようになりました。',
  feat_dashboard_raw_json_tab_memory:
    'ダッシュボードと Raw JSON のタブが、再読み込み後も選択中の表示を記憶するようになりました',
  feat_design_direct_edit_hide:
    'レイアウト順序タブからレジュメの個別のセクションを直接非表示にしたり、エディタの該当箇所へ直接移動して編集したりできるようになりました。',
  feat_flexible_layout:
    'テンプレートエンジンの刷新 — すべてのテーマを包括的にアップグレードし、完全にダイナミックなセクション配置とレイアウトの柔軟性をサポート',
  feat_image_editor_reset: 'ズームと回転のレベルを個別にリセットできるようになりました',
  feat_image_visibility_toggle: '履歴書のプロフィール写真を非表示にできるようになりました',
  feat_layout_editor_hints:
    'レイアウトエディターのすべてのセクションに説明的なヒントを追加し、コンテンツを簡単に整理できるようになりました。',
  feat_layout_hints_sparkles:
    'すべてのフォームにレイアウトヒント (✨) を導入し、メインカラムにのみ表示されるフィールドを明確に示しました',
  feat_manual_page_breaks:
    '手動の改ページ機能により、複数ページにわたるレジュメのレイアウトを完璧にコントロールできるようになりました',
  feat_mobile_support:
    'どこでも作成・編集：待望のモバイル対応。タッチ操作に最適化された新しいインターフェースで、外出先でも履歴書を完璧に仕上げることができます。',
  feat_sidebar_flip_transition:
    'ついに、すべての2カラムレイアウトでサイドバーの位置を自分で決められるようになりました。左でも、右でも、スムーズなミラーアニメーション付きで自由自在です。',
  feat_social_profile_iconography:
    'GitHub、LinkedIn、ポートフォリオ向けに、正確にマッチしたソーシャルプロファイルアイコンを導入しました',
  feat_theme_miniatures:
    '高精度なテーマプレビュー：テーマを選ぶ前に、各デザインの美しさをひと目で確認できるようになりました。',
  fix_preview_loading_hang:
    'プレビューレンダリングシステムを強化し、読み込みのハングを防止し、複雑なエッジケースを処理できるようにしました',
  fix_reduced_json_internal_ids: '縮小版 JSON エクスポートに内部の表示 ID が含まれなくなりました',
  ui_categorized_changelog:
    '可読性を高めるために、カテゴリ別のセクションでチェンジログを再設計しました',
  ui_image_editor_visuals: '画像エディタのデザインを刷新',
  ui_layout_column_filter:
    '新しいシングルカラムと2カラムのレイアウトフィルターにより、テンプレート選択がより直感的に行えるようになりました。',
  ui_localized_editor_placeholders:
    '完全に空の履歴書の場合、エディタと履歴書プレビューのプレースホルダーが UI 言語ではなく履歴書言語に一致するようになりました',
};
