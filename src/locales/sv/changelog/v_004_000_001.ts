import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  fix_migration_notice:
    'Om du fortfarande når KiwiCV via den tidigare webbadressen visar meddelandet där nu exakt när adressen slutar fungera: 31 oktober 2026.',
  fix_mobile_checkout:
    'Att svepa genom priskorten på mobilen öppnar inte längre kassan av misstag. Endast knappen startar nu ett köp.',
  fix_preview_reliability:
    'Förhandsgranskningen fastnar inte längre i en oändlig laddningssnurra. Ett blockerat pop-up-fönster meddelar nu vad som hände, en renderingsprocess som stannar avbryts med en tydlig förklaring, och förhandsgranskningen fortsätter att fungera även om en extern tjänst är långsam eller onåbar.',
  fix_save_status:
    'Meddelandet "Sparad på denna enhet" speglar nu vad som faktiskt har sparats, istället för att visa samma bekräftelse oavsett vad som hände.',
  fix_translations:
    'Korrigerat tretton texter som innehöll tecken från fel alfabet (kyrilliska tecken i spanska och turkiska ord, samt koreanska och japanska i kinesiska) och fyllt de sista luckorna i alla femton språk.',
  perf_preview_speed:
    'Den första förhandsgranskningen visas mycket snabbare. Tidigare laddade KiwiCV alla typsnitt som någonsin kunde behövas innan något kunde visas, inklusive två mycket stora för kinesiska och japanska. Dessa laddas nu endast om ditt CV faktisk använder de tecknen.',
  ui_polish:
    'Visuell finputsning: rubriker använder ett äkta extra fetstilt typsnitt istället för ett som webbläsaren gör konstgjort tjockare, formuläretiketter och plats hållare är lättare att läsa, och avsnittskort delar en konsekvent accentfärg.',
};
