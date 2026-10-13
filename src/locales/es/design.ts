import type { Translations } from '@/locales/en';

export const design: Translations['design'] = {
  address_schema_active_fields: 'Campos activos (Arrastrar para reordenar)',
  address_schema_apply_template: 'Aplicar plantilla',
  address_schema_available_fields: 'Campos disponibles (Haz clic para incluir)',
  address_schema_desc:
    'Formatea la distribución del bloque de dirección y sus separadores de forma independiente al idioma del currículum.',
  address_schema_mode_custom: 'Personalizado',
  address_schema_mode_default: 'Según idioma',
  address_schema_mode_default_desc:
    'El esquema se adapta automáticamente al idioma de tu currículum. Si este difiere del idioma de visualización establecido, también se añade el código de país. Para obtener más opciones de personalización, elige "{customLayout}".',
  address_schema_mode_label: 'Modo de diseño',
  address_schema_no_active_fields:
    'No hay campos activos. Haz clic en los campos de abajo para agregarlos.',
  address_schema_preset_european: 'Estilo europeo',
  address_schema_preset_us_ca: 'Estilo US/CA',
  address_schema_restore: 'Restablecer valores predeterminados',
  address_schema_separator_comma: 'Coma',
  address_schema_separator_dash: 'Guion',
  address_schema_separator_space: 'Espacio',
  address_schema_title: 'Gestión del esquema de dirección',
  address_schema_toggle_separator: 'Alternar separador entre coma y espacio',
  bold_header: {
    desc: 'Elige qué detalles deben mostrarse como encabezado en negrita (línea principal)',
    title: 'Modo de encabezado en negrita',
  },
  color_chooser: 'Esquema de color',
  column_empty: 'Sin secciones',
  design_filter: {
    one_column: 'Una columna',
    two_column: 'Dos columnas',
  },
  empty_sections_subtitle:
    'Estas secciones aún están vacías. ¿Seguro que no quieres añadir nada? Cada detalle cuenta.',
  empty_sections_title: 'Secciones adicionales disponibles',
  example_section: 'Sección de ejemplo',
  formatting: 'formato',
  groups: {
    details: 'Detalles',
    layout: 'Diseño',
    typography: 'Tipografía',
  },
  layout_flip: 'Reflejar diseño',
  layout_main_column: 'Columna principal',
  layout_side_column: 'Columna lateral',
  layout_swap_tooltip: 'Mover a la otra columna',
  more_actions_named: 'Más acciones para «{{name}}»',
  page_break_add: 'Añadir salto de página',
  page_break_disabled_first: 'Salto de página no disponible para el primer elemento',
  page_break_disabled_hidden: 'Salto de página no disponible para secciones ocultas',
  page_break_removal_tooltip:
    'Eliminar el salto de página antes de esta sección (solo se aplica a la versión PDF)',
  page_break_remove: 'Eliminar salto de página',
  page_break_tooltip:
    'Añadir un salto de página antes de esta sección (solo se aplica a la versión PDF)',
  pdf_footer: {
    date: 'Incluir fecha',
    desc: 'Insertar la linea de firma, el lugar y la fecha en la parte inferior',
    location: 'Incluir ubicación',
    show: 'Mostrar pie de página',
    title: 'Pie de página PDF',
  },
  section_reordering: {
    hint: 'Las secciones aparecen en tu CV en este orden. Arrastra una fila por su asa para moverla.',
    hint_touch:
      'Las secciones aparecen en tu CV en este orden. Usa las flechas para mover una fila, o mantén presionada su asa y arrastra.',
    title: 'Orden de secciones',
  },
  swap_column_named: 'Mover «{{name}}» a la otra columna',
  template: 'Plantilla',
};
