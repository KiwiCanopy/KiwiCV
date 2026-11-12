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
  page_break_disabled_first: 'Salto de página no disponible para el primer elemento',
  page_break_disabled_hidden: 'Salto de página no disponible para secciones ocultas',
  page_break_named: 'Salto de página antes de «{{name}}»',
  page_break_removal_tooltip:
    'Eliminar el salto de página antes de esta sección (solo se aplica a la versión PDF)',
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
  signature: {
    add: 'Añadir firma',
    backup_delete_failed:
      'Tu firma se ha quitado de este dispositivo, pero no se pudo eliminar su copia de seguridad. Elimina tú mismo KiwiCV/signature/signature.json en Google Drive o signature/signature.json en GitHub.',
    backup_failed:
      'Tu firma está guardada en este dispositivo, pero no se pudo actualizar la copia de seguridad.',
    backup_github_history:
      'Al quitarla, se elimina de tu repositorio; las versiones anteriores de su historial la conservan.',
    backup_label: 'Guardar también una copia en {{targets}}',
    backup_note: 'Guardada en este dispositivo y en {{targets}}. Los PDF que creas la incluyen.',
    backup_unreachable:
      'Guardada en este dispositivo. Ahora mismo no se puede acceder a tu copia de seguridad. Los PDF que creas la incluyen.',
    change: 'Cambiar',
    commit_removed: 'Eliminar copia de la firma',
    commit_saved: 'Guardar copia de la firma',
    crop_description: 'Recorta, rota o voltea la imagen. Después se quita el fondo del papel.',
    crop_title: 'Recortar tu firma',
    device_note:
      'Guardada solo en este dispositivo, fuera de tus copias de seguridad y de la sincronización. Los PDF que creas la incluyen.',
    dialog_title: 'Tu firma',
    draw_hint: 'Dibuja con el ratón, el dedo o un lápiz.',
    draw_label: 'Área de dibujo para tu firma',
    edit_label: 'Cambiar firma',
    face_unavailable: 'Este estilo no puede mostrar todas las letras de este nombre.',
    footer_off: 'Aparece en el pie de página PDF, que está desactivado.',
    preview_alt: 'Tu firma',
    restore_found: 'Tu copia de seguridad tiene una firma guardada.',
    restore_use: 'Usarla',
    row_empty: 'No hay firma en este dispositivo',
    row_label: 'Firma',
    tab_draw: 'Dibujar',
    tab_type: 'Escribir',
    tab_upload: 'Subir',
    type_name: 'Nombre',
    type_style: 'Estilo',
    type_unavailable:
      'Los estilos manuscritos no pueden mostrar todas las letras de este nombre. Dibújalo o súbelo.',
    upload_another: 'Elegir otra',
    upload_choose: 'Elegir una imagen',
    upload_empty:
      'No se encontró ninguna firma en esta imagen. Un bolígrafo oscuro sobre papel blanco funciona mejor.',
    upload_hint:
      'Una foto o un escaneo sobre papel blanco. El fondo se quita en este dispositivo. También puedes pegar una imagen. Desde Vista Previa de macOS, exporta antes la firma como PNG.',
    upload_ready: 'Firma lista. Revísala y luego guarda.',
    upload_too_large: 'La imagen es demasiado grande (máx. {{size}} MB).',
    upload_unreadable: 'Este archivo no se puede leer como imagen. Prueba con PNG o JPG.',
    upload_working: 'Quitando el fondo…',
  },
  swap_column_named: 'Mover «{{name}}» a la otra columna',
  template: 'Plantilla',
};
