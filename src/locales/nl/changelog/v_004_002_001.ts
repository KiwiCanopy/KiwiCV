import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'Op een telefoon werkt het openen van je CV als webpagina weer zoals het hoort. De HTML-optie in het menu Voorbeeld bleef voorheen steken op een tabblad dat zei dat het bestand werd gegenereerd; nu zie je meteen je gerenderde CV.',
  perf_phone_preview:
    'Voorbeeld opent sneller op een telefoon. KiwiCV zet de document-engine nu al voor je klaar terwijl je nog aan het bewerken bent in plaats van te starten zodra je tikt, en wanneer je een CV heropent dat je sinds het laatste voorbeeld niet hebt gewijzigd, sla je de wachttijd helemaal over.',
  ui_phone_layout:
    "Op een telefoon geven de editor en Mijn CV's elk element weer de ruimte. Elke back-up toont naam, taal en opslagdatum op een eigen regel in plaats van onder de knop Herstellen te lopen, de kaart „Verbeteren met AI” houdt titel en creditmelding op aparte regels, en de laatste sectie in de editor valt niet meer weg achter de zwevende knop Voorbeeld.",
};
