import type { Translations } from '@/locales/en';

export const v_002_000_000: Translations['changelog']['entries']['v_002_000_000'] = {
  _highlights: {
    'dashboard-view': {
      badge: 'Panel',
      content:
        '¡Ya no hay que alternar entre vista previa y editor! La nueva vista de panel lo une todo en una interfaz integrada de doble panel.',
      title: 'Panel todo en uno',
    },
  },
  feat_chronological_sort:
    'Cronología Inteligente: Ordena automáticamente cualquier sección que contenga campos de fecha cronológicamente con un solo clic.',
  feat_dashboard_available_sections_add:
    'Añade secciones previamente vacías con un solo clic directamente desde la pestaña de Diseño.',
  feat_dashboard_raw_json_tab_memory:
    'Las pestañas del panel y de JSON en bruto ahora recuerdan la vista seleccionada tras recargar',
  feat_design_direct_edit_hide:
    'Ahora es posible ocultar secciones individuales directamente desde la pestaña de orden de diseño o saltar directamente al editor para editarlas.',
  feat_flexible_layout:
    'Renovación del motor de plantillas — Actualización integral de todos los temas para admitir la colocación dinámica de secciones y la flexibilidad de diseño',
  feat_image_editor_reset: 'Ahora puedes restablecer los niveles de zoom y rotación por separado',
  feat_image_visibility_toggle: 'Posibilidad de ocultar la foto de perfil en el currículum',
  feat_layout_editor_hints:
    'Se agregaron sugerencias descriptivas para todas las secciones en el Editor de diseño para ayudarte a organizar tu contenido sin esfuerzo.',
  feat_layout_hints_sparkles:
    'Introducción de sugerencias de diseño (✨) en todos los formularios para indicar claramente los campos que solo son visibles en la columna principal',
  feat_manual_page_breaks:
    'Toma el control de tu diseño con saltos de página manuales para currículums de varias páginas perfectos',
  feat_mobile_support:
    'Crea desde cualquier lugar: Presentamos el soporte móvil. Crea y perfecciona tu currículum sobre la marcha con nuestra nueva interfaz optimizada para pantallas táctiles.',
  feat_sidebar_flip_transition:
    'Por fin tienes la posibilidad de elegir tú mismo la posición de la barra lateral en todos los diseños de dos columnas: izquierda o derecha, sin problema, con una animación de espejo fluida.',
  feat_social_profile_iconography:
    'Iconografía de perfiles sociales adaptada con precisión para los tipos GitHub, LinkedIn y Portfolio',
  feat_theme_miniatures:
    'Miniaturas de alta fidelidad: obtén una primera impresión perfecta de cada diseño antes de seleccionarlo.',
  fix_preview_loading_hang:
    'Sistema de renderizado de vista previa reforzado para evitar bloqueos de carga y manejar casos de borde complejos',
  fix_reduced_json_internal_ids:
    'Las exportaciones JSON reducidas ya no incluyen identificadores internos de visibilidad',
  ui_categorized_changelog:
    'Rediseño del registro de cambios con secciones categorizadas para una mejor legibilidad',
  ui_image_editor_visuals: 'Un look renovado para el editor de imágenes',
  ui_layout_column_filter:
    'La selección de plantillas es ahora más intuitiva con un nuevo filtro de diseño por columnas.',
  ui_localized_editor_placeholders:
    'Los marcadores de posición en el editor y la vista previa del currículum para currículums completamente vacíos ahora coinciden con el idioma del currículum en lugar del idioma de la interfaz',
};
