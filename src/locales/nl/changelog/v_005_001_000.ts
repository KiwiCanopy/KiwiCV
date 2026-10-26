import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Vacatures',
      content:
        "Plak de link naar de vacature in het exportvenster wanneer je een back-up van een cv maakt naar Google Drive of een privé-GitHub-repository, en open hem vanuit „Mijn CV's” wanneer je hem nodig hebt. Openbare repository's krijgen de link nooit.",
      title: 'Onthoud waar je hebt gesolliciteerd',
    },
  },
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  feat_cover_letter_style_default:
    'Met een opgeslagen schrijfvoorbeeld beginnen je sollicitatiebrieven nu op „Mijn schrijfstijl overnemen”, ook in een nieuw browsertabblad. Kies je in plaats daarvan een toon, dan onthoudt KiwiCV die voor dat tabblad.',
  feat_export_cmd_enter:
    'Druk in het exportvenster op Cmd+Enter (Ctrl+Enter op Windows) om de export te starten zonder naar de knop te hoeven gaan.',
  feat_export_cover_letter_switch:
    'Het exportvenster laat nu zien of je sollicitatiebrief wordt meegenomen, met een schakelaar om hem toe te voegen of weg te laten, en waarschuwt je wanneer de brief mogelijk niet past bij de vacature waarop je je cv net hebt afgestemd, zodat je hem kunt controleren voordat je hem verstuurt.',
  feat_job_posting_link:
    "Voeg de link naar de vacature toe wanneer je een back-up van een cv maakt naar Google Drive of een privé-GitHub-repository, en open hem daarna direct vanuit die versie in „Mijn CV's”. Openbare GitHub-repository's krijgen hem nooit.",
  fix_basics_proposal_gap:
    'Een AI-voorstel in „Basisgegevens” zit niet meer direct tegen je foto aan.',
  fix_json_resume_import_levels:
    'Bij het importeren van een JSON Resume-bestand zet KiwiCV de taalvaardigheid van een taal, zoals „Native” of „B2”, nu om naar het bijbehorende niveau en leest het vaardigheidsniveaus die als woorden zijn geschreven, zoals „Expert”. Als een werkervaring een bedrijfsomschrijving bevat, laat de import je nu weten dat KiwiCV geen veld heeft om die te bewaren, in plaats van haar stilzwijgend weg te laten.',
  fix_sign_out_forgets_export_details:
    'Bij het uitloggen vergeet KiwiCV nu ook het bedrijf, de functie en de link naar de vacature die je in het exportvenster hebt ingevuld, zodat de volgende persoon die in deze browser inlogt ze niet ziet.',
  fix_tailoring_matches_job_ad:
    'Afstemmen op een vacature herschrijft nu je werkervaring richting de vacature en past je titel aan, in plaats van alleen je vaardigheden te herstructureren.',
  ui_export_footer_pinned:
    'Exporteren en Annuleren blijven nu onderaan het exportvenster in beeld, ook op kleinere schermen.',
  ui_restructure_skills_default:
    '„Vaardigheden herstructureren” staat nu aangevinkt wanneer je je hele cv verbetert, zodat het afstemmen je vaardigheden standaard op de functie hergroepeert. Vink het uit om je eigen structuur te houden; elke wijziging komt nog steeds binnen als voorstel dat je kunt accepteren of verwerpen.',
};
