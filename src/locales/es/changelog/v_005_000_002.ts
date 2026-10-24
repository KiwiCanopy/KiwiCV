import type { Translations } from '@/locales/en';

export const v_005_000_002: Translations['changelog']['entries']['v_005_000_002'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fix_composer_translate_tick:
    'Después de que «Mejorar con IA» traduzca tu CV, la siguiente ejecución ya no lo traduce otra vez: «Traducir también mi CV» ahora se desactiva solo en cuanto llega la traducción.',
  fix_pending_bar_wraps:
    'En un editor estrecho, la barra de propuestas de IA por revisar ahora reparte sus botones en varias líneas, así que Descartar todo ya no se corta.',
  fix_skills_false_change:
    'Las habilidades que no has tocado ya no aparecen como modificadas tras Mejorar con IA o una traducción, y descartar los cambios de una traducción ya no devuelve tus habilidades al idioma anterior.',
  fix_skills_reorder_is_change:
    'Cuando Mejorar con IA solo reordena tus habilidades, ahora se te ofrece como un cambio que puedes revisar, con las habilidades movidas marcadas, en lugar de informar de «Sin cambios».',
  ui_composer_addon_summary:
    'Con la barra de IA cerrada en modo Profesional, los complementos que se ejecutarán junto con la mejora — como una traducción o una reestructuración de habilidades — ahora aparecen junto a Mejorar mi CV, y al hacer clic en ellos se abre la barra.',
  ui_export_closes_on_success:
    'Tras una exportación totalmente correcta, el cuadro de exportación ahora se cierra solo y un aviso lo confirma durante diez segundos. Si algún destino falla, el cuadro sigue abierto para que puedas reintentarlo.',
  ui_export_improve_apart:
    'Exportar y Mejorar mi CV ahora se distinguen mejor: Mejorar está al principio de la barra de IA y el botón Exportar de la cabecera ya no es verde. Cuando trabajas con una oferta de empleo o tus propias instrucciones, Mejorar espera a que la barra esté abierta, así nunca se ejecuta sobre un texto que no ves.',
  ui_page_break_toggle_on_row:
    'El botón de salto de página vuelve a estar en cada fila de sección de la pestaña Diseño, para que veas de un vistazo dónde empieza una nueva página del PDF.',
};
