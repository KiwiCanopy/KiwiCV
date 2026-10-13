import type { Translations } from '@/locales/en';

export const v_004_000_000: Translations['changelog']['entries']['v_004_000_000'] = {
  _highlights: {
    'kiwicv-rebrand': {
      badge: 'Rebrand 🥝',
      content:
        'CVCanvas har blivit KiwiCV 🥝✨! Vi har uppdaterat vårt namn för att ge vår redigerare en helt egen och oberoende identitet. Som en stolt del av KiwiCanopy-familjen förblir alla dina verktyg, din lokala integritet och dina sparade CV:n 100 % intakta.',
      title: 'Fräschare namn, unik karaktär',
    },
  },
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  chore_product_tour: 'Pensionerat den gamla guidade turen. Fönstret "Vad är nytt" bor kvar.',
  chore_security:
    'Rutinmässiga säkerhets- och integritetsförbättringar under huven, inklusive striktare kontroller när ett konto raderas.',
  feat_accessibility:
    'Ett stort kliv för tillgängligheten: KiwiCV fungerar nu ordentligt med skärmläsare och kan användas från start till mål med enbart tangentbordet, inklusive att flytta sektioner och poster utan mus.',
  feat_design_settings:
    'Designinställningarna är enklare: mindre använda sektionsåtgärder är undanstoppade i en liten meny istället för att fylla varje rad.',
  feat_export_and_preview:
    'Exporter visar nu hur långt nedladdningen har kommit, och PDF-förhandsgranskningen reparerar sig själv istället för att lämna en tom sida om något går fel.',
  feat_interface_redesign:
    'KiwiCV har fått ett helt nytt utseende – en fräsch landningssida, en renare arbetsyta och en mobil layout som äntligen känns gjord för en mobiltelefon.',
  feat_translations:
    'Fyllt de sista luckorna i alla femton språk – en handfull meddelanden och etiketter som fortfarande visades på engelska är nu översatta.',
  fix_ai_import: 'Fixat AI-importer som kunde fastna halvvägs eller dra krediter två gånger.',
  fix_drive_connection:
    'Fixat att Google Drive ibland visades som ansluten när det tyst hade slutat fungera, samt förhindrat att en gammal anslutning följer med till ett annat Google-konto i samma webbläsare.',
  fix_editor_layout:
    'Flera layoutfixar i redigeraren: rubriker och rader bryts inte längre på två rader, tvåkolumnsvyn staplas mjukare på smala skärmar och att avbryta en dragning återställer allt till sin plats.',
  ui_kiwicv_rebrand:
    'Välkommen till KiwiCV! Vi säger adjö till det gamla namnet CVCanvas och ansluter stolt till KiwiCanopy-familjen 🥝. Din CV-redigerare står för maximal integritet, unik design och högsta kvalitet.',
};
