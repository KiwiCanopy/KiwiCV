import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    "Her zaman olduğu gibi, arka plandaki birkaç küçük paket güncellemesi KiwiCV'ın arkasındaki teknolojiyi olabildiğince güncel tutar.",
  fix_ai_proposal_diff:
    'Yapay zeka önerilerini okumak ve yanıtlamak artık daha kolay. Eklenen ve kaldırılan satırlar yalnızca metin rengi yerine kendi arka plan tonuna sahip, her iki seçenek de karanlık modda okunaklı kalıyor ve ait oldukları metnin hemen altında yer alıyor: solda kendi ifadeni koru, sağda öneriyi kabul et.',
  fix_ai_stuck_dialog:
    'Takılan bir yapay zeka işlemi artık ilerleme penceresini açık bırakıp kilitlemiyor. Bir işlem takıldığında pencere kapanmıyordu ve sayfayı yenilemek onu doğrudan geri getirip aynı işlemi yeniden başlatıyordu; yani tek çıkış yolu durumu daha da kötüleştiriyordu. Artık dilediğin an kapatılabiliyor ve sayfa yenilendiğinde kapalı kalıyor.',
  fix_ai_translate_addon:
    "«CV'mi de çevir» seçeneğini işaretlemek artık CV'ni gerçekten çeviriyor. Yanındaki dil kutusu CV'nin zaten yazılı olduğu dille açılıyordu ve işlem bunu «çevrilecek bir şey yok» olarak algılıyordu; bu yüzden CV iş ilanına uyarlanmış ancak yine orijinal dilinde dönüyor, isteğin iptal edildiğine dair hiçbir işaret görünmüyordu.",
  fix_cover_letter_footer:
    "Ön yazının altındaki imza satırı, tıpkı CV'ndeki gibi artık «PDF Altbilgi» ayarlarını takip ediyor. Eskiden mektubun üst kısmındaki tarih alanını kopyalıyordu; dolayısıyla bu alanı temizlemek imzayı da boşaltıyordu ve ikisi asla birbirinden farklı olamıyordu.",
  fix_cvs_connect_button:
    "«CV'lerim» ekranından bulut depolama bağlamak baştan sona yeniden sorunsuz çalışıyor. Bağlı bir sağlayıcı olmadan giriş yaptığında «Bulut depolamayı bağla» butonu hiçbir tepki vermiyordu ve arkasındaki iletişim kutusu yalnızca zaten bulunduğun sayfaya geri döndüren bir butonla açılıyordu.",
};
