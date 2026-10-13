import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Personligt brev',
      content:
        'Personliga brev har landat i KiwiCV. Skriv ett brev med exakt samma design som ditt CV och exportera båda tillsammans som ett enhetligt ansökningspaket — inga mer spretiga dokument.',
      title: 'Personliga brev, perfekt matchade',
    },
  },
  chore_ai_model_upgrade:
    'KiwiCVs AI körs nu på Googles nyaste Gemini-generation (Gemini 3.1) för märkbart bättre förslag. Integriteten är oförändrad: behandlingen sker uteslutande inom EU, i enlighet med GDPR, och dina data används aldrig för att träna AI-modeller.',
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  feat_matching_cover_letters:
    'Skapa ett personligt brev som matchar din CV-design och exportera båda tillsammans i ett samlat ansökningspaket. Formatera texten med fetstil, kursiv stil och länkar, välj mellan klassisk DIN 5008 eller en temamatchad layout, och visa eller dölj avsändar-, mottagar- och signaturblock för varje sökt roll.',
  fix_design_settings_reset:
    'Dina Design-inställningar ligger nu kvar medan du redigerar. Valet av fetstil för rubriker i Arbetslivserfarenhet och Utbildning, den anpassade adresslayouten och målsökvägen för GitHub återställdes tidigare till standardvärdena så fort du lade till, ändrade ordning på eller redigerade ett objekt i en listsektion — utan varning eller möjlighet att ångra. Anpassade avsnittsrubriker från ett importerat CV behålls också efter varje redigering.',
  fix_elegant_page_breaks:
    'Manuella sidbrytningar fungerar nu i temat Elegant. Att markera en sidbrytning hade tidigare ingen effekt på den exporterade PDF-filen; en ny sida börjar nu exakt där du angav, precis som i alla andra teman.',
  fix_empty_custom_address_layout:
    'En anpassad adresslayout utan användbara fält raderar inte längre din adress. Att ta bort alla fält från den anpassade layouten i Design tog tidigare bort adressen helt från ditt CV och din PDF utan förklaring på skärmen. KiwiCV använder nu i stället standardlayouten för ditt land.',
  fix_footer_date_round_trip:
    'Att inaktivera datumet i CV-sidfoten bibehålls nu efter export och återimport, och ett manuellt angivet datum sparas exakt som du skrev det i stället för att rensas.',
  fix_import_list_warnings:
    'Importvarningar omfattar nu även listor. När KiwiCV måste hoppa över ett oläsligt objekt bland höjdpunkterna för en tjänst, kurserna i en examen eller nyckelorden för en färdighet, anges objektet och fältet i importsummeringen i stället för att listan tyst förkortas.',
  fix_import_warning_headings:
    'Importvarningar visar nu vilket avsnitt i ditt CV de kommer från (inklusive dina personuppgifter) i stället för en intern etikett.',
  fix_imported_list_fields:
    'En CV-fil med felaktigt formaterade punktlistor bryter inte längre din förhandsgranskning. Om en importerad JSON-fil sparade höjdpunkter för en tjänst, kurser i en examen eller nyckelord för en färdighet som en enda textrad i stället för en lista, slutade förhandsgranskningen och PDF-filen helt att visas. KiwiCV läser nu vad som går och hoppar tyst över resten.',
  fix_imported_text_fields:
    'Kontaktuppgifter i fel format skadar inte längre ditt CV. Om en importerad fil sparade ditt namn, din webbplats, ditt telefonnummer eller din ort i ett annat format än ren text, kunde förhandsgranskningen eller PDF-filen sluta fungera helt. KiwiCV läser nu vad som går och rensar överflödiga mellanslag runt ditt namn och din adress så att teman som delar namnet på två rader inte längre visar en tom första rad.',
  fix_imported_theme_name:
    'Ett CV som importerats med ett okänt temanamn visar nu alla sina avsnitt i stället för att visas nästan tomt.',
  fix_missing_sections_single_column:
    'Avsnitt du fyllt i efter att ha ändrat ordning på din layout försvinner inte längre i enkolumnsteman — varje avsnitt med innehåll visas i förhandsgranskningen och den exporterade PDF-filen.',
  fix_pdf_special_characters:
    'Specialtecken och länkar i ditt CV exporteras nu med hög tillförlitlighet i alla temans PDF-filer.',
  fix_preview_pdf_parity:
    'Vad du ser matchar nu vad du exporterar. Ändrade avsnittsrubriker, temaspecifika detaljer, ikonerna bredvid dem och projektavsnitt i flera tvåspaltiga teman kunde skilja sig mellan förhandsgranskningen på skärmen och den exporterade PDF-filen – de två renderas nu identiskt.',
  fix_reload_repairs_cv:
    'Att ladda om redigeraren reparerar nu automatiskt skadade eller gamla CV-filer direkt, vilket förhindrar potentiella krascher i förhandsgranskningen och exporten.',
  fix_signature_footer:
    'Signaturfoten har korrigerats: den lämnar nu utrymme för att faktiskt skriva under, skapar inte längre en tom sista sida på längre CV:n och visas nu i teman Elegant, Plain och Plain 2 som saknade den.',
  fix_stackoverflow_page_breaks:
    'Manuella sidbrytningar fungerar igen i temat Stack Overflow. Att infoga en sidbrytning förhindrade tidigare PDF-filen från att skapas; förhandsgranskningen och exporten bryter nu sidan exakt där du angav.',
  fix_theme_fonts:
    'Elegant, Timeless och JavaScript visas nu i förhandsgranskningen med sina originaltypsnitt. Förhandsgranskningen föll tidigare tillbaka på ett generiskt systemtypsnitt och Timeless-PDF:en exporterades med ett annat typsnitt — alla tre ser nu likadana ut på skärmen som i det färdiga dokumentet.',
  fix_two_column_stray_breaks:
    'I temana Lunar, Misty och Swiss Grid drar ett avsnitt där du döljer alla objekt inte längre med sig sin manuella sidbrytning till den exporterade PDF-filen, vilket förhindrar att en tom kolumn uppstår.',
  other_discord_community:
    'KiwiCV har nu en Discord-gemenskap — en plats för att utbyta feedback, önska mallar och stötta varandra under jobbsökandet. En länk väntar i sidfoten och på landningssidan.',
  other_export_no_google_fonts:
    'När du öppnar ett exporterat HTML-CV görs inga anrop till Google för att hämta typsnitt. Samma typsnittsfiler som KiwiCV redan tillhandahåller används, vilket ger en identisk visning utan att någon annan får veta att du har öppnat det.',
  other_import_clear_warning:
    'Importsammanfattningen varnar dig nu tydligt när icke-textvärden rensas från rena textfält, istället för att bara tömma dem tyst.',
  other_kiwicanopy_family:
    'Möt resten av KiwiCanopy-familjen — KiwiCV länkar nu till KiwiCanopy och KiwiDesk från Om-sidan.',
};
