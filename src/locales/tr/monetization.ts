import type { Translations } from '@/locales/en';

export const monetization: Translations['monetization'] = {
  buy_now: 'Şimdi Satın Al',
  canceled_message: 'Satın alma işlemi iptal edildi.',
  description: "İş arama sürene en uygun Pass'i seç.",
  fair_use: {
    description:
      'Kullanım başına ödeme yok. Adil kullanım politikamız dahilinde özgeçmişini istediğin kadar optimize et.',
    link: 'Adil Kullanım Politikası',
    title: 'YZ Kullanımı',
  },
  fulfillment_pending: "Ödeme alındı! Pass'in birkaç dakika içinde etkinleştirilecektir.",
  fulfillment_successful: 'Satın alma başarıyla tamamlandı!',
  passes: {
    '1_days': {
      description: 'Tüm yapay zeka özelliklerini bir sonraki başvurunda dene.',
      title: '1 günlük Pass',
    },
    '7_days': {
      description: 'İş başvuruların için hızlı bir sprint.',
      title: '7 günlük Pass',
    },
    '30_days': {
      description: 'Dolu dolu bir aylık arama süreci için mükemmel.',
      title: '30 günlük Pass',
    },
  },
  per_day: 'Günlük {{price}}',
  processing_order: 'Siparişin işleniyor...',
  recommended: 'Önerilen',
  tabs: {},
  title: 'Hesabına bakiye yükle',
};
