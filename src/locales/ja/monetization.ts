import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: '今すぐ購入',
  canceled_message: '購入がキャンセルされました。',
  description: '求職活動の期間に合わせた Pass をお選びください。',
  fair_use: {
    description:
      '従量課金ではありません。フェアユースポリシーの範囲内で、何度でも履歴書を最適化できます。',
    link: '公平利用ポリシー',
    title: 'AI の利用',
  },
  fulfillment_pending: 'お支払いを確認しました。まもなく Pass が有効化されます。',
  fulfillment_successful: '購入が正常に完了しました！',
  passes: {
    '1_days': {
      description: '次の応募で、すべてのAI機能を試せます。',
      title: '1日間 Pass',
    },
    '7_days': {
      description: '応募書類作成の短期集中スプリント。',
      title: '7日間 Pass',
    },
    '30_days': {
      description: '1ヶ月間の本格的な転職・就職活動に最適。',
      title: '30日間 Pass',
    },
  },
  per_day: '1日あたり {{price}}',
  processing_order: '注文を処理しています...',
  recommended: 'おすすめ',
  tabs: {},
  title: 'アカウントのチャージ',
};
