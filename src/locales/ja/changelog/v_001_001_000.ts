import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: '生成されたPDFファイルがATSフレンドリーな形式であることを確認',
  feat_github_backup:
    'GitHubへのプッシュ時（プレビュータブから）、設定も現在の状態に合わせて更新されます',
  feat_mock_data_preview:
    'データが提供されない場合は、モックデータを使用してプレビューテンプレートが入力され、すぐにプレビューを確認できます',
  feat_onboarding_flow: '改善されたウェルカムフローによりオンボーディング体験を強化',
  fix_link_references: 'PDFおよびHTMLテーマの複数のリンク参照を最適化',
  fix_lunar_sidebar_header: 'Lunarテーマでサイドバーのヘッダーが表示されなかった問題を修正',
  fix_netlify_routing: 'Netlifyでサブページを更新すると404エラーが発生する問題を修正',
  fix_welcome_modal_scroll: '小さな画面でウェルカムモーダルがスクロールできなかった問題を修正',
};
