import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  fix_month_year_dates:
    'Ett datum skrivet som månad och år — 03/2019 eller 03.2019 — sparas nu korrekt, så att posten sorteras där den hör hemma i stället för att hamna sist som om den saknade datum.',
  fix_skills_reorg_empty:
    'Att ordna om dina färdigheter med AI kan inte längre tömma avsnittet Färdigheter. När AI:n inte föreslår någon ny gruppering förblir dina färdigheter exakt som de var, körningen räknas inte mot din dagliga gräns och det personliga brevet som skrivs samtidigt stämmer med ditt CV.',
  ui_entry_header_contrast:
    'Lättare att läsa i redigeraren: rollen, datumen och platshållaren ”Namnlös” bredvid varje hopfälld post syns nu tydligt i ljust och mörkt läge.',
};
