import type { Translations } from '@/locales/en';

export const account: Translations['account'] = {
  extend: 'Uzat',
  get_premium: 'Premium Al',
  joined_on: 'Katılma tarihi: {{date}}',
  member_fallback: 'Üye',
  modals: {
    delete_account: {
      confirm_btn: 'Hesabı Kalıcı Olarak Sil',
      consent_label:
        "Premium Pass'imin kalan tüm günlerini kaybetmeyi kabul ediyorum ve bunun geri alınamayacağını anlıyorum.",
      description: 'Hesabını silmek istediğinden emin misin? Bu işlem kalıcıdır ve geri alınamaz.',
      error_message: 'Hesap silinemedi. Lütfen tekrar dene veya destekle iletişime geç.',
      premium_warning: 'Premium durumun ({{date}} tarihine kadar aktif) derhal iptal edilecektir.',
      remove_github: 'GitHub bağlantısını da bu cihazdan kaldır',
      success_message: 'Hesabın başarıyla silindi.',
      title: 'Hesabı Sil',
    },
    profile_missing: {
      description:
        'Kullanıcı profili bulunamadı. Lütfen çıkış yapıp tekrar girmeyi dene. Sorun devam ederse, {{email}} üzerinden KiwiCV ekibiyle iletişime geç veya baştan başlamak için hesabını sil.',
      title: 'Profil Bulunamadı',
    },
  },
  renew: 'Yenile',
  security_privacy: 'Güvenlik ve Gizlilik',
  status: 'Durum',
  status_free: 'Ücretsiz',
  status_pro: 'Pro',
  valid_until: 'Şuna kadar geçerli',
};
