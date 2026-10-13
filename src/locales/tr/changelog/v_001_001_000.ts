import type { Translations } from '@/locales/en';

export const v_001_001_000: Translations['changelog']['entries']['v_001_001_000'] = {
  feat_ats_friendly: 'Oluşturulan PDF dosyaları için ATS uyumlu format sağlandı',
  feat_github_backup:
    "GitHub'a gönderildiğinde (önizleme sekmesinden) yapılandırman da geçerli duruma göre güncellenecektir",
  feat_mock_data_preview:
    'Veri sağlanmazsa, önizleme şablonlarını doldurmak için örnek veriler kullanılacak ve hemen bir önizleme görmene olanak tanıyacaktır',
  feat_onboarding_flow: 'İyileştirilmiş bir karşılama akışı ile ilk katılım deneyimi geliştirildi',
  fix_link_references: 'PDF ve HTML temalarında birkaç bağlantı referansı optimize edildi',
  fix_lunar_sidebar_header:
    'Lunar temasında kenar çubuğu başlıklarının görüntülenmemesi sorunu giderildi',
  fix_netlify_routing:
    "Netlify'daki alt sayfaların yenilenmesinin 404 hatasına neden olduğu bir sorun düzeltildi",
  fix_welcome_modal_scroll:
    'Hoş geldin modalının küçük ekranlarda kaydırılamaması sorunu giderildi',
};
