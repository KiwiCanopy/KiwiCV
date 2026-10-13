import type { Translations } from '@/locales/en';

export const raw_json: Translations['raw_json'] = {
  copy_clipboard: '复制',
  data_label: '原始数据',
  download: '下载 JSON',
  full: '完整',
  full_desc: '元数据 + 可见性标志（最适合导入到 KiwiCV）',
  full_title: '完整状态',
  passthrough: {
    desc: '保留这些数据，以便其他工具仍能读取你的文件。它们包含在你的 JSON 导出以及 Drive 和私有 GitHub 备份中，但绝不会显示在简历中，也不会发送给 AI。',
    remove_confirm_message: '你从 KiwiCV 导出的文件将不再包含此数据块。此操作无法撤销。',
    remove_confirm_title: '移除“{{name}}”？',
    removed_desc:
      '下次同步会替换你当前的备份。较早的快照以及 Drive 和 GitHub 保留的旧版本仍包含它，直到你在那里将其删除。',
    removed_title: '已从此浏览器移除“{{name}}”',
    title: '导入文件中的额外数据',
  },
  reduced: '精简',
  reduced_desc: '已移除隐藏项',
  reduced_title: '精简 JSON',
  standard: '标准',
  standard_desc: '清理后',
  standard_title: '标准 JSON',
};
