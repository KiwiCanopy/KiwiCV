import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'På mobilen fungerar det nu att öppna ditt CV som en webbsida. HTML-alternativet i menyn Förhandsgranska fastnade tidigare på en flik som stod och genererade utan att bli klar; nu visas ditt färdiga CV direkt.',
  perf_phone_preview:
    'Förhandsgranska öppnas snabbare på mobilen. KiwiCV gör nu dokumentmotorn redo medan du fortfarande redigerar istället för att starta den först när du trycker, och om du öppnar ett CV som inte har ändrats sedan förra förhandsgranskningen slipper du väntetiden helt.',
  ui_phone_layout:
    'På mobilen ger redigeraren och Mina CV:n alla element ordentligt med utrymme igen. Varje säkerhetskopia visar sitt namn, språk och sparandedatum på en egen rad istället för att hamna under knappen Återställ, kortet „Förbättra med AI” håller titel och kreditbesked på separata rader, och det sista avsnittet i redigeraren hamnar inte längre bakom den flytande knappen Förhandsgranska.',
};
