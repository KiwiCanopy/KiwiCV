import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Come sempre, alcuni aggiornamenti minori dei pacchetti in background mantengono la tecnologia alla base di KiwiCV il più aggiornata possibile.',
  fix_backup_failure_reported:
    'Quando «Salva backup» non riesce, la finestra ora indica cosa è andato storto e si può chiudere, e gli screen reader lo annunciano.',
  fix_dashboard_header_narrow_phones:
    'Sui telefoni più stretti, l’intestazione della dashboard ora entra nello schermo, quindi il pulsante Esporta non viene più tagliato.',
  fix_drive_export_no_empty_folder:
    'Esportare solo il backup su Google Drive non crea più una cartella vuota, e un file precedente con lo stesso nome resta intatto.',
  fix_drive_export_retry_same_folder:
    'Riprovare un’esportazione su Google Drive ora scrive nella stessa cartella invece di lasciarne una seconda.',
  fix_export_drive_renamed_folder:
    'Se Google Drive ha già una cartella con il nome della tua esportazione, l’avviso dopo l’esportazione e la riga di Google Drive nella finestra di esportazione ora indicano la cartella in cui sono finiti i tuoi file, ad esempio MyCV_2.',
  fix_export_retry_keeps_finished:
    'Quando riprovi nella finestra di esportazione, le destinazioni già completate restano segnate come completate e il messaggio le conteggia.',
  ui_dark_mode_black:
    'La modalità scura ora è nero puro, con le schede delineate da una sottile linea verde e il verde kiwi come unico accento forte.',
};
