import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Aktif Alanlar (Sıralamak için sürükle)',
  address_schema_apply_template: 'Şablon Uygula',
  address_schema_available_fields: 'Kullanılabilir Alanlar (Eklemek için tıkla)',
  address_schema_desc:
    'Adres bloğu düzenini ve ayraçlarını CV dilinden bağımsız olarak biçimlendir.',
  address_schema_mode_custom: 'Özel',
  address_schema_mode_default: 'Dil tabanlı',
  address_schema_mode_default_desc:
    'Şema, CV\'nin diline otomatik olarak uyum sağlar. Bu dil, ayarlanan ekran dilinden farklıysa ülke kodu da eklenir. Daha fazla özelleştirme seçeneği için "{customLayout}" seç.',
  address_schema_mode_label: 'Düzen Modu',
  address_schema_no_active_fields: 'Aktif alan yok. Eklemek için aşağıdaki alanlara tıkla.',
  address_schema_preset_european: 'Avrupa Stili',
  address_schema_preset_us_ca: 'US/CA Stili',
  address_schema_restore: 'Varsayılana Sıfırla',
  address_schema_separator_comma: 'Virgül',
  address_schema_separator_dash: 'Tire',
  address_schema_separator_space: 'Boşluk',
  address_schema_title: 'Adres Şeması Yönetimi',
  address_schema_toggle_separator: 'Ayracı Virgül ve Boşluk arasında değiştir',
  bold_header: {
    desc: 'Hangi detayların kalın başlık (ana satır) olarak gösterileceğini seç',
    title: 'Deneyim Kalın Başlık Modu',
  },
  color_chooser: 'Renk şeması',
  column_empty: 'Bölüm yok',
  design_filter: {
    one_column: 'Tek Sütun',
    two_column: 'İki Sütun',
  },
  empty_sections_subtitle:
    'Bu bölümler henüz boş. Eklemek istediğin bir şey olmadığına emin misin? Her detay fark yaratabilir.',
  empty_sections_title: 'Ek kullanılabilir bölümler',
  example_section: 'Örnek Bölüm',
  formatting: 'biçimlendirme',
  groups: {
    details: 'Detaylar',
    layout: 'Düzen',
    typography: 'Tipografi',
  },
  layout_flip: 'Düzeni Yansıt',
  layout_main_column: 'Ana Sütun',
  layout_side_column: 'Yan Panel',
  layout_swap_tooltip: 'Diğer sütuna taşı',
  more_actions_named: '“{{name}}” için diğer eylemler',
  page_break_add: 'Sayfa sonu ekle',
  page_break_disabled_first: 'İlk öğe için sayfa sonu kullanılamaz',
  page_break_disabled_hidden: 'Gizli bölümler için sayfa sonu kullanılamaz',
  page_break_removal_tooltip:
    'Bu bölümden önceki sayfa sonunu kaldır (yalnızca PDF Sürümü için geçerlidir)',
  page_break_remove: 'Sayfa sonunu kaldır',
  page_break_tooltip: 'Bu bölümden önce sayfa sonu ekle (yalnızca PDF Sürümü için geçerlidir)',
  pdf_footer: {
    date: 'Tarihi Dahil Et',
    desc: 'Imza satirini, konumu ve tarihi alta ekle',
    location: 'Konumu Dahil Et',
    show: 'Altbilgiyi Göster',
    title: 'PDF Altbilgi',
  },
  section_reordering: {
    hint: "Bölümler CV'nde bu sırada görünür. Taşımak için bir satırı tutamağından sürükle.",
    hint_touch:
      "Bölümler CV'nde bu sırada görünür. Bir satırı taşımak için okları kullan veya tutamağını basılı tutup sürükle.",
    title: 'Bölüm Sırası',
  },
  swap_column_named: '“{{name}}” öğesini diğer sütuna taşı',
  template: 'Şablon',
};
