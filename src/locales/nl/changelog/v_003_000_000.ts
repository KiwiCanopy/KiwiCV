import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'IA-import',
      content:
        'Importeer hier je CV. Eenmaal geladen, verandert deze knop in je krachtige IA-assistent voor optimalisatie. Let op het {wardsymbol} in de app.',
      title: 'Import & IA-assistent',
    },
    'google-drive': {
      badge: 'Cloud-sync',
      content: 'Synchroniseer je CV naadloos met Google Drive voor eenvoudige toegang overal.',
      title: 'Google Drive-integratie',
    },
    webhosting: {
      badge: 'Webhosting',
      content: 'Leer hoe je je CV binnen enkele minuten als persoonlijke website publiceert.',
      title: 'Eenvoudige Webhosting',
    },
  },
  feat_ai_import_assistant:
    "Een nieuwe manier om aan de slag te gaan! KiwiCV maakt het nu mogelijk om cv-inhoud te importeren met behulp van externe LLM's, rechtstreeks vanuit de editor. Deze functie, die voorheen beperkt was tot de introductietour, is nu voor iedereen beschikbaar — voor een naadloze overgang van een eenvoudige prompt naar een perfect gestyled cv.",
  feat_brand_contact_modal:
    'Neem contact op! Een nieuwe contactmodule is toegevoegd om het nog makkelijker te maken om feedback te delen, problemen te melden of nieuwe functies direct aan KiwiCV voor te stellen.',
  feat_deletion_prevention:
    'Bevestigingsvragen toegevoegd voor het verwijderen van items in alle secties om onbedoeld gegevensverlies te voorkomen.',
  feat_google_drive_sync:
    'Google Drive Sync is er! KiwiCV ondersteunt nu veilige synchronisatie met je persoonlijke Google Drive, wat nog meer flexibiliteit biedt om je gegevens op al je apparaten gesynchroniseerd te houden. De synchronisatie-engine is volledig vernieuwd om meerdere providers tegelijkertijd te ondersteunen — en dat alles terwijl je gegevens strikt onder jouw controle blijven voor maximale privacy.',
  feat_language_aware_restore:
    'Intelligente cloudontdekking. Of je nu een herstel start in de instellingen, inlogt via Google Drive of je GitHub-verbinding opnieuw instelt, KiwiCV identificeert intelligent de beschikbare back-ups op de achtergrond. Zo kun je met één klik precies de taalversie herstellen die je nodig hebt.',
  feat_localized_language_display:
    'Verbeterde lokalisatie. CV-taalkeuzeopties worden nu vertaald naar je huidige UI-taal, terwijl de UI-taalinstelling in de oorspronkelijke vorm blijft voor een betere toegankelijkheid.',
  feat_robust_manual_import:
    "Robuuste handmatige import. Hoewel KiwiCV nu zijn eigen veilige AI-model biedt voor het importeren van cv's, blijven we functies verbeteren die de onafhankelijkheid van onze gebruikers ondersteunen. Kopieer je cv rechtstreeks uit een AI-chat (zoals Gemini of ChatGPT) – onze importeur identificeert en reinigt nu automatisch storende artefacten zoals citatietags of Markdown-blokken.",
  fix_design_tab_overflow:
    'Betere verwerking van overloop en gecentreerde thema-selectie in het designtabblad voor een mehr evenwichtige en toegankelijke ervaring op alle apparaten.',
  fix_intelligent_address_cc:
    "Slimmere adresopmaak. KiwiCV verbergt nu op intelligente wijze de landcode voor binnenlandse cv's. Het land verschijnt alleen als je locatie afwijkt van de primaire taal van het cv, wat zorgt voor een strakkere en professionelere presentatie.",
  fix_pagebreaks_reset_on_edit:
    'Een probleem opgelost waarbij handmatige pagina-einden onbedoeld werden gereset na het bewerken van de inhoud. Je aangepaste lay-out blijft nu precies zoals je die hebt ingesteld.',
  fix_project_keywords_cleanup:
    'Opschoning van gegevens. Niet-functionele trefwoordvelden verwijderd uit de secties Project en Privéproject.',
  other_language_polish:
    'Geoptimaliseerd voor een wereldwijd publiek. De bewoordingen in verschillende talen zijn verfijnd om de cv-bouwprocessen voor iedereen intuïtiever en gemakkelijker navigeerbaar te maken.',
  perf_high_growth_optimization:
    'Ontworpen voor uitmuntendheid. KiwiCV heeft aanzienlijke prestatieverbeteringen onder de motorkap doorgevoerd om een vloeiende en responsieve ervaring te garanderen terwijl het platform zich blijft ontwikkelen.',
  refactor_language_certificate:
    'JSON-sleutel `languages.fluency` hernoemd naar `certificate` om het doel beter te weerspiegelen, met een legacy-fallback voor achterwaartse compatibiliteit.',
  refactor_sync_organization:
    "Verfijnd voor consistentie. De cloudopslagmap is hernoemd van 'backup' naar 'backups' om perfect aan te sluiten bij de gegevensstructuur van KiwiCV. De ondersteuning voor oude mappen blijft actief, zodat je bestaande gegevens correct geïdentificeerd en gesynchroniseerd blijven.",
  ui_enhancements:
    "Verbetering van de ervaring bij het maken van cv's. We hebben uitgebreide verbeteringen aan de gebruikersinterface en lay-outverfijningen geïntroduceerd om KiwiCV intuïtiever, toegankelijker en gemakkelijker te navigeren te maken in alle ondersteunde talen.",
  ui_improved_extras_section:
    "Uitgebreide handleiding-update. De sectie 'Hoe te gebruiken' is volledig vernieuwd met nieuwe lay-outtips, beheersing van pagina-einden en intelligente meertalige back-upgidsen.",
  ui_multi_cloud_interface:
    'Naadloos multi-cloud beheer. De gebruikersinterface is verfijnd om meerdere synchronisatiediensten tegelijkertijd elegant te beheren, met een duidelijk en intuïtief overzicht van de synchronisatiestatus van je gegevens.',
  ui_refined_experience:
    "Verfijnde gebruikerservaring. Subtiele UI-verbeteringen en lay-outaanpassingen zijn doorgevoerd op het hele platform om te zorgen voor een meer gepolijste en intuïtieve ervaring bij het bouwen van cv's.",
  ui_swedish_support:
    'Välkommen! KiwiCV ondersteunt nu officieel Zweeds. Geniet van een volledig gelokaliseerde ervaring, van de editor tot je geëxporteerde cv.',
};
