import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Eigen secties',
      content:
        'Je cv is niet langer beperkt tot de standaardsecties. Voeg er zelf een toe — Conferenties, Belangrijkste prestaties, alles wat jouw verhaal vertelt —, vul die in zoals elke andere sectie, en hij past bij elke vormgeving, in het voorbeeld en in de PDF. „Verbeteren met AI” en vertalen werken er ook op.',
      title: 'Je eigen secties',
    },
  },
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  feat_custom_sections:
    'Voeg je eigen secties toe aan je cv — Conferenties, Belangrijkste prestaties of alles wat de standaardsecties niet dekken. „Sectie toevoegen” vind je onderaan de sectielijst: geef de sectie een titel en vul haar met items zoals elke andere sectie — naam, datums, link, samenvatting en hoogtepunten. Eigen secties zien er in elke vormgeving goed uit, in het voorbeeld en in de PDF, en je kunt ze net als de rest tussen kolommen verplaatsen in de indelingseditor. „Verbeteren met AI” werkt op de secties en op elk van hun items, en bij het vertalen van je cv worden ook hun titels en items vertaald.',
  feat_json_round_trip:
    'Een cv-bestand uit een andere tool importeren gooit niet langer weg wat KiwiCV niet kan tonen. Extra blokken in het bestand en de functies en trefwoorden van je projecten blijven bij je cv bewaard en komen ongewijzigd terug wanneer je het exporteert of een back-up maakt naar Google Drive of een privé-GitHub-repository. Ze verschijnen nooit op je cv en bereiken nooit de AI, en de import vertelt je welke blokken hij heeft bewaard.',
  feat_privacy_by_design:
    "KiwiCV blijft zijn werkwijze rond jouw privacy vormgeven. Een GitHub-repository die iedereen kan lezen — openbaar of gepubliceerd met GitHub Pages — krijgt nu alleen wat je cv toont: verborgen items, adresonderdelen die je wegliet en je sollicitatiebrief blijven erbuiten. Een privérepository houdt de volledige back-up, en het verbindingsvenster vertelt je welke van de twee het is. Foto's in een geïmporteerd cv-bestand verliezen hun cameragegevens, inclusief de gps-locatie, voordat ze worden opgeslagen.",
  fix_hidden_entries_stay_hidden:
    'Wat je verbergt, blijft verborgen. Een ander item bewerken, verplaatsen, sorteren of verwijderen kon een verborgen item weer tevoorschijn halen, net als een AI-herindeling van je vaardigheden of het voorbeeld van een leeg cv. Diezelfde acties accepteren ook niet langer stilletjes een AI-suggestie waarop je nog niet hebt gereageerd.',
  fix_keyboard_screen_reader:
    'Soepeler met toetsenbord en schermlezer: een nieuw eerste item opent meteen, het veld Platform werkt als een echte lijst en knoppen worden bij naam aangekondigd.',
  fix_language_polish:
    'Taalverfijning in de hele app: gecorrigeerde sectiekoppen in het Italiaans, Bulgaars, Turks en Portugees, een hoofdletter İ met punt in Turkse cv’s, de laatste Engelse schermen vertaald en echte voorbeeldinhoud in een leeg cv in twaalf talen.',
  fix_reduced_json_hides_sections:
    'De „Gereduceerd”-JSON op de pagina Ruwe JSON laat nu alles weg wat je cv verbergt — een hele sectie die je hebt verborgen en een profielfoto die je hebt verborgen —, evenals de adresonderdelen die je cv weglaat en projectvelden die alleen uit een geïmporteerd bestand zijn bewaard.',
};
