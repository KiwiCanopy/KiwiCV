import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  fix_ai_proposal_diff:
    'AI-voorstellen zijn eenvoudiger te lezen en te beoordelen. Toegevoegde en verwijderde regels hebben nu een eigen achtergrondtint in plaats van alleen een tekstkleur, beide opties blijven goed leesbaar in de donkere modus en staan direct onder de bijbehorende tekst: links behoud je je eigen versie, rechts neem je het voorstel over.',
  fix_ai_stuck_dialog:
    'Een vastgelopen AI-taak houdt het voortgangsvenster niet langer geforceerd open. Het venster kon niet worden gesloten wanneer een taak vastliep, en opnieuw laden opende het meteen weer om dezelfde taak opnieuw te starten — de enige uitweg maakte het probleem dus alleen maar groter. Het venster blijft nu sluitbaar en blijft na het vernieuwen dicht.',
  fix_ai_translate_addon:
    'Het aanvinken van „Mijn CV ook vertalen” zorgt er nu daadwerkelijk voor dat je CV wordt vertaald. Het taalkeuzevak ernaast opende met de taal waarin het CV al stond, wat de taak opvatte als „niets om te vertalen” — het CV kwam daardoor wel afgestemd op de vacature terug maar nog steeds in de oorspronkelijke taal, zonder enige melding dat het vertaalverzoek was genegeerd.',
  fix_cover_letter_footer:
    'De handtekeningregel onder je sollicitatiebrief volgt nu je instellingen voor „PDF-voettekst”, net zoals onder je CV. Voorheen werd het datumveld bovenaan de brief gekopieerd, waardoor het wissen van dat veld ook de handtekening leegmaakte en beide nooit van elkaar konden verschillen.',
  fix_cvs_connect_button:
    "Cloudopslag koppelen vanuit „Mijn CV's” werkt weer van begin tot eind. De knop „Cloudopslag koppelen” deed helemaal niets als je was ingelogd zonder gekoppelde provider, en het dialoogvenster erachter toonde een knop die je alleen terugleidde naar de pagina waar je al op stond.",
};
