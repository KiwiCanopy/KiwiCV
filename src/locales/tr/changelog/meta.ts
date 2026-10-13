import type { Translations } from '@/locales/en';

export const meta: Omit<Translations['changelog'], 'entries'> = {
  intro: "KiwiCV'taki en son güncellemeleri, özellikleri ve iyileştirmeleri keşfet.",
  title: 'Değişim Günlüğü',
  types: {
    chore: 'Bakım',
    docs: 'Dokümantasyon',
    feat: 'Özellikler',
    fix: 'Hata Düzeltmeleri',
    other: 'Diğer İyileştirmeler',
    perf: 'Performans',
    refactor: 'Yeniden Yapılandırma',
    ui: 'Kullanıcı arayüzü',
  },
};
