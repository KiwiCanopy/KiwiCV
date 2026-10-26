import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'İş İlanları',
      content:
        "Bir CV'yi Google Drive'a veya özel bir GitHub deposuna yedeklerken ilan bağlantısını dışa aktarma penceresine yapıştır, sonra ihtiyaç duyduğunda “CV'lerim” üzerinden aç. Herkese açık depolar bu bağlantıyı asla almaz.",
      title: 'Nereye başvurduğunu hatırla',
    },
  },
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  feat_cover_letter_style_default:
    'Kayıtlı bir yazı örneğin varsa ön yazıların artık yeni bir tarayıcı sekmesinde bile “Yazım tarzıma uyarla” ile başlıyor. Bunun yerine bir ton seçersen KiwiCV onu o sekme için korur.',
  feat_export_cmd_enter:
    "Dışa aktarma penceresinde Cmd+Enter (Windows'ta Ctrl+Enter) tuşlarına basarak düğmeye uzanmadan dışa aktarmayı başlat.",
  feat_export_cover_letter_switch:
    "Dışa aktarma penceresi artık ön yazının dahil olup olmadığını gösteriyor ve eklemek ya da çıkarmak için bir anahtar sunuyor. Ön yazı, CV'ni az önce uyarladığın iş ilanıyla uyuşmayabilecekse seni uyarıyor; böylece göndermeden önce kontrol edebilirsin.",
  feat_job_posting_link:
    "Bir CV'yi Google Drive'a veya özel bir GitHub deposuna yedeklerken ilan bağlantısını ekle, ardından “CV'lerim” içindeki o sürümden doğrudan aç. Herkese açık GitHub depoları bu bağlantıyı asla almaz.",
  fix_basics_proposal_gap:
    '“Temel Bilgiler” bölümündeki bir yapay zeka önerisi artık fotoğrafına yapışık durmuyor.',
  fix_json_resume_import_levels:
    'Bir JSON Resume dosyasını içe aktarırken KiwiCV artık bir dilin yeterliliğini, örneğin “Native” veya “B2”, dil seviyesine dönüştürüyor ve kelimeyle yazılmış yetenek seviyelerini, örneğin “Expert”, okuyor. Bir iş deneyimi şirket açıklaması içeriyorsa içe aktarma artık onu sessizce atlamak yerine KiwiCV’de bunu saklayacak bir alan olmadığını sana bildiriyor.',
  fix_sign_out_forgets_export_details:
    'Oturumu kapattığında KiwiCV artık dışa aktarma penceresine yazdığın şirket, pozisyon ve ilan bağlantısını da unutuyor; böylece bu tarayıcıda sonraki oturum açan kişi bunları görmüyor.',
  fix_tailoring_matches_job_ad:
    'İlana uyarlama artık iş deneyimini iş ilanına göre yeniden yazıyor ve mesleki unvanını ayarlıyor; yalnızca yeteneklerini yeniden yapılandırmakla kalmıyor.',
  ui_export_footer_pinned:
    'Dışa Aktar ve İptal düğmeleri artık küçük ekranlarda dışa aktarma penceresinin altında görünür kalıyor.',
  ui_restructure_skills_default:
    "“Yetenekler bölümünü yeniden yapılandır” artık CV'nin tamamını geliştirirken işaretli başlıyor; böylece uyarlama yeteneklerini varsayılan olarak işe göre yeniden gruplandırıyor. Kendi yapını korumak için işareti kaldır; her değişiklik yine kabul edebileceğin veya reddedebileceğin bir öneri olarak gelir.",
};
