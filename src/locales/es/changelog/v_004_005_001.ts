import type { Translations } from '@/locales/en';

export const v_004_005_001: Translations['changelog']['entries']['v_004_005_001'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fix_month_year_dates:
    'Una fecha escrita como mes y año — 03/2019 o 03.2019 — ahora se guarda correctamente, así que la entrada se ordena donde corresponde en lugar de quedar al final como si no tuviera fecha.',
  fix_skills_reorg_empty:
    'Reorganizar tus habilidades con IA ya no puede dejar vacía la sección Habilidades. Si la IA no propone ninguna agrupación nueva, tus habilidades quedan exactamente como estaban, la ejecución no cuenta para tu límite diario y la carta de presentación redactada a la vez coincide con tu CV.',
  ui_entry_header_contrast:
    'Más fácil de leer en el editor: el puesto, las fechas y el marcador «Sin título» junto a cada entrada plegada ahora destacan con claridad en modo claro y oscuro.',
};
