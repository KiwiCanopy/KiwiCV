import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: 'Panoya kopyala',
  data_label: 'Ham veri',
  download: 'JSON İndir',
  full: 'Tam',
  full_desc: "Üst veri + görünürlük işaretleri (KiwiCV'a aktarmak için en iyisi)",
  full_title: 'Tam Uygulama Durumu',
  passthrough: {
    desc: "Diğer araçların dosyanı okumaya devam edebilmesi için saklanır. JSON dışa aktarımlarına ve Drive ile özel GitHub yedeklerine dahil edilir; CV'nde asla gösterilmez ve yapay zekaya gönderilmez.",
    remove_confirm_message:
      "KiwiCV'den dışa aktardığın dosyalar artık bu bloğu içermeyecek. Bu işlem geri alınamaz.",
    remove_confirm_title: '“{{name}}” kaldırılsın mı?',
    removed_desc:
      "Bir sonraki senkronizasyon mevcut yedeğinin yerini alır. Önceki anlık görüntüler ve Drive ile GitHub'ın sakladığı eski sürümler, sen oradan silene kadar onu içermeye devam eder.",
    removed_title: '“{{name}}” bu tarayıcıdan kaldırıldı',
    title: 'İçe aktarılan bir dosyadaki ek veriler',
  },
  reduced: 'Azaltılmış',
  reduced_desc: 'gizli öğeler kaldırıldı',
  reduced_title: 'Küçültülmüş JSON',
  standard: 'Standart',
  standard_desc: 'Meta yok, Tüm Öğeler',
  standard_title: 'Standart JSON',
};
