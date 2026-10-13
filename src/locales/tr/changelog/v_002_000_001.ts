import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Haberdar kal: Güncelleme sonrası en yeni özellikleri ve iyileştirmeleri vurgulayan 'Neler Yeni' penceresi eklendi.",
  fix_html_preview_scrolling:
    'Belirli tarayıcıda HTML önizleme panelinin kaydırılamaz hale gelmesine neden olan bir sorun çözüldü.',
  fix_onboarding_tour_mobile_overlay:
    'Küçük ekranlarda hoş geldin turu kartının vurgulanan öğelerin üzerine binmesine neden olan bir konumlandırma sorunu giderildi.',
  fix_sidebar_position_placeholders:
    'Örnek verilerle önizleme yaparken yan panel konumunun değiştirilememesi sorunu giderildi.',
  fix_ui_header_action_bubbling:
    'Sorunsuz editör işlemleri: Bölüm başlıklarında görünürlüğü değiştirmek veya yeni öğeler eklemek artık istenmeyen genişleme veya daralmaya neden olmaz.',
  perf_ats_rendering_optimization:
    'ATS Optimizasyonu: Tüm iki sütunlu temalarda ana sütundaki içeriklerin ekran okuyucular tarafından öncelikli okunması sağlandı.',
  refactor_backend_cleanup:
    'Daha düzenli bir veri yapısı için oluşturulan JSON dosyalarından kullanımdan kaldırılan anahtarları temizleyerek arka uç ve meta verileri optimize edildi.',
  refactor_package_upgrades:
    "Daha güvenli ve modern bir deneyim için Node 24 (Node 22'den) ve Vite 8'e yükseltme ile büyük altyapı optimizasyonu.",
  ui_interactive_3d_buttons:
    'Tasarım Birleştirme: Daha tutarlı ve üst düzey bir deneyim için dokunsal 3D düğme sistemi tüm uygulama genelinde birleştirildi.',
  ui_section_field_ordering:
    "Editör form alanlarını oluşturulan CV'nin görsel hiyerarşisiyle uyumlu olacak şekilde yeniden düzenledik.",
};
