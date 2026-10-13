import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: '延长',
  get_premium: '获取高级版',
  joined_on: '加入于 {{date}}',
  member_fallback: '会员',
  modals: {
    delete_account: {
      confirm_btn: '永久删除账户',
      consent_label: '我同意放弃我的 Premium Pass 的所有剩余天数，并且我明白此操作无法撤消。',
      description: '你确定要删除你的账户吗？此操作是永久性的，无法撤销。',
      error_message: '删除账户失败。请重试或联系支持人员。',
      premium_warning: '你的高级会员状态（有效期至 {{date}}）将立即取消。',
      remove_github: '同时从该设备中移除 GitHub 连接',
      success_message: '你的账户已成功删除。',
      title: '删除账户',
    },
    profile_missing: {
      description:
        '找不到你的用户资料。请尝试退出并重新登录。如果问题仍然存在，请通过 {{email}} 联系 KiwiCV 团队或删除你的帐户以重新开始。',
      title: '未找到个人资料',
    },
  },
  renew: '续费',
  security_privacy: '安全与隐私',
  status: '状态',
  status_free: '免费',
  status_pro: 'Pro',
  valid_until: '有效期至',
};
