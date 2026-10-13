import type { Translations } from '@/locales/en';

export const v_004_002_000: Translations['changelog']['entries']['v_004_002_000'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  feat_ai_composer:
    'Mejorar con AI ahora ocurre directamente en el editor. Elige si quieres adaptar tu CV a una oferta de trabajo, perfeccionar la redacción o dar tus propias instrucciones, consulta el coste antes de gastar nada y revisa cada sugerencia junto a tu texto original: nada se sobrescribe hasta que lo aceptas.',
  feat_cv_library:
    '«Mis CV» ahora es una página independiente. Cada versión guardada se muestra con su diseño, idioma y puesto objetivo, para que puedas encontrarla y restaurarla sin tener que abrir una ventana emergente primero.',
  feat_editor_section_rail:
    'El editor ahora muestra tus secciones a un lado en lugar de apilarlas en tarjetas que debes abrir una por una. Salta directamente a «Experiencia Laboral» o «Habilidades», consulta de un vistazo cuántas entradas tiene cada una y mantén tu posición mientras la vista previa permanece fija.',
  feat_export_single_trigger:
    'El diálogo de exportación ahora envía un CV a todos los destinos conectados en una sola ejecución: selecciona ZIP, GitHub y Google Drive a la vez en lugar de exportar tres veces, y observa cómo se confirma cada envío al finalizar.',
  fix_drive_reconnect_prompt:
    'Al abrir o recargar «Mis CV» ya no se te pide volver a conectar Google Drive. Tu conexión nunca se perdió —la página simplemente no la había verificado aún—, por lo que tus versiones están disponibles de inmediato en cualquier página en la que entres.',
  fix_language_switch_wait:
    'Cambiar el idioma de tu CV ya no genera incertidumbre. Mientras KiwiCV busca un CV en el nuevo idioma en tus servicios en la nube conectados, un breve diálogo de progreso te lo indica, y la solicitud de restauración o traducción aparece justo ahí, en lugar de interrumpirte segundos después.',
  ui_cover_letter_page:
    'Tu carta de presentación ahora se adapta perfectamente al diseño que elegiste. Cada tema estiliza el asunto a su manera —con un color de acento, versalitas o una etiqueta con borde— y tu firma se sitúa en la parte inferior de la página en lugar de quedar pegada tras un texto corto.',
};
