import type { Translations } from '@/locales/en';

export const v_004_002_001: Translations['changelog']['entries']['v_004_002_001'] = {
  fix_html_preview:
    'En el teléfono, abrir tu CV como página web ya funciona correctamente. La opción HTML del menú Vista previa solía quedarse en una pestaña diciendo que se estaba generando sin terminar nunca; ahora muestra tu CV procesado de inmediato.',
  perf_phone_preview:
    'La vista previa se abre más rápido en el teléfono. Ahora KiwiCV prepara el motor de documentos mientras sigues editando en lugar de iniciar justo al tocar, y si vuelves a abrir un CV que no has cambiado desde la última vista previa, te saltas la espera por completo.',
  ui_phone_layout:
    'En el teléfono, el editor y Mis CVs vuelven a darle espacio a cada elemento. Cada copia de seguridad muestra su nombre, idioma y fecha de guardado en su propia línea en lugar de quedar debajo del botón Restaurar, la tarjeta «Mejorar con IA» mantiene su título y su aviso de créditos en líneas separadas, y la última sección del editor ya no queda oculta tras el botón flotante Vista previa.',
};
