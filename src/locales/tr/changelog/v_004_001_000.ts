import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Ön Yazı',
      content:
        'Ön yazılar KiwiCV dünyasına katıldı. Özgeçmişinle birebir aynı tasarıma sahip bir ön yazı yaz ve her ikisini şık tek bir başvuru paketi olarak dışa aktar — artık uyumsuz belgelere son.',
      title: 'Mükemmel Uyumlu Ön Yazılar',
    },
  },
  chore_ai_model_upgrade:
    "KiwiCV'nin yapay zekası, belirgin şekilde daha iyi öneriler sunmak için artık Google'ın en yeni Gemini nesli (Gemini 3.1) üzerinde çalışıyor. Gizlilik değişmedi: işleme yalnızca AB içinde kalır, GDPR uyumludur ve verilerin asla yapay zeka modellerini eğitmek için kullanılmaz.",
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  feat_matching_cover_letters:
    'Özgeçmişinin tasarımına uyum sağlayan bir ön yazı oluştur ve her ikisini tek bir başvuru paketi olarak dışa aktar. Metni kalın, italik ve bağlantılarla biçimlendir, klasik DIN 5008 veya temayla eşleşen bir düzen seç; gönderen, alıcı ve imza bloklarını her pozisyona uygun şekilde göster veya gizle.',
  fix_design_settings_reset:
    "Design ayarların artık düzenleme yaparken sabit kalıyor. İş Deneyimi ve Eğitim için kalın başlık seçeneği, özel adres düzeni ve GitHub hedef yolu; herhangi bir liste bölümüne öge eklediğinde, sıralamasını değiştirdiğinde veya düzenlediğinde uyarı vermeden ve geri alma seçeneği sunmadan varsayılan değerlere sıfırlanıyordu. İçe aktarılan bir CV'deki özel bölüm başlıkları da artık her düzenlemede korunuyor.",
  fix_elegant_page_breaks:
    'Manuel sayfa sonları artık Elegant temasında çalışıyor. Sayfa sonu eklemek dışa aktarılan PDF üzerinde hiçbir etki yapmıyordu; artık tıpkı diğer temalarda olduğu gibi tam belirttiğin noktadan yeni bir sayfa başlatıyor.',
  fix_empty_custom_address_layout:
    "Kullanılabilir alan içermeyen özel bir adres düzeni artık adresini silmiyor. Design bölümündeki özel düzenden tüm alanları kaldırmak, ekranda hiçbir açıklama göstermeden adresini CV'nden ve PDF'inden tamamen kaldırıyordu. KiwiCV artık bunun yerine ülken için geçerli standart düzene otomatik olarak geçiş yapıyor.",
  fix_footer_date_round_trip:
    'CV altbilgisindeki tarihi kapatma seçeneği dışa aktarma ve tekrar içe aktarma sonrasında korunuyor, kendi yazdığın tarih ise temizlenmek yerine yazıldığı gibi kalıyor.',
  fix_import_list_warnings:
    'İçe aktarma uyarıları artık listeleri de kapsıyor. KiwiCV bir işin öne çıkanlarından, bir diplomanın derslerinden veya bir yeteneğin anahtar kelimelerinden okuyamadığı bir ögeyi çıkarmak zorunda kaldığında, listeyi sessizce kısaltmak yerine içe aktarma özetinde ögeyi ve alanı açıkça belirtiyor.',
  fix_import_warning_headings:
    "İçe aktarma uyarıları artık dahili bir etiket yerine kişisel bilgilerin de dahil olmak üzere CV'nin hangi bölümünden kaynaklandığını gösteriyor.",
  fix_imported_list_fields:
    'Madde işaretli listeleri hatalı biçimlendirilmiş bir CV dosyası artık önizlemeni bozmuyor. İçe aktarılan bir JSON dosyası iş öne çıkanlarını, dersleri veya bir yeteneğin anahtar kelimelerini liste yerine tek bir metin satırı olarak kaydetmişse, önizleme ve PDF tamamen oluşturulamaz hale geliyordu. KiwiCV artık okuyabildiği verileri işleyip kalanını hatasız bir şekilde atlıyor.',
  fix_imported_text_fields:
    "Yanlış biçimde gelen iletişim bilgileri artık CV'ne zarar vermiyor. İçe aktarılan bir dosya adını, web siteni, telefonunu veya şehrini düz metin dışında bir formatta kaydetmişse, önizleme veya PDF tamamen durabiliyordu. KiwiCV artık okuyabildiği verileri alıyor ve adının ile adresinin etrafındaki fazla boşlukları temizleyerek adını iki satıra bölen temalarda ilk satırın boş görünmesini engelliyor.",
  fix_imported_theme_name:
    'Tanınmayan bir tasarım adıyla içe aktarılan bir CV artık neredeyse boş görünmek yerine tüm bölümlerini görüntülüyor.',
  fix_missing_sections_single_column:
    "Düzenini yeniden organize ettikten sonra doldurduğun bölümler tek sütunlu temalarda artık kaybolmuyor — içerik barındıran her bölüm önizlemede ve dışa aktarılan PDF'te görünüyor.",
  fix_pdf_special_characters:
    'Özgeçmişindeki özel karakterler ve bağlantılar artık tüm temaların PDF çıktılarında sorunsuz ve güvenilir şekilde yer alıyor.',
  fix_preview_pdf_parity:
    'Artık gördüğün şey, dışa aktardığın şeyle eşleşiyor. Yeniden adlandırılan bölüm başlıkları, temaya özel detaylar, yanlarındaki simgeler ve birkaç iki sütunlu temadaki proje bölümleri ekran önizlemesi ile dışa aktarılan PDF arasında farklılık gösterebiliyordu – ikisi artık tamamen aynı şekilde işleniyor.',
  fix_reload_repairs_cv:
    'Editörün yeniden yüklenmesi, bozuk veya eski CV dosyalarını anında otomatik olarak onarır ve olası önizleme ve dışa aktarma çökmelerini önler.',
  fix_signature_footer:
    "İmza altbilgisi düzeltildi: Artık gerçekten imza atmak için yer bırakıyor, daha uzun CV'lerde boş bir son sayfa oluşturmuyor ve eksik olduğu Elegant, Plain ve Plain 2 temalarında görünüyor.",
  fix_stackoverflow_page_breaks:
    'Manuel sayfa sonları Stack Overflow temasında tekrar çalışıyor. Sayfa sonu eklemek PDF oluşturulmasını tamamen engelliyordu; önizleme ve dışa aktarma artık tam belirttiğin konumda sayfayı bölüyor.',
  fix_theme_fonts:
    "Elegant, Timeless ve JavaScript artık önizlemede tasarlandıkları yazı tipleriyle görüntüleniyor. Önizleme daha önce genel bir sistem yazı tipine geçiyor, Timeless PDF'i ise farklı bir yazı tipiyle dışa aktarılıyordu — her üç tema da artık ekranda nihai belgedekiyle birebir aynı görünüyor.",
  fix_two_column_stray_breaks:
    "Lunar, Misty ve Swiss Grid temalarında, tüm ögelerini gizlediğin bir bölüm artık manuel sayfa sonunu dışa aktarılan PDF'e taşımıyor, böylece bölümün bulunduğu yerde boş bir sütun oluşmuyor.",
  other_discord_community:
    'KiwiCV artık bir Discord topluluğuna sahip — geri bildirim paylaşmak, şablon talep etmek ve iş arama sürecinde birbirlerine destek olmak için bir yer. Altbilgide ve açılış sayfasında bir bağlantı seni bekliyor.',
  other_export_no_google_fonts:
    "Dışa aktarılan bir HTML CV'yi açmak artık yazı tipleri için Google ile bağlantı kurmuyor. KiwiCV'nin sunduğu yazı tipi dosyalarının aynısı kullanılıyor, böylece belgeyi açtığın başkaları tarafından öğrenilmeden tamamen aynı görünüm elde ediliyor.",
  other_import_clear_warning:
    'İçe aktarma özeti, yalnızca metin içeren alanlardan metin dışı değerler temizlendiğinde bunları sessizce boşaltmak yerine seni açıkça uyarır.',
  other_kiwicanopy_family:
    'KiwiCanopy ailesinin diğer üyeleriyle tanış — KiwiCV artık Hakkında sayfasından KiwiCanopy ve KiwiDesk bağlantıları sunuyor.',
};
