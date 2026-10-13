import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: 'Yazı Tipi Boyutu Ölçeği',
    },
  },
  cv_defaults: {
    title: 'CV Varsayılanları',
  },
  danger: {
    delete_btn: 'Tüm Verileri Sil',
    delete_data: 'Tüm Yerel Verileri Sil',
    delete_data_desc:
      'Yerel verilerini sildiğinde geri dönüşü yoktur. Bu işlem tarayıcının LocalStorage verilerinden kaydedilmiş tüm özgeçmişleri kaldıracaktır.',
    title: 'Tehlikeli Bölge',
  },
  export: {
    available_variables: 'Kullanılabilir Değişkenler',
    format_tokens: 'FORMAT belirteçleri:',
    pattern_error_brackets: 'Geçersiz desen: dengesiz parantezler.',
    pattern_tip:
      "FORMAT'ı herhangi bir belirteç kombinasyonuyla değiştir, örn. {date-YYYYMMDD} veya {date-YYYY-MM-DD_HHmm}. Değişiklikler yalnızca yeni dışa aktarımlar için geçerlidir.",
    project_name: 'Varsayılan Proje Adı',
    project_name_desc: 'Dışa aktarmaların için proje adı temelini tanımla.',
  },
  github: {
    disconnect_success: 'GitHub bağlantısı başarıyla kesildi.',
    error_forbidden: 'Erişim yasaklandı veya hız sınırı aşıldı',
    error_invalid_token: "Geçersiz GitHub jetonu. Lütfen PAT'ini kontrol et.",
    error_repo_not_found: 'Depo bulunamadı',
    hide_token: 'Jetonu gizle',
    modal_connect_btn: 'Bağlan ve Senkronize Et',
    modal_description:
      "Özgeçmişini cihazlar arasında senkronize tutmak ve GitHub Pages'a dağıtmak için GitHub deponu bağla.",
    modal_pat_placeholder: 'ghp_kişisel_erişim_jetonun',
    modal_repo_placeholder: 'kullanıcı_adı/depo',
    modal_title: 'GitHub ile Senkronize Et',
    pat_creation_tip:
      "'Only select repositories' seçeneğini işaretlemeyi ve istediğin son kullanma tarihini belirtmeyi unutma.",
    pat_security_note:
      "Güvenlik İpucu: Maksimum güvenlik için yalnızca kendi depona 'Contents' okuma/yazma erişimi olan bir 'Fine-grained' Personal Access Token kullan. Aşağıdaki bağlantıdan bir tane oluşturabilirsin: {{link}}",
    personal_token: 'Personal Access Token (PAT)',
    public_repo_note:
      'Herkese açık bir depoda veya GitHub Pages ile yayınlanan bir depoda yedekler gizlediğin hiçbir şeyi, ön yazını ve içe aktarılan dosyalardaki verileri içermez. Referanslarının adları ve iletişim bilgileri ile dışa aktarırken seçtiğin dosya ve klasör adları yine yedeklerde yer alır; bu adlar başvurduğun şirketi belirtebilir. Özel bir depoyu daha sonra herkese açık yaparsan veya GitHub Pages ile yayınlarsan içinde zaten bulunanlar da herkese açık hale gelebilir.',
    remember_pat: 'Jetonu bu tarayıcıda kalıcı olarak sakla',
    remember_pat_tip:
      'Devre dışı bırakılırsa, jeton yalnızca mevcut oturum için saklanır ve sekmeyi kapattığında silinir.',
    repo_name: 'Depo Adı',
    show_token: 'Jetonu göster',
  },
  interface: {
    appearance: 'Görünüm',
    install: {
      action: "KiwiCV'yi yükle",
      description: "KiwiCV'yi diğer uygulamalar gibi kendi penceresinde aç.",
      installed: 'Bu cihaza yüklendi',
      ios_hint: '“Paylaş” ve ardından “Ana Ekrana Ekle” seçeneğine dokun.',
      label: 'Uygulama',
      unsupported:
        'Tarayıcın uygulama yükleyebiliyorsa adres çubuğunda veya menüde “Yükle” seçeneğini ara.',
    },
    language: 'UI-Dil',
    language_description: 'Uygulama arayüzü için tercih ettiğin dili seç.',
    theme_description: 'Tercih ettiğin tema modunu seç.',
    theme_options: {
      dark: 'Koyu',
      light: 'Açık',
      system: 'Sistem',
    },
    title: 'Uygulama Arayüzü',
  },
  title: 'Ayarlar',
};
