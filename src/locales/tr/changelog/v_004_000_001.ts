import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  fix_migration_notice:
    "KiwiCV'ye hâlâ önceki web adresinden erişiyorsan, oradaki bildirim artık bu adresin ne zaman kapanacağını tam olarak gösterir: 31 Ekim 2026.",
  fix_mobile_checkout:
    'Telefonda fiyat kartları arasında gezinirken artık yanlışlıkla ödeme sayfası açılmıyor. Yalnızca buton satın alma işlemini başlatır.',
  fix_preview_reliability:
    'Önizleme artık sonsuz bir yükleme simgesinde takılı kalmıyor. Engelleyen bir açılır pencere olduğunda durum açıkça bildirilir, duraklayan bir işleme anlaşılır bir açıklamayla durdurulur ve harici bir hizmet yavaş veya erişilemez olduğunda bile önizleme çalışmaya devam eder.',
  fix_save_status:
    '"Bu cihaza kaydedildi" notu artık ne olursa olsun aynı güvenceyi göstermek yerine gerçekten nelerin depolandığını yansıtır.',
  fix_translations:
    'İspanyolca ve Türkçe kelimelerdeki Kiril karakterleri, Çince içindeki Korece ve Japonca karakterler gibi yanlış alfabeden harfler içeren on üç metin düzeltildi ve tüm on beş dildeki son eksiklikler giderildi.',
  perf_preview_speed:
    "İlk önizleme çok daha hızlı görünüyor. KiwiCV önceden, herhangi bir şey görüntülemeden önce ihtiyaç duyabileceği tüm yazı tiplerini (Çince ve Japonca için iki çok büyük yazı tipi dahil) yüklüyordu. Bunlar artık yalnızca CV'nde bu karakterler gerçekten kullanılıyorsa yükleniyor.",
  ui_polish:
    'Görsel iyileştirme: Başlıklar, tarayıcının yapay olarak kalınlaştırdığı bir yazı tipi yerine gerçek bir ekstra kalın yazı tipi kullanır, form etiketleri ve yer tutucuların okunması kolaylaştırılmıştır ve bölüm kartları kendi renklerini seçmek yerine tutarlı bir vurguyu paylaşır.',
};
