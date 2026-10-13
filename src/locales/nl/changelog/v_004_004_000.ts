import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'AI',
      content:
        'KiwiCV schrijft nu je sollicitatiebrief. Plak de vacaturetekst en ontvang een brief gebaseerd op het cv dat je al hebt opgebouwd — stel de lengte en toon in, of lever een voorbeeld van je eigen teksten aan zodat KiwiCV je eigen schrijfstijl overneemt. De brief verschijnt als voorstel dat je naast je concept kunt bekijken en alinea voor alinea kunt overnemen.',
      title: 'Sollicitatiebrieven, voor jou geschreven',
    },
  },
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  feat_ai_cover_letters:
    'Je sollicitatiebrief kan nu voor je worden geschreven op basis van een vacature en het cv dat je al hebt. Kies een lengte en toon, of geef een voorbeeld van je eigen teksten mee zodat KiwiCV die schrijfstijl aanhoudt. De brief komt binnen als voorstel dat je naast je concept kunt leggen en alinea voor alinea kunt accepteren — zowel bij een lege brief als wanneer je al begonnen was. Het onderdeel opent nu direct met de brief zelf in plaats van met vijf adresvelden voor een brief die je nog moest schrijven.',
  fix_ai_large_cv_wait:
    'Het verbeteren of vertalen van een groot CV stopt niet meer na een minuut met een foutmelding — de wachttijd groeit nu mee met de omvang van het CV.',
  fix_dates:
    'Datums gedragen zich weer zoals het hoort. Een ingevoerde datum kon buiten Europa een dag terugspringen, en een los jaartal kon het jaartal volledig kwijtraken; in de datumkiezer kon een toevallige klik aan de rand van het raster je ongemerkt naar de buurmaand of het buurjaar verplaatsen; en „Sorteer vermeldingen chronologisch” kon datums die met de dag beginnen zoals 15.03.2019 helemaal niet lezen, waardoor die vermeldingen onderaan belandden alsof ze geen datum hadden.',
  fix_keyboard_navigation:
    'Werken met het toetsenbord brengt je niet langer zomaar terug naar de bovenkant van de pagina. Het sluiten van een dialoogvenster brengt je terug naar de knop waarmee je het opende, het verwijderen van een item of een opgeslagen cv plaatst je op het volgende item, en het beantwoorden van een AI-suggestie houdt je precies waar je bezig was. Je profielfoto is nu ook volledig bereikbaar via het toetsenbord — het blok reageerde alleen op muisklikken, waardoor „Bewerken”, „Vervangen” en „Verwijderen” onbereikbaar waren.',
  fix_main_badge_overlaps_label:
    'De „main”-badge naast een veldlabel overlapt de labeltekst niet meer. Deze werd weergegeven in een vak met de afmetingen van een pictogram, waardoor een bredere badge buiten het vak viel en over de woorden ernaast liep.',
};
