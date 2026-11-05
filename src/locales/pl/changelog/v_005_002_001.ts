import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Jak zawsze, kilka drobnych aktualizacji pakietów w tle dba o to, aby technologia stojąca za KiwiCV była jak najbardziej aktualna.',
  fix_backup_failure_reported:
    'Gdy tworzenie kopii zapasowej się nie powiedzie, okno podaje teraz przyczynę i można je zamknąć, a czytniki ekranu to odczytują.',
  fix_dashboard_header_narrow_phones:
    'Na najwęższych telefonach nagłówek panelu mieści się teraz na ekranie, więc przycisk Eksportuj nie jest już ucięty.',
  fix_drive_export_no_empty_folder:
    'Eksport samej kopii zapasowej na Google Drive nie tworzy już pustego folderu, a wcześniejszy plik o tej samej nazwie pozostaje nienaruszony.',
  fix_drive_export_retry_same_folder:
    'Ponowna próba eksportu na Google Drive zapisuje teraz do tego samego folderu, zamiast zostawiać drugi.',
  fix_export_drive_renamed_folder:
    'Jeśli na Google Drive jest już folder o nazwie Twojego eksportu, komunikat po eksporcie i wiersz Google Drive w oknie eksportu podają teraz folder, do którego trafiły pliki, na przykład MyCV_2.',
  fix_export_retry_keeps_finished:
    'Przy ponownej próbie w oknie eksportu miejsca docelowe, które są już gotowe, pozostają oznaczone jako gotowe, a komunikat je uwzględnia.',
  ui_dark_mode_black:
    'Tryb ciemny jest teraz czysto czarny: karty są otoczone cienką zieloną linią, a kolor kiwi to jedyny mocny akcent.',
};
