import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: '立即购买',
  canceled_message: '购买已取消。',
  description: '选择适合你求职周期的 Pass。',
  fair_use: {
    description: '无需按量计费。在我们的公平使用原则内，随意优化你的简历。',
    link: '公平使用政策',
    title: 'AI 使用',
  },
  fulfillment_pending: '已收到付款！你的 Pass 将在稍后激活。',
  fulfillment_successful: '购买成功！',
  passes: {
    '1_days': {
      description: '在下一次求职申请中体验所有 AI 功能。',
      title: '1 天 Pass',
    },
    '7_days': {
      description: '适合投递冲刺期的短期体验。',
      title: '7 天 Pass',
    },
    '30_days': {
      description: '全面开启一个月求职季的最佳搭档。',
      title: '30 天 Pass',
    },
  },
  per_day: '每天 {{price}}',
  processing_order: '正在处理你的订单...',
  recommended: '推荐',
  tabs: {},
  title: '充值账户',
};
