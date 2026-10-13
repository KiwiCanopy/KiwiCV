import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: 'Carta de presentación',
      content:
        'Las cartas de presentación llegan a KiwiCV. Escribe una carta con el diseño exacto de tu currículum y exporta ambos juntos como un paquete de solicitud impecable: se acabaron los documentos desparejados.',
      title: 'Cartas de presentación, perfectamente combinadas',
    },
  },
  chore_ai_model_upgrade:
    'La IA de KiwiCV ahora funciona con la generación Gemini más reciente de Google (Gemini 3.1) para ofrecer sugerencias notablemente mejores. La privacidad se mantiene sin cambios: el procesamiento permanece exclusivamente en la UE, cumple con el RGPD y tus datos nunca se utilizan para entrenar modelos de IA.',
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  feat_matching_cover_letters:
    'Crea una carta de presentación que combine con el diseño de tu currículum y exporta ambos juntos en un solo paquete de solicitud. Da formato al texto con negritas, cursivas y enlaces, elige entre un estilo clásico DIN 5008 o adaptado al tema, y muestra u oculta los bloques de remitente, destinatario y firma según cada puesto.',
  fix_design_settings_reset:
    'Tus ajustes de Design ahora se mantienen intactos mientras editas. La opción de encabezados en negrita para Experiencia Laboral y Educación, el diseño personalizado de dirección y la ruta de destino de GitHub se restablecían a sus valores por defecto al añadir, reordenar o editar cualquier elemento en una sección de lista, sin aviso ni opción de deshacer. Los encabezados de sección personalizados de un CV importado también conservan sus cambios tras cada edición.',
  fix_elegant_page_breaks:
    'Los saltos de página manuales ya funcionan en el tema Elegant. Marcar un salto no tenía efecto en el PDF exportado; ahora comienza una nueva página exactamente donde indicaste, como en los demás temas.',
  fix_empty_custom_address_layout:
    'Un diseño personalizado de dirección sin campos válidos ya no borra tu dirección. Eliminar todos los campos del diseño personalizado en Design eliminaba por completo la dirección de tu CV y de tu PDF sin mostrar ningún aviso explicativo. KiwiCV ahora utiliza el diseño estándar de tu país como alternativa.',
  fix_footer_date_round_trip:
    'Desactivar la fecha del pie de página del CV se mantiene tras exportar e importar de nuevo, y las fechas escritas manualmente se conservan exactamente como las pusiste en lugar de borrarse.',
  fix_import_list_warnings:
    'Los avisos de importación ahora incluyen las listas. Cuando KiwiCV debe omitir un elemento ilegible de los logros de un empleo, las asignaturas de una titulación o las palabras clave de una habilidad, indica el elemento y el campo en el resumen de importación en lugar de acortar la lista en silencio.',
  fix_import_warning_headings:
    'Los avisos de importación ahora muestran el nombre de la sección de tu CV de la que proceden, incluidos tus datos personales, en lugar de un código interno.',
  fix_imported_list_fields:
    'Un archivo de CV con listas de viñetas mal formateadas ya no bloquea la vista previa. Si un JSON importado guardó los logros de un empleo, las asignaturas de una titulación o las palabras clave de una habilidad como una sola línea de texto en lugar de una lista, la vista previa y el PDF dejaban de generarse. KiwiCV ahora lee los datos válidos y omite el resto sin errores.',
  fix_imported_text_fields:
    'Los datos de contacto con un formato incorrecto ya no dañan tu CV. Si un archivo importado guardó tu nombre, sitio web, teléfono o ciudad en un formato distinto a texto plano, la vista previa o el PDF podían dejar de funcionar. KiwiCV ahora lee lo que puede y elimina los espacios innecesarios alrededor de tu nombre y dirección para que los temas con nombres en dos líneas no muestren una primera línea en blanco.',
  fix_imported_theme_name:
    'Un CV importado con un nombre de diseño desconocido ahora muestra todas sus secciones en lugar de aparecer casi vacío.',
  fix_missing_sections_single_column:
    'Las secciones que rellenaste tras cambiar la estructura de tu diseño ya no desaparecen en los temas de una sola columna: cada sección con contenido se muestra en la vista previa y en el PDF exportado.',
  fix_pdf_special_characters:
    'Los caracteres especiales y los enlaces de tu currículum ahora se exportan con total precisión en el PDF de cualquier tema.',
  fix_preview_pdf_parity:
    'Lo que ves ahora coincide con lo que exportas. Los títulos de sección renombrados, los detalles específicos de cada tema, los iconos junto a ellos y las secciones de proyectos en varios temas de dos columnas podían diferir entre la vista previa en pantalla y el PDF exportado; ahora ambos se representan de forma idéntica.',
  fix_reload_repairs_cv:
    'Recargar el editor ahora repara automáticamente los archivos de CV dañados o antiguos sobre la marcha, evitando posibles errores en la vista previa y en la exportación.',
  fix_signature_footer:
    'El pie de página de la firma se ha corregido: ahora deja espacio para firmar, ya no genera una página final vacía en los CV más largos y aparece en los temas Elegant, Plain y Plain 2 en los que faltaba.',
  fix_stackoverflow_page_breaks:
    'Los saltos de página manuales vuelven a funcionar en el tema Stack Overflow. Añadir un salto impedía generar el PDF por completo; la vista previa y la exportación ahora saltan de página exactamente donde indicaste.',
  fix_theme_fonts:
    'Elegant, Timeless y JavaScript se muestran en la vista previa con sus tipografías originales. La vista previa utilizaba previamente una fuente genérica del sistema y el PDF de Timeless se exportaba con otra distinta; los tres temas se ven ahora en pantalla exactamente igual que en el documento final.',
  fix_two_column_stray_breaks:
    'En los temas Lunar, Misty y Swiss Grid, una sección con todos los elementos ocultos ya no traslada su salto de página manual al PDF exportado, evitando dejar una columna vacía donde estaba la sección.',
  other_discord_community:
    'KiwiCV ahora cuenta con una comunidad en Discord — un lugar para compartir impresiones, solicitar plantillas y apoyarse mutuamente durante la búsqueda de empleo. Encontrarás el enlace en el pie de página y en la página de inicio.',
  other_export_no_google_fonts:
    'Al abrir un CV en formato HTML exportado ya no se realizan peticiones a Google para cargar fuentes. Se utilizan los mismos archivos de tipografía incluidos en KiwiCV, ofreciendo una visualización idéntica sin que nadie más sepa que lo has abierto.',
  other_import_clear_warning:
    'El resumen de importación ahora te advierte claramente cuando se borran valores que no son de texto de los campos de solo texto, en lugar de vaciarlos silenciosamente.',
  other_kiwicanopy_family:
    'Conoce al resto de la familia KiwiCanopy: KiwiCV ahora incluye enlaces a KiwiCanopy y KiwiDesk desde la página Acerca de.',
};
