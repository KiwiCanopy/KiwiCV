import type { Translations } from '@/locales/en';

export const v_004_005_000: Translations['changelog']['entries']['v_004_005_000'] = {
  _highlights: {
    custom_sections: {
      badge: 'Secciones personalizadas',
      content:
        'Tu CV ya no se limita a las secciones estándar. Añade las tuyas —Conferencias, Logros clave, lo que cuente tu historia—, rellénalas como cualquier otra sección y encajarán en todos los diseños, tanto en la vista previa como en el PDF. «Mejorar con IA» y la traducción también funcionan en ellas.',
      title: 'Tus propias secciones',
    },
  },
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  feat_custom_sections:
    'Añade secciones propias a tu CV: Conferencias, Logros clave o cualquier cosa que las secciones estándar no cubran. Encontrarás «Añadir sección» al final de la lista de secciones; ponle un título y rellénala con entradas como en cualquier otra sección: nombre, fechas, enlace, resumen y puntos destacados. Las secciones personalizadas lucen igual de bien en todos los diseños, en la vista previa y en el PDF, y se pueden mover entre columnas en el editor de diseño como las demás. «Mejorar con IA» funciona en ellas y en cada una de sus entradas, y al traducir tu CV también se traducen sus títulos y entradas.',
  feat_json_round_trip:
    'Importar un archivo de CV de otra herramienta ya no descarta lo que KiwiCV no puede mostrar. Los bloques adicionales del archivo, junto con los roles y las palabras clave de tus proyectos, se conservan con tu CV y vuelven sin cambios cuando lo exportas o haces una copia en Google Drive o en un repositorio privado de GitHub. Nunca aparecen en tu CV ni llegan a la IA, y la importación te indica qué bloques ha conservado.',
  feat_privacy_by_design:
    'KiwiCV sigue orientando sus flujos de trabajo en torno a tu privacidad. Un repositorio de GitHub que cualquiera puede leer —público o publicado con GitHub Pages— ahora recibe solo lo que muestra tu CV: las entradas ocultas, las partes de la dirección que has omitido y tu carta de presentación quedan fuera. Un repositorio privado conserva la copia completa, y el cuadro de conexión te dice de cuál se trata. Las fotos de un archivo de CV importado pierden sus metadatos de cámara, incluida la ubicación GPS, antes de guardarse.',
  fix_hidden_entries_stay_hidden:
    'Lo que ocultas permanece oculto. Editar, mover, ordenar o eliminar otra entrada podía hacer reaparecer una oculta, igual que una reorganización de tus habilidades con IA o la vista previa de ejemplo de un CV vacío. Esas mismas acciones tampoco aceptan ya en silencio una sugerencia de IA a la que aún no has respondido.',
  fix_keyboard_screen_reader:
    'Más fluido con teclado y lector de pantalla: una nueva primera entrada se abre al instante, el campo de red social funciona como una lista de verdad y los botones se anuncian por su nombre.',
  fix_language_polish:
    'Pulido lingüístico en toda la app: encabezados de sección corregidos en italiano, búlgaro, turco y portugués, una İ mayúscula con punto en los CV turcos, las últimas pantallas en inglés traducidas y contenido de ejemplo real en un CV vacío en doce idiomas.',
  fix_reduced_json_hides_sections:
    'El JSON «Reducido» de la página JSON sin formato ahora deja fuera todo lo que tu CV oculta —una sección entera que has ocultado y una foto de perfil oculta—, así como las partes de la dirección que tu CV omite y los campos de proyecto conservados solo de un archivo importado.',
};
