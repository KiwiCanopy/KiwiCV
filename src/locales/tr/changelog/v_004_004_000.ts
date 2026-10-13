import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'Yapay zeka',
      content:
        "KiwiCV artık ön yazını senin için yazıyor. İş ilanını yapıştır ve mevcut CV'nden oluşturulan bir mektup al: uzunluğunu ve tonunu belirle ya da kendi yazılarından bir örnek vererek senin üslubuna uymasını sağla. Taslağının yanında beliren öneriyi paragraf paragraf inceleyip onaylayabilirsin.",
      title: 'Senin için yazılan ön yazılar',
    },
  },
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  feat_ai_cover_letters:
    "Ön yazın artık bir iş ilanından ve elindeki CV'den yola çıkılarak senin için yazılabilir. Bir uzunluk ve ton seç veya kendi yazından bir örnek vererek KiwiCV'ın o üsluba uymasını sağla. Mektup, taslağının yanında okuyabileceğin ve paragraf paragraf kabul edebileceğin bir öneri olarak döner; mektup ister boş ister başlanmış olsun bu imkandan yararlanabilirsin. Bölüm artık henüz yazmadığın bir metin için alıcı adresine ait beş alan yerine doğrudan mektubun kendisiyle açılıyor.",
  fix_ai_large_cv_wait:
    "Büyük bir CV'yi geliştirmek veya çevirmek artık bir dakika sonra hatayla durmuyor — bekleme süresi artık CV'nin boyutuna göre uzuyor.",
  fix_dates:
    'Tarihler yeniden olması gerektiği gibi davranıyor. Girdiğin bir tarih Avrupa dışındayken bir gün geriye kayabiliyor ve tek başına girilen bir yıl tamamen kaybolabiliyordu; tarih seçicide ızgaranın kenarına yakın rastgele bir tıklama fark ettirmeden komşu aya veya yıla atlayabiliyordu; "Girişleri kronolojik olarak sırala" ise 15.03.2019 gibi günle başlayan tarihleri hiç okuyamadığı için bu kayıtlar sanki tarihi yokmuş gibi en alta düşüyordu.',
  fix_keyboard_navigation:
    'Klavyeyle çalışırken artık sayfanın en başına fırlatılmazsın. Bir iletişim kutusunu kapatmak seni onu açtığın düğmeye geri döndürür, bir kaydı veya kayıtlı bir CV\'yi silmek seni bir sonraki kayıtta bırakır ve bir yapay zeka önerisini yanıtlamak çalıştığın yerde kalmanı sağlar. Profil fotoğrafına da artık klavyeden tamamen ulaşılabiliyor; kutucuk yalnızca fare tıklamasına yanıt verdiği için "Düzenle", "Değiştir" ve "Sil" seçeneklerine erişilemiyordu.',
  fix_main_badge_overlaps_label:
    'Bir alan etiketinin yanındaki "main" rozeti artık etiket metninin üzerine binmiyor. Bir simge boyutundaki kutunun içinde oluşturulduğu için daha geniş bir rozet dışarı taşıp yanındaki kelimelerin üzerini örtüyordu.',
};
