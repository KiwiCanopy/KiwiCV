import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: 'Ofertas de empleo',
      content:
        'Pega el enlace a la oferta en el cuadro de exportación cuando hagas una copia de seguridad de un CV en Google Drive o en un repositorio privado de GitHub, y ábrelo desde «Mis CV» siempre que lo necesites. Los repositorios públicos nunca reciben el enlace.',
      title: 'Recuerda dónde enviaste tu candidatura',
    },
  },
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  feat_cover_letter_style_default:
    'Con una muestra de redacción guardada, tus cartas de presentación ahora empiezan en «Adaptar a mi estilo de redacción», incluso en una pestaña nueva del navegador. Si eliges un tono, KiwiCV lo mantiene para esa pestaña.',
  feat_export_cmd_enter:
    'Pulsa Cmd+Intro (Ctrl+Intro en Windows) en el cuadro de exportación para iniciar la exportación sin tener que buscar el botón.',
  feat_export_cover_letter_switch:
    'El cuadro de exportación ahora muestra si tu carta de presentación está incluida, con un interruptor para añadirla u omitirla, y te avisa cuando la carta puede no coincidir con la oferta de empleo a la que acabas de adaptar tu CV, para que la revises antes de enviarla.',
  feat_job_posting_link:
    'Añade el enlace a la oferta cuando hagas una copia de seguridad de un CV en Google Drive o en un repositorio privado de GitHub, y ábrelo directamente desde esa versión en «Mis CV». Los repositorios públicos de GitHub nunca lo reciben.',
  fix_basics_proposal_gap:
    'Una propuesta de la IA en «Datos Básicos» ya no queda pegada a tu foto.',
  fix_json_resume_import_levels:
    'Al importar un archivo JSON Resume, KiwiCV ahora convierte la fluidez de un idioma, por ejemplo «Native» o «B2», en su nivel, y lee los niveles de habilidad escritos con palabras, por ejemplo «Expert». Si una experiencia laboral incluye la descripción de la empresa, la importación ahora te avisa de que KiwiCV no tiene un campo donde guardarla, en lugar de descartarla en silencio.',
  fix_sign_out_forgets_export_details:
    'Al cerrar sesión, KiwiCV ahora también olvida la empresa, el puesto y el enlace a la oferta que escribiste en el cuadro de exportación, para que la siguiente persona que inicie sesión en este navegador no los vea.',
  fix_tailoring_matches_job_ad:
    'Adaptar tu CV a una oferta ahora reescribe tu experiencia laboral en función de la oferta de empleo y ajusta tu título profesional, en lugar de solo reestructurar tus habilidades.',
  ui_export_footer_pinned:
    'Exportar y Cancelar ahora siguen a la vista en la parte inferior del cuadro de exportación en pantallas más pequeñas.',
  ui_restructure_skills_default:
    '«Reestructurar Habilidades» ahora viene marcado cuando mejoras todo tu CV, así la adaptación reagrupa por defecto tus habilidades en función del puesto. Desmárcalo para conservar tu propia estructura; cada cambio sigue llegando como una propuesta que puedes aceptar o descartar.',
};
