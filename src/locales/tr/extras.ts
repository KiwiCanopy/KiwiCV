import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV, KiwiCanopy çatısı altında geliştirilen birkaç araçtan biridir. Ailenin geri kalanını keşfet.',
    family_title: 'KiwiCanopy ailesinin bir parçası',
    kiwicanopy_desc: 'Tüm araçların bir arada bulunduğu KiwiCanopy ailesinin evi.',
    kiwidesk_desc: 'KiwiCanopy ailesindeki kardeş bir uygulama.',
    story_p1:
      'İster kendim ister arkadaş çevremle yaptığım paylaşımlarda olsun, defalarca aynı hüsranı yaşadım: her yeni başvuru için özgeçmişi zahmetle yeniden yazma süreci. Herkes, CV’yi hemen aşırı yüklü göstermeden deneyimlerini ilgili pozisyona özel olarak uyarlamak ister. Ancak geleneksel araçlar işte tam da bunu bir eziyete dönüştürüyor: Her küçük düzenleme için çoğu zaman tamamen yeni bir belge oluşturulması gerekiyor ve bu durum hızla bitmek bilmeyen bir versiyon karmaşasına dönüşüyor.',
    story_p2:
      "İşte tam da bu yüzden KiwiCV'ı hayata geçirdim: tek bir merkezden her şeyi yönetebileceğin, maddeleri kolayca açıp kapatabileceğin, bölümlerin yerini özgürce değiştirebileceğin ve esnek bir şekilde dışa aktarabileceğin modüler bir özgeçmiş oluşturucu. Sayısız Word belgesi arasında yorucu kopyala-yapıştır işlemlerine artık son. Tüm kariyer geçmişin artık sabit bir yuvaya sahip ve sen her başvuru için sadece o an göstermek istediklerini büyük bir rahatlıkla seçiyorsun.",
    story_title: "KiwiCV'ın Hikayesi",
    title: 'KiwiCV Hakkında',
    visit_site: 'Siteyi ziyaret et',
  },
  howto: {
    core: {
      ai_assistant: 'Yapay Zeka Asistanı',
      ai_assistant_desc:
        "Tek tek öğeleri, bölümleri veya tüm CV'ni optimize etmek için Yapay Zeka Asistanını kullan. {wardsymbol} simgesini ara!",
      hide_show: 'Gizle/Göster',
      hide_show_desc:
        'Öğeleri sürekli kaldırıp tekrar eklemekten kaçınmak için, tek bir tıklamayla tek tek öğeleri veya tüm bölümleri gizleyebilirsin.',
      move_items_desc:
        'Bölümleri veya tek tek öğeleri kenar çubuğu ile ana sütun arasında sürükleyip bırak.',
      page_breaks: 'Sayfa Sonu',
      page_breaks_desc:
        "PDF dışa aktarımının tam istediğin gibi görünmesini sağlamak için manuel sayfa sonları ekle. Bu sadece PDF'yi etkiler, web sürümünü etkilemez.",
      rearrange: 'Yeniden Düzenle',
      rearrange_desc:
        'Öne çıkarmak istediğin şeye odaklanmak için herhangi bir bölümdeki öğeleri yeniden sırala.',
      switch_sides: 'Kenarları Değiştir',
      switch_sides_desc:
        'İçeriğin için en iyi düzeni bulmak üzere Ana sütun ile Kenar çubuğunu kolayca değiştir.',
      title: 'Temel Fonksiyonlar',
    },
    footer: {
      message:
        "KiwiCV ile CV'ni yazmanın gelecekte daha az zahmetli ve daha eğlenceli olacağını umuyoruz! İş aramanda bol şans!",
    },
    github: {
      create_pat_link: "GitHub'da jeton oluştur",
      create_repo_link: "GitHub'da depo oluştur",
      go_to_settings: 'Ayarlara git',
      intro:
        'Otomatik çoklu dil kullanımı, sürüm kontrolü ve basit barındırma için özgeçmişini bir GitHub deposuna bağla. Şu üç adımı izle:',
      pat_security_tip:
        "Sadece ilgili depondaki 'Contents' bölümüne okuma/yazma erişimi olan 'Fine-grained' bir Personal Access Token kullan. 'Only select repositories' seçeneğini işaretlemeyi ve istediğin bir son geçerlilik tarihi belirlemeyi unutma.",
      step1_desc:
        "GitHub'da yeni bir özel depo oluştur. Şimdilik tamamen boş bırakabilirsin (README ve .gitignore gerekmez).",
      step1_title: 'Bir Depo Oluştur',
      step2_desc:
        "KiwiCV'ın depona veri gönderebilmesi için bir Personal Access Token'a (PAT) ihtiyacı var. Maksimum güvenlik için 'fine-grained' bir jeton kullanmanı öneririm.",
      step2_title: 'Personal Access Token (PAT) Oluştur',
      step3_desc:
        "Ayarlar sayfasına git ve GitHub bölümüne depo bilgilerini ve jetonunu gir. Alternatif olarak, sağ üstteki GitHub butonuna tıklayarak PAT'ını girebileceğin formu açabilirsin.",
      step3_title: "KiwiCV'a Bağla",
      title: 'GitHub Bağlantı Rehberi',
    },
    hosting: {
      automated_title: 'Seçenek B: Otomatik Barındırma (GitHub aracılığıyla)',
      github_pages_desc:
        "KiwiCV tarafından oluşturulan HTML dosyasını kullan ve bir GitHub deposuna yükle. Özgeçmişin için ücretsiz bir genel URL almak için depo ayarlarından GitHub Pages'i etkinleştir.",
      github_pages_title: 'GitHub Pages',
      intro:
        'Özgeçmişinin oluşturulan HTML versiyonunu ücretsiz olarak barındırabilirsin. İşte en yaygın seçenekler:',
      manual_title: 'Seçenek A: Manuel Yükleme (GitHub gerekmez)',
      netlify_desc:
        'Netlify veya Vercel gibi servisler, basit sürükle-bırak yöntemiyle veya GitHub deponla otomatik senkronizasyonla ücretsiz statik barındırma sunar. HTML özgeçmişini düzenleme geçmişini açığa çıkarmadan oraya yükleyebilirsin.',
      netlify_drop_desc:
        'Kişisel bir URL ile rekabet avantajını garantile. Özgeçmişini **saniyeler içinde** çevrimiçi hale getirebileceğin birçok **ücretsiz sağlayıcı** vardır. İster yukarıda bağlantısı verilen araç aracılığıyla, ister [Tiiny.host](https://tiiny.host) gibi alternatifler aracılığıyla: web sitenin hızlı bir şekilde **sürüklenip bırakılması**, web üzerinde profesyonel bir varlığa sahip olmak için yeterlidir.',
      netlify_drop_title: 'Hızlı ve Kolay: Netlify Drop',
      netlify_title: 'Netlify, Vercel ve Diğerleri',
      privacy_warning:
        "Dikkat: Ücretli bir GitHub planın yoksa, GitHub Pages'i kullanmak için deponu herkese açık (public) yapman gerekir. Bu, tüm özgeçmiş geçmişinin (tüm commit'lerin) herkes tarafından görülebileceği anlamına gelir! Gizlilik önemliyse ilk seçeneği kullanmanı öneririm.",
      push_folder_hint:
        'KiwiCV, HTML dosyasını depandaki belirli bir klasöre göndermeni destekler. Önizleme sayfasındaki gelişmiş ayarları kontrol et.',
      sensitive_data_warning:
        "Gizlilik Uyarısı: Özgeçmişini herkese açık bir URL'de barındırırsan verilerine herkes erişebilir. Açık adresin, telefon numaran ve e-posta adresin gibi çok hassas kişisel bilgileri kaldırmayı düşünebilirsin.",
      title: 'Özgeçmişini Yayınla',
    },
    pdf_guide: {
      font_size: 'Yazı Tipi Boyutu',
      font_size_desc: 'Alanı optimize etmek için Tasarım sekmesinden yazı tipi boyutunu ayarla.',
      intro:
        'PDF işleme karmaşıktır ve bu da bazen istenmeyen düzenlere yol açabilir. Bunu önlemek için, belgen isteklerini tam olarak karşılayana kadar aşağıdaki özelliklerle denemeler yapabilirsin:',
      rearrange_sections: 'Yeniden Düzenle',
      rearrange_sections_desc:
        'Bölümleri yeniden sıralamak genellikle "yalnız" kalan satırları veya uygunsuz sayfa sonlarını çözebilir.',
      space_opt: 'Alan Optimizasyonu',
      space_opt_desc:
        'Bazen kısa bir bölümü kenar çubuğuna taşımak temiz bir düzen için yeterli alanı boşaltabilir.',
      title: 'PDF Düzen İpuçları',
      use_pagebreaks: 'Sayfa Sonlarını Kullan',
      use_pagebreaks_desc:
        'Kenara çok yakın öğeler bazen kötü görünebilir. Onları temiz bir şekilde taşımak için sayfa sonlarını kullan.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Dil değiştirmek, bulutta zaten bir sürüm olup olmadığını kontrol eden bir süreci tetikler.',
      auto_recognition_title: 'Otomatik Tanıma',
      desc: 'KiwiCV birden fazla dili yönetir. Kaydettiğinde veya yedeklediğinde, uygulama o an aktif olan dile özel bir sürüm oluşturur. Daha sonra dilleri değiştirdiğinde, KiwiCV mevcut yedekleri tanıyacak ve bunları geri yüklemeyi teklif edecektir.',
      language_specific_desc: 'Her dil versiyonu, bulut deponda ayrı bir giriş olarak saklanır.',
      language_specific_title: 'Dil Spesifik',
      title: 'Akıllı Dil Yedeklemeleri',
    },
    toc_title: 'İÇİNDEKİLER',
  },
  page_description:
    "Arka plan, destek ve vizyon: KiwiCV'tan en iyi şekilde nasıl yararlanabileceğini, yolculuğun nereye gittiğini ve CV oluşturucunun arkasındaki hikayeyi keşfet.",
  page_title: 'Ekstralar',
  tabs: {
    about: 'KiwiCV Hakkında',
    changelog: 'Değişiklik Günlüğü',
    howto: 'Rehberler',
    roadmap: 'Yol Haritası',
  },
};
