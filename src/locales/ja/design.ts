import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: '使用中の項目（ドラッグで並び替え）',
  address_schema_apply_template: 'テンプレートの適用',
  address_schema_available_fields: '利用可能な項目（クリックで追加）',
  address_schema_desc:
    '履歴書の言語とは無関係に、住所ブロックのレイアウトと区切り文字をフォーマットします。',
  address_schema_mode_custom: 'カスタム',
  address_schema_mode_default: '言語に基づく',
  address_schema_mode_default_desc:
    'スキーマは履歴書の言語に自動的に適応します。設定された表示言語と異なる場合は、国コードも追加されます。さらにカスタマイズしたい場合は、「{customLayout}」を選択してください。',
  address_schema_mode_label: 'レイアウトモード',
  address_schema_no_active_fields:
    '有効な項目がありません。下の項目をクリックして追加してください。',
  address_schema_preset_european: 'ヨーロッパ式',
  address_schema_preset_us_ca: 'アメリカ/カナダ式',
  address_schema_restore: 'デフォルトに戻す',
  address_schema_separator_comma: 'コンマ',
  address_schema_separator_dash: 'ダッシュ',
  address_schema_separator_space: 'スペース',
  address_schema_title: '住所スキーマ的管理',
  address_schema_toggle_separator: 'カンマとスペースの区切り文字を切り替える',
  bold_header: {
    desc: 'どの詳細を太字ヘッダー（主要行）として表示するか選択します',
    title: '職歴・学歴の太字ヘッダーモード',
  },
  color_chooser: '配色',
  column_empty: 'セクションなし',
  design_filter: {
    one_column: 'シングルカラム',
    two_column: '2カラム',
  },
  empty_sections_subtitle:
    'これらのセクションはまだ空です。本当に追加する内容はありませんか？細かな詳細が差をつけます。',
  empty_sections_title: '追加の利用可能なセクション',
  example_section: '例のセクション',
  formatting: 'フォーマット',
  groups: {
    details: '詳細',
    layout: 'レイアウト',
    typography: 'タイポグラフィ',
  },
  layout_flip: 'レイアウトを反転',
  layout_main_column: 'メインカラム',
  layout_side_column: 'サイドバー',
  layout_swap_tooltip: '別の列に移動',
  more_actions_named: '「{{name}}」のその他の操作',
  page_break_add: '改ページを追加',
  page_break_disabled_first: '最初の項目では改ページを使用できません',
  page_break_disabled_hidden: '非表示のセクションでは改ページを使用できません',
  page_break_removal_tooltip: 'このセクションの前の改ページを削除（PDF版のみ適用）',
  page_break_remove: '改ページを削除',
  page_break_tooltip: 'このセクションの前に改ページを追加（PDF版のみ適用）',
  pdf_footer: {
    date: '日付を含める',
    desc: '署名欄、場所、日付を下部に挿入',
    location: '場所を含める',
    show: 'フッターを表示',
    title: 'PDFフッター',
  },
  section_reordering: {
    hint: 'セクションはこの順序でCVに表示されます。行のハンドルをドラッグして移動できます。',
    hint_touch:
      'セクションはこの順序でCVに表示されます。矢印を使って行を移動するか、ハンドルを長押ししてドラッグします。',
    title: 'セクション順序',
  },
  swap_column_named: '「{{name}}」を別の列に移動',
  template: 'テンプレート',
};
