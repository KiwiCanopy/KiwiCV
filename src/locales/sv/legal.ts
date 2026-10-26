import type { Translations } from '@/locales/en';

export const legal: Translations['legal'] = {
  contact: {
    button: 'Skicka ett e-postmeddelande',
    message:
      'Feedback är bränslet för KiwiCV. Oavsett om du har hittat en bugg, har en briljant idé för en funktion eller bara vill säga hej – KiwiCV lyssnar gärna.',
    prompt: 'Svar kommer vanligtvis inom 24 timmar.',
    support_label: 'Officiell kontaktadress',
    title: 'Låt oss bygga framtidens meritförteckningar tillsammans!',
  },
  licenses: {
    description:
      'Följande programvara med öppen källkod används i KiwiCV. KiwiCV tackar utvecklarna och communityn för deras värdefulla bidrag.',
    tabLabel: 'Licenser',
    title: 'Licenser för öppen källkod',
  },
  nav_label: 'Integritet och villkor',
  notice: {
    sections: {
      details: {
        content:
          '**{{name}}**\n**{{title}}**\n{{address}}\n\n**Kontakt:**\nE-Mail: {{email}}\n\n*Som småföretagare i den mening som avses i § 19 st. 1 UStG debiteras ingen mervärdesskatt.*',
        title: 'Information enligt § 5 DDG:',
      },
      dispute: {
        content:
          '**Tvistlösning för konsumenter:**\nKiwiCV är varken villigt eller skyldigt att delta i tvistlösningsförfaranden inför en konsumentnämnd eller allmän reklamationsnämnd.',
        title: 'Tvistlösning:',
      },
    },
    title: 'Rättslig information',
  },
  privacy: {
    sections: {
      '1': {
        general: {
          content:
            'Följande information ger en enkel översikt över vad som händer med dina personuppgifter när du besöker denna webbplats. Personuppgifter är alla uppgifter som kan användas för att identifiera dig personligen. KiwiCV säljer eller delar inte dina personuppgifter.',
          title: 'Allmän information',
        },
        how: {
          content:
            'Din data samlas dels in genom att du själv tillhandahåller den (t.ex. genom att fylla i CV-data i applikationen). Dessa uppgifter behandlas dock främst lokalt i din webbläsare. Annan data samlas in automatiskt av KiwiCV IT-system när du besöker webbplatsen. Detta består främst av teknisk data (t.ex. webbläsare, operativsystem eller tidpunkt för sidvisningen).',
          title: 'Hur samlas din data in?',
        },
        responsible: {
          content:
            'Databehandlingen på denna webbplats utförs av webbplatsens operatör. Kontaktuppgifter hittar du i avsnittet "Information om ansvarig instans" i denna integritetspolicy.',
          title: 'Vem är ansvarig för datainsamlingen på denna webbplats?',
        },
        title: '1. Dataskydd i korthet',
      },
      '2': {
        responsible: {
          content:
            'Ansvarig för databehandling på denna webbplats är:\n\n{{name}}\n{{title}}\n{{address}}\nE-Mail: {{email}}',
          title: 'Information om ansvarig instans',
        },
        rights: {
          content:
            'Inom ramen för gällande lagstiftning har du när som helst rätt till kostnadsfri information om dina lagrade personuppgifter, deras ursprung och mottagare samt syftet med databehandlingen (Art. 15 GDPR) och, i förekommande fall, rätt till rättelse (Art. 16 GDPR) eller radering (Art. 17 GDPR) av denna data, till begränsning av behandlingen (Art. 18 GDPR) samt att få ut de uppgifter du har lämnat i ett strukturerat, allmänt använt och maskinläsbart format eller få dem överförda till en annan personuppgiftsansvarig (rätt till dataportabilitet, Art. 20 GDPR). För detta ändamål, samt för ytterligare frågor om personuppgifter, kan du kontakta mig när som helst.\n\n**Rätt att invända (Art. 21 GDPR):** När jag behandlar dina personuppgifter på grundval av berättigade intressen (Art. 6 st. 1 lit. f GDPR) har du rätt att när som helst invända mot denna behandling av skäl som hänför sig till din specifika situation. Detta gäller all behandling för vilken denna integritetspolicy anger Art. 6 st. 1 lit. f GDPR som rättslig grund. Jag behandlar då inte längre uppgifterna i fråga, såvida jag inte kan visa tvingande berättigade skäl för behandlingen som väger tyngre än dina intressen, rättigheter och friheter, eller behandlingen sker för att fastställa, göra gällande eller försvara rättsliga anspråk.\n\nOm en behandling grundar sig på ditt samtycke (Art. 6 st. 1 lit. a GDPR) kan du när som helst återkalla det med verkan för framtiden (Art. 7 st. 3 GDPR); återkallelsen påverkar inte lagligheten av den behandling som skett på grundval av samtycket innan det återkallades.\n\nDu har även rätt att klaga hos den behöriga tillsynsmyndigheten.',
          title: 'Dina rättigheter',
        },
        title: '2. Allmänna anteckningar och obligatorisk information',
      },
      '3': {
        netlify: {
          content:
            'Denna webbplats hostas av en extern tjänsteleverantör (host). KiwiCV använder leverantören **Netlify, Inc., 512 2nd Street, Suite 200, San Francisco, CA 94107** för hosting.\n\nAnvändningen av Netlify sker i syfte att tillhandahålla ett säkert, snabbt och effektivt onlineerbjudande genom en professionell leverantör (Art. 6 st. 1 lit. f GDPR). Netlify använder ett världsomspännande Content Delivery Network (CDN), genom vilket data (som din IP-adress) kan dirigeras via servrar över hela världen för att minimera laddningstider. De resulterande serverloggfilerna (åtkomstdata) lagras vanligtvis av Netlify i 90 dagar (och upp till 1 år offline) av säkerhetsskäl och raderas därefter.\n\nNetlify driver också KiwiCV:s serverfunktioner, som finns i USA. Varje förfrågan till AI-funktionerna i avsnitt 8 passerar genom dem på väg till Google, tillsammans med sitt innehåll (till exempel texten i ditt CV, en jobbannons eller en uppladdad CV-fil). Detsamma gäller synkroniseringen med Google Drive (avsnitt 4), betalningar (avsnitt 6) och raderingen av ditt konto (avsnitt 7). För AI-funktionerna och synkroniseringen med Google Drive gäller den rättsliga grund som anges i respektive avsnitt; betalningar behandlas för att fullgöra avtalet med dig (Art. 6 st. 1 lit. b GDPR), och ditt konto raderas för att uppfylla den rättsliga förpliktelsen att radera dina uppgifter (Art. 6 st. 1 lit. c GDPR jämförd med Art. 17 GDPR).\n\nDataöverföringen till USA baseras på EU-kommissionens standardavtalsklausuler samt på EU-US Data Privacy Framework (DPF), som Netlify är certifierat under.\n\n**Personuppgiftsbiträde:** Jag har ingått ett personuppgiftsbiträdesavtal (AVV) för användning av ovannämnda tjänst, vilket säkerställer att Netlify behandlar personuppgifter från besökare på KiwiCV endast enligt mina instruktioner och i enlighet med GDPR.',
          title: 'Extern hosting (Netlify)',
        },
        sanity: {
          content:
            'Artiklarna i KiwiCV:s blogg och deras bilder samt omdömena på startsidan och deras foton hanteras med innehållsplattformen Sanity (Sanity AS, Trondheimsveien 2K, 0560 Oslo, Norge, och Sanity US Inc., 351 California Street, Suite 650, San Francisco, CA 94104, USA). När du öppnar bloggen eller en artikel, eller scrollar mot ett omdöme på startsidan, laddar din webbläsare innehållet direkt från Sanitys servrar (sanity.io). Sanity tar då emot din IP-adress och de tekniska uppgifter som varje förfrågan innehåller (till exempel din webbläsartyp och tidpunkten för förfrågan).\n\nAnvändningen av Sanity grundar sig på vårt berättigade intresse av att tillhandahålla bloggen och webbplatsens innehåll effektivt (Art. 6 st. 1 lit. f GDPR). Data kan då överföras till USA; Sanitys personuppgiftsbiträdesavtal grundar sådana överföringar på EU-kommissionens standardavtalsklausuler.',
          title: 'Blogg- och webbplatsinnehåll (Sanity)',
        },
        title: '3. Hosting och Content Delivery Networks (CDN)',
      },
      '4': {
        drive: {
          content:
            'KiwiCV erbjuder en valfri synkronisering av dina CV-uppgifter med din personliga Google Drive. Om du aktiverar denna funktion överförs dina CV-filer till ditt Google Drive-konto (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) och lagras där i en mapp som skapats av KiwiCV.\n\nOm du anger länken till annonsen när du exporterar sparas den med den versionen: i säkerhetskopieringsfilen och i filegenskaper som bara KiwiCV kan läsa och som Google Drive inte visar, så att "Mina CV:n" kan visa den bredvid versionen. Den finns kvar där tills du raderar den versionen från din Google Drive; att koppla från Google Drive tar inte bort den. Den skickas inte till AI-funktionerna.\n\nTekniskt sett dirigeras denna synkronisering via våra serverfunktioner: ditt CV-innehåll, länken till annonsen och den åtkomstbehörighet som krävs för överföringen (refresh token) behandlas där tillfälligt under begärans varaktighet och lagras inte permanent på våra servrar; länken till annonsen passerar dem också när "Mina CV:n" listar dina sparade versioner. Refresh token lagras i övrigt endast lokalt i din webbläsare. KiwiCV får endast åtkomst till filer som appen själv har skapat (Googles avgränsning "drive.file") och aldrig till resten av din Drive.\n\nDataöverföringen sker uteslutande på grundval av ditt aktiva samtycke (Art. 6 punkt 1 lit. a i GDPR) genom att du frivilligt kopplar ditt Google-konto. Du kan när som helst återkalla det med "Koppla från Google Drive" under "Synk & Lagring" i inställningarna och "Koppla från och ta bort åtkomst", vilket också återkallar den behörighet som beviljats KiwiCV hos Google. Du kan också ta bort KiwiCV under åtkomst för tredje part i ditt Google-konto (myaccount.google.com/connections). Observera att Google som ett amerikanskt företag överför data till USA; denna överföring baseras på ramverket för dataskydd mellan EU och USA (DPF), under vilket Google är certifierat, samt på Europeiska kommissionens standardavtalsklausuler.',
          title: 'Google Drive-synkronisering (Valfritt)',
        },
        github: {
          content:
            'Denna applikation erbjuder möjligheten att interagera direkt med ditt GitHub-konto (t.ex. för att spara eller synkronisera dina CV-data) via en GitHub Personal Access Token (PAT) som du frivilligt tillhandahåller.\n\nOm du använder denna funktion upprättar din webbläsare en direktanslutning till GitHubs servrar (GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA). I processen överförs din IP-adress samt de data du angett i applikationen direkt till GitHub och behandlas där.\n\nVad som når GitHub beror på vilket arkiv du väljer. Ett privat arkiv som inte publiceras med GitHub Pages får alla dina CV-data, inklusive poster du har dolt, ditt personliga brev, data som KiwiCV behåller från en importerad fil och länken till annonsen om du anger en när du exporterar. Ett arkiv som vem som helst kan läsa (ett offentligt eller ett som publiceras med GitHub Pages) får ditt CV utan de poster och avsnitt du har dolt, utan ditt personliga brev, utan data som behållits från importerade filer och utan länken till annonsen. Det innehåller däremot dina designinställningar, din profilbild om du inte döljer den, namn och kontaktuppgifter för referenser du har angett samt de fil- och mappnamn du väljer vid export, som också syns i commit-meddelanden och kan nämna företaget och tjänsten du söker. Om du senare gör ett arkiv offentligt eller publicerar det med GitHub Pages kan det som redan finns i det, inklusive historiken, också bli offentligt.\n\nDin GitHub PAT skickas aldrig till KiwiCV:s servrar. Den lagras endast i din webbläsare på den här enheten och används endast för att auktorisera de förfrågningar som din webbläsare skickar till GitHub å dina vägnar: under den aktuella webbläsarsessionen eller, om du väljer "Spara token permanent i denna webbläsare", tills du tar bort den. Eftersom token tillhör den här enheten och inte ditt KiwiCV-konto finns den kvar när du loggar ut, om du inte väljer "Ta bort GitHub och logga ut"; när du raderar ditt konto tas den bort om du låter "Ta även bort GitHub-anslutningen från denna enhet" vara ikryssad.\n\nDataöverföringen till GitHub sker uteslutande baserat på ditt aktiva samtycke (Art. 6 st. 1 lit. a GDPR) genom att du frivilligt använder funktionen och anger din token. Du kan när som helst återkalla detta samtycke med "Koppla från GitHub" under "Synk & Lagring" i inställningarna och "Koppla från och ta bort token", vilket tar bort din token och dina arkivinställningar från den här enheten och inte skickar något till GitHub. Data som redan finns i ditt arkiv ligger kvar där tills du raderar dem på GitHub. Observera att GitHub som ett amerikanskt företag överför data till USA. Mer information om dataskydd hos GitHub hittar du här:',
          link: {
            text: 'GitHubs integritetspolicy',
            url: 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement',
          },
          title: 'Interaktion med GitHub via Personal Access Token (PAT)',
        },
        storage: {
          content:
            'För att tillhandahålla och driva CV-byggaren använder KiwiCV så kallad web-storage-teknik (Local Storage). I denna process cachas dina inmatningar (såsom textdata för CV:t eller lokalt behandlade profilbilder i Base64-format) lokalt i webbläsaren på din enhet. Detta förhindrar att dina uppgifter går förlorade om sidan av misstag läses om.\n\nOm du importerar en CV-fil som innehåller avsnitt på översta nivån som KiwiCV inte använder (till exempel sådana som skrivits av en annan applikation) behåller KiwiCV dem tillsammans med ditt CV, upp till en storleksgräns, så att export av filen returnerar dem oförändrade. De lagras, exporteras och säkerhetskopieras tillsammans med ditt CV (till Google Drive eller ett privat GitHub-arkiv som inte publiceras med GitHub Pages) och finns i vyn Rå-JSON, men visas aldrig i ditt CV eller i redigeraren och skickas aldrig till AI-funktionerna.\n\nOm du använder ”Matcha min skrivstil” för ett personligt brev sparas även textprovet du anger (upp till 5 000 tecken) i Local Storage, separat från ditt CV, så att det är redo för ditt nästa brev. Det överförs till AI-funktionerna i avsnitt 8 varje gång ett personligt brev skrivs i din stil; det ingår inte i dina säkerhetskopior på Google Drive eller GitHub. Det finns kvar på din enhet tills du rensar det i dialogen för personligt brev, loggar ut, loggar in med ett annat konto eller rensar webbläsarens lagring; att radera ditt konto tar också bort det från den enhet där du raderar kontot, eftersom du då loggas ut.\n\nOm du använder ett GitHub-arkiv sparar din webbläsare också länkarna till annonserna som sparats med versionerna i det i Local Storage på den här enheten, så att "Mina CV:n" inte behöver ladda ned varje säkerhetskopia igen för att visa dem. De tas bort tillsammans med din GitHub-anslutning: när du kopplar från GitHub, när du väljer "Ta bort GitHub och logga ut" eller när du raderar ditt konto med "Ta även bort GitHub-anslutningen från denna enhet" ikryssat.\n\nDessa uppgifter behandlas lokalt på din enhet och överförs inte till någon server såvida du inte aktivt använder en av de valfria funktionerna som beskrivs i denna policy (till exempel Google Drive-säkerhetskopieringen i detta avsnitt eller AI-funktionerna i avsnitt 8). Jag har inte tillgång till dessa lokalt lagrade uppgifter vid någon tidpunkt.\n\nOm du loggar in lagrar din webbläsare också din inloggningssession, som följer med dina förfrågningar till våra servrar (se avsnitt 5), en kopia av din profil och ditt konto-ID, som anger vilket konto lokalt lagrade inloggningsuppgifter och textprovet hör till. Lagringen är strängt nödvändig för den inloggning du har begärt (§ 25 st. 2 nr 2 TDDDG); alla tre tas bort när du loggar ut.\n\nLagringen av dessa uppgifter är tekniskt strängt nödvändig för applikationens kärnfunktion. Den rättsliga grunden för att lagra och läsa av uppgifterna på din enhet är § 25 st. 2 nr 2 TDDDG. Den efterföljande behandlingen baseras på mitt berättigade intresse av ett användarvänligt tillhandahållande av tjänsten enligt Art. 6 st. 1 lit. f GDPR. Om inget annat anges ovan stannar uppgifterna kvar på din enhet tills du manuellt rensar webbläsarens lagring (cache/Local Storage).',
          title: 'Användning av webblagring (Local Storage)',
        },
        title: '4. Datainsamling i vår applikation',
      },
      '5': {
        account: {
          content:
            'När du skapar ett användarkonto (via Google OAuth) lagrar vi din e-postadress, ditt namn och din Google-profilbild för att hantera din åtkomst och dina personaliserade uppgifter. Observera att premiumfunktioner endast är tillgängliga för registrerade användare. Vi lagrar även information om ditt aktiva Pro Pass samt metadata om dina AI-förfrågningar, som avsnitt 8 beskriver. Vi lagrar inte permanent några indata (prompter) eller utdata (resultat) från AI-optimeringen på våra servrar; den tillfälliga cachningen under bearbetningen beskrivs i avsnitt 8.\n\n**Databasleverantör:** Dessa kontouppgifter lagras hos vårt personuppgiftsbiträde **Supabase, Inc.** i ett projekt som värdhanteras i Europeiska unionen. Ett personuppgiftsbiträdesavtal i enlighet med Art. 28 i GDPR finns upprättat med Supabase.',
          title: 'Konto- och profilinformation',
        },
        title: '5. Konto- och användardata',
      },
      '6': {
        stripe: {
          content:
            'KiwiCV använder Stripe Payments Europe, Limited (Irland) för att behandla betalningar. Under betalningsprocessen samlar Stripe in din betalningsinformation direkt. KiwiCV lagrar inte känsliga betalningsuppgifter (som kreditkortsnummer) på egna servrar; KiwiCV tar endast emot statusinformation om transaktionen från Stripe. Den rättsliga grunden är fullgörandet av ditt köp (Art. 6 punkt 1 lit. b i GDPR) och, för de fakturauppgifter som måste bevaras, en rättslig förpliktelse (Art. 6 punkt 1 lit. c i GDPR, se avsnitt 7). Stripe behandlar även data i USA (Stripe, LLC); denna överföring baseras på ramverket för dataskydd mellan EU och USA (DPF), under vilket Stripe är certifierat, samt på Europeiska kommissionens standardavtalsklausuler.',
          title: 'Transaktionshantering via Stripe',
        },
        title: '6. Betalningsbehandling',
      },
      '7': {
        deletion_scope: {
          content:
            'När du raderar ditt användarkonto kommer din profil och alla länkade metadata (t.ex. status för ditt Pro Pass, betalningsposter och användningsloggar) omedelbart och permanent att raderas från vår databas som drivs av Supabase (se avsnitt 5). Observera att CV-data lagras i din webbläsares lokala lagring och, om du använder Google Drive-säkerhetskopieringen eller GitHub-synkroniseringen, på ditt personliga Google Drive eller i ditt GitHub-arkiv; inget av dessa påverkas av radering av kontot på serversidan. En GitHub-token som lagras på den här enheten tas också bort om du låter "Ta även bort GitHub-anslutningen från denna enhet" vara ikryssad (se avsnitt 4).',
          title: 'Omfattning av radering',
        },
        retention_legal: {
          content:
            'Observera att KiwiCV enligt lag är skyldigt att spara transaktionsrelaterade fakturadata (specifikt uppgifter om köp gjorda via Stripe) i 10 år. Detta görs baserat på skatte- och handelsrättsliga krav (t.ex. i Tyskland enligt AO och HGB). Den lagliga grunden för detta är Art. 6 st. 1 lit. c GDPR.',
          title: 'Lagliga lagringsskyldigheter',
        },
        stripe_retention: {
          content:
            'Dessa specifika uppgifter förblir lagrade hos betaltjänstleverantören, Stripe, under den lagstadgade tiden för att säkerställa korrekt dokumentation för skattemyndigheter.',
          title: 'Lagring via Stripe',
        },
        title: '7. Radering & lagring av data',
      },
      '8': {
        logging_metrics: {
          content:
            'För varje slutförd AI-förfrågan loggar KiwiCV metadata kopplade till ditt konto i vår databas som drivs av Supabase (se avsnitt 5). Loggen innehåller aldrig innehållet i dina prompter eller i resultaten; hur dessa hålls kortvarigt medan en förfrågan körs beskrivs nedan under "Tillfällig lagring". Följande lagras:\n\n**Typ av förfrågan:** vilken sorts förfrågan det var (t.ex. "CV-optimering", "Personligt brev", "AI CV-tolkning"), det AI-läge du valde och vad den gällde (hela CV:t eller en typ av avsnitt, t.ex. "Arbetslivserfarenhet"), aldrig själva texten.\n\n**Användningsdata:** tidpunkten för förfrågan, antalet använda tokens och om ett Pro Pass täckte den; för förfrågningar från den tid då KiwiCV fortfarande erbjöd en gratis provperiod, om provperioden täckte den.\n\n**Tekniska data:** hur lång tid förfrågan tog, AI-modellen, serverregionen, versionen av våra instruktioner till AI:n, hur förfrågan avslutades, om resultatet ändrade något och om det var en testkörning.\n\n**Säkerhetsklassificering:** för CV-optimeringar och personliga brev de poäng som Googles automatiska säkerhetssystem tilldelar AI-svaret, där Google tillhandahåller dem, till exempel hur sannolikt det är att det innehåller trakasserier eller farligt innehåll. De härleds från texten men innehåller ingenting av den.\n\nVi använder dessa data för att räkna dina förfrågningar mot din dagliga kvot, för att upprätthålla vår policy för skälig användning (undvikande av missbruk och automatiserad användning) och för feldiagnostik. För att förbättra AI-funktionerna utvärderar vi dem endast i aggregerad form och använder dem aldrig för att skapa en profil av dig. Räkningen av dina förfrågningar är nödvändig för att tillhandahålla tjänsten (Art. 6 st. 1 lit. b GDPR); övriga ändamål grundar sig på vårt berättigade intresse av att förhindra missbruk, rätta fel och förbättra AI-funktionerna (Art. 6 st. 1 lit. f GDPR). Data sparas så länge ditt konto finns och raderas tillsammans med det (se avsnitt 7).',
          title: 'Loggning och användningsstatistik',
        },
        privacy_training: {
          content:
            'Skyddet av din data är högsta prioritet för KiwiCV. Vid användning av Google Cloud API (Vertex AI) gäller följande säkerhetsgarantier:\n\n**Ingen modellträning:** Google använder uttryckligen inte din inmatade data (prompter) för att träna sina globala AI-modeller. Din data förblir i vår isolerade Google Cloud-miljö.\n\n**Dataplats:** Google behandlar dina förfrågningar på servrar inom Europeiska unionen (Google Cloud EU-multiregion "eu", begränsad till EU-medlemsstater) för att säkerställa en adekvat dataskyddsnivå i enlighet med GDPR. Innan de når Google passerar de genom våra serverfunktioner i USA (se avsnitt 3).\n\n**Ingen permanent lagring hos leverantören:** Google behandlar data för att hantera begäran och lagrar den inte permanent. Google kan cachelagra indata och resultat i upp till 24 timmar. Om Googles automatiska säkerhetssystem flaggar en begäran kan Google behålla prompten i upp till 30 dagar för att granska den med avseende på missbruk; den används inte för att träna modeller.',
          title: 'Dataskydd och undantag från träning',
        },
        processing_scope: {
          content:
            'För att ge dig funktioner för intelligent optimering och skapande av CV:n och personliga brev använder vi plattformen Vertex AI från Google Cloud. I denna process överförs och behandlas de texter du anger på Googles servrar; på vägen dit passerar de genom våra serverfunktioner hos Netlify i USA (se avsnitt 3). AI-funktionerna körs endast när du aktivt utlöser dem; den rättsliga grunden för denna behandling är Art. 6 punkt 1 lit. b i GDPR (tillhandahållande av den funktion du begärt).',
          title: 'Typ och omfattning av behandling',
        },
        temporary_storage: {
          content:
            'För att säkerställa en stabil bearbetning av AI-förfrågningar använder KiwiCV asynkrona bakgrundsprocesser. De uppladdade indatadokumenten (t.ex. CV-filer) samt resultaten som genereras av AI:n lagras tillfälligt i vår databas som drivs av Supabase (se avsnitt 5) under en kort period (vanligtvis inte mer än några minuter och aldrig mer än 24 timmar) tills din webbläsare hämtar dem. Efter denna period, eller när de har hämtats, raderas dessa tillfälliga resultat och uppladdade indata automatiskt och fullständigt. KiwiCV använder dessa tillfälliga indata och resultat endast för att leverera det resultat du har begärt och aldrig för profilering eller för att träna AI-modeller.',
          title: 'Tillfällig lagring',
        },
        title: '8. Användning av AI-tjänster (Google Cloud Vertex AI)',
      },
      '9': {
        posthog: {
          content:
            'För att bättre förstå hur användare interagerar med KiwiCV och för att förbättra tjänsterna, använder KiwiCV analysverktyget PostHog (PostHog, Inc., 2261 Market Street #4008, San Francisco, CA 94114, USA). För att skydda din integritet har KiwiCV konfigurerat PostHog på ett strikt anonymt och kakfritt sätt.\n\n**Anonym spårning:** KiwiCV använder inga spårningskakor och lagrar ingen personlig identifiering i din webbläsare. PostHog är konfigurerat för att endast använda minnesbaserad lagring, vilket innebär att all sessionsdata går förlorad så snart du stänger eller laddar om sidan.\n\n**Dataplats (EU):** All data skickas till och lagras på PostHogs europeiska servrar (Region: Frankfurt, Tyskland - https://eu.i.posthog.com) för att säkerställa efterlevnad av europeiska dataskyddsstandarder.\n\n**Sessionsigenkänning:** För anonym sessionsigenkänning genereras ett kortvarigt hashvärde på serversidan, som automatiskt raderas efter 24 timmar. Detta gör att vi kan se interaktionsmönster (t.ex. vilka teman som är populära eller hur många CV:n som exporteras) utan att kunna identifiera dig som individ.\n\nAnvändningen av PostHog baseras på ett berättigat intresse av en efterfrågestyrd design och ständig optimering av webbplatsen (Art. 6 st. 1 lit. f GDPR).',
          title: 'Anonym webbanalys (PostHog)',
        },
        title: '9. Webbanalys',
      },
      '10': {
        email: {
          content:
            'Om du kontaktar oss via e-post (till exempel på {{email}} eller en annan adress som anges på webbplatsen) sparar vi dina uppgifter, inklusive kontaktuppgifter, för att hantera ärendet och eventuella följdfrågor.\n\n**Vidarebefordran av e-post (Cloudflare):** E-post till adresser på kiwicanopy.com tas emot av **Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA** med tjänsten Email Routing och vidarebefordras till vår brevlåda. Innehållet lagras inte; Cloudflare loggar avsändare, mottagare, ämne, tidpunkt och leveransstatus. Ett personuppgiftsbiträdesavtal har ingåtts med Cloudflare (Cloudflare Customer DPA).\n\n**Brevlåda (Google):** Brevlådan tillhandahålls av Google (Gmail); leverantör är Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Ireland. Eventuell överföring till USA (till Cloudflare eller Google LLC) grundar sig på EU-US Data Privacy Framework och i andra hand på EU-kommissionens standardavtalsklausuler.\n\nRättslig grund är art. 6.1 b GDPR om ärendet avser ett avtal, annars vårt berättigade intresse av att besvara det (art. 6.1 f GDPR). Uppgifterna raderas när de inte längre behövs för detta ändamål och ingen lagstadgad lagringsskyldighet föreligger.',
          title: 'Vidarebefordran av e-post och brevlåda',
        },
        title: '10. Kontakt via e-post',
      },
    },
    tabLabel: 'Integritet',
    title: 'Integritetspolicy',
  },
  terms: {
    sections: {
      '1': {
        async_processing: {
          content:
            'AI-bearbetningsbegäranden utförs asynkront. Användaren ansvarar för att hämta resultaten i god tid. Av säkerhetsskäl och för resursoptimering raderas tillfälligt cachade resultat oåterkalleligt senast efter 24 timmar. Det finns ingen rätt till permanent lagring av dessa tillfälliga data.',
          title: 'Asynkron behandling & datatillhandahållande',
        },
        daily_limit: {
          content:
            'För att förhindra missbruk och säkerställa tillgänglighet för alla användare är antalet AI-förfrågningar per Pro-konto begränsat till {{limit}} förfrågningar per 24 timmar. Denna kvot återställs dagligen vid midnatt (tysk tid, CET/CEST).',
          title: 'Användningskvot',
        },
        purpose: {
          content:
            'AI-funktionerna i KiwiCV får endast användas för att skapa och förbättra ansökningshandlingar inom plattformen. Användning för syften utanför systemet är inte tillåten.',
          title: 'Avsedd användning',
        },
        technical_limits: {
          content:
            'KiwiCV förbehåller sig rätten att begränsa det maximala antalet tokens per förfrågan till en rimlig nivå för CV-optimering. Automatiserad användning eller masskräpning av AI-svar är förbjuden.',
          title: 'Tekniska begränsningar',
        },
        title: '1. Policy för skälig användning',
      },
      '2': {
        ai_usage: {
          content:
            'Innehavare av ett Pro Pass får tillgång till AI-driven optimering utan individuell debitering per förfrågan. Denna åtkomst är avsedd för privat bruk i samband med jobbsökande.',
          title: 'AI-åtkomst (för Pro Pass-innehavare)',
        },
        one_time_payment: {
          content:
            'Köp av ett Pro Pass utgör en slutförd engångsbetalning för en specifik tjänst. Detta är inte en prenumeration; det sker ingen automatisk förnyelse.',
          title: 'Engångsbetalning',
        },
        refunds: {
          content:
            'Som konsument har du en lagstadgad ångerrätt på 14 dagar från den dag då avtalet ingicks. Villkoren, tidsfristen och förfarandet anges i vår ångerrättsinstruktion, som även innehåller standardformuläret för utövande av ångerrätten.\n\nOm du ångrar dig inom denna frist återbetalar vi hela det erlagda beloppet. Utöver den lagstadgade ångerrätten erbjuder vi inga återbetalningar. Ett Pro Pass kan inte överlåtas mellan användarkonton.',
          title: 'Ångerrätt, återbetalningar & överlåtbarhet',
        },
        stacking: {
          content:
            'Vid köp av flera tidsbegränsade Pro Pass läggs giltighetstiderna samman ("stapling"). Perioden för det nya passet börjar först efter att den nuvarande aktiva perioden har löpt ut.',
          title: 'Stapling av Pro Pass',
        },
        title: '2. Premiumanvändning (Pass)',
        validity_timezone: {
          content:
            'Åtkomstperioder och dagliga användningsgränser beräknas baserat på centraleuropeisk tid (CET/CEST). Tidsbaserade pass löper ut kl. 23:59:59 den sista dagen av den totala samlade åtkomstperioden.',
          title: 'Tidszonspolicy',
        },
      },
      '3': {
        termination: {
          content:
            'Du kan radera ditt användarkonto när som helst utan att ange något skäl. Vid radering av kontot upphör avtalsförhållandet med omedelbar verkan.',
          title: 'Radera konto',
        },
        title: '3. Uppsägning & radering av konto',
      },
    },
    tabLabel: 'Villkor',
    title: 'Användarvillkor',
  },
  translation_note:
    'Detta är en maskinöversättning av den tyska originalversionen för din bekvämlighet. Vid avvikelser gäller den tyska versionen.',
  update: {
    button: 'Godkänn & Fortsätt',
    changes_desc:
      'Avsnitt 4 förklarar nu att länken till annonsen som du lägger till vid export sparas med den versionen i din Google Drive eller i ett privat GitHub-arkiv som inte publiceras med GitHub Pages, aldrig i ett arkiv som vem som helst kan läsa, att den passerar våra serverfunktioner för Google Drive och att din webbläsare behåller länkarna till annonserna för dina GitHub-versioner på den här enheten tills du tar bort GitHub-anslutningen.',
    changes_title: 'Vad har ändrats?',
    checkbox: 'Jag godkänner de uppdaterade användarvillkoren och integritetspolicyn.',
    intro:
      'KiwiCV:s integritetspolicy har uppdaterats: den förklarar nu var länken till annonsen som du kan lägga till vid export sparas.',
    link_privacy: 'Integritetspolicy',
    link_terms: 'Användarvillkor',
    links_desc: 'Du kan läsa de fullständiga dokumenten här:',
    success: 'Tack för att du godkänner de uppdaterade villkoren!',
    title: 'Uppdatering av villkor och integritet',
  },
  withdrawal: {
    sections: {
      '1': {
        right: {
          content:
            'Du har rätt att frånträda detta avtal utan att ange något skäl inom 14 dagar. Ångerfristen löper ut 14 dagar efter den dag då avtalet ingicks.\n\nVill du utöva ångerrätten ska du till oss:\n\n{{name}}\n{{address}}\n{{email}}\n\nskicka ett klart och tydligt meddelande om ditt beslut att frånträda avtalet (t.ex. ett brev avsänt per post eller e-post). Du kan använda den bifogade mallen, men du måste inte använda den.\n\nFör att du ska hinna utöva din ångerrätt i tid räcker det med att du sänder in ditt meddelande om att du tänker utöva ångerrätten innan ångerfristen gått ut.',
          title: 'Din ångerrätt',
        },
        title: '1. Ångerrätt',
      },
      '2': {
        email_note: {
          content:
            'För att hjälpa oss att hitta din beställning ber vi dig att även ange den e-postadress du använde vid köpet. Detta krävs inte för att ditt frånträde av avtalet ska vara giltigt.',
          title: 'Identifiering av din beställning',
        },
        form: {
          content:
            '_Till {{name}}, {{address}}, {{email}}:_\n\nJag/Vi (*) meddelar härmed att jag/vi (*) frånträder mitt/vårt (*) avtal avseende tillhandahållande av följande tjänst:\n\n— Beställdes den (*) / mottogs den (*):\n\n— Konsumentens/konsumenternas namn:\n\n— Konsumentens/konsumenternas adress:\n\n— Konsumentens/konsumenternas underskrift (endast om denna blankett meddelas på papper):\n\n— Datum:\n\n_(*) Stryk det som inte är tillämpligt._',
          title: 'Blanketten ska fyllas i och återsändas bara om du vill frånträda avtalet',
        },
        title: '2. Mall för ångerblankett',
      },
      '3': {
        refund: {
          content:
            'Om du frånträder detta avtal kommer vi att betala tillbaka alla betalningar vi fått från dig utan onödigt dröjsmål och i vilket fall som helst senast 14 dagar från och med den dag då vi underrättades om ditt beslut att frånträda avtalet.\n\nVi kommer att använda samma betalningsmedel för återbetalningen som du själv har använt för den inledande affärshändelsen, om du inte uttryckligen kommit överens med oss om något annat. I vilket fall som helst kommer återbetalningen inte att kosta dig något.',
          title: 'Återbetalning',
        },
        title: '3. Verkan av utövad ångerrätt',
      },
    },
    tabLabel: 'Ångerrätt',
    title: 'Ångerrätt',
  },
};
