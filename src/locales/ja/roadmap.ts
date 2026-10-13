import type { Translations } from '@/locales/en';

export const roadmap: Translations['roadmap'] = {
  contact_subtitle:
    '究極の履歴書ワークスペースの構築を KiwiCV で。あなたのアイデアがロードマップを動かします。一緒に素晴らしいものを作り上げましょう。',
  contact_text: '将来へのビジョンをお持ちですか？',
  intro: '将来のバージョンで予定されている機能は次のとおりです。',
  items: {
    ai_cover_letters: {
      desc: '職務経歴書や応募先の求人情報に合わせて、AIを活用してカバーレターの下書きと推敲を行います。',
      title: 'AIによるカバーレター作成',
    },
    cloud_sync: {
      desc: '独自の Google Drive または GitHub ストレージを介して履歴書をバックアップおよび復元します。',
      title: 'クラウドのバックアップと復元',
    },
    layout_switch: {
      desc: '列间でのセクション移動、サイドバー位置の切り替え、手動の改ページ追加を行います。',
      title: '柔軟な履歴書レイアウト',
    },
    live_preview: {
      desc: 'ライブ HTML または PDF プレビューの横で編集します。',
      title: '履歴書のライブプレビュー',
    },
    llm_integration: {
      desc: 'AI を使用して既存の履歴書をインポートし、特定の求人内容に合わせて調整します。',
      title: 'AI を活用したインポートと調整',
    },
    matching_cover_letters: {
      desc: '選択した履歴書テンプレートと視覚的に一致するカバーレターを作成します。',
      title: 'デザインが統一されたカバーレター',
    },
    mobile_support: {
      desc: '小さな画面での編集とプレビューのワークフローを継続的に改善します。',
      title: 'さらなるモバイル機能の改善',
    },
    mobile_support_v1: {
      desc: 'スマートフォンでタッチ対応コントロールを使用して履歴書を編集します。',
      title: 'タッチ対応のモバイル編集',
    },
    more_themes: {
      desc: '既存のコンテンツを変更することなく、プロフェッショナルなテンプレートを追加します。',
      title: '履歴書テンプレートの追加',
    },
  },
  mail: 'メール',
  status: {
    planned: '計画中',
    released: 'リリース済み',
  },
  suggest_via: '以下から新機能を提案',
  title: 'ロードマップ',
};
