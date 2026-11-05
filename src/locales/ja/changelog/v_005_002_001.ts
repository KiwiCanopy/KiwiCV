import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'いつも通り、バックグラウンドでのいくつかのマイナーなパッケージアップデートにより、KiwiCVの背後にあるテクノロジーを可能な限り最新の状態に保ちます。',
  fix_backup_failure_reported:
    '「バックアップ」に失敗すると、ダイアログに原因が表示されて閉じられるようになり、スクリーンリーダーでも読み上げられます。',
  fix_dashboard_header_narrow_phones:
    '最も幅の狭いスマートフォンでも、ダッシュボードのヘッダーが画面に収まるようになり、「エクスポート」ボタンが切れなくなりました。',
  fix_drive_export_no_empty_folder:
    'バックアップだけを Google Drive にエクスポートしても空のフォルダは作成されなくなり、同じ名前の以前のファイルもそのまま残ります。',
  fix_drive_export_retry_same_folder:
    'Google Drive へのエクスポートを再試行すると、2 つ目のフォルダを残さず同じフォルダに書き込むようになりました。',
  fix_export_drive_renamed_folder:
    'エクスポートと同じ名前のフォルダが Google Drive にすでにある場合、エクスポート後の通知とエクスポートのダイアログの Google Drive の行に、ファイルの保存先フォルダ（MyCV_2 など）が表示されるようになりました。',
  fix_export_retry_keeps_finished:
    'エクスポートのダイアログで再試行しても、完了済みの送信先は完了のまま残り、メッセージの件数にも含まれます。',
  ui_dark_mode_black:
    'ダークモードが純粋な黒になりました。カードは細い緑の線で縁取られ、強いアクセントはキウイグリーンだけです。',
};
