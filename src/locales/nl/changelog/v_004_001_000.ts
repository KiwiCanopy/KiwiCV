import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Sollicitatiebrief',
      content:
        'Sollicitatiebrieven doen hun intrede in KiwiCV. Schrijf een brief in het exacte ontwerp van je cv en exporteer beide samen als één stijlvol sollicitatiepakket — geen onsamenhangende documenten meer.',
      title: 'Sollicitatiebrieven, perfect afgestemd',
    },
  },
  chore_ai_model_upgrade:
    "De AI van KiwiCV draait nu op Google's nieuwste Gemini-generatie (Gemini 3.1) voor merkbaar betere suggesties. De privacy blijft ongewijzigd: de verwerking blijft uitsluitend in de EU, AVG-conform, en jouw gegevens worden nooit gebruikt om AI-modellen te trainen.",
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  feat_matching_cover_letters:
    'Maak een sollicitatiebrief die aansluit bij het ontwerp van je cv en exporteer beide samen in één sollicitatiedocument. Formatteer de tekst met vet, cursief en links, kies voor een klassieke DIN 5008-lay-out of een bijpassend thema, en toon of verberg de afzender-, ontvanger- en handtekeningblokken naar wens.',
  fix_design_settings_reset:
    'Je Design-instellingen blijven nu netjes behouden tijdens het bewerken. De optie voor vetgedrukte koppen bij Werkervaring en Opleiding, een aangepaste adresindeling en het doelpad voor GitHub-hosting sprongen voorheen direct terug naar hun standaardwaarden zodra je een item in een lijstsectie toevoegde, verplaatste of bewerkte — zonder waarschuwing of ongedaan te maken. Aangepaste sectiekoppen in een geïmporteerd cv blijven nu ook na elke bewerking behouden.',
  fix_elegant_page_breaks:
    "Handmatige pagina-einden werken nu ook in het thema Elegant. Het inschakelen van een pagina-einde had voorheen geen effect op de geëxporteerde PDF; er begint nu precies op de gewenste plek een nieuwe pagina, net als bij alle andere thema's.",
  fix_empty_custom_address_layout:
    'Een aangepaste adresindeling zonder bruikbare velden wist je adres niet langer. Het verwijderen van alle velden uit de aangepaste indeling in Design verwijderde voorheen je adres volledig uit je cv en PDF zonder uitleg op het scherm. KiwiCV valt nu automatisch terug op de standaardindeling voor jouw land.',
  fix_footer_date_round_trip:
    'Het uitschakelen van de datum in de voettekst van je cv blijft nu behouden na exporteren en opnieuw importeren. Een handmatig ingevoerde datum blijft bovendien exact zoals je deze hebt getypt in plaats van te worden gewist.',
  fix_import_list_warnings:
    'Importwaarschuwingen omvatten nu ook lijsten. Wanneer KiwiCV een onleesbaar item moet weglaten uit de hoogtepunten van een baan, de vakken van een opleiding of de trefwoorden van een vaardigheid, worden het item en het veld vermeld in het importoverzicht in plaats van de lijst stilzwijgend in te korten.',
  fix_import_warning_headings:
    'Importwaarschuwingen vermelden nu het exacte onderdeel van je cv waar ze vandaan komen, inclusief je persoonlijke gegevens, in plaats van een interne code te tonen.',
  fix_imported_list_fields:
    'Een cv-bestand met afwijkende opsommingslijsten verstoort je voorbeeld niet langer. Als een geïmporteerd JSON-bestand de hoogtepunten van een baan, de vakken van een opleiding of de trefwoorden van een vaardigheid als één tekstregel opsloeg in plaats van als lijst, stopten het voorbeeld en de PDF volledig met weergave. KiwiCV leest nu wat mogelijk is en slaat de rest zonder fouten over.',
  fix_imported_text_fields:
    "Contactgegevens in het verkeerde formaat beschadigen je cv niet langer. Als in een geïmporteerd bestand je naam, website, telefoonnummer of woonplaats anders dan als platte tekst was opgeslagen, kon de weergave van het voorbeeld of de PDF volledig stoppen. KiwiCV leest nu wat mogelijk is en verwijdert overbodige spaties rond je naam en adres, zodat thema's die de naam over twee regels verdelen geen lege eerste regel meer tonen.",
  fix_imported_theme_name:
    'Een cv dat is geïmporteerd met een onbekende themanaam toont nu al zijn secties in plaats van bijna leeg te verschijnen.',
  fix_missing_sections_single_column:
    "Secties die je hebt ingevuld na het herorganiseren van je indeling verdwijnen niet langer bij thema's met één kolom: elke sectie met inhoud verschijnt in het voorbeeld en de geëxporteerde PDF.",
  fix_pdf_special_characters:
    'Speciale tekens en links in je cv worden nu betrouwbaar geëxporteerd in de pdf van elk thema.',
  fix_preview_pdf_parity:
    "Wat je ziet, komt nu overeen met wat je exporteert. Hernoemde sectiekoppen, themaspecifieke details, de pictogrammen daarnaast en projectsecties in verschillende tweekoloms thema's konden verschillen tussen de weergave op het scherm en de geëxporteerde PDF – de twee worden nu identiek weergegeven.",
  fix_reload_repairs_cv:
    'Het herladen van de editor repareert nu automatisch beschadigde of oude CV-bestanden direct, wat mogelijke crashes bij het voorvertonen en exporteren voorkomt.',
  fix_signature_footer:
    "De voettekst voor de handtekening is hersteld: deze laat nu ruimte over om daadwerkelijk te ondertekenen, voegt geen lege eindpagina meer toe aan langere cv's en verschijnt op de thema's Elegant, Plain en Plain 2 die deze voorheen misten.",
  fix_stackoverflow_page_breaks:
    'Handmatige pagina-einden werken weer in het thema Stack Overflow. Het instellen van een pagina-einde voorkwam voorheen dat de PDF überhaupt werd gegenereerd; het voorbeeld en de export springen nu precies op de door jou gekozen plek naar een nieuwe pagina.',
  fix_theme_fonts:
    'Elegant, Timeless en JavaScript worden in het voorbeeld nu weergegeven met de lettertypen waarvoor ze zijn ontworpen. Het voorbeeld viel voorheen terug op een generiek systeemlettertype en de PDF van Timeless werd geëxporteerd met een ander lettertype; alle drie zien er op het scherm nu exact zo uit als in het einddocument.',
  fix_two_column_stray_breaks:
    "Bij de thema's Lunar, Misty en Swiss Grid neemt een sectie waarvan je alle items hebt verborgen haar handmatige pagina-einde niet langer mee naar de geëxporteerde PDF, waardoor er geen lege kolom meer ontstaat waar de sectie stond.",
  other_discord_community:
    'KiwiCV heeft nu een Discord-community — een plek om feedback uit te wisselen, sjablonen aan te vragen en elkaar te steunen bij het zoeken naar een baan. Een link staat klaar in de voettekst en op de landingspagina.',
  other_export_no_google_fonts:
    'Het openen van een geëxporteerd HTML-cv maakt geen verbinding meer met Google voor het ophalen van lettertypen. Er wordt gebruikgemaakt van dezelfde lettertypebestanden die KiwiCV al meelevert, waardoor de pagina identiek wordt weergegeven zonder dat iemand anders te weten komt dat je deze hebt geopend.',
  other_import_clear_warning:
    'De importsamenvatting waarschuwt je nu duidelijk wanneer niet-tekstwaarden worden gewist uit velden die alleen tekst mogen bevatten, in plaats van ze stilletjes leeg te maken.',
  other_kiwicanopy_family:
    'Maak kennis met de rest van de KiwiCanopy-familie — KiwiCV linkt nu naar KiwiCanopy en KiwiDesk vanaf de Over-pagina.',
};
