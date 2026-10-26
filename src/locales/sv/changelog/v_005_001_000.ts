import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Jobbannonser',
      content:
        'Klistra in länken till annonsen i exportdialogen när du säkerhetskopierar ett CV till Google Drive eller ett privat GitHub-arkiv, och öppna den från ”Mina CV:n” när du behöver. Offentliga arkiv får aldrig länken.',
      title: 'Kom ihåg var du sökte',
    },
  },
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  feat_cover_letter_style_default:
    'Med ett sparat textprov börjar dina personliga brev nu på ”Matcha min skrivstil”, även i en ny webbläsarflik. Väljer du en ton i stället behåller KiwiCV den för den fliken.',
  feat_export_cmd_enter:
    'Tryck på Cmd+Enter (Ctrl+Enter i Windows) i exportdialogen för att starta exporten utan att behöva sträcka dig efter knappen.',
  feat_export_cover_letter_switch:
    'Exportdialogen visar nu om ditt personliga brev ingår, med en brytare för att lägga till eller utelämna det, och varnar dig när brevet kanske inte matchar jobbannonsen du nyss anpassade ditt CV till, så att du kan kontrollera det innan du skickar.',
  feat_job_posting_link:
    'Lägg till länken till annonsen när du säkerhetskopierar ett CV till Google Drive eller ett privat GitHub-arkiv, och öppna den sedan direkt från den versionen i ”Mina CV:n”. Offentliga GitHub-arkiv får den aldrig.',
  fix_basics_proposal_gap:
    'Ett AI-förslag i ”Grundläggande info” ligger inte längre tätt intill ditt foto.',
  fix_json_resume_import_levels:
    'När du importerar en JSON Resume-fil gör KiwiCV nu om språkkunskapen för ett språk, till exempel ”Native” eller ”B2”, till motsvarande nivå och läser färdighetsnivåer som är skrivna med ord, till exempel ”Expert”. Om en anställning har en företagsbeskrivning talar importen nu om att KiwiCV saknar fält att spara den i, i stället för att tyst släppa den.',
  fix_sign_out_forgets_export_details:
    'När du loggar ut glömmer KiwiCV nu också företaget, positionen och länken till annonsen som du skrev i exportdialogen, så att nästa person som loggar in i den här webbläsaren inte ser dem.',
  fix_tailoring_matches_job_ad:
    'Anpassning till en annons skriver nu om din arbetslivserfarenhet mot jobbannonsen och justerar din yrkesrubrik, i stället för att bara omstrukturera dina färdigheter.',
  ui_export_footer_pinned:
    'Exportera och Avbryt syns nu längst ner i exportdialogen även på mindre skärmar.',
  ui_restructure_skills_default:
    '”Omstrukturera Färdigheter” är nu förbockat när du förbättrar hela ditt CV, så att anpassningen som standard grupperar om dina färdigheter mot jobbet. Bocka ur för att behålla din egen struktur; varje ändring kommer fortfarande som ett förslag du kan godta eller förkasta.',
};
