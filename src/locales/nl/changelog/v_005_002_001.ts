import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Zoals altijd zorgen een paar kleine pakketupdates op de achtergrond ervoor dat de technologie achter KiwiCV zo up-to-date mogelijk blijft.',
  fix_backup_failure_reported:
    'Als „Back-up maken” mislukt, noemt het venster nu wat er misging en kun je het sluiten, en schermlezers lezen het voor.',
  fix_dashboard_header_narrow_phones:
    'Op de smalste telefoons past de koptekst van het dashboard nu op het scherm, zodat de knop Exporteer niet meer wordt afgesneden.',
  fix_drive_export_no_empty_folder:
    'Als je alleen de back-up naar Google Drive exporteert, ontstaat er geen lege map meer, en een eerder bestand met dezelfde naam blijft bewaard.',
  fix_drive_export_retry_same_folder:
    'Een Google Drive-export opnieuw proberen schrijft nu naar dezelfde map in plaats van een tweede achter te laten.',
  fix_export_drive_renamed_folder:
    'Als Google Drive al een map heeft met de naam van je export, noemen de melding na de export en de Google Drive-rij in het exportvenster nu de map waarin je bestanden staan, bijvoorbeeld MyCV_2.',
  fix_export_retry_keeps_finished:
    'Als je het opnieuw probeert in het exportvenster, blijven bestemmingen die al klaar zijn als klaar gemarkeerd, en de melding telt ze mee.',
  ui_dark_mode_black:
    'De donkere modus is nu puur zwart, met kaarten omlijnd door een fijne groene lijn en kiwi-groen als enige sterke accent.',
};
