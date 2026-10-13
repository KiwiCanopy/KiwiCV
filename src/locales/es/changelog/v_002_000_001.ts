import type { Translations } from '@/locales/en';

export const v_002_000_001: Translations['changelog']['entries']['v_002_000_001'] = {
  feat_whats_new_modal:
    "Mantente informado: Se ha añadido una ventana de 'Novedades' que destaca las últimas funciones y mejoras después de una actualización.",
  fix_html_preview_scrolling:
    'Se resolvió un problema por el cual el panel de vista previa HTML podía volverse no desplazable en ciertos navegadores.',
  fix_onboarding_tour_mobile_overlay:
    'Se resolvió un problema de posicionamiento por el cual la tarjeta del tour de bienvenida podía superponerse a los elementos destacados en pantallas pequeñas.',
  fix_sidebar_position_placeholders:
    'Se corrigió un error que impedía cambiar la posición de la barra lateral con datos de ejemplo.',
  fix_ui_header_action_bubbling:
    'Acciones del editor sin interrupciones: Alternar la visibilidad o añadir nuevos elementos en los encabezados de sección ya no activa expansiones o colapsos no deseados.',
  perf_ats_rendering_optimization:
    'Optimización ATS: el contenido de la columna principal ahora tiene prioridad para los lectores de pantalla en todos los temas de dos columnas.',
  refactor_backend_cleanup:
    'Limpieza del backend y metadatos eliminando claves obsoletas de los archivos JSON generados para una estructura de datos más ajustada.',
  refactor_package_upgrades:
    'Optimización interna importante con una actualización a Node 24 (desde Node 22) y Vite 8 para una experiencia más segura y moderna.',
  ui_interactive_3d_buttons:
    'Unificación de diseño: Se ha unificado el sistema de botones táctiles 3D en toda la aplicación para una sensación más coherente y de alta gama.',
  ui_section_field_ordering:
    'Campos del formulario del editor reorganizados para alinearse con la jerarquía visual del CV renderizado.',
};
