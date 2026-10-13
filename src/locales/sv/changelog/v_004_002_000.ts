import type { Translations } from '@/locales/en';

export const v_004_002_000: Translations['changelog']['entries']['v_004_002_000'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  feat_ai_composer:
    'Förbättring med AI sker nu direkt i editorn. Välj om du vill anpassa ditt CV efter en jobbannons, vässa formuleringarna eller ge egna instruktioner, se vad en körning kostar innan du förbrukar något, och granska varje förslag bredvid din egen text — inget skrivs om förrän du godkänner det.',
  feat_cv_library:
    '”Mina CV:n” är nu en egen sida. Varje säkerhetskopierad version listas med sin design, sitt språk och den roll den anpassades för, så att du kan hitta och återställa en version utan att först öppna en popup.',
  feat_editor_section_rail:
    'Editorn listar nu dina avsnitt i sidopanelen istället för att stapla dem som kort du måste öppna ett i taget. Hoppa direkt till ”Arbetslivserfarenhet” eller ”Färdigheter”, se med ett ögonkast hur många poster varje avsnitt innehåller, och behåll din plats medan förhandsgranskningen ligger kvar.',
  feat_export_single_trigger:
    'Exportdialogen skickar nu ett CV till alla anslutna destinationer i en enda körning — välj ZIP, GitHub och Google Drive tillsammans istället för att exportera tre gånger, och följ bekräftelsen för varje destination när den blir klar.',
  fix_drive_reconnect_prompt:
    'Att öppna eller läsa om ”Mina CV:n” ber dig inte längre att återansluta Google Drive. Din anslutning gick aldrig förlorad — sidan hade helt enkelt inte kontrollerat den ännu — så dina versioner finns där direkt, oavsett vilken sida du landar på.',
  fix_language_switch_wait:
    'Att byta språk på ditt CV lämnar dig inte längre i ovisshet. Medan KiwiCV söker i dina anslutna molntjänster efter ett CV på det nya språket visas en kort förloppsdialog — och återställnings- eller översättningsrutan dyker upp direkt där, istället för att avbryta dig sekunder senare.',
  ui_cover_letter_page:
    'Ditt personliga brev passar nu perfekt ihop med den design du valt. Varje tema stylar ämnesraden på sitt eget sätt — med en accentfärg, kapitäler eller en ramad tagg — och din signatur placeras längst ned på sidan istället för att hamna direkt under en kort text.',
};
