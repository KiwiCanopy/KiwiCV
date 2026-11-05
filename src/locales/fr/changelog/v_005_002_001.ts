import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates:
    'Comme toujours, quelques mises à jour mineures de packages en arrière-plan permettent de garder la technologie derrière KiwiCV aussi à jour que possible.',
  fix_backup_failure_reported:
    'Quand « Sauvegarder » échoue, la fenêtre indique désormais le problème et peut être fermée, et les lecteurs d’écran l’annoncent.',
  fix_dashboard_header_narrow_phones:
    'Sur les téléphones les plus étroits, l’en-tête du tableau de bord tient désormais à l’écran : le bouton Exporter n’est plus coupé.',
  fix_drive_export_no_empty_folder:
    'Exporter uniquement la sauvegarde vers Google Drive ne crée plus de dossier vide, et un fichier précédent du même nom reste intact.',
  fix_drive_export_retry_same_folder:
    'Réessayer un export vers Google Drive écrit désormais dans le même dossier au lieu d’en laisser un second.',
  fix_export_drive_renamed_folder:
    'Si Google Drive contient déjà un dossier portant le nom de ton export, la notification affichée après l’export et la ligne Google Drive de la fenêtre d’export indiquent désormais le dossier où se trouvent tes fichiers, par exemple MyCV_2.',
  fix_export_retry_keeps_finished:
    'Quand tu réessaies dans la fenêtre d’export, les destinations déjà terminées restent marquées comme terminées, et le message les compte.',
  ui_dark_mode_black:
    'Le mode sombre est désormais d’un noir pur, avec des cartes entourées d’un fin trait vert et le vert kiwi comme seul accent marqué.',
};
