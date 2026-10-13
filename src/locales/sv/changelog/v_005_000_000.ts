import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: '1-dagars Pass',
      content:
        'Osäker på om KiwiCV är något för dig? Det nya 1-dagars Pass låser upp alla AI-funktioner för din nästa ansökan, så att du kan ta reda på det innan du binder dig till ett längre Pass. Priskorten erbjuder nu 1, 7 och 30 dagar.',
      title: 'Testa i en dag',
    },
    open_source: {
      badge: 'Öppen källkod',
      content:
        'Varje rad av KiwiCV är nu offentlig på GitHub under AGPL. Se exakt hur ditt CV hanteras, rapportera ett fel eller föreslå en funktion: koden bakom integritetslöftena finns där för vem som helst att granska.',
      title: 'KiwiCV är öppen källkod',
    },
  },
  feat_ai_review_calmer:
    'Det är lugnare att granska AI-förslag. Färdigheter och Språk får nu granskningspanelen på varje post, fälten som ett förslag skrev om förblir skrivskyddade tills du väljer ”Behåll min” eller ”Använd förslaget”, och Förbättra väntar tills du har bestämt dig, så en andra körning kan inte ersätta ett förslag du inte har sett. Skärmläsare meddelar varje beslut.',
  feat_ai_tailoring_keeps_facts:
    'När du anpassar ditt CV till en jobbannons lämnas dina titlar, arbetsgivare, datum och listade färdigheter nu orörda. En färdighet som ditt CV aldrig nämner markeras med ”Finns inte i ditt CV — godkänn bara om det stämmer”, så att du bestämmer innan den hamnar där.',
  feat_raw_data_extra_blocks:
    'Sidan Rå-JSON listar nu extra data som en importerad fil har med sig, till exempel ett annat verktygs inställningsblock. Öppna ett block för att läsa dess JSON, eller ta bort de du inte längre vill ha i dina exporter.',
  fix_dates:
    'Datum med dagen först, som 05.06.19, läses nu som 5 juni, inte 6 maj. Ett datum som inte finns, som 31.02.2019, blir kvar som du skrev det och får den röda felmarkeringen.',
  fix_drive_reconnect:
    'Att koppla Google Drive igen blir nu alltid klart, slår på säkerhetskopiering och börjar med en riktig uppladdning.',
  fix_photos:
    'Foton i ett importerat CV förlorar sina kameradata, inklusive GPS-platsen, och GIF-, HEIC- och AVIF-foton blir JPEG. Foton med transparent bakgrund förblir vita efter beskärning i stället för att bli svarta.',
  fix_preview_pdf_match:
    'Din liveförhandsvisning och din PDF stämmer nu bättre överens i Soft, Misty, Skyline, Swiss Grid, Lunar och Elegant: samma versaler, tidslinjer, typsnitt och länkar. Förhandsvisningen hämtar inte längre typsnitt från en tredjepartsserver, och en PDF:s titel och författare innehåller bara ditt namn.',
  fix_privacy_controls:
    'Du bestämmer vad som stannar på den här enheten. Inloggning med Google ber bara om varaktig åtkomst när du kopplar Google Drive. Korten för Google Drive och GitHub i Inställningar erbjuder alltid Koppla från, när du loggar ut eller raderar ditt konto kan du också ta bort GitHub-kopplingen, och ditt textprov stannar hos kontot som sparade det.',
  fix_privacy_policy:
    'Integritetspolicyn är omskriven. Den listar vad KiwiCV sparar om dina AI-förfrågningar (aldrig din text), anger din rätt att invända och hur du återkallar ditt samtycke, och namnger varje tjänst som är inblandad och var den körs.',
  fix_small_things:
    'Att vrida en surfplatta med sidomenyn öppen blockerar inte längre tryck, den flytande knappen Förhandsgranska täcker inte längre mobilmenyn, en flik som lämnats öppen under en uppdatering laddas om till den nya versionen, och ett CV som är för långt att översätta avvisas direkt i stället för att misslyckas efter lång väntan.',
  ui_editor_polish:
    'Tillbaka? Startsidan säger nu Fortsätt redigera, och Skapa ditt CV öppnas direkt på dina personuppgifter. I följebrevet ligger Ämne och Datum ovanför brevtexten, och Mottagare öppnas när det finns en adressat. Förbättra syns kvar i ett tomt avsnitt med ett tips om vad du bör lägga till först, och AI:s teckenräknare blir bärnstensfärgade före gränsen.',
  ui_informal_address_more_languages:
    'Spanska, nederländska, ryska, ukrainska och bulgariska tilltalar dig nu informellt i hela appen, precis som de andra språken.',
  ui_install_app:
    'Använd KiwiCV som en app: Inställningar → App-gränssnitt har nu en knapp Installera KiwiCV, och på iPhone och iPad får KiwiCV en riktig ikon när du lägger till det på hemskärmen.',
};
