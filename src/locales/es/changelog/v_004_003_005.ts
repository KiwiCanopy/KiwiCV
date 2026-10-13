import type { Translations } from '@/locales/en';

export const v_004_003_005: Translations['changelog']['entries']['v_004_003_005'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fix_ai_proposal_diff:
    'Las propuestas de la IA son ahora más fáciles de leer y responder. Las líneas añadidas y eliminadas tienen su propio matiz de fondo además del color del texto, ambas opciones siguen siendo legibles en el modo oscuro y se sitúan justo debajo del texto correspondiente: a la izquierda conservas tu versión y a la derecha aplicas la propuesta.',
  fix_ai_stuck_dialog:
    'Una ejecución bloqueada de la IA ya no deja la ventana de progreso atascada. La ventana no se cerraba cuando un proceso se quedaba colgado, y recargar la página la abría de inmediato reiniciando el mismo proceso, por lo que la única salida lo empeoraba todo. Ahora se puede cerrar en cualquier momento y permanece cerrada tras recargar.',
  fix_ai_translate_addon:
    'Marcar «Traducir también mi CV» ahora traduce el documento de verdad. El selector de idioma contiguo se abría con el idioma en el que ya estaba el CV, lo que el proceso interpretaba como «nada que traducir»: el CV volvía adaptado a la oferta de trabajo pero en su idioma original, sin ningún aviso de que la solicitud se había descartado.',
  fix_cover_letter_footer:
    'La línea de firma de tu carta de presentación ahora sigue la configuración de «Pie de página PDF», igual que en tu CV. Antes copiaba el campo de fecha superior de la carta, por lo que al borrarlo también se eliminaba la fecha de la firma y nunca podían ser distintas.',
  fix_cvs_connect_button:
    'Conectar el almacenamiento en la nube desde «Mis CVs» vuelve a funcionar de principio a fin. El botón «Conectar almacenamiento en la nube» no hacía nada si habías iniciado sesión sin un proveedor conectado, y el diálogo que abría mostraba un botón que solo te devolvía a la página en la que ya estabas.',
};
