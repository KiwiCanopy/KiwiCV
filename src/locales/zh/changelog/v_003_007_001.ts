import type { Translations } from '@/locales/en';

export const v_003_007_001: Translations['changelog']['entries']['v_003_007_001'] = {
  fix_editor_tag_columns:
    '亮点和关键词等列表项现在在缩窄编辑器面板时会更早地折叠为单列布局，确保文字显示完整、不会被挤压且易于阅读。',
  fix_sync_routing:
    '打开云端备份和同步界面现在将直接显示你的连接选项，如果你已经登录，将不再要求你进行重复的 Google 登录。',
  fix_sync_z_index:
    '云端同步设置窗口现在将清晰地浮动在编辑器面板的分栏调节拉杆上方，解决了视觉重叠并防止误触背景元素。',
};
