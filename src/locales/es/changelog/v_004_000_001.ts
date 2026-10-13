import type { Translations } from '@/locales/en';

export const v_004_000_001: Translations['changelog']['entries']['v_004_000_001'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fix_migration_notice:
    'Si todavía accedes a KiwiCV a través de su dirección web anterior, el aviso muestra ahora la fecha exacta en que esa dirección dejará de funcionar: 31 de octubre de 2026.',
  fix_mobile_checkout:
    'Al deslizar las tarjetas de precios en el teléfono ya no se abre el proceso de pago por accidente. Solo el botón inicia la compra.',
  fix_preview_reliability:
    'La vista previa ya no se queda bloqueada en una carga infinita. Si se bloquea una ventana emergente, ahora verás un aviso explicativo, los errores de renderizado muestran un mensaje claro y la vista previa sigue funcionando incluso si un servicio externo es lento o no está disponible.',
  fix_save_status:
    'La nota «Guardado en este dispositivo» refleja ahora lo que realmente se ha guardado, en lugar de mostrar el mismo mensaje independientemente de lo ocurrido.',
  fix_translations:
    'Se han corregido trece textos que contenían letras del alfabeto incorrecto (caracteres cirílicos en palabras en español y turco, o coreanos y japoneses en chino) y se han completado las últimas traducciones en los quince idiomas.',
  perf_preview_speed:
    'La primera vista previa aparece mucho más rápido. Antes, KiwiCV cargaba todas las fuentes que pudiera necesitar antes de mostrar nada, incluidas dos fuentes muy grandes para chino y japonés. Ahora solo se cargan si tu CV utiliza realmente esos caracteres.',
  ui_polish:
    'Un retoque visual: los encabezados usan una tipografía negrita real en lugar de una engrosada artificialmente por el navegador, las etiquetas de formulario y marcadores son más legibles, y las tarjetas de sección comparten un acento uniforme.',
};
