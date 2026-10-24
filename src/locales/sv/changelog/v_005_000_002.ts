import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  fix_composer_translate_tick:
    'Efter att Förbättra med AI har översatt ditt CV översätter nästa körning det inte igen: ”Översätt även mitt CV” stänger nu av sig självt när översättningen är klar.',
  fix_pending_bar_wraps:
    'I en smal redigerare radbryter fältet med AI-förslag att granska nu sina knappar, så Kasta alla klipps inte längre av.',
  fix_skills_false_change:
    'Färdigheter som du inte har rört visas inte längre som ändrade efter Förbättra med AI eller en översättning, och när du kastar en översättnings ändringar hamnar dina färdigheter inte längre tillbaka på det gamla språket.',
  fix_skills_reorder_is_change:
    'När Förbättra med AI bara ändrar ordningen på dina färdigheter erbjuds det nu som en ändring att granska, med de flyttade färdigheterna markerade, i stället för att rapporteras som ”Oändrad”.',
  ui_composer_addon_summary:
    'När AI-fältet är stängt i läget Professionell nämns de tillägg som körs med — som en översättning eller en omstrukturering av färdigheter — nu bredvid Förbättra mitt CV, och ett klick på dem öppnar fältet.',
  ui_export_closes_on_success:
    'Efter en helt lyckad export stängs exportdialogen nu av sig själv, och ett meddelande bekräftar det i tio sekunder. Om någon destination misslyckas förblir dialogen öppen så att du kan försöka igen.',
  ui_export_improve_apart:
    'Exportera och Förbättra mitt CV är nu lättare att skilja åt: Förbättra sitter nu först i AI-fältet, och knappen Exportera i sidhuvudet är inte längre grön. När du arbetar utifrån en jobbannons eller egna instruktioner väntar Förbättra tills fältet är öppet, så att det aldrig körs på text du inte kan se.',
  ui_page_break_toggle_on_row:
    'Knappen för sidbrytning finns nu tillbaka på varje sektionsrad i fliken Design, så att du ser med en blick var en ny PDF-sida börjar.',
};
