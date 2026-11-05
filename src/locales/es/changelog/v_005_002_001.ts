import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Como siempre, algunas actualizaciones menores de paquetes en segundo plano mantienen la tecnología de KiwiCV lo más actualizada posible.',
  fix_backup_failure_reported:
    'Cuando «Guardar copia» falla, el cuadro ahora indica qué salió mal y se puede cerrar, y los lectores de pantalla lo anuncian.',
  fix_dashboard_header_narrow_phones:
    'En los teléfonos más estrechos, la cabecera del panel ahora cabe en la pantalla, así que el botón Exportar ya no se corta.',
  fix_drive_export_no_empty_folder:
    'Exportar solo la copia de seguridad a Google Drive ya no crea una carpeta vacía, y un archivo anterior con el mismo nombre se conserva.',
  fix_drive_export_retry_same_folder:
    'Reintentar una exportación a Google Drive ahora escribe en la misma carpeta en lugar de dejar una segunda.',
  fix_export_drive_renamed_folder:
    'Si Google Drive ya tiene una carpeta con el nombre de tu exportación, el aviso tras la exportación y la fila de Google Drive en el cuadro de exportación ahora indican la carpeta donde están tus archivos, por ejemplo MyCV_2.',
  fix_export_retry_keeps_finished:
    'Al reintentar en el cuadro de exportación, los destinos ya finalizados siguen marcados como listos, y el mensaje los cuenta.',
  ui_dark_mode_black:
    'El modo oscuro ahora es negro puro, con tarjetas perfiladas por una fina línea verde y el verde kiwi como único acento fuerte.',
};
