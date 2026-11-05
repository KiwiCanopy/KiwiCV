import type { Translations } from '@/locales/en';

export const v_005_002_001: Translations['changelog']['entries']['v_005_002_001'] = {
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  fix_backup_failure_reported:
    '“备份”失败时，对话框现在会说明出错原因并且可以关闭，屏幕阅读器也会读出提示。',
  fix_dashboard_header_narrow_phones:
    '在最窄的手机上，仪表板页眉现在能完整显示，“导出”按钮不再被截断。',
  fix_drive_export_no_empty_folder:
    '仅将备份导出到 Google Drive 时，不再创建空文件夹，同名的旧文件也会保留。',
  fix_drive_export_retry_same_folder:
    '重试 Google Drive 导出时，现在会写入同一个文件夹，不再留下第二个文件夹。',
  fix_export_drive_renamed_folder:
    '如果 Google Drive 中已有与导出同名的文件夹，导出后的提示和导出对话框中的 Google Drive 一行现在会显示文件实际保存的文件夹，例如 MyCV_2。',
  fix_export_retry_keeps_finished:
    '在导出对话框中重试时，已完成的目的地会保持已完成状态，提示信息也会将其计算在内。',
  ui_dark_mode_black: '深色模式现在是纯黑色，卡片带有纤细的绿色轮廓线，奇异果绿是唯一的强调色。',
};
