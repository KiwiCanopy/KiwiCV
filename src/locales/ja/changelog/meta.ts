import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: 'KiwiCVの最新のアップデート、機能、改善点をご覧ください。',
  title: '変更ログ',
  types: {
    chore: 'メンテナンス',
    docs: 'ドキュメント',
    feat: '新機能',
    fix: 'バグ修正',
    other: 'その他の改善',
    perf: 'パフォーマンス',
    refactor: 'リファクタリング',
    ui: 'ユーザーインターフェース',
  },
};
