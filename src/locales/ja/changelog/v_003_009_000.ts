import type { Translations } from '@/locales/en';

export const v_003_009_000: Translations['changelog']['entries']['v_003_009_000'] = {
  chore_login_stability:
    'ログインセッションの維持処理を強化し、意図しない接続切れを防ぎ、より安定した接続状態を確保しました。',
  fix_translation_after_import:
    'データのインポート直後でも、履歴書を他の言語にすぐ翻訳できるようになりました。',
  fix_two_column_sidebar_position:
    'エディタでエントリーを編集する際、2カラムレイアウトのサイドバーの位置が正しく保持されるようになりました。',
  refactor_pdf_rendering:
    'PDFレンダリングエンジンをTypstでゼロから再構築し、より高速で安定した高品質なエクスポート機能を実現しました。応募先でさらに好印象を与えることができます。',
  ui_polish:
    'ウェブサイト全体のさまざまなインターフェースデザインを微調整し、より滑らかでクリーンな視覚体験を実現しました。',
};
