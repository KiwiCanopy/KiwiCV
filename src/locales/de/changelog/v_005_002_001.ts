import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Wie immer sorgen einige kleinere Paket-Updates im Hintergrund dafür, dass die Technologie hinter KiwiCV so aktuell wie möglich bleibt.',
  fix_backup_failure_reported:
    'Wenn „Sichern“ fehlschlägt, nennt der Dialog jetzt den Grund und lässt sich schließen, und auch Screenreader sagen es an.',
  fix_dashboard_header_narrow_phones:
    'Auf den schmalsten Smartphones passt die Kopfzeile des Dashboards jetzt auf den Bildschirm, sodass der Button „Exportieren“ nicht mehr abgeschnitten wird.',
  fix_drive_export_no_empty_folder:
    'Wenn du nur die Sicherung nach Google Drive exportierst, entsteht kein leerer Ordner mehr, und eine frühere Datei mit demselben Namen bleibt erhalten.',
  fix_drive_export_retry_same_folder:
    'Versuchst du einen Google-Drive-Export erneut, schreibt KiwiCV jetzt in denselben Ordner, statt einen zweiten zu hinterlassen.',
  fix_export_drive_renamed_folder:
    'Wenn es in Google Drive schon einen Ordner mit dem Namen deines Exports gibt, nennen der Hinweis nach dem Export und die Google-Drive-Zeile im Export-Dialog jetzt den Ordner, in dem deine Dateien liegen, etwa MyCV_2.',
  fix_export_retry_keeps_finished:
    'Beim erneuten Versuch im Export-Dialog bleiben Ziele, die schon fertig sind, als fertig markiert, und die Meldung zählt sie mit.',
  ui_dark_mode_black:
    'Der Dunkelmodus ist jetzt rein schwarz, mit einer feinen grünen Linie um die Karten und Kiwi-Grün als einzigem starken Akzent.',
};
