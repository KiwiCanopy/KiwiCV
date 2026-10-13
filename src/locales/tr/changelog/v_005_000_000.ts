import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: '1 günlük Pass',
      content:
        "KiwiCV'nin sana uygun olup olmadığından emin değil misin? Yeni 1 günlük Pass, bir sonraki başvurun için tüm yapay zeka özelliklerinin kilidini açar; böylece daha uzun bir Pass'e karar vermeden önce kendin görebilirsin. Fiyat kartları artık 1, 7 ve 30 gün sunuyor.",
      title: 'Bir günlüğüne dene',
    },
    open_source: {
      badge: 'Açık kaynak',
      content:
        "KiwiCV'nin her satırı artık AGPL lisansıyla GitHub'da herkese açık. CV'nin tam olarak nasıl işlendiğini gör, hata bildir ya da özellik öner: gizlilik sözlerinin arkasındaki kodu herkes kontrol edebilir.",
      title: 'KiwiCV açık kaynaklı',
    },
  },
  feat_ai_review_calmer:
    'Yapay zeka önerilerini incelemek daha sakin. Yetenekler ve Diller artık her kayıtta inceleme panelini alıyor, bir önerinin yeniden yazdığı alanlar sen “Benimkini koru” veya “Öneriyi kullan”ı seçene kadar salt okunur kalıyor ve Geliştir sen karar verene kadar bekliyor; böylece ikinci bir çalıştırma henüz görmediğin bir öneriyi değiştiremiyor. Ekran okuyucular her kararı duyuruyor.',
  feat_ai_tailoring_keeps_facts:
    "CV'ni bir iş ilanına göre uyarlamak artık unvanlarına, işverenlerine, tarihlerine ve listelediğin yeteneklere dokunmuyor. CV'nde hiç geçmeyen bir yetenek “CV'nde yok — yalnızca doğruysa kabul et” diye işaretleniyor; böylece eklenmeden önce sen karar veriyorsun.",
  feat_raw_data_extra_blocks:
    "Ham JSON sayfası artık içe aktarılan bir dosyanın getirdiği ek verileri, örneğin başka bir aracın ayar bloğunu listeliyor. JSON'unu okumak için bir bloğu aç ya da dışa aktarımlarında artık istemediklerini kaldır.",
  fix_dates:
    '05.06.19 gibi gün önde tarihler artık 6 Mayıs değil 5 Haziran olarak okunuyor. 31.02.2019 gibi var olmayan bir tarih yazdığın gibi kalıyor ve kırmızı hata işaretini alıyor.',
  fix_drive_reconnect:
    "Google Drive'ı yeniden bağlamak artık her zaman tamamlanıyor, yedeklemeyi açıyor ve gerçek bir yüklemeyle başlıyor.",
  fix_photos:
    "İçe aktarılan bir CV'deki fotoğraflar GPS konumu dahil kamera meta verilerini kaybeder, GIF, HEIC ve AVIF fotoğraflar JPEG olur. Şeffaf arka planlı fotoğraflar kırpıldıktan sonra siyaha dönmek yerine beyaz kalır.",
  fix_preview_pdf_match:
    "Canlı önizlemen ile PDF'in Soft, Misty, Skyline, Swiss Grid, Lunar ve Elegant temalarında artık daha iyi örtüşüyor: aynı büyük harfler, zaman çizelgeleri, yazı tipleri ve bağlantılar. Önizleme artık üçüncü taraf bir sunucudan yazı tipi yüklemiyor, PDF'in başlığı ve yazarı yalnızca adını taşıyor.",
  fix_privacy_controls:
    "Bu cihazda neyin kalacağına sen karar verirsin. Google ile giriş, kalıcı erişimi yalnızca Google Drive'ı bağladığında ister. Ayarlar'daki Google Drive ve GitHub kartları her zaman bağlantıyı kesme seçeneği sunar, çıkış yaparken veya hesabını silerken GitHub bağlantısının da kaldırılmasını seçebilirsin ve yazı örneğin onu kaydeden hesapta kalır.",
  fix_privacy_policy:
    "Gizlilik politikası yeniden yazıldı. KiwiCV'nin yapay zeka isteklerinle ilgili neyi sakladığını (metnini asla), itiraz hakkını ve rızanı nasıl geri çekeceğini sıralıyor; ilgili her hizmeti ve nerede çalıştığını adıyla belirtiyor.",
  fix_small_things:
    'Yan menü açıkken tableti döndürmek artık dokunuşları dondurmuyor, yüzen Önizleme düğmesi artık telefon menüsünü kapatmıyor, güncelleme sırasında açık bırakılan sekme yeni sürüme yeniden yükleniyor ve çevirmek için çok uzun bir CV, uzun bir beklemenin ardından hata vermek yerine baştan reddediliyor.',
  ui_editor_polish:
    "Geri mi döndün? Başlangıç sayfası artık Düzenlemeye devam et diyor ve CV'ni oluştur doğrudan kişisel bilgilerinde açılıyor. Ön yazıda Konu ve Tarih yazı metninin üstünde duruyor, Alıcı ise bir muhatap olunca açılıyor. Geliştir boş bir bölümde de görünür kalıyor ve önce neyi eklemen gerektiğine dair bir ipucu veriyor; yapay zeka karakter sayaçları sınırdan önce kehribar rengine dönüyor.",
  ui_informal_address_more_languages:
    'İspanyolca, Felemenkçe, Rusça, Ukraynaca ve Bulgarca artık uygulamanın her yerinde, diğer diller gibi sana samimi bir dille hitap ediyor.',
  ui_install_app:
    "KiwiCV'yi bir uygulama gibi kullan: Ayarlar → Uygulama Arayüzü artık KiwiCV'yi yükle düğmesi içeriyor; iPhone ve iPad'de de ana ekrana eklediğinde KiwiCV düzgün bir simge kazanıyor.",
};
