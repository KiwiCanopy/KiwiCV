import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'フォントサイズのスケール',
    },
  },
  cv_defaults: {
    title: 'CV デフォルト設定',
  },
  danger: {
    delete_btn: 'すべてのデータを削除',
    delete_data: 'すべてのローカルデータを削除',
    delete_data_desc:
      'ローカルデータを削除すると、元に戻すことはできません。この操作により、ブラウザのLocalStorageに保存されているすべての履歴書が削除されます。',
    title: '危険ゾーン',
  },
  export: {
    available_variables: '利用可能な変数',
    format_tokens: 'FORMAT トークン:',
    pattern_error_brackets: '無効なパターン: 括弧の数が一致していません。',
    pattern_tip:
      'FORMATをトークンの組み合わせに置き換えてください。例：{date-YYYYMMDD} や {date-YYYY-MM-DD_HHmm}。変更は新しいエクスポートにのみ適用されます。',
    project_name: 'デフォルトプロジェクト名',
    project_name_desc: 'エクスポートのプロジェクト名ベースを定義します。',
  },
  github: {
    disconnect_success: 'GitHubの接続を解除しました。',
    error_forbidden: 'アクセスが禁止されているか、レート制限がかかっています',
    error_invalid_token: 'GitHub トークンが無効です。PAT を確認してください。',
    error_repo_not_found: 'リポジトリが見つかりません',
    hide_token: 'トークンを非表示',
    modal_connect_btn: '接続と同期',
    modal_description:
      'GitHub リポジトリを接続して、デバイス間で履歴書を同期し、GitHub Pages にデプロイします。',
    modal_pat_placeholder: 'ghp_あなたの個人アクセストークン',
    modal_repo_placeholder: 'ユーザー名/リポジトリ',
    modal_title: 'GitHub と同期',
    pat_creation_tip:
      '「Only select repositories」を選択し、ご希望の有効期限を指定することを忘れないでください。',
    pat_security_note:
      'セキュリティのヒント：最大限のセキュリティを確保するために、特定のリポジトリに対して「Contents」の読み取り/書き込みアクセスのみを許可する「Fine-grained」Personal Access Token を使用してください。以下のリンクから作成できます：{{link}}',
    personal_token: 'Personal Access Token',
    public_repo_note:
      '公開リポジトリ、または GitHub Pages で公開されているリポジトリでは、バックアップに、非表示にした内容、カバーレター、インポートしたファイルのデータは一切含まれません。推薦人の氏名や連絡先、エクスポート時に付けるファイル名やフォルダ名は引き続き含まれます。ファイル名やフォルダ名には、応募先の企業名が含まれることがあります。非公開リポジトリを後から公開した場合、または GitHub Pages で公開した場合、すでに含まれている内容も公開される可能性があります。',
    remember_pat: 'このブラウザにトークンを永続的に保存する',
    remember_pat_tip:
      '無効にすると、トークンは現在のセッションのみ保存され、タブを閉じるとクリアされます。',
    repo_name: 'リポジトリ名',
    show_token: 'トークンを表示',
  },
  interface: {
    appearance: '外観',
    install: {
      action: 'KiwiCV をインストール',
      description: '他のアプリと同じように KiwiCV を開き、専用のウィンドウで使えます。',
      installed: 'このデバイスにインストール済み',
      ios_hint: '「共有」をタップし、「ホーム画面に追加」をタップします。',
      label: 'アプリ',
      unsupported:
        'お使いのブラウザがアプリのインストールに対応している場合は、アドレスバーまたはメニューで「インストール」を探してください。',
    },
    language: 'UI言語',
    language_description: 'アプリケーションインターフェースの優先言語を選択してください。',
    theme_description: '好みのテーマモードを選択してください。',
    theme_options: {
      dark: 'ダーク',
      light: 'ライト',
      system: 'システム',
    },
    title: 'アプリインターフェース',
  },
  title: '設定',
};
