import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Egna avsnitt',
      content:
        'Ditt CV är inte längre begränsat till standardavsnitten. Lägg till egna — Konferenser, Viktigaste prestationer, allt som berättar din historia —, fyll i dem som vilket avsnitt som helst, så passar de varje design, i förhandsgranskningen och i PDF:en. "Förbättra med AI" och översättning fungerar på dem också.',
      title: 'Egna avsnitt',
    },
  },
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  feat_custom_sections:
    'Lägg till egna avsnitt i ditt CV — Konferenser, Viktigaste prestationer eller allt som standardavsnitten inte täcker. "Lägg till avsnitt" hittar du längst ned i avsnittslistan: ge avsnittet en titel och fyll det med poster som vilket annat avsnitt som helst — namn, datum, länk, sammanfattning och höjdpunkter. Egna avsnitt passar in i varje design, i förhandsgranskningen och i PDF:en, och kan flyttas mellan kolumner i layoutredigeraren som alla andra. "Förbättra med AI" fungerar på dem och på var och en av deras poster, och när du översätter ditt CV översätts även deras titlar och poster.',
  feat_json_round_trip:
    'Att importera en CV-fil från ett annat verktyg kastar inte längre bort det KiwiCV inte kan visa. Extra block i filen samt dina projekts roller och nyckelord sparas med ditt CV och kommer tillbaka oförändrade när du exporterar det eller säkerhetskopierar det till Google Drive eller ett privat GitHub-arkiv. De syns aldrig i ditt CV och når aldrig AI:n, och importen talar om vilka block den behöll.',
  feat_privacy_by_design:
    'KiwiCV fortsätter att forma sina arbetsflöden kring din integritet. Ett GitHub-arkiv som vem som helst kan läsa — offentligt eller publicerat med GitHub Pages — får nu bara det ditt CV visar: dolda poster, adressdelar du utelämnat och ditt personliga brev hålls utanför. Ett privat arkiv behåller den kompletta säkerhetskopian, och anslutningsdialogen talar om vilket som gäller. Foton i en importerad CV-fil förlorar sina kamerametadata, inklusive GPS-position, innan de sparas.',
  fix_hidden_entries_stay_hidden:
    'Det du döljer förblir dolt. Att redigera, flytta, sortera eller ta bort en annan post kunde få en dold post att dyka upp igen, och det kunde även en AI-omorganisering av dina färdigheter eller exempelförhandsgranskningen av ett tomt CV. Samma åtgärder godtar inte längre i det tysta ett AI-förslag som du ännu inte har svarat på.',
  fix_keyboard_screen_reader:
    'Smidigare med tangentbord och skärmläsare: en ny första post öppnas direkt, nätverksfältet fungerar som en riktig lista och knappar läses upp med sitt namn.',
  fix_language_polish:
    'Språkputsning i hela appen: rättade avsnittsrubriker på italienska, bulgariska, turkiska och portugisiska, ett prickigt stort İ i turkiska CV:n, de sista engelska skärmarna översatta och riktigt exempelinnehåll i ett tomt CV på tolv språk.',
  fix_reduced_json_hides_sections:
    'Den "Reducerade" JSON:en på sidan Rå-JSON utelämnar nu allt som ditt CV döljer — ett helt avsnitt du har dolt och ett profilfoto du har dolt —, liksom de adressdelar som ditt CV utelämnar och projektfält som bara sparats från en importerad fil.',
};
