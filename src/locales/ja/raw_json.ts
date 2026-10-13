import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'クリップボードにコピー',
  data_label: '生データ',
  download: 'JSONをダウンロード',
  full: '完全',
  full_desc: 'メタ情報＋表示フラグ（KiwiCVへのインポートに最適）',
  full_title: '全アプリ状態',
  passthrough: {
    desc: '他のツールが引き続きファイルを読み込めるように保持されます。JSON エクスポートと、Drive および非公開の GitHub バックアップには含まれますが、履歴書に表示されたり、AI に送信されたりすることはありません。',
    remove_confirm_message:
      'KiwiCV からエクスポートするファイルには、このブロックが含まれなくなります。この操作は取り消せません。',
    remove_confirm_title: '「{{name}}」を削除しますか？',
    removed_desc:
      '次回の同期で現在のバックアップが置き換えられます。以前のスナップショットや、Drive と GitHub が保持する以前のバージョンには、そこで削除するまで残ります。',
    removed_title: '「{{name}}」をこのブラウザから削除しました',
    title: 'インポートしたファイルの追加データ',
  },
  reduced: '縮小',
  reduced_desc: '非表示アイテム削除済み',
  reduced_title: '縮小JSON',
  standard: '標準',
  standard_desc: 'メタデータなし、全項目',
  standard_title: '標準JSON',
};
