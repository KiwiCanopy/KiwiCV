import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: 'Pass van 1 dag',
      content:
        'Weet je niet zeker of KiwiCV iets voor je is? De nieuwe Pass van 1 dag ontgrendelt alle AI-functies voor je volgende sollicitatie, zodat je het kunt ontdekken voordat je kiest voor een langere Pass. De prijskaarten bieden nu 1, 7 en 30 dagen.',
      title: 'Probeer het een dag',
    },
    open_source: {
      badge: 'Open Source',
      content:
        'Elke regel van KiwiCV is nu openbaar op GitHub onder de AGPL. Bekijk precies hoe je cv wordt behandeld, meld een bug of stel een functie voor: de code achter de privacybeloften ligt er voor iedereen om te controleren.',
      title: 'KiwiCV is open source',
    },
  },
  feat_ai_review_calmer:
    'AI-voorstellen beoordelen gaat rustiger. Vaardigheden en Talen krijgen nu bij elk item het beoordelingspaneel, de velden die een voorstel heeft herschreven blijven alleen-lezen tot je „Mijn versie behouden” of „Voorstel gebruiken” kiest, en Verbeteren wacht tot je hebt besloten, zodat een tweede ronde geen voorstel kan vervangen dat je nog niet hebt gezien. Schermlezers kondigen elke beslissing aan.',
  feat_ai_tailoring_keeps_facts:
    'Je cv afstemmen op een vacature laat je functietitels, werkgevers, data en vermelde vaardigheden nu met rust. Een vaardigheid die je cv nergens noemt, wordt gemarkeerd met „Niet in je cv — accepteer alleen als het klopt”, zodat jij beslist voordat die erin komt.',
  feat_raw_data_extra_blocks:
    'De pagina Ruwe JSON toont nu extra gegevens die een geïmporteerd bestand heeft meegebracht, zoals het instellingenblok van een andere tool. Open een blok om de JSON te lezen, of verwijder de blokken die je niet meer in je exports wilt.',
  fix_dates:
    'Data met de dag eerst, zoals 05.06.19, worden nu gelezen als 5 juni, niet als 6 mei. Een datum die niet bestaat, zoals 31.02.2019, blijft staan zoals je hem typte en krijgt de rode foutmarkering.',
  fix_drive_reconnect:
    'Google Drive opnieuw koppelen wordt nu altijd afgerond, zet back-ups aan en begint met een echte upload.',
  fix_photos:
    "Foto's in een geïmporteerd cv verliezen hun cameragegevens, inclusief de GPS-locatie, en GIF-, HEIC- en AVIF-foto's worden JPEG. Foto's met een transparante achtergrond blijven na het bijsnijden wit in plaats van zwart te worden.",
  fix_preview_pdf_match:
    'Je live voorbeeld en je pdf komen nu beter overeen in Soft, Misty, Skyline, Swiss Grid, Lunar en Elegant: dezelfde hoofdletters, tijdlijnen, lettertypen en links. Het voorbeeld laadt geen lettertypen meer van een server van derden, en de titel en auteur van een pdf bevatten alleen je naam.',
  fix_privacy_controls:
    'Jij bepaalt wat er op dit apparaat blijft. Inloggen met Google vraagt alleen om blijvende toegang wanneer je Google Drive koppelt. De kaarten voor Google Drive en GitHub in Instellingen bieden altijd Ontkoppelen, bij uitloggen of het verwijderen van je account kun je ook de GitHub-koppeling laten verwijderen, en je schrijfvoorbeeld blijft bij het account dat het heeft opgeslagen.',
  fix_privacy_policy:
    'Het privacybeleid is herschreven. Het noemt wat KiwiCV bewaart over je AI-verzoeken (nooit je tekst), benoemt je recht van bezwaar en hoe je toestemming intrekt, en noemt elke betrokken dienst en waar die draait.',
  fix_small_things:
    'Een tablet draaien terwijl het zijmenu openstaat blokkeert tikken niet meer, de zwevende knop Voorbeeld bedekt het telefoonmenu niet meer, een tabblad dat tijdens een update openstond laadt opnieuw op de nieuwe versie, en een cv dat te lang is om te vertalen wordt vooraf geweigerd in plaats van na lang wachten te mislukken.',
  ui_editor_polish:
    'Terug? De startpagina zegt nu Verder bewerken, en Maak je CV opent direct op je persoonlijke gegevens. In de sollicitatiebrief staan Onderwerp en Datum boven de brieftekst en gaat Ontvanger open zodra er een geadresseerde is. Verbeteren blijft zichtbaar in een lege sectie, met een tip over wat je het eerst toevoegt, en AI-tekentellers worden amber vóór de limiet.',
  ui_informal_address_more_languages:
    'Spaans, Nederlands, Russisch, Oekraïens en Bulgaars spreken je nu overal in de app informeel aan, net als de andere talen.',
  ui_install_app:
    'Gebruik KiwiCV als een app: Instellingen → Applicatie heeft nu een knop KiwiCV installeren, en op iPhone en iPad krijgt KiwiCV een echt icoon wanneer je het aan je beginscherm toevoegt.',
};
