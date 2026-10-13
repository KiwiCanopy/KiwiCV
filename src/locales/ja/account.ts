import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: '延長',
  get_premium: 'プレミアムを入手',
  joined_on: '登録日 {{date}}',
  member_fallback: 'メンバー',
  modals: {
    delete_account: {
      confirm_btn: 'アカウントを永久に削除する',
      consent_label:
        'Premium Pass の残り日数をすべて失うことに同意し、この操作を元に戻すことはできないことを理解しています。',
      description:
        'アカウントを削除してもよろしいですか？この操作は永続的であり、元に戻すことはできません。',
      error_message:
        'アカウントの削除に失敗しました。もう一度試すか、サポートにお問い合わせください。',
      premium_warning: 'プレミアムステータス（{{date}} まで有効）は直ちにキャンセルされます。',
      remove_github: 'このデバイスから GitHub の接続も削除する',
      success_message: 'アカウントが正常に削除されました。',
      title: 'アカウントの削除',
    },
    profile_missing: {
      description:
        'ユーザープロフィールが見つかりませんでした。一度ログアウトしてから再度ログインしてください。問題が解決しない場合は、{{email}} までご連絡いただくか、アカウントを削除してやり直してください。',
      title: 'プロフィールが見つかりません',
    },
  },
  renew: '更新',
  security_privacy: 'セキュリティとプライバシー',
  status: 'ステータス',
  status_free: '無料',
  status_pro: 'Pro',
  valid_until: '有効期限',
};
