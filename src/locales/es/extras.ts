import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro:
      'KiwiCV es una de las varias herramientas creadas bajo el paraguas de KiwiCanopy. Explora el resto de la familia.',
    family_title: 'Parte de la familia KiwiCanopy',
    kiwicanopy_desc: 'El hogar de la familia KiwiCanopy, donde todas las herramientas conviven.',
    kiwidesk_desc: 'Una aplicación hermana dentro de la familia KiwiCanopy.',
    story_p1:
      'Ya sea por mí mismo o en conversaciones con amigos y conocidos, he experimentado la misma frustración una y otra vez: la tediosa tarea de reescribir el currículo para cada nueva solicitud. Todos quieren adaptar sus experiencias específicamente al puesto respectivo sin que el CV parezca inmediatamente sobrecargado. Pero las herramientas convencionales hacen que precisamente eso sea un tormento: para cada pequeño ajuste, a menudo hay que crear un documento completamente nuevo, lo que termina rápidamente en un caos de versiones sin fin.',
    story_p2:
      'Precisamente por esta razón creé KiwiCV: un generador de currículos modular donde puedes activar y desactivar fácilmente secciones individuales, mover segmentos libremente y exportar de forma flexible, todo desde una visión centralizada. Se acabó el tedioso copiar y pegar entre innumerables documentos de Word. Todo tu historial profesional tiene un hogar fijo, y tú eliges relajadamente solo lo que quieres mostrar en cada candidatura.',
    story_title: 'La historia detrás de KiwiCV',
    title: 'Acerca de KiwiCV',
    visit_site: 'Visitar sitio',
  },
  howto: {
    core: {
      ai_assistant: 'Asistente IA',
      ai_assistant_desc:
        'Usa el Asistente IA para optimizar elementos individuales, secciones o todo tu CV. ¡Busca el icono {wardsymbol}!',
      hide_show: 'Ocultar/Mostrar',
      hide_show_desc:
        'Para evitar tener que quitar y volver a insertar entradas constantemente, puedes ocultar elementos individuales o secciones enteras con un solo clic.',
      move_items_desc:
        'Arrastra y suelta secciones o elementos individuales entre la barra lateral y la columna principal.',
      page_breaks: 'Saltos de página',
      page_breaks_desc:
        'Inserta saltos de página manuales para que tu PDF se vea exactamente como quieres. Esto solo afecta al PDF, no a la versión web.',
      rearrange: 'Reordenar',
      rearrange_desc:
        'Reordena los elementos dentro de cualquier sección para centrarte en lo que quieres destacar.',
      switch_sides: 'Cambiar lados',
      switch_sides_desc:
        'Intercambia fácilmente la columna principal y la barra lateral para encontrar el mejor diseño.',
      title: 'Funciones principales',
    },
    footer: {
      message: '¡Esperamos que escribir tu CV sea más divertido con KiwiCV! ¡Mucha suerte!',
    },
    github: {
      create_pat_link: 'Crear Token en GitHub',
      create_repo_link: 'Crear repositorio en GitHub',
      go_to_settings: 'Ir a Configuración',
      intro:
        'Conecta tu currículum con un repositorio de GitHub para el manejo automático de múltiples idiomas, control de versiones y alojamiento sencillo. Sigue estos tres pasos:',
      pat_security_tip:
        "Consejo de seguridad: Utiliza un Personal Access Token 'Fine-grained' con acceso de lectura/escritura solo a 'Contents' en tu repositorio específico. Recuerda elegir 'Only select repositories' y establecer tu fecha de caducidad preferida.",
      step1_desc:
        'Crea un nuevo repositorio privado en GitHub. Puedes dejarlo completamente vacío por ahora (no se necesitan README ni .gitignore).',
      step1_title: 'Crear un repositorio',
      step2_desc:
        "Necesitas un Personal Access Token (PAT) para permitir que KiwiCV envíe tu currículum a tu repositorio. Recomiendo usar un token 'fine-grained' para máxima seguridad.",
      step2_title: 'Crear un Personal Access Token',
      step3_desc:
        'Ve a la página de Configuración e introduce los detalles de tu repositorio y token en la sección de GitHub. Alternativamente, haz clic en el botón de GitHub en la parte superior derecha para abrir un formulario donde también puedes introducir tu PAT.',
      step3_title: 'Conectar en KiwiCV',
      title: 'Guía de conexión a GitHub',
    },
    hosting: {
      automated_title: 'Opción B: Alojamiento automatizado (vía GitHub)',
      github_pages_desc:
        'Utiliza el archivo HTML generado por KiwiCV y súbelo a un repositorio de GitHub. Activa GitHub Pages en la configuración del repositorio para obtener una URL pública gratuita para tu currículum.',
      github_pages_title: 'GitHub Pages',
      intro:
        'Puedes alojar la versión HTML generada de tu currículum de forma gratuita. Aquí están las opciones más comunes:',
      manual_title: 'Opción A: Carga manual (no se requiere GitHub)',
      netlify_desc:
        'Servicios como Netlify o Vercel ofrecen alojamiento estático gratuito con implementación de arrastrar y soltar o sincronización automática con tu repositorio de GitHub. Puedes subir tu currículum en HTML allí sin exponer tu historial de edición.',
      netlify_drop_desc:
        'Asegura tu ventaja competitiva con una URL personal. Hay muchos **proveedores gratuitos** donde puedes poner tu CV en línea **en segundos**. Ya sea a través de la herramienta vinculada arriba o de alternativas como [Tiiny.host](https://tiiny.host): un rápido **arrastrar y soltar** de tu sitio web es todo lo que necesitas para tener una presencia profesional en la web.',
      netlify_drop_title: 'Rápido y fácil: Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        'Atención: A menos que tengas un plan de pago en GitHub, deberás hacer público tu repositorio para usar GitHub Pages. ¡Todo tu historial (todos los commits) será visible para todos! Si la privacidad es importante, usa la primera opción.',
      push_folder_hint:
        'KiwiCV admite exclusivamente el envío(push) del archivo HTML a una carpeta específica en tu repositorio. Consulta la configuración avanzada en la página de Vista previa.',
      sensitive_data_warning:
        'Advertencia de privacidad: Si alojas tu currículum en una URL pública, cualquiera puede acceder a tus datos. Considera eliminar información personal muy confidencial como tu dirección exacta, número de teléfono y correo electrónico.',
      title: 'Alojar tu currículum',
    },
    pdf_guide: {
      font_size: 'Tamaño de fuente',
      font_size_desc:
        'Ajusta el tamaño de la fuente en la pestaña de Diseño para optimizar el espacio.',
      intro:
        'El renderizado PDF es complejo. Experimenta con las siguientes funciones hasta que el documento sea perfecto:',
      rearrange_sections: 'Reordenar',
      rearrange_sections_desc: 'Reordenar secciones puede corregir saltos de página extraños.',
      space_opt: 'Optimización de espacio',
      space_opt_desc: 'Mover una sección corta a la barra lateral puede liberar espacio.',
      title: 'Consejos de diseño PDF',
      use_pagebreaks: 'Usar saltos de página',
      use_pagebreaks_desc:
        'Los elementos cerca del borde pueden renderizarse mal. Usa saltos de página para moverlos limpiamente.',
    },
    sync_guide: {
      auto_recognition_desc:
        'Al cambiar de idioma se activa una comprobación para ver si ya existe una versión en la nube.',
      auto_recognition_title: 'Reconocimiento automático',
      desc: 'KiwiCV gestiona varios idiomas. Al guardar o realizar una copia de seguridad, la aplicación crea una versión específica para el idioma activo. Más adelante, reconocerá las copias de seguridad existentes para restaurarlas.',
      language_specific_desc:
        'Cada versión de idioma se almacena como una entrada independiente en tu repositorio en la nube.',
      language_specific_title: 'Específico del idioma',
      title: 'Copias de seguridad de idiomas inteligentes',
    },
    toc_title: 'ÍNDICE DE CONTENIDOS',
  },
  page_description:
    'Antecedentes, soporte y visión: descubre cómo aprovechar al máximo KiwiCV, hacia dónde se dirige y la historia detrás de tu creador de currículums.',
  page_title: 'Extras',
  tabs: {
    about: 'Acerca de KiwiCV',
    changelog: 'Historial de cambios',
    howto: 'Guías',
    roadmap: 'Hoja de ruta',
  },
};
