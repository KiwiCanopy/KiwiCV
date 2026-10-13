import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  fix_ai_proposal_diff:
    'AI-förslag är enklare att läsa och besvara. Tillagda och borttagna rader har nu en egen bakgrundston utöver textfärgen, båda alternativen förblir tydliga i mörkt läge och visas direkt under texten de tillhör — behåll din egen formulering till vänster, acceptera förslaget till höger.',
  fix_ai_stuck_dialog:
    'En AI-körning som har hängt sig låser inte längre förloppsfönstret i öppet läge. Fönstret gick inte att stänga när en körning fastnade, och en sidomladdning öppnade det direkt igen och startade samma körning på nytt — den enda utvägen gjorde alltså saken värre. Nu kan fönstret alltid stängas och förblir stängt efter en omladdning.',
  fix_ai_translate_addon:
    'När du markerar ”Översätt även mitt CV” översätts dokumentet nu på riktigt. Språkrutan bredvid öppnades med språket som ditt CV redan var skrivet på, vilket körningen tolkade som ”inget att översätta” — ditt CV anpassades till jobbannonsen men behöll sitt ursprungliga språk, utan någon indikation om att önskemålet hade ignorerats.',
  fix_cover_letter_footer:
    'Signaturraden under ditt personliga brev följer nu dina inställningar för ”PDF-sidfot”, precis som under ditt CV. Tidigare kopierade den datumfältet högst upp i brevet, vilket gjorde att en rensning av datumet även tömde signaturen så att de två aldrig kunde skilja sig åt.',
  fix_cvs_connect_button:
    'Att koppla molnlagring från ”Mina CV:n” fungerar nu hela vägen igen. Knappen ”Koppla molnlagring” reagerade inte alls när du var inloggad utan en kopplad lagringstjänst, och dialogrutan som öppnades visade en knapp som bara skickade dig tillbaka till sidan du redan stod på.',
};
