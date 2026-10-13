import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  fix_migration_notice:
    'Als je KiwiCV nog bereikt via het vorige webadres, geeft de melding daar nu precies aan wanneer dat adres stopt met werken: 31 oktober 2026.',
  fix_mobile_checkout:
    'Wissen door de prijskaarten op een telefoon opent de kassa niet langer per ongeluk. Alleen de knop start nu een aankoop.',
  fix_preview_reliability:
    'De preview blijft niet meer steken in een eindeloze laadanimatie. Een geblokkeerde pop-up meldt nu duidelijk wat er is gebeurd, een vastgelopen weergave stopt met een heldere uitleg, en de preview blijft werken zelfs als een externe dienst traag of onbereikbaar is.',
  fix_save_status:
    "De melding 'Opgeslagen op dit apparaat' geeft nu de werkelijke opslagstatus weer, in plaats van altijd dezelfde bevestiging te tonen.",
  fix_translations:
    'Dertien teksten gecorrigeerd die letters uit het verkeerde alfabet bevatten (zoals cyrillische tekens in Spaanse en Turkse woorden, of Koreaanse en Japanse tekens in het Chinees) en de laatste ontbrekende vertalingen in alle vijftien talen aangevuld.',
  perf_preview_speed:
    'De eerste preview verschijnt veel sneller. KiwiCV laadde eerder alle lettertypen die mogelijk nodig waren voordat er iets getoond kon worden, inclusief twee zeer grote Chinese en Japanse lettertypen. Die worden nu alleen geladen als je CV deze tekens daadwerkelijk gebruikt.',
  ui_polish:
    'Visuele verfijning: kopteksten gebruiken een echt vetgedrukt lettertype in plaats van een door de browser kunstmatig verdikt type, veldlabels en placeholders zijn beter leesbaar, en sectiekaarten delen één consistente accentkleur.',
};
