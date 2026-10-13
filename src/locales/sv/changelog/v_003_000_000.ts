import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'AI-import',
      content:
        'Importera dina CV-data här. När de har laddats omvandlas den här knappen till din kraftfulla AI-assistent för CV-optimering. Håll utkik efter {wardsymbol} i appen.',
      title: 'Import & AI-assistent',
    },
    'google-drive': {
      badge: 'Molnsynkronisering',
      content: 'Synkronisera ditt CV sömlöst med Google Drive för enkel åtkomst var som helst.',
      title: 'Google Drive-integration',
    },
    webhosting: {
      badge: 'Webbhosting',
      content:
        'Lär dig hur du publicerar ditt CV som en personlig webbplats på bara några minuter.',
      title: 'Enkel webbhosting',
    },
  },
  feat_ai_import_assistant:
    'Ett nytt sätt att komma igång! KiwiCV gör det nu möjligt att importera CV-innehåll med hjälp av externa LLM:er direkt från redigeraren. Tidigare var detta begränsat till introduktionsguiden, men nu är funktionen tillgänglig för alla – vilket möjliggör en smidig övergång från en enkel prompt till ett perfekt utformat CV.',
  feat_brand_contact_modal:
    'Hör av dig! En ny kontaktmodul har lagts till för att göra det ännu enklare att dela feedback, rapportera problem eller föreslå nya funktioner direkt till KiwiCV.',
  feat_deletion_prevention:
    'Lagt till bekräftelsefrågor vid radering av objekt i alla sektioner för att förhindra oavsiktlig dataförlust.',
  feat_google_drive_sync:
    'Google Drive-synkronisering är här! KiwiCV stöder nu säker synkronisering med din personliga Google Drive, vilket ger ännu mer flexibilitet för att hålla dina data synkade mellan enheter. Synkroniseringsmotorn har tänkts om helt för att stödja flera leverantörer samtidigt – allt medan dina data hålls strikt under din kontroll för maximal integritet.',
  feat_language_aware_restore:
    'Intelligent molnupptäckt. Oavsett om du startar en återställning i inställningarna, loggar in via Google Drive eller konfigurerar din GitHub-anslutning på nytt, skannar KiwiCV intelligent efter tillgängliga säkerhetskopior i bakgrunden. Du kan sedan återställa exakt den språkversion du behöver med ett klick.',
  feat_localized_language_display:
    'Förbättrad lokalisering. CV-språkväljare översätts nu till ditt nuvarande UI-språk, medan valet av UI-språk förblir i sin ursprungliga form för bättre tillgänglighet.',
  feat_robust_manual_import:
    'Robust manuell import. Även om KiwiCV nu erbjuder sin egen säkra AI-modell för CV-import, fortsätter vi att förbättra funktioner som stöder våra användares oberoende. Kopiera ditt CV direkt från valfri AI-chat (som Gemini oder ChatGPT) – vår importör identifierar och rensar nu automatiskt störande artefakter som citattaggar och Markdown-block.',
  fix_design_tab_overflow:
    'Bättre hantering av flöde och centrerat temaval i designfliken för en mer balanserad och tillgänglig upplevelse på alla enheter.',
  fix_intelligent_address_cc:
    'Smartare adressformatering. KiwiCV döljer nu intelligent landskoden för inrikes CV:n. Landet visas endast när din plats skiljer sig från CV:ts primära språk, vilket säkerställer en renare och mer professionell presentation.',
  fix_pagebreaks_reset_on_edit:
    'Åtgärdat ett problem där manuella sidbrytningar oavsiktligt rensades efter redigering av CV-innehåll, vilket säkerställer att din anpassade layout förblir exakt som du ställt in den.',
  fix_project_keywords_cleanup:
    'Rensning av onödiga data. Tagit bort icke-fungerande nyckelordsfält från sektionerna Projekt och Privata projekt.',
  other_language_polish:
    'Putstat för en global publik. Formuleringar på flera språk har förfinats för att göra arbetsflöden för CV-bygge mer intuitiva och enklare att navigera för alla.',
  perf_high_growth_optimization:
    'Konstruerad för excellens. KiwiCV har introducerat betydande prestandaförbättringar under huven för att säkerställa en flytande och responsiv upplevelse medan plattformen fortsätter att utvecklas och växa.',
  refactor_language_certificate:
    'Döpt om JSON-nyckeln `languages.fluency` till `certificate` för att bättre återspegla dess syfte, med en fallback-lösning för bakåtkompatibilitet.',
  refactor_sync_organization:
    'Förfinat för konsekvens. Molnlagringsmappen har döpts om från "backup" till "backups" för att passa perfekt med KiwiCV datastruktur. Stöd för det gamla namnet finns kvar, vilket säkerställer att befintliga data fortsätter att identifieras och synkroniseras korrekt.',
  ui_enhancements:
    'Höjer upplevelsen av att bygga CV:n. Vi har introducerat omfattande UI-förbättringar och layoutförfiningar för att göra KiwiCV mer intuitivt, tillgängligt och enklare att navigera på alla språk som stöds.',
  ui_improved_extras_section:
    'Omfattande manualuppdatering. Sektionen "Hur man gör" har tänkts om helt med nya layouttips, guider för sidbrytningar och intelligenta guider för säkerhetskopiering på flera språk.',
  ui_multi_cloud_interface:
    'Sömlös hantering av flera molntjänster. Användargränssnittet har förfinats för att elegant hantera flera synkroniseringstjänster samtidigt, vilket ger en tydlig och intuitiv vy över dina datas synkroniseringsstatus.',
  ui_refined_experience:
    'Förfinad användarupplevelse. Subtila UI-förbättringar och layoutjusteringar har implementerats över hela plattformen för att säkerställa en mer polerad och intuitiv resa när du bygger ditt CV.',
  ui_swedish_support:
    'Välkommen! KiwiCV har nu officiellt stöd för svenska. Njut av en helt lokaliserad upplevelse, från redigeraren till ditt exporterade CV.',
};
