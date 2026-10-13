import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Kendi bölümlerin',
      content:
        'CV\'n artık standart bölümlerle sınırlı değil. Kendi bölümlerini ekle — Konferanslar, Önemli Sonuçlar, hikâyeni anlatan her şey —, diğer bölümler gibi doldur; her tasarıma uyar, hem önizlemede hem PDF\'te. "Yapay Zeka ile İyileştir" ve çeviri de bunlarda çalışır.',
      title: 'Kendi bölümlerin',
    },
  },
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  feat_custom_sections:
    'CV\'ne kendi bölümlerini ekle — Konferanslar, Önemli Sonuçlar ya da standart bölümlerin kapsamadığı her şey. "Bölüm ekle" bölüm listesinin sonunda: bir başlık ver ve diğer bölümler gibi kayıtlarla doldur — ad, tarihler, bağlantı, özet ve öne çıkanlar. Kendi bölümlerin her tasarımda, önizlemede ve PDF\'te yerini bulur ve düzen düzenleyicisinde diğerleri gibi sütunlar arasında taşınabilir. "Yapay Zeka ile İyileştir" bunlarda ve her bir kaydında çalışır; CV\'ni çevirmek de başlıklarını ve kayıtlarını çevirir.',
  feat_json_round_trip:
    "Başka bir araçtan CV dosyası içe aktarmak artık KiwiCV'nin gösteremediği şeyleri çöpe atmıyor. Dosyadaki ek bloklar ile projelerinin rolleri ve anahtar kelimeleri CV'nle birlikte saklanır ve onu dışa aktardığında ya da Google Drive'a veya özel bir GitHub deposuna yedeklediğinde olduğu gibi geri gelir. CV'nde asla görünmezler ve yapay zekaya ulaşmazlar; içe aktarma da hangi blokları sakladığını sana söyler.",
  feat_privacy_by_design:
    "KiwiCV iş akışlarını gizliliğin etrafında şekillendirmeyi sürdürüyor. Herkesin okuyabildiği bir GitHub deposu — herkese açık olan ya da GitHub Pages ile yayımlanan — artık yalnızca CV'nin gösterdiklerini alıyor: gizli kayıtlar, dışarıda bıraktığın adres parçaları ve ön yazın hariç tutuluyor. Özel bir depo tam yedeği korur ve bağlantı penceresi hangisinin hangisi olduğunu sana söyler. İçe aktarılan bir CV dosyasındaki fotoğraflar, kaydedilmeden önce GPS konumu dahil kamera meta verilerini kaybeder.",
  fix_hidden_entries_stay_hidden:
    "Gizlediğin her şey gizli kalır. Başka bir kaydı düzenlemek, taşımak, sıralamak veya silmek gizli bir kaydı geri getirebiliyordu; yeteneklerinin yapay zeka ile yeniden düzenlenmesi ya da boş bir CV'nin örnek önizlemesi de öyle. Aynı işlemler artık henüz yanıtlamadığın bir yapay zeka önerisini sessizce kabul etmiyor.",
  fix_keyboard_screen_reader:
    'Klavye ve ekran okuyucuyla daha akıcı: yeni bir ilk kayıt hemen açılır, platform alanı gerçek bir liste gibi çalışır ve düğmeler adlarıyla duyurulur.',
  fix_language_polish:
    "Uygulama genelinde dil cilası: İtalyanca, Bulgarca, Türkçe ve Portekizce bölüm başlıkları düzeltildi, Türkçe CV'lerde noktalı büyük İ, son İngilizce ekranlar çevrildi ve boş bir CV'de on iki dilde gerçek örnek içerik.",
  fix_reduced_json_hides_sections:
    '"Ham JSON" sayfasındaki "Azaltılmış" JSON artık CV\'nin gizlediği her şeyi dışarıda bırakıyor — gizlediğin bütün bir bölümü ve gizlediğin profil fotoğrafını —, ayrıca CV\'nin dışarıda bıraktığı adres parçalarını ve yalnızca içe aktarılan bir dosyadan saklanan proje alanlarını.',
};
