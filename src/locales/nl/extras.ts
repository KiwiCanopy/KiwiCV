import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV is een van de meerdere tools die zijn gebouwd onder de paraplu van KiwiCanopy. Ontdek de rest van de familie.',
    family_title: 'Onderdeel van de KiwiCanopy-familie',
    kiwicanopy_desc: 'Thuisbasis van de KiwiCanopy-familie, waar alle tools samenwonen.',
    kiwidesk_desc: 'Een zuster-app binnen de KiwiCanopy-familie.',
    story_p1:
      'Of het nu voor mezelf was of in gesprek met vrienden en kennissen – ik heb keer op keer dezelfde frustratie ervaren: het moeizame herschrijven van het cv voor elke nieuwe sollicitatie. Iedereen wil zijn ervaringen specifiek afstemmen op de betreffende functie, zonder dat het cv direct overladen overkomt. Maar traditionele tools maken precies dat tot een kwelling: voor elke kleine aanpassing moet vaak een volledig nieuw document worden aangemaakt, wat snel eindigt in een eindeloze versie-chaos.',
    story_p2:
      'Juist om die reden heb ik KiwiCV in het leven geroepen: een modulaire cv-bouwer waarbij je eenvoudig individuele onderdelen aan- en uit kunt vinken, secties vrij kunt verplaatsen en flexibel kunt exporteren – allemaal vanuit één centraal overzicht. Geen lastig gekopieer en geplak meer tussen talloze Word-documenten. Je gehele carrièrehistorie krijgt een vast thuis, en jij kiest voor elke sollicitatie ontspannen alleen datgene uit wat je op dat moment wilt laten zien.',
    story_title: 'Het verhaal achter KiwiCV',
    title: 'Over KiwiCV',
    visit_site: 'Website bezoeken',
  },
  howto: {
    core: {
      ai_assistant: 'AI-assistent',
      ai_assistant_desc:
        'Gebruik de AI-assistent om items, secties of je hele cv te optimaliseren. Zoek naar het {wardsymbol}-icoon!',
      hide_show: 'Verbergen/Tonen',
      hide_show_desc:
        'Om te voorkomen dat je items constant moet verwijderen en opnieuw moet invoegen, kun je items of hele secties met één klik verbergen.',
      move_items_desc: 'Versleep secties of individuele items tussen de zijbalk en de hoofdkolom.',
      page_breaks: 'Pagina-einden',
      page_breaks_desc:
        'Voeg handmatige pagina-einden in zodat je PDF-export er precies zo uitziet als je wilt. Dit heeft alleen invloed op de PDF, niet op de webversie.',
      rearrange: 'Herschikken',
      rearrange_desc:
        'Rangschik items binnen een sectie om de focus te leggen op wat je wilt benadrukken.',
      switch_sides: 'Kolommen wisselen',
      switch_sides_desc:
        'Wissel eenvoudig de hoofdkolom en de zijbalk om de beste lay-out te vinden.',
      title: 'Kernfuncties',
    },
    footer: {
      message: 'We hopen dat het schrijven van je cv leuker wordt met KiwiCV! Veel succes!',
    },
    github: {
      create_pat_link: 'Token maken op GitHub',
      create_repo_link: 'Repository aanmaken op GitHub',
      go_to_settings: 'Naar Instellingen',
      intro:
        'Koppel je cv aan een GitHub-repository voor automatische meertalige verwerking, versiebeheer en eenvoudige hosting. Volg deze drie stappen:',
      pat_security_tip:
        "Beveiligingstip: Gebruik een 'Fine-grained' Personal Access Token met alleen lees/schrijftoegang tot 'Contents' voor je specifieke repository. Vergeet niet 'Only select repositories' te selecteren en je gewenste vervaldatum in te stellen.",
      step1_desc:
        'Maak een nieuwe privé-repository op GitHub. Je kunt deze voorlopig helemaal leeg laten (geen README en geen .gitignore nodig).',
      step1_title: 'Een repository maken',
      step2_desc:
        'Je hebt een Personal Access Token (PAT) nodig om KiwiCV naar je repository te laten pushen. Voor maximale beveiliging raad ik een fine-grained token aan.',
      step2_title: 'Een Personal Access Token maken',
      step3_desc:
        'Ga naar de Instellingen pagina en voer je repository details en token in de GitHub sectie in. Je kunt ook op de GitHub knop rechtsboven klikken om een formulier te openen waar je ook je PAT kunt invoeren.',
      step3_title: 'Verbinden in KiwiCV',
      title: 'GitHub Connectie Gids',
    },
    hosting: {
      automated_title: 'Optie B: Geautomatiseerde hosting (via GitHub)',
      github_pages_desc:
        'Gebruik het HTML-bestand gegenereerd door KiwiCV en upload het naar een GitHub-repository. Schakel GitHub Pages in de repository-instellingen in om een gratis openbare URL voor je cv te krijgen.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Je kunt de gegenereerde HTML-versie van je cv gratis hosten. Hier zijn de meest voorkomende opties:',
      manual_title: 'Optie A: Handmatige upload (geen GitHub vereist)',
      netlify_desc:
        'Diensten zoals Netlify of Vercel bieden gratis statische hosting com eenvoudige drag-and-drop-implementatie of automatische synchronisatie met je GitHub-repository. Je kunt daar je HTML-cv uploaden zonder de bewerkingsgeschiedenis bloot te leggen.',
      netlify_drop_desc:
        'Stel je concurrentievoordeel veilig met een persoonlijke URL. Er zijn veel **gratis aanbieders** waar je je CV **binnen enkele seconden** online kunt zetten. Of het nu via de hierboven gelinkte tool is of via alternatieven zoals [Tiiny.host](https://tiiny.host): een snelle **drag-and-drop** van je website is alles wat nodig is om een professionele aanwezigheid op het web te hebben.',
      netlify_drop_title: 'Snel en gemakkelijk: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        'Let op: Tenzij je een betaald GitHub-abonnement hebt, moet je je repository openbaar maken om GitHub Pages te gebruiken. Hierdoor is je volledige cv-geschiedenis (alle commits) voor iedereen zichtbaar! Indien privacy belangrijk is, kies dan de eerste optie.',
      push_folder_hint:
        'KiwiCV ondersteunt expliciet het uitsluitend pushen van het HTML-bestand naar een specifieke map in je repository. Bekijk de geavanceerde instellingen op de voorbeeldpagina.',
      sensitive_data_warning:
        'Privacywaarschuwing: Als je je cv op een openbare URL host, heeft iedereen toegang tot je gegevens. Overweeg om zeer gevoelige persoonlijke informatie, zoals je exacte adres, telefoonnummer en e-mailadres, te verwijderen.',
      title: 'Je cv hosten',
    },
    pdf_guide: {
      font_size: 'Lettergrootte',
      font_size_desc:
        'Pas de lettergrootte aan in het tabblad Ontwerp om de ruimte te optimaliseren.',
      intro:
        'PDF-rendering is complex. Experimenteer met de volgende functies tot je document aan je wensen voldoet:',
      rearrange_sections: 'Herschikken',
      rearrange_sections_desc: 'Secties herschikken kan onhandige pagina-einden voorkomen.',
      space_opt: 'Ruimte optimaliseren',
      space_opt_desc: 'Een korte sectie naar de zijbalk verplaatsen kan ruimte vrijmaken.',
      title: 'PDF-lay-outtips',
      use_pagebreaks: 'Pagina-einden gebruiken',
      use_pagebreaks_desc:
        'Items dicht bij de rand kunnen soms slecht renderen. Gebruik pagina-einden om ze netjes te verplaatsen.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Het wisselen van taal activeert een controle om te zien of er al een versie in de cloud bestaat.',
      auto_recognition_title: 'Automatische herkenning',
      desc: 'KiwiCV beheert meerdere talen. Wanneer je opslaat of een back-up maakt, maakt de app een versie aan specifiek voor de actieve taal. Later herkent de app bestaande back-ups om ze te herstellen.',
      language_specific_desc:
        'Elke taalversie wordt als een afzonderlijk item opgeslagen in je cloud-repository.',
      language_specific_title: 'Taalspecifiek',
      title: 'Intelligente taalback-ups',
    },
    toc_title: 'INHOUDSOPGAVE',
  },
  page_description:
    'Achtergrond, ondersteuning en visie: ontdek hoe je optimaal gebruik kunt maken van KiwiCV, waar de reis naartoe gaat en het verhaal achter je cv-maker.',
  page_title: "Extra's",
  tabs: {
    about: 'Over KiwiCV',
    changelog: 'Changelog',
    howto: 'Handleidingen',
    roadmap: 'Routekaart',
  },
};
