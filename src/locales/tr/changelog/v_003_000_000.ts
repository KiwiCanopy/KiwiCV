import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'AI İçe Aktar',
      content:
        'Özgeçmişini buradan içe aktar. Yüklendiğinde, bu buton güçlü bir AI asistanına dönüşür. {wardsymbol} sembolüne dikkat et.',
      title: 'İçe Aktarma ve AI Asistanı',
    },
    'google-drive': {
      badge: 'Bulut Senk.',
      content: 'Özgeçmişini her yerden kolay erişim için Google Drive ile sorunsuz senkronize et.',
      title: 'Google Drive Entegrasyonu',
    },
    webhosting: {
      badge: 'Web Hosting',
      content: 'Özgeçmişini dakikalar içinde kişisel bir web sitesi olarak yayınlamayı öğren.',
      title: 'Basit Web Hosting',
    },
  },
  feat_ai_import_assistant:
    "Başlamak için yeni bir yol! KiwiCV artık harici LLM'lerin yardımıyla doğrudan düzenleyiciden özgeçmiş içeriği aktarılmasına olanak tanıyor. Daha önce sadece karşılama turuyla sınırlı olan bu özellik artık herkes tarafından kullanılabilir; bu da basit bir istemden mükemmel şekilde stillendirilmiş bir özgeçmişe kusursuz bir geçiş sağlar.",
  feat_brand_contact_modal:
    "İletişime geç! Geri bildirim paylaşmayı, sorun bildirmeyi veya yeni özellikler önermeyi daha da kolaylaştırmak için KiwiCV'a doğrudan bir iletişim penceresi eklendi.",
  feat_deletion_prevention:
    'Yanlışlıkla veri kaybını önlemek için tüm bölümlerdeki öğe silme işlemleri için onay istemleri eklendi.',
  feat_google_drive_sync:
    'Google Drive Senkronizasyonu geldi! KiwiCV artık kişisel Google Drive hesabınla güvenli senkronizasyonu destekleyerek verilerini cihazlar arasında senkronize tutman için daha fazla esneklik sağlıyor. Senkronizasyon motoru, aynı anda birden fazla sağlayıcıyı destekleyecek şekilde tamamen yeniden tasarlandı; üstelik maksimum gizlilik için verilerin tamamen senin kontrolünde kalıyor.',
  feat_language_aware_restore:
    'Akıllı Bulut Keşfi. İster ayarlardan bir geri yükleme başlat, ister Google Drive üzerinden giriş yap veya GitHub bağlantını yeniden kur; KiwiCV arka planda mevcut yedekleri akıllıca tanımlar. Böylece tek bir tıkla tam olarak ihtiyacın olan dil sürümünü geri yükleyebilirsin.',
  feat_localized_language_display:
    'Gelişmiş Yerelleştirme. Özgeçmiş dili seçicileri artık mevcut arayüz diline çevrilirken, arayüz dili seçimi daha iyi erişilebilirlik için yerel formunda kalır.',
  feat_robust_manual_import:
    'Güçlü Manuel İçe Aktarma. KiwiCV artık özgeçmiş içe aktarma işlemleri için kendi güvenli AI modelini sunsa da, kullanıcılarımızın bağımsızlığını destekleyen özellikleri geliştirmeye devam ediyoruz. Özgeçmişini herhangi bir AI sohbetinden (Gemini veya ChatGPT gibi) doğrudan kopyala; içe aktarıcımız artık alıntı etiketleri veya Markdown blokları gibi dikkat dağıtıcı artefaktları otomatik olarak tanımlayıp temizliyor.',
  fix_design_tab_overflow:
    'Tüm cihazlarda daha dengeli ve erişilebilir bir deneyim için tasarım sekmesinde geliştirilmiş taşma yönetimi ve ortalanmış tema seçimi.',
  fix_intelligent_address_cc:
    'Daha akıllı adres biçimlendirme. KiwiCV artık yerel özgeçmişler için ülke kodunu akılcı bir şekilde gizliyor. Ülke bilgisi, yalnızca konumun özgeçmişin ana dilinden farklı olduğunda görünür; bu da daha temiz ve profesyonel bir görünüm sağlar.',
  fix_pagebreaks_reset_on_edit:
    'Özgeçmiş içeriği düzenlendikten sonra manuel sayfa sonlarının istemeden sıfırlanması sorunu giderildi. Özel düzenin artık tam olarak ayarladığın şekilde korunuyor.',
  fix_project_keywords_cleanup:
    'Veri temizliği. Proje ve Özel Proje bölümlerinden işlevsel olmayan anahtar kelime alanları kaldırıldı.',
  other_language_polish:
    'Küresel bir kitle için geliştirildi. Özgeçmiş oluşturma iş akışlarını herkes için daha sezgisel ve gezinmesi daha kolay hale getirmek amacıyla birkaç dildeki ifadeler iyileştirildi.',
  perf_high_growth_optimization:
    'Mükemmellik için tasarlandı. KiwiCV, platform gelişmeye ve büyümeye devam ederken akıcı ve duyarlı bir deneyim sağlamak için önemli performans iyileştirmelerini devreye aldı.',
  refactor_language_certificate:
    'JSON anahtarı `languages.fluency`, amacını daha iyi yansıtmak için `certificate` olarak yeniden adlandırıldı; geriye dönük uyumluluk için eski bir geri dönüş mekanizması eklendi.',
  refactor_sync_organization:
    "Tutarlılık için geliştirildi. Bulut depolama klasörü, KiwiCV'ın veri yapısıyla tam uyum sağlamak amacıyla 'backup' yerine 'backups' olarak yeniden adlandırıldı. Mevcut verilerinin doğru şekilde tanınmaya ve senkronize edilmeye devam etmesi için eski klasör desteği etkin kalmaya devam ediyor.",
  ui_enhancements:
    "Özgeçmiş oluşturma deneyimini yükseltiyoruz. KiwiCV'ı desteklenen tüm dillerde daha sezgisel, erişilebilir ve gezinmesi daha kolay hale getirmek için kapsamlı kullanıcı arayüzü geliştirmeleri ve düzen iyileştirmeleri sunduk.",
  ui_improved_extras_section:
    "Kapsamlı Kılavuz Güncellemesi. 'Nasıl Yapılır' bölümü, yeni düzen ipuçları, sayfa sonları ve akıllı çok dilli yedekleme kılavuzları ile tamamen yenilendi.",
  ui_multi_cloud_interface:
    'Kusursuz çoklu bulut yönetimi. Kullanıcı arayüzü, aynı anda birden fazla senkronizasyon hizmetini zarif bir şekilde yönetecek şekilde geliştirildi; verilerinin senkronizasyon durumuna dair net ve sezgisel bir görünüm sunuyor.',
  ui_refined_experience:
    'Geliştirilmiş Kullanıcı Deneyimi. Özgeçmiş oluşturma sürecinin daha kusursuz ve sezgisel olmasını sağlamak için platform genelinde ince kullanıcı arayüzü iyileştirmeleri ve düzenlemeleri yapıldı.',
  ui_swedish_support:
    'Välkommen! KiwiCV artık resmi olarak İsveççe dilini destekliyor. Editörden dışa aktarılan özgeçmişine kadar tamamen yerelleştirilmiş bir deneyimin tadını çıkar.',
};
