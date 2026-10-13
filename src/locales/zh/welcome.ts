import type { Translations } from '@/locales/en';

export const welcome: Translations['welcome'] = {
  choice_ai_badge: '隐私保护',
  choice_ai_desc: '上传 TXT、PDF 或 Word 文件。任何数据都不会用于训练模型。',
  choice_ai_paid: '付费',
  choice_ai_title: 'AI 导入',
  choice_direct_desc: '我有 KiwiCV 格式的简历。',
  choice_direct_title: '以 .json 文件导入',
  cloud_sync_desc: '免费在你自己的私有云中管理多语言版本和云端备份。',
  import_error: '导入文件失败。格式无效。',
  import_success: '简历导入成功！',
  import_success_with_warnings: '简历已导入，但有一些警告。',
  onboarding_lang: {
    cta: '开始吧！',
    cv_desc: '控制自动生成的各个小节标题、日期/时间格式和排版文本。',
    cv_label: '简历内容语言',
    description: '让我们个性化设置你的工作区。请选择你的界面语言以及你计划编写的简历语言。',
    note: '这两项设置以后都可以随时更改。',
    title: '欢迎使用 KiwiCV',
    ui_desc: '在此语言下显示菜单、选项和指南。',
    ui_label: '界面语言',
  },
  tagline: '标准简历无法通过算法筛选。在同一个地方轻松创建完美适配的版本。',
  title_import: '导入你的简历',
};
