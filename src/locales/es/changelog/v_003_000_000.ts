import type { Translations } from '@/locales/en';

export const v_003_000_000: Translations['changelog']['entries']['v_003_000_000'] = {
  _highlights: {
    'ai-import': {
      badge: 'Importación IA',
      content:
        'Importa tu currículum aquí. Una vez cargado, este botón se convierte en tu potente asistente de IA para optimizar tu CV. Atento al {wardsymbol} en la aplicación.',
      title: 'Importación y Asistente IA',
    },
    'google-drive': {
      badge: 'Sincronización Cloud',
      content:
        'Sincroniza tu CV sin problemas con Google Drive para acceder fácilmente desde cualquier lugar.',
      title: 'Integración con Google Drive',
    },
    webhosting: {
      badge: 'Webhosting',
      content: 'Aprende a publicar tu CV como un sitio web personal en solo unos minutos.',
      title: 'Alojamiento web sencillo',
    },
  },
  feat_ai_import_assistant:
    '¡Una nueva forma de empezar! KiwiCV ahora permite importar el contenido del currículum con la ayuda de LLM externos directamente desde el editor. Esta función, antes limitada al recorrido de bienvenida, ahora está disponible para todos, lo que permite una transición fluida desde un simple prompt hasta un currículum con un estilo perfecto.',
  feat_brand_contact_modal:
    '¡Ponte en contacto! Se ha añadido un nuevo formulario de contacto para que sea aún más fácil compartir comentarios, informar de problemas o sugerir nuevas funciones directamente a KiwiCV.',
  feat_deletion_prevention:
    'Se agregaron avisos de confirmación para la eliminación de elementos en todas las secciones para evitar la pérdida accidental de datos.',
  feat_google_drive_sync:
    '¡Ya está aquí la sincronización con Google Drive! KiwiCV ahora admite la sincronización segura con tu Google Drive personal, lo que ofrece aún más flexibilidad para mantener tus datos sincronizados en todos tus dispositivos. El motor de sincronización se ha rediseñado por completo para admitir varios proveedores simultáneamente, todo ello manteniendo tus datos estrictamente bajo tu control para una máxima privacidad.',
  feat_language_aware_restore:
    'Descubrimiento inteligente en la nube. Ya sea que inicies una restauración en los ajustes, inicies sesión con Google Drive o vuelvas a configurar tu conexión de GitHub, KiwiCV identifica de forma inteligente las copias de seguridad disponibles en segundo plano. Así, puedes restaurar con un solo clic la versión de idioma exacta que necesites.',
  feat_localized_language_display:
    'Localización mejorada. Los selectores de idioma del CV ahora se traducen a tu idioma de interfaz actual, mientras que la selección del idioma de la interfaz permanece en su forma nativa para una mejor accesibilidad.',
  feat_robust_manual_import:
    'Importación manual robusta. Aunque KiwiCV ahora ofrece su propio modelo de IA seguro para la importación de currículums, seguimos mejorando las funciones que apoyan la independencia de nuestros usuarios. Copia directamente tu currículum desde cualquier chat de IA (como el Gemini o el ChatGPT): nuestro importador ahora identifica y limpia automáticamente artefactos molestos como etiquetas de citas o bloques de Markdown.',
  fix_design_tab_overflow:
    'Mejor manejo de desbordamientos y selección de temas centrada en la pestaña de diseño para una experiencia más equilibrada y accesible en todos los dispositivos.',
  fix_intelligent_address_cc:
    'Formato de dirección inteligente. KiwiCV ahora oculta de forma inteligente el código de país en los currículums nacionales. El país solo aparece cuando tu ubicación difiere del idioma principal del currículum, lo que garantiza una presentación más limpia y profesional.',
  fix_pagebreaks_reset_on_edit:
    'Se corrigió un problema en el que los saltos de página manuales se restablecían involuntariamente al editar el contenido del currículum. Tu diseño personalizado ahora se mantiene exactamente como lo configuraste.',
  fix_project_keywords_cleanup:
    'Limpieza de datos redundantes. Eliminados los campos de palabras clave no funcionales de las secciones de Proyectos y Proyectos privados.',
  other_language_polish:
    'Perfeccionado para una audiencia global. Se han refinado las redacciones en varios idiomas para que los flujos de trabajo de creación de currículums sean más intuitivos y fáciles de navegar para todos.',
  perf_high_growth_optimization:
    'Diseñado para la excelencia. KiwiCV ha introducido importantes mejoras de rendimiento internas para garantizar una experiencia fluida y con capacidad de respuesta a medida que la plataforma sigue evolucionando.',
  refactor_language_certificate:
    'Se cambió el nombre de la clave JSON `languages.fluency` a `certificate` para reflejar mejor su propósito, con un respaldo heredado para la compatibilidad con versiones anteriores.',
  refactor_sync_organization:
    "Refinado para mayor coherencia. La carpeta de almacenamiento en la nube ha sido renombrada de 'backup' a 'backups' para alinearse perfectamente con la estructura de datos de KiwiCV. El soporte para carpetas heredadas permanece activo, lo que garantiza que tus datos existentes se sigan identificando y sincronizando correctamente.",
  ui_enhancements:
    'Elevando la experiencia de creación de currículums. Hemos introducido mejoras integrales en la interfaz de usuario y refinamientos en el diseño para que KiwiCV sea más intuitivo, accesible y fácil de navegar en todos los idiomas compatibles.',
  ui_improved_extras_section:
    "Actualización completa del manual. La sección 'Cómo hacerlo' ha sido rediseñada con nuevos consejos de diseño, dominio de los saltos de página y guías inteligentes de copia de seguridad en varios idiomas.",
  ui_multi_cloud_interface:
    'Gestión multi-nube sin interrupciones. La interfaz de usuario se ha refinado para gestionar con elegancia varios servicios de sincronización a la vez, ofreciendo una visión clara e intuitiva del estado de sincronización de tus datos.',
  ui_refined_experience:
    'Experiencia de usuario refinada. Se han implementado mejoras sutiles en la interfaz de usuario y ajustes de diseño en toda la plataforma para garantizar un proceso de creación de currículums más pulido e intuitivo.',
  ui_swedish_support:
    '¡Välkommen! KiwiCV ya es compatible oficialmente con el sueco. Disfruta de una experiencia totalmente localizada, desde el editor hasta tu currículum exportado.',
};
