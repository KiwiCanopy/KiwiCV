import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Som alltid håller några mindre paketuppdateringar i bakgrunden tekniken bakom KiwiCV så uppdaterad som möjligt.',
  fix_backup_failure_reported:
    'När Säkerhetskopiera misslyckas visar dialogen nu vad som gick fel och kan stängas, och skärmläsare läser upp det.',
  fix_dashboard_header_narrow_phones:
    'På de smalaste telefonerna får sidhuvudet i Översikt nu plats på skärmen, så knappen Exportera klipps inte längre av.',
  fix_drive_export_no_empty_folder:
    'Att bara exportera säkerhetskopian till Google Drive skapar inte längre en tom mapp, och en tidigare fil med samma namn finns kvar.',
  fix_drive_export_retry_same_folder:
    'När du försöker exportera till Google Drive igen skrivs filerna nu till samma mapp i stället för att en andra lämnas kvar.',
  fix_export_drive_renamed_folder:
    'Om Google Drive redan har en mapp med samma namn som din export visar meddelandet efter exporten och Google Drive-raden i exportdialogen nu mappen dina filer hamnade i, till exempel MyCV_2.',
  fix_export_retry_keeps_finished:
    'När du försöker igen i exportdialogen förblir destinationer som redan är färdiga markerade som klara, och meddelandet räknar med dem.',
  ui_dark_mode_black:
    'Mörkt läge är nu helt svart, med kort som omges av en tunn grön linje och kiwi-grönt som enda starka accent.',
};
