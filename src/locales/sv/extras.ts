import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV är ett av flera verktyg som skapats under KiwiCanopy-paraplyet. Utforska resten av familjen.',
    family_title: 'En del av KiwiCanopy-familjen',
    kiwicanopy_desc: 'Hemmet för KiwiCanopy-familjen, där alla verktyg bor tillsammans.',
    kiwidesk_desc: 'En systerapp i KiwiCanopy-familjen.',
    story_p1:
      'Oavsett om det var för mig själv eller i utbyte med vänner och bekanta – jag upplevde samma frustration om och om igen: det mödosamma arbetet med att skriva om mitt CV för varje ny ansökan. Alla vill skräddarsy sin erfarenhet specifikt för den aktuella tjänsten utan att CV:t omedelbart ser överlastat ut. Men konventionella verktyg gör just det till en pina: För varje liten justering måste ofta ett helt nytt dokument skapas, vilket snabbt slutar i ett ändlöst versionskaos.',
    story_p2:
      'Det är just av den anledningen som jag skapade KiwiCV: en modulär CV-byggare där du enkelt kan slå på och av enskilda sektioner, flytta segment fritt och exportera flexibelt – allt från en enda, central översikt. Inget mer mödosamt kopierande och klistrande mellan otaliga Word-dokument. Hela din karriärhistoria får ett permanent hem, och du kan lugnt välja ut precis det du vill visa för varje specifik ansökan.',
    story_title: 'Historien bakom KiwiCV',
    title: 'Om KiwiCV',
    visit_site: 'Besök webbplats',
  },
  howto: {
    core: {
      ai_assistant: 'AI-assistent',
      ai_assistant_desc:
        'Använd AI-assistenten för att optimera enskilda objekt, sektioner eller hela ditt CV. Leta efter {wardsymbol}-ikonen!',
      hide_show: 'Dölj/Visa',
      hide_show_desc:
        'För att slippa ta bort och lägga till poster hela tiden kan du dölja enskilda objekt eller hela sektioner med ett enda klick.',
      move_items_desc:
        'Dra och släpp sektioner eller enskilda objekt mellan sidofältet och huvudkolumnen.',
      page_breaks: 'Sidbrytningar',
      page_breaks_desc:
        'Infoga manuella sidbrytningar för att säkerställa att din PDF-export ser ut precis som du vill. Detta påverkar endast PDF-versionen, inte webbversionen.',
      rearrange: 'Omorganisera',
      rearrange_desc:
        'Ändra ordningen på objekt inom valfri sektion för att fokusera på det du vill lyfta fram.',
      switch_sides: 'Byt sida',
      switch_sides_desc:
        'Växla enkelt mellan huvudkolumnen och sidofältet för att hitta den bästa layouten för ditt innehåll.',
      title: 'Kärnfunktioner',
    },
    footer: {
      message:
        'Att skriva ditt CV blir förhoppningsvis mindre besvärligt och roligare i framtiden med KiwiCV! Lycka till med ditt arbetssökande!',
    },
    github: {
      create_pat_link: 'Skapa token på GitHub',
      create_repo_link: 'Skapa arkiv på GitHub',
      go_to_settings: 'Gå till inställningar',
      intro:
        'Anslut ditt CV till ett GitHub-arkiv för automatisk hantering av flera språk, versionskontroll och enkel hosting. Följ dessa tre steg:',
      pat_security_tip:
        "Använd en 'Fine-grained' Personal Access Token med endast läs- och skrivåtkomst för 'Contents' till ditt specifika arkiv. Kom ihåg att välja 'Only select repositories' och ställ in ditt önskade utgångsdatum.",
      step1_desc:
        'Skapa ett nytt privat arkiv (repository) på GitHub. Du kan lämna det helt tomt tills vidare (ingen README eller .gitignore behövs).',
      step1_title: 'Skapa ett arkiv',
      step2_desc:
        'Du behöver en Personal Access Token (PAT) för att tillåta KiwiCV att skicka filer till ditt arkiv. Jag rekommenderar att du använder en "fine-grained" token för maximal säkerhet.',
      step2_title: 'Skapa en Personal Access Token',
      step3_desc:
        'Gå till sidan Inställningar och ange dina arkivuppgifter och din token i avsnittet GitHub. Du kan också klicka på GitHub-knappen uppe till höger för att öppna ett formulär där du även kan ange din PAT.',
      step3_title: 'Anslut i KiwiCV',
      title: 'Guide för GitHub-anslutning',
    },
    hosting: {
      automated_title: 'Alternativ B: Automatiserad hosting (via GitHub)',
      github_pages_desc:
        'Använd HTML-filen som genereras av KiwiCV och ladda upp den till ett GitHub-arkiv. Aktivera GitHub Pages i arkivets inställningar för att få en gratis offentlig URL för ditt CV.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Du kan hosta den genererade HTML-versionen av ditt CV gratis. Här är de vanligaste alternativen:',
      manual_title: 'Alternativ A: Manuell uppladdning (inget GitHub krävs)',
      netlify_desc:
        'Tjänster som Netlify eller Vercel erbjuder gratis hosting av statiska sidor med enkel drag-och-släpp-publicering eller automatisk synkronisering med ditt GitHub-arkiv. Du kan helt enkelt ladda upp ditt HTML-CV där utan att exponera din redigeringshistorik.',
      netlify_drop_desc:
        'Säkra din konkurrensfördel med en personlig URL. Det finns många **gratisleverantörer** där du kan få ut ditt CV på nätet **på några sekunder**. Oavsett om det är via verktyget som länkats ovan eller alternativ som [Tiiny.host](https://tiiny.host): En snabb **drag-och-släpp** av din webbplats är allt som krävs för att få en professionell närvaro på webben.',
      netlify_drop_title: 'Snabbt & enkelt: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        'Varning: Om du inte har ett betalt GitHub-konto måste du göra ditt arkiv offentligt för att använda GitHub Pages. Detta innebär att hela din CV-historik (alla commits) blir synlig för alla! Om integritet är viktigt för dig, överväg att använda det första alternativet.',
      push_folder_hint:
        'KiwiCV stöder att endast skicka HTML-filen till en specifik mapp i ditt arkiv. Kontrollera de avancerade inställningarna på förhandsgranskningssidan.',
      sensitive_data_warning:
        'Integritetsvarning: Om du hostar ditt CV på en offentlig URL kan vem som helst komma åt dina uppgifter. Överväg att ta bort känslig personlig information som din exakta adress, telefonnummer och e-post.',
      title: 'Hosta ditt CV',
    },
    pdf_guide: {
      font_size: 'Teckensnittsstorlek',
      font_size_desc:
        'Justera teckensnittsstorleken i Design-fliken för att optimera hur ditt innehåll får plats på sidorna.',
      intro:
        'PDF-rendering är komplext, vilket ibland kan leda till mindre bra layouter. För att undvika detta kan du experimentera med följande funktioner tills ditt dokument ser ut precis som du önskar:',
      rearrange_sections: 'Omorganisera',
      rearrange_sections_desc:
        'Att ändra ordningen på sektioner kan ofta lösa "föräldralösa" rader eller konstiga sidbrytningar.',
      space_opt: 'Utrymmesoptimering',
      space_opt_desc:
        'Ibland kan en flytt av en kort sektion till sidofältet frigöra tillräckligt med utrymme för en snyggare layout.',
      title: 'Tips för PDF-layout',
      use_pagebreaks: 'Använd sidbrytningar',
      use_pagebreaks_desc:
        'Objekt som ligger väldigt nära sidkanten kan ibland renderas konstigt. Använd manuella sidbrytningar för att flytta dem snyggt till nästa sida.',
    },
    sync_guide: {
      auto_recognition_desc:
        'När du byter språk triggas en kontroll för att se om en version redan finns i molnet.',
      auto_recognition_title: 'Automatisk igenkänning',
      desc: 'KiwiCV hanterar flera språk. När du sparar eller säkerhetskopierar ditt CV skapar appen en version specifikt för det för tillfället aktiva språket. När du byter språk senare känner KiwiCV igen befintliga säkerhetskopior och erbjuder att återställa dem, vilket håller din flerspråkiga CV-historik perfekt organiserad.',
      language_specific_desc: 'Varje språkversion lagras som en separat post i ditt molnarkiv.',
      language_specific_title: 'Språkspecifikt',
      title: 'Intelligent språksäkerhetskopiering',
    },
    toc_title: 'INNEHÅLLSFÖRTECKNING',
  },
  page_description:
    'Bakgrund, support och vision: Upptäck hur du får ut det mesta av KiwiCV, vart resan är på väg och historien bakom din CV-byggare.',
  page_title: 'Extra',
  tabs: {
    about: 'Om KiwiCV',
    changelog: 'Ändringslogg',
    howto: 'Guide',
    roadmap: 'Vägkarta',
  },
};
