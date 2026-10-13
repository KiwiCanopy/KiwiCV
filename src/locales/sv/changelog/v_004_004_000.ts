import type { Translations } from '@/locales/en';

export const v_004_004_000: Translations['changelog']['entries']['v_004_004_000'] = {
  _highlights: {
    ai_cover_letters: {
      badge: 'AI',
      content:
        'KiwiCV skriver nu ditt personliga brev. Klistra in jobbannonsen och få ett brev baserat på ditt befintliga CV — välj längd och ton, eller bifoga ett textprov så att KiwiCV fångar din egen stil. Brevet presenteras som ett förslag som du kan läsa bredvid ditt utkast och godkänna stycke för stycke.',
      title: 'Personliga brev, skrivna för dig',
    },
  },
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  feat_ai_cover_letters:
    'Ditt personliga brev kan nu skrivas åt dig utifrån en jobbannons och CV:t du redan har. Välj längd och ton, eller dela ett prov på ditt eget skrivande så matchar KiwiCV den stilen i stället. Brevet levereras som ett förslag som du kan läsa bredvid ditt utkast och godkänna stycke för stycke — oavsett om brevet är tomt eller redan påbörjat. Sektionen öppnas nu direkt på själva brevet i stället för fem mottagarfält för något du inte ens hade skrivit än.',
  fix_ai_large_cv_wait:
    'Att förbättra eller översätta ett stort CV avbryts inte längre med ett fel efter en minut — väntetiden växer nu med CV:ts storlek.',
  fix_dates:
    'Datumen fungerar som de ska igen. Ett datum du angav kunde flyttas bakåt en dag utanför Europa, och ett ensamt årtal kunde tappas bort helt; i datumväljaren kunde ett oavsiktligt klick nära rutnätets kant hoppa till angränsande månad och år utan förvarning; och "Sortera kronologiskt" kunde inte alls läsa datum med dagen först som 15.03.2019, vilket gjorde att dessa poster hamnade längst ner som om de saknade datum.',
  fix_keyboard_navigation:
    'Tangentbordsnavigering kastar dig inte längre upp till sidans början. När du stänger en dialogruta kommer du tillbaka till knappen du öppnade den från, när du tar bort en post eller ett sparat CV hamnar du på nästa, och när du besvarar ett AI-förslag stannar du kvar där du arbetade. Ditt profilfoto kan nu nås helt med tangentbordet — rutan svarade tidigare enbart på musklick, så "Redigera", "Ersätt" och "Ta bort" gick inte att nå.',
  fix_main_badge_overlaps_label:
    '"main"-brickan intill en fältetikett överlappar inte längre etikettens text. Den renderades inuti en ruta anpassad för en ikon, vilket gjorde att en bredare bricka svällde över och täckte orden bredvid.',
};
