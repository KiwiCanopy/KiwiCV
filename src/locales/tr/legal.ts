import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Bize e-posta gönderin',
    message:
      "Geri bildirimler KiwiCV'ın en büyük motivasyonudur. İster bir hata bulmuş olun, ister harika bir özellik fikriniz olsun, isterseniz de sadece merhaba demek isteyin; KiwiCV sizi dinlemekten mutluluk duyar.",
    prompt: 'Yanıtlar genellikle 24 saat içinde iletilir.',
    support_label: 'Resmi İletişim Adresi',
    title: 'Özgeçmişlerin geleceğini birlikte inşa edelim!',
  },
  licenses: {
    description:
      "KiwiCV'ta aşağıdaki açık kaynaklı yazılımlar kullanılmaktadır. Değerli katkıları için geliştiricilere ve topluluğa minnettarız.",
    tabLabel: 'Lisanslar',
    title: 'Açık Kaynak Lisansları',
  },
  nav_label: 'Gizlilik ve Şartlar',
  notice: {
    sections: {
      details: {
        content:
          '**{{name}}**\n**{{title}}**\n{{address}}\n\n**İletişim:**\nE-Mail: {{email}}\n\n*UStG § 19 fıkra 1 anlamında bir küçük işletme sahibi olarak KDV hesaplanmaz.*',
        title: '§ 5 DDG uyarınca bilgiler:',
      },
      dispute: {
        content:
          '**Tüketici Uyuşmazlıklarının Çözümü:**\nKiwiCV, bir tüketici hakem heyeti nezdindeki uyuşmazlık çözüm prosedürlerine katılma niyetinde olmadığı gibi buna mecbur da değildir.',
        title: 'Uyuşmazlık Çözümü:',
      },
    },
    title: 'Künye',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            'Aşağıdaki bilgiler, bu web sitesini ziyaret ettiğinizde kişisel verilerinize ne olduğuna dair basit bir genel bakış sunar. Kişisel veriler, sizi kişisel olarak tanımlamak için kullanılabilecek her türlü veridir. KiwiCV kişisel bilgilerinizi satmaz veya paylaşmaz.',
          title: 'Genel Notlar',
        },
        how: {
          content:
            'Verileriniz, bir yandan bize iletmeniz yoluyla toplanır (örneğin uygulamaya özgeçmiş verilerinizi girmeniz). Ancak bu girişler öncelikli olarak tarayıcınızda yerel olarak işlener. Diğer veriler ise web sitesini ziyaret ettiğinizde BT sistemlerimiz tarafından otomatik olarak toplanır. Bunlar esas olarak teknik verilerdir (örneğin internet tarayıcısı, işletim sistemi veya sayfanın görüntülendiği saat).',
          title: 'KiwiCV verilerinizi nasıl topluyor?',
        },
        responsible: {
          content:
            'Bu web sitesindeki veri işleme faaliyetleri web sitesi operatörü tarafından yürütülür. Operatörün iletişim bilgilerini bu gizlilik politikasındaki "Sorumlu birime ilişkin not" bölümünde bulabilirsiniz.',
          title: 'Bu web sitesinde veri toplama işleminden kim sorumludur?',
        },
        title: '1. Bir Bakışta Veri Koruma',
      },
      '2': {
        responsible: {
          content:
            'Bu web sitesindeki veri işlemeden sorumlu kurum:\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail: {{email}}',
          title: 'Sorumlu Birime İlişkin Not',
        },
        rights: {
          content:
            "Geçerli yasal hükümler çerçevesinde, saklanan kişisel verileriniz, bunların kaynağı ve alıcıları ile veri işleme amacı hakkında her zaman ücretsiz bilgi alma (GDPR Madde 15) ve varsa bu verilerin düzeltilmesini (GDPR Madde 16) veya silinmesini (GDPR Madde 17) ve işlenmelerinin kısıtlanmasını (GDPR Madde 18) isteme hakkına, ayrıca sağladığınız verileri yapılandırılmış, yaygın olarak kullanılan ve makine tarafından okunabilir bir formatta alma veya başka bir veri sorumlusuna aktarılmasını isteme hakkına (veri taşınabilirliği hakkı, GDPR Madde 20) sahipsiniz. Bu amaçla ve kişisel veriler konusundaki diğer sorularınız için her zaman benimle iletişime geçebilirsiniz.\n\n**İtiraz hakkı (GDPR Madde 21):** Kişisel verilerinizi meşru menfaatlere dayanarak (GDPR Madde 6 fıkra 1 bent f) işlediğim durumlarda, özel durumunuzdan kaynaklanan nedenlerle bu işlemeye her zaman itiraz etme hakkına sahipsiniz. Bu, bu Gizlilik Politikası'nın hukuki dayanak olarak GDPR Madde 6 fıkra 1 bent f'yi belirttiği tüm işlemeler için geçerlidir. Bu durumda, çıkarlarınıza, haklarınıza ve özgürlüklerinize ağır basan zorlayıcı meşru gerekçeler kanıtlayamadığım ve işleme hukuki taleplerin tespiti, kullanılması ya da savunulması amacına hizmet etmediği sürece ilgili verileri artık işlemem.\n\nBir işleme rızanıza dayanıyorsa (GDPR Madde 6 fıkra 1 bent a), bu rızayı istediğiniz zaman ileriye dönük olarak geri çekebilirsiniz (GDPR Madde 7 fıkra 3); geri çekme, geri çekmeden önce rızaya dayanarak yapılan işlemenin hukuka uygunluğunu etkilemez.\n\nAyrıca, yetkili denetim makamına şikayette bulunma hakkınız da mevcuttur.",
          title: 'Haklarınız',
        },
        title: '2. Genel Notlar ve Zorunlu Bilgiler',
      },
      '3': {
        netlify: {
          content:
            "Bu web sitesi harici bir hizmet sağlayıcı (hoster) tarafından barındırılmaktadır. Web sitemizin barındırılması için **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107** sağlayıcısını kullanıyorum.\n\nNetlify kullanımı, çevrimiçi sunduğum hizmetlerin profesyonel bir sağlayıcı tarafından güvenli, hızlı ve verimli bir şekilde sunulması amacıyla gerçekleştirilmektedir (GDPR Madde 6 fıkra 1 bent f). Netlify, web sitesinin yükleme sürelerini en aza indirmek için verilerin (IP adresiniz gibi) dünya çapındaki sunucular üzerinden yönlendirilebildiği dünya çapında bir İçerik Teslimat Ağı (CDN) kullanır. Oluşan sunucu günlük dosyaları (erişim verileri) genellikle güvenlik nedenleriyle Netlify tarafından 90 gün (ve çevrimdışı 1 yıla kadar) boyunca saklanır ve ardından silinir.\n\nNetlify ayrıca KiwiCV'nin ABD'de bulunan sunucu işlevlerini de çalıştırır. Bölüm 8'deki yapay zeka özelliklerine yapılan her istek, içeriğiyle birlikte (örneğin özgeçmiş metniniz, bir iş ilanı veya yüklenen bir özgeçmiş dosyası) Google'a ulaşmadan önce bu işlevlerden geçer. Aynı durum Google Drive senkronizasyonu (Bölüm 4), ödemeler (Bölüm 6) ve hesabınızın silinmesi (Bölüm 7) için de geçerlidir. Yapay zeka özellikleri ve Google Drive senkronizasyonu için hukuki dayanak, ilgili bölümde belirtilen dayanaktır; ödemeler sizinle yapılan sözleşmenin ifası için işlenir (GDPR Madde 6 fıkra 1 bent b) ve hesabınız, verilerinizi silme yönündeki yasal yükümlülüğü yerine getirmek için silinir (GDPR Madde 17 ile bağlantılı olarak GDPR Madde 6 fıkra 1 bent c).\n\nABD'ye veri aktarımı, AB Komisyonu'nun standart sözleşme maddelerine ve Netlify'ın sertifikalı olduğu AB-ABD Veri Gizliliği Çerçevesi'ne (DPF) dayanmaktadır.\n\n**Veri İşleme Sözleşmesi:** Yukarıda belirtilen hizmetin kullanımı için, Netlify'ın web sitemizi ziyaret edenlerin kişisel verilerini yalnızca benim talimatlarım doğrultusunda ve GDPR'ye uygun olarak işlemesini garanti eden bir Veri İşleme Sözleşmesi (AVV) akdettik.",
          title: 'Harici Hosting (Netlify)',
        },
        sanity: {
          content:
            "KiwiCV blogundaki makaleler ve görselleri ile ana sayfadaki kullanıcı görüşleri ve fotoğrafları, içerik platformu Sanity ile yönetilir (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Norveç ve Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, ABD). Blogu veya bir makaleyi açtığınızda ya da ana sayfada bir kullanıcı görüşüne doğru kaydırdığınızda tarayıcınız bu içeriği doğrudan Sanity'nin sunucularından (sanity.io) yükler. Bu sırada Sanity, IP adresinizi ve her isteğin taşıdığı teknik verileri (örneğin tarayıcı türünüz ve isteğin zamanı) alır.\n\nSanity'nin kullanımı, blogu ve web sitesi içeriğini verimli bir şekilde sunmaya yönelik meşru menfaatimize dayanmaktadır (GDPR Madde 6 fıkra 1 bent f). Bu sırada veriler ABD'ye aktarılabilir; Sanity'nin veri işleme sözleşmesi bu aktarımları AB Komisyonu'nun standart sözleşme maddelerine dayandırır.",
          title: 'Blog ve Web Sitesi İçeriği (Sanity)',
        },
        title: '3. Hosting ve İçerik Teslimat Ağları (CDN)',
      },
      '4': {
        drive: {
          content:
            'KiwiCV, özgeçmiş verilerinin kişisel Google Drive hesabınızla isteğe bağlı senkronizasyonunu sunar. Bu işlevi etkinleştirirseniz, özgeçmiş dosyalarınız Google Drive hesabınıza (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, ABD) aktarılır ve orada KiwiCV tarafından oluşturulan bir klasörde saklanır.\n\nTeknik olarak bu senkronizasyon sunucu işlevlerimiz üzerinden yönlendirilir: Özgeçmiş içeriğiniz ve aktarım için gerekli erişim kimlik bilgisi (refresh token), istek süresince orada geçici olarak işlenir ve sunucularımızda kalıcı olarak saklanmaz. Refresh token aksi takdirde yalnızca tarayıcınızda yerel olarak saklanır. KiwiCV yalnızca kendisinin oluşturduğu dosyalara (Google "drive.file" kapsamı) erişim alır ve Drive\'ınızın geri kalanına hiçbir zaman erişemez.\n\nVeri aktarımı, yalnızca Google hesabınızı gönüllü olarak bağlayarak verdiğiniz aktif rızanıza (GDPR Madde 6 Paragraf 1 lit. a) dayanarak gerçekleşir. Bunu, ayarlardaki "Senkronizasyon ve Depolama" bölümünde "Google Drive bağlantısını kes" ve "Bağlantıyı kes ve erişimi kaldır" ile istediğiniz zaman geri çekebilirsiniz; bu işlem KiwiCV\'ye Google tarafında verilen yetkiyi de iptal eder. KiwiCV\'yi ayrıca Google Hesabı\'ndaki üçüncü taraf erişimi bölümünden kaldırabilirsiniz (myaccount.google.com/connections). Google\'ın bir ABD şirketi olarak verileri ABD\'ye aktardığını lütfen unutmayın; bu aktarım, Google\'ın sertifikalı olduğu AB-ABD Veri Gizliliği Çerçevesi (DPF) ve AB Komisyonu\'nun standart sözleşme maddelerine dayanmaktadır.',
          title: 'Google Drive Senkronizasyonu (İsteğe Bağlı)',
        },
        github: {
          content:
            "Uygulamamız, gönüllü olarak sağladığınız bir GitHub Kişisel Erişim Belirteci (PAT) aracılığıyla doğrudan GitHub hesabınızla etkileşim kurma imkanı sunar (örneğin özgeçmiş verilerinizi kaydetmek veya eşitlemek için).\n\nBu işlevi kullandığınızda tarayıcınız GitHub sunucularıyla (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA) doğrudan bağlantı kurar. Bu süreçte IP adresiniz ve uygulamaya girdiğiniz veriler doğrudan GitHub'a iletilir ve orada işlenir.\n\nGitHub'a neyin ulaştığı seçtiğiniz depoya bağlıdır. GitHub Pages ile yayınlanmayan özel bir depo; gizlediğiniz girdiler, ön yazınız ve KiwiCV'nin içe aktarılan bir dosyadan sakladığı veriler dahil özgeçmiş verilerinin tamamını alır. Herkesin okuyabildiği bir depo (herkese açık olan veya GitHub Pages ile yayınlanan) özgeçmişinizi, gizlediğiniz girdiler ve bölümler, ön yazınız ve içe aktarılan dosyalardan saklanan veriler olmadan alır. Buna karşın tasarım ayarlarınız, gizlemediğiniz sürece profil fotoğrafınız, listelediğiniz referansların adları ve iletişim bilgileri ile dışa aktarırken seçtiğiniz dosya ve klasör adları yine yer alır; bu adlar commit mesajlarında da görünür ve başvurduğunuz şirketi ve pozisyonu belirtebilir. Bir depoyu daha sonra herkese açık yaparsanız veya GitHub Pages ile yayınlarsanız içinde zaten bulunanlar, geçmişi dahil, herkese açık hale gelebilir.\n\nGitHub PAT'iniz hiçbir zaman KiwiCV'nin sunucularına gönderilmez. Bu belirteç yalnızca bu cihazdaki tarayıcınızda saklanır ve yalnızca tarayıcınızın sizin adınıza GitHub'a gönderdiği istekleri yetkilendirmek için kullanılır: geçerli tarayıcı oturumu boyunca veya \"Jetonu bu tarayıcıda kalıcı olarak sakla\" seçeneğini seçerseniz siz kaldırana kadar. Belirteç KiwiCV hesabınıza değil bu cihaza ait olduğundan, \"GitHub'ı kaldır ve çıkış yap\" seçeneğini seçmediğiniz sürece oturumu kapatmak onu korur; hesabınızı silmek, \"GitHub bağlantısını da bu cihazdan kaldır\" seçeneğini işaretli bırakırsanız onu kaldırır.\n\nGitHub'a veri aktarımı yalnızca işlevi gönüllü olarak kullanmanız ve belirtecinizi girmeniz yoluyla verdiğiniz aktif onayınıza (GDPR Madde 6 fıkra 1 bent a) dayanarak gerçekleşir. Bu rızayı, ayarlardaki \"Senkronizasyon ve Depolama\" bölümünde \"GitHub bağlantısını kes\" ve \"Bağlantıyı kes ve jetonu kaldır\" ile istediğiniz zaman geri çekebilirsiniz; bu işlem belirtecinizi ve depo ayarlarınızı bu cihazdan kaldırır ve GitHub'a hiçbir şey göndermez. Deponuzda zaten bulunan veriler, siz GitHub'da silene kadar orada kalır. GitHub'ın bir ABD şirketi olarak verileri ABD'ye aktardığını lütfen unutmamanızı dilerim. GitHub'daki veri korumasına ilişkin daha fazla bilgiyi buradan alabilirsiniz:",
          link: {
            text: 'GitHub Gizlilik Bildirimi',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Kişisel Erişim Belirteci (PAT) Aracılığıyla GitHub ile Etkileşim',
        },
        storage: {
          content:
            "Özgeçmiş oluşturucunun sunulması ve çalışması için KiwiCV, Web Depolama (Local Storage) adı verilen tekniği kullanır. Bu süreçte girdileriniz (özgeçmiş için metin verileri veya Base64 formatında yerel olarak işlenen profil resimleri gibi) uç cihazınızın tarayıcısında yerel olarak önbelleğe alınır. Bu, sayfanın kazara yeniden yüklenmesi durumunda verilerinizin kaybolmasını önler.\n\nKiwiCV'nin kullanmadığı üst düzey bölümler içeren bir özgeçmiş dosyasını içe aktarırsanız (örneğin başka bir uygulama tarafından yazılmış olanlar), dosyayı dışa aktardığınızda bu bölümlerin değişmeden geri gelmesi için KiwiCV bunları bir boyut sınırına kadar özgeçmişinizle birlikte tutar. Bunlar özgeçmişinizle birlikte saklanır, dışa aktarılır ve yedeklenir (Google Drive'a veya GitHub Pages ile yayınlanmayan özel bir GitHub deposuna) ve Ham JSON görünümünde yer alır, ancak özgeçmişinizde veya editörde asla görüntülenmez ve yapay zeka özelliklerine asla gönderilmez.\n\nBir ön yazı için “Yazım tarzıma uyarla” seçeneğini kullanırsanız, girdiğiniz yazı örneği (en fazla 5.000 karakter) özgeçmişinizden ayrı olarak Local Storage'da da saklanır; böylece bir sonraki ön yazınız için hazır olur. Sizin tarzınızda her ön yazı yazıldığında Bölüm 8'deki yapay zeka özelliklerine iletilir; Google Drive veya GitHub yedeklerinizin bir parçası değildir. Ön yazı penceresinde temizleyene, oturumu kapatana, başka bir hesapla oturum açana veya tarayıcınızın depolama alanını silene kadar uç cihazınızda kalır; hesabınızı silmek oturumunuzu da kapattığı için onu hesabı sildiğiniz cihazdan da kaldırır.\n\nBu veriler uç cihazınızda yerel olarak işlenir ve bu politikada açıklanan isteğe bağlı özelliklerden birini (örneğin bu bölümdeki Google Drive yedeklemesi veya Bölüm 8'deki yapay zeka özellikleri) aktif olarak kullanmadığınız sürece hiçbir sunucuya iletilmez. Yerel olarak saklanan bu verilere hiçbir zaman erişimim yoktur.\n\nOturum açarsanız tarayıcınız ayrıca sunucularımıza gönderdiğiniz isteklere eşlik eden oturumunuzu (bkz. Bölüm 5), profilinizin bir kopyasını ve yerel olarak saklanan erişim bilgilerinin ve yazı örneğinin hangi hesaba ait olduğunu kaydeden hesap kimliğinizi saklar. Bunların saklanması, talep ettiğiniz oturum açma için kesinlikle gereklidir (TDDDG § 25 Paragraf 2 No. 2); üçü de oturumu kapattığınızda kaldırılır.\n\nBu verilerin saklanması, uygulamanın temel işlevi için teknik olarak kesinlikle gereklidir. Uç cihazınızdaki verilerin saklanması ve okunmasının hukuki dayanağı TDDDG § 25 Paragraf 2 No. 2'dir. Sonraki işleme süreci, GDPR Madde 6 Paragraf 1 fıkra f uyarınca hizmetin kullanıcı dostu bir şekilde sunulmasındaki meşru menfaatime dayanmaktadır. Yukarıda aksi belirtilmedikçe veriler, tarayıcınızın deposunu (önbellek/Local Storage) manuel olarak temizleyene kadar uç cihazınızda kalır.",
          title: 'Web Depolama (Yerel Depolama) Kullanımı',
        },
        title: '4. Uygulamamızda Veri Toplama',
      },
      '5': {
        account: {
          content:
            "Bir kullanıcı hesabı oluşturduğunuzda (Google OAuth aracılığıyla), erişiminizi ve kişiselleştirilmiş verilerinizi yönetmek için e-posta adresinizi, adınızı ve Google profil resminizi saklarız. Premium özelliklerin yalnızca kayıtlı kullanıcılar tarafından kullanılabileceğini lütfen unutmayın. Ayrıca aktif Pro Pass'iniz hakkındaki bilgileri ve yapay zeka isteklerinize ilişkin, Bölüm 8'de açıklanan meta verileri saklarız. Sunucularımızda yapay zeka optimizasyonuna ait hiçbir girdiyi (promptlar) veya çıktıyı (sonuçlar) kalıcı olarak saklamayız; işleme sırasındaki geçici önbellekleme Bölüm 8'de açıklanmaktadır.\n\n**Veritabanı sağlayıcısı:** Bu hesap verileri, Avrupa Birliği'nde barındırılan bir projede veri işleyicimiz **Supabase, Inc.** nezdinde saklanır. Supabase ile GDPR Madde 28 uyarınca bir veri işleme sözleşmesi mevcuttur.",
          title: 'Hesap ve Profil Bilgileri',
        },
        title: '5. Hesap ve Kullanıcı Verileri',
      },
      '6': {
        stripe: {
          content:
            "Ödemelerin işlenmesi için Stripe Payments Europe, Limited (İrlanda) kullanıyoruz. Ödeme işlemi sırasında Stripe ödeme bilgilerinizi doğrudan toplar. Kendi sunucularımızda hassas ödeme verilerini (kredi kartı numaraları gibi) saklamıyoruz; Stripe'tan yalnızca işlemle ilgili durum bilgilerini alıyoruz. Hukuki dayanak, satın alma işleminizin ifasıdır (GDPR Madde 6 Paragraf 1 lit. b) ve saklanması gereken fatura kayıtları için hukuki yükümlülüktür (GDPR Madde 6 Paragraf 1 lit. c, bkz. Bölüm 7). Stripe verileri ABD'de de işler (Stripe, LLC); bu aktarım, Stripe'ın sertifikalı olduğu AB-ABD Veri Gizliliği Çerçevesi (DPF) ve AB Komisyonu'nun standart sözleşme maddelerine dayanmaktadır.",
          title: 'Stripe Üzerinden İşlem Yönetimi',
        },
        title: '6. Ödeme İşlemleri',
      },
      '7': {
        deletion_scope: {
          content:
            'Kullanıcı hesabınızı sildiğinizde, profiliniz ve bağlı tüm meta veriler (örneğin Pro Pass durumunuz, ödeme kayıtları ve kullanım günlükleri) Supabase tarafından işletilen veri tabanımızdan derhal ve kalıcı olarak silinir (bkz. Bölüm 5). Özgeçmiş verilerinin tarayıcınızın yerel deposunda ve Google Drive yedeklemesini veya GitHub eşitlemesini kullanıyorsanız kişisel Google Drive\'ınızda veya GitHub deponuzda saklandığını lütfen unutmayın; bunların hiçbiri sunucu tarafındaki hesap silme işleminden etkilenmez. Bu cihazda saklanan bir GitHub belirteci de, "GitHub bağlantısını da bu cihazdan kaldır" seçeneğini işaretli bırakırsanız kaldırılır (bkz. Bölüm 4).',
          title: 'Silme Kapsamı',
        },
        retention_legal: {
          content:
            "İşlemle ilgili fatura verilerini (özellikle Stripe üzerinden yapılan satın alma kayıtlarını) 10 yıl süreyle saklamamızın yasal olarak zorunlu olduğunu lütfen unutmayın. Bu, vergi ve ticaret hukuku gerekliliklerine (örneğin Alman AO ve HGB uyarınca) dayanarak yapılır. Bunun yasal dayanağı GDPR Madde 6 Paragraf 1 bent c'dir.",
          title: 'Yasal Saklama Yükümlülükleri',
        },
        stripe_retention: {
          content:
            'Bu spesifik veriler, vergi makamları için uygun dokümantasyonu sağlamak amacıyla yasal süreler boyunca ödeme hizmeti sağlayıcımız Stripe bünyesinde saklı kalmaya devam eder.',
          title: 'Stripe Üzerinden Saklama',
        },
        title: '7. Veri Silme ve Saklama',
      },
      '8': {
        logging_metrics: {
          content:
            'Tamamlanan her yapay zeka isteği için KiwiCV, hesabınıza bağlı meta verileri Supabase tarafından işletilen veri tabanımızda günlüğe kaydeder (bkz. Bölüm 5). Bu kayıt, istemlerinizin veya sonuçların içeriğini asla barındırmaz; bunların bir istek çalışırken kısa süreyle nasıl tutulduğu aşağıda "Geçici Depolama" başlığı altında açıklanmıştır. Şunlar saklanır:\n\n**İstek türü:** isteğin ne tür bir istek olduğu (örneğin, "Özgeçmiş Optimizasyonu", "Ön Yazı", "Yapay Zeka Özgeçmiş Analizi"), seçtiğiniz yapay zeka modu ve isteğin neyle ilgili olduğu (özgeçmişin tamamı ya da "İş Deneyimi" gibi bir bölüm türü); metnin kendisi asla saklanmaz.\n\n**Kullanım verileri:** isteğin zamanı, kullanılan token sayısı ve isteği bir Pro Pass\'in karşılayıp karşılamadığı; KiwiCV\'nin henüz ücretsiz deneme süresi sunduğu dönemdeki istekler için, isteği bu deneme süresinin karşılayıp karşılamadığı.\n\n**Teknik veriler:** isteğin ne kadar sürdüğü, yapay zeka modeli, sunucu bölgesi, yapay zekaya verdiğimiz talimatların sürümü, isteğin nasıl sona erdiği, sonucun herhangi bir şeyi değiştirip değiştirmediği ve bunun bir test çalıştırması olup olmadığı.\n\n**Güvenlik sınıflandırması:** özgeçmiş optimizasyonları ve ön yazılar için, Google\'ın otomatik güvenlik sistemlerinin yapay zeka yanıtına verdiği puanlar (Google bunları sağladığında); örneğin yanıtın taciz veya tehlikeli içerik barındırma olasılığı. Bu puanlar metinden türetilir ancak metinden hiçbir şey içermez.\n\nBu verileri isteklerinizi günlük kullanım hakkınızdan düşmek, Adil Kullanım Politikamızı (kötüye kullanımın, otomatik kullanımın önlenmesi) uygulamak ve hata teşhisi yapmak için kullanırız. Yapay zeka özelliklerini iyileştirmek için bu verileri yalnızca toplu olarak değerlendiririz ve hakkınızda bir profil oluşturmak için asla kullanmayız. İsteklerinizin sayılması hizmetin sağlanması için gereklidir (GDPR Madde 6 fıkra 1 bent b); diğer amaçlar ise kötüye kullanımı önleme, hataları giderme ve yapay zeka özelliklerini iyileştirme yönündeki meşru menfaatimize dayanır (GDPR Madde 6 fıkra 1 bent f). Veriler hesabınız var olduğu sürece saklanır ve hesabınızla birlikte silinir (bkz. Bölüm 7).',
          title: 'Günlükleme ve Kullanım Metrikleri',
        },
        privacy_training: {
          content:
            "Verilerinizin korunması bizim en yüksek önceliğimizdir. Google Cloud API (Vertex AI) kullanımı kapsamında aşağıdaki güvenlik garantileri geçerlidir:\n\n**Model eğitimi yok:** Google, girdiğiniz verilerin (promptlar) küresel yapay zeka modellerini eğitmek için kullanılmasını açıkça hariç tutar. Verileriniz izole edilmiş Google Cloud ortamımızda kalır.\n\n**Veri konumu:** Google, GDPR uyarınca uygun bir veri koruma düzeyi sağlamak amacıyla isteklerinizi Avrupa Birliği içindeki sunucularda (Google Cloud AB çoklu bölgesi \"eu\", AB üye ülkeleriyle sınırlı) işler. İstekler Google'a ulaşmadan önce ABD'deki sunucu işlevlerimizden geçer (bkz. Bölüm 3).\n\n**Sağlayıcıda kalıcı depolama yok:** Google, verileri isteği işlemek için işler ve kalıcı olarak saklamaz. Google, girdileri ve çıktıları 24 saate kadar önbelleğe alabilir. Google'ın otomatik güvenlik sistemleri bir isteği işaretlerse Google, kötüye kullanım açısından incelemek için promptu 30 güne kadar saklayabilir; prompt, model eğitmek için kullanılmaz.",
          title: 'Veri Koruma ve Eğitim Dışı Tutma',
        },
        processing_scope: {
          content:
            "Size özgeçmiş ve ön yazıların akıllı optimizasyonu ve oluşturulması özelliklerini sunmak için Google Cloud'un Vertex AI platformunu kullanıyoruz. Bu süreçte girdiğiniz metinler Google sunucularına iletilir ve orada işlenir; bu sırada ABD'de Netlify üzerinde çalışan sunucu işlevlerimizden geçer (bkz. Bölüm 3). Yapay zeka işlevleri yalnızca siz bunları aktif olarak tetiklediğinizde çalışır; bu işlemenin yasal dayanağı GDPR Madde 6 Paragraf 1 lit. b'dir (talep ettiğiniz özelliğin sağlanması).",
          title: 'İşlemenin Türü ve Kapsamı',
        },
        temporary_storage: {
          content:
            'Yapay zeka taleplerinin istikrarlı bir şekilde işlenmesini sağlamak için KiwiCV asenkron arka plan işlemleri kullanır. Yüklenen girdi belgeleri (özgeçmiş dosyaları gibi) ve yapay zeka tarafından oluşturulan sonuçlar, tarayıcınız bunları başarıyla alana kadar Supabase tarafından işletilen veri tabanımızda (bkz. Bölüm 5) kısa bir süre için (genellikle birkaç dakikadan uzun olmayacak şekilde ve hiçbir zaman 24 saatten fazla olmamak üzere) geçici olarak saklanır. Bu sürenin ardından veya alındıktan sonra, bu geçici sonuçlar ve yüklenen girdi verileri otomatik olarak ve tamamen silinir. KiwiCV bu geçici girdileri ve sonuçları yalnızca talep ettiğiniz sonucu sunmak için kullanır; profil oluşturma veya yapay zeka modellerini eğitme amacıyla asla kullanmaz.',
          title: 'Geçici Depolama',
        },
        title: '8. Yapay Zeka Servislerinin Kullanımı (Google Cloud Vertex AI)',
      },
      '9': {
        posthog: {
          content:
            "Kullanıcıların KiwiCV ile nasıl etkileşime girdiğini daha iyi anlamak ve hizmetlerimizi geliştirmek için PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, ABD) analiz aracını kullanıyoruz. Gizliliğinizi korumak için PostHog'u kesinlikle anonim ve çerezsiz bir şekilde yapılandırdık.\n\n**Anonim Takip:** Herhangi bir takip çerezi kullanmıyoruz ve tarayıcınızda herhangi bir kişisel kimlik bilgisi saklamıyoruz. PostHog, yalnızca bellek içi kalıcılık (memory-only persistence) kullanacak şekilde yapılandırılmıştır; bu, sayfayı kapattığınızda veya yenilediğinizde tüm oturum verilerinin kaybolacağı anlamına gelir.\n\n**Veri Yerleşimi (AB):** Tüm veriler, Avrupa veri koruma standartlarına uyumu sağlamak için PostHog'un Avrupa sunucularına (Bölge: Frankfurt, Almanya - https://eu.i.posthog.com) gönderilir ve burada saklanır.\n\n**Oturum Tanıma:** Anonim oturum tanıma için sunucu tarafında 24 saat sonra otomatik olarak silinen kısa süreli bir karma (hash) değeri oluşturulur. Bu, sizi bir birey olarak tanımlamamıza olanak sağlamadan etkileşim modellerini (örneğin hangi temaların popüler olduğunu veya kaç özgeçmişin dışa aktarıldığını) görmemizi sağlar.\n\nPostHog kullanımı, web sitemizin talebe yönelik tasarımı ve sürekli optimizasyonuna yönelik meşru menfaatimize dayanmaktadır (GDPR Madde 6 (1) (f)).",
          title: 'Anonim Web Analizi (PostHog)',
        },
        title: '9. Web Analizi',
      },
      '10': {
        email: {
          content:
            "Bize e-posta ile ulaştığınızda (örneğin {{email}} adresine veya bu sitede belirtilen başka bir adrese), talebinizi ve olası ek soruları yanıtlamak için iletişim bilgileriniz dahil verilerinizi saklarız.\n\n**E-posta yönlendirme (Cloudflare):** kiwicanopy.com adreslerine gönderilen e-postalar **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** tarafından Email Routing hizmetiyle alınır ve posta kutumuza yönlendirilir. İçerik saklanmaz; Cloudflare gönderen, alıcı, konu, zaman ve teslim durumunu kaydeder. Cloudflare ile bir veri işleme sözleşmesi (Cloudflare Customer DPA) mevcuttur.\n\n**Posta kutusu (Google):** Posta kutusu Google (Gmail) tarafından barındırılır; sağlayıcı Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland'dir. ABD'ye (Cloudflare veya Google LLC'ye) yapılan aktarımlar EU-US Data Privacy Framework'e, bunun dışında Avrupa Komisyonu'nun standart sözleşme maddelerine dayanır.\n\nHukuki dayanak, talebiniz bir sözleşmeye yönelikse GDPR md. 6(1)(b), aksi halde yanıt vermeye ilişkin meşru menfaatimizdir (GDPR md. 6(1)(f)). Veriler bu amaç için artık gerekli olmadığında ve yasal saklama yükümlülüğü bulunmadığında silinir.",
          title: 'E-posta yönlendirme ve posta kutusu',
        },
        title: '10. E-posta ile iletişim',
      },
    },
    tabLabel: 'Gizlilik',
    title: 'Gizlilik Politikası',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            'Yapay zeka işleme talepleri asenkron olarak gerçekleştirilir. Sonuçların zamanında alınmasından kullanıcı sorumludur. Güvenlik nedenleri ve kaynak optimizasyonu nedeniyle, geçici olarak önbelleğe alınan sonuçlar en geç 24 saat sonra geri alınamaz şekilde silinir. Bu geçici verilerin kalıcı olarak saklanması konusunda herhangi bir hak talebinde bulunulamaz.',
          title: 'Asenkron İşleme ve Veri Sağlama',
        },
        daily_limit: {
          content:
            'Kötüye kullanımı önlemek ve tüm kullanıcılar için kullanılabilirliği sağlamak amacıyla, Pro hesap başına yapay zeka isteği sayısı 24 saat içinde {{limit}} istekle sınırlıdır. Bu kota her gün gece yarısı (Alman saati, CET/CEST) sıfırlanır.',
          title: 'Kullanım Kotası',
        },
        purpose: {
          content:
            'KiwiCV’ın yapay zeka özellikleri yalnızca platform içindeki başvuru belgelerini oluşturmak ve iyileştirmek için kullanılabilir. Sistem dışı amaçlarla kullanımı yasaktır.',
          title: 'Kullanım Amacı',
        },
        technical_limits: {
          content:
            'Özgeçmiş optimizasyonu için istek başına maksimum jeton sayısını makul bir seviyeyle sınırlama hakkımız saklıdır. Yapay zeka yanıtlarının otomatik kullanımı veya toplu olarak çekilmesi yasaktır.',
          title: 'Teknik Kısıtlamalar',
        },
        title: '1. Adil Kullanım Politikası',
      },
      '2': {
        ai_usage: {
          content:
            'Pro Pass sahipleri, istek başına bireysel faturalandırma olmaksızın yapay zeka destekli optimizasyon özelliklerine erişim hakkı kazanır. Bu erişim, iş arama bağlamında özel kullanım için tasarlanmıştır.',
          title: 'Yapay Zeka Erişimi (Pro Pass Sahipleri)',
        },
        one_time_payment: {
          content:
            'Bir Pro Pass satın alınması, belirli bir hizmet için tamamlanmış tek seferlik bir ödemeyi temsil eder. Bu bir abonelik değildir; otomatik yenileme yoktur.',
          title: 'Tek Seferlik Ödeme',
        },
        refunds: {
          content:
            'Tüketici olarak, sözleşmenin kurulduğu andan itibaren 14 günlük yasal cayma hakkına sahipsiniz. Şartlar, süre ve prosedür, örnek cayma formunu da içeren Cayma Bildirimimizde belirtilmiştir.\n\nBu süre içinde cayma hakkınızı kullanırsanız, ödenen tutarın tamamını iade ederiz. Yasal cayma hakkı saklı kalmak kaydıyla para iadesi yapılmamaktadır. Pro Pass kullanıcı hesapları arasında devredilemez.',
          title: 'Cayma Hakkı, İadeler ve Devredilebilirlik',
        },
        stacking: {
          content:
            'Birden fazla süreli Pro Pass satın alındığında, geçerlilik süreleri birbirine eklenir ("stacking"). Yeni pass\'in süresi ancak o anki aktif sürenin sona ermesinden sonra başlar.',
          title: 'Pro Pass Birleştirme (Stacking)',
        },
        title: '2. Premium Kullanım (Pass)',
        validity_timezone: {
          content:
            "Erişim süreleri ve günlük kullanım limitleri Orta Avrupa Saati (CET/CEST) baz alınarak hesaplanır. Süreli paketler, toplam birikmiş erişim süresinin son gününde saat 23:59:59'da sona erer.",
          title: 'Saat Dilimi Politikası',
        },
      },
      '3': {
        termination: {
          content:
            'Kullanıcı hesabınızı herhangi bir neden belirtmeksizin istediğiniz zaman silebilirsiniz. Hesabın silinmesiyle birlikte sözleşme ilişkisi derhal sona erer.',
          title: 'Hesap Silme',
        },
        title: '3. Fesih ve Hesap Silme',
      },
    },
    tabLabel: 'Şartlar',
    title: 'Şartlar ve Koşullar',
  },
  translation_note:
    'Bu, size kolaylık sağlamak amacıyla orijinal Almanca versiyonun makine çevirisidir. Tutarsızlık durumunda Almanca versiyon geçerlidir.',
  update: {
    button: 'Kabul Et ve Devam Et',
    changes_desc:
      "Bölüm 2 artık işlemenin kısıtlanması ve veri taşınabilirliği haklarınızı da belirtiyor, meşru menfaatlere dayalı işlemeye itiraz etme hakkınızı ayrıca açıklıyor ve bir rızayı istediğiniz zaman geri çekebileceğinizi belirtiyor. Bölüm 3 artık KiwiCV'nin sunucu işlevlerinin ABD'de Netlify üzerinde çalıştığını ve yapay zeka isteklerinin içerikleriyle birlikte Google'ın AB sunucularına giderken bu işlevlerden geçtiğini açıklıyor; ayrıca tarayıcınızın blogu ve ana sayfadaki kullanıcı görüşlerini yüklediği Sanity'yi adlandırıyor. Bölüm 4 artık Google Drive ve GitHub senkronizasyonuna verdiğiniz rızayı bağlantıyı kesme düğmeleriyle nasıl geri çekeceğinizi, GitHub belirtecinin cihazda kaldığını ve ne zaman kaldırıldığını açıklıyor, tarayıcınızın sakladığı oturum bilgilerini adlandırıyor ve ön yazılar için yazı örneğinin oturumu kapattığınızda veya başka bir hesap oturum açtığında ve hesabınızı sildiğiniz cihazda da kaldırıldığını belirtiyor. Bölüm 5 artık sona eren ücretsiz deneme süresinden bahsetmiyor; Bölüm 8 ondan yalnızca sunulduğu dönemde yapılan istekler için bahsediyor. Bölüm 6 artık ödeme sağlayıcısı olarak Stripe Payments Europe'u, ödemelerin hukuki dayanağını ve Stripe'ın ABD'deki işlemesine ilişkin güvenceleri adlandırıyor. Bölüm 7 artık ödeme kayıtlarınızı hesabınızla birlikte silinen veriler arasında sayıyor. Bölüm 8 artık yapay zeka kullanım kaydının kaydettiği her şeyi, amacını, hukuki dayanağını ve saklama süresini listeliyor ve yüklenen belgelerin ve yapay zeka sonuçlarının genellikle en fazla birkaç dakika geçici olarak saklandığını belirtiyor.",
    changes_title: 'Ne değişti?',
    checkbox: 'Güncellenmiş Hizmet Koşullarını ve Gizlilik Politikasını kabul ediyorum.',
    intro:
      "KiwiCV Gizlilik Politikası güncellendi: artık itiraz hakkınızı ve bir rızayı nasıl geri çekebileceğinizi de belirtiyor, isteklerin ABD'deki sunucu işlevlerinden geçtiğini açıklıyor, blog ve ana sayfadaki kullanıcı görüşleri için Sanity'yi adlandırıyor ve yapay zeka kullanım kaydının neleri kaydettiğini eksiksiz listeliyor.",
    link_privacy: 'Gizlilik Politikası',
    link_terms: 'Hizmet Koşulları',
    links_desc: 'Belgelerin tamamını buradan okuyabilirsiniz:',
    success: 'Güncellenen koşulları kabul ettiğiniz için teşekkür ederiz!',
    title: 'Koşullar ve Gizlilik Güncellemesi',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            'Herhangi bir gerekçe göstermeksizin 14 gün içinde bu sözleşmeden cayma hakkına sahipsiniz. Cayma süresi, sözleşmenin kurulduğu günden itibaren 14 gündür.\n\nCayma hakkınızı kullanmak için bizi:\n\n{{name}}\n{{address}}\n{{email}}\n\nbu sözleşmeden cayma kararınıza ilişkin açık bir beyanla (örneğin posta yoluyla gönderilen bir mektup veya e-posta) bilgilendirmeniz gerekmektedir. Aşağıdaki örnek cayma formunu kullanabilirsiniz, ancak bu zorunlu değildir.\n\nCayma süresine uymak için, cayma hakkının kullanımına ilişkin bildirimi cayma süresi dolmadan önce göndermeniz yeterlidir.',
          title: 'Cayma hakkınız',
        },
        title: '1. Cayma Hakkı',
      },
      '2': {
        email_note: {
          content:
            'Siparişinizi bulmamıza yardımcı olmak için lütfen satın alma işleminde kullandığınız e-posta adresini de belirtiniz. Bu, cayma hakkınızın geçerli olması için zorunlu değildir.',
          title: 'Siparişinizin belirlenmesi',
        },
        form: {
          content:
            '_Kime: {{name}}, {{address}}, {{email}}:_\n\nBen/Biz (*) işbu formla aşağıdaki hizmetin sunulmasına ilişkin sözleşmeden caydığımı/caydığımızı (*) bildiririm/bildiririz (*):\n\n— Sipariş tarihi (*) / teslim tarihi (*):\n\n— Tüketicinin/Tüketicilerin adı soyadı:\n\n— Tüketicinin/Tüketicilerin adresi:\n\n— Tüketicinin/Tüketicilerin imzası (yalnızca bu form kâğıt üzerinde sunuluyorsa):\n\n— Tarih:\n\n_(*) Uygun olmayanın üstünü çizin._',
          title: 'Yalnızca sözleşmeden caymak istiyorsanız bu formu doldurup geri gönderin',
        },
        title: '2. Örnek Cayma Formu',
      },
      '3': {
        refund: {
          content:
            'Bu sözleşmeden caymanız halinde, sizden tahsil edilen tüm ödemeleri, haksız bir gecikme olmaksızın ve her durumda bu sözleşmeden cayma kararınızın bize bildirildiği tarihten itibaren en geç 14 gün içinde tarafınıza iade edeceğiz.\n\nBu geri ödeme, tarafınızca aksi açıkça kararlaştırılmadıkça, ilk işlemde kullandığınız ödeme aracı kullanılarak gerçekleştirilir; hiçbir durumda bu geri ödeme nedeniyle herhangi bir ücret ödemek zorunda kalmazsınız.',
          title: 'Geri Ödeme',
        },
        title: '3. Caymanın Sonuçları',
      },
    },
    tabLabel: 'Cayma Hakkı',
    title: 'Cayma Bildirimi',
  },
};
