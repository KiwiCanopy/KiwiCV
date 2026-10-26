import type { Translations } from '@/locales/en';

export const v_005_001_000: Translations['changelog']['entries']['v_005_001_000'] = {
  _highlights: {
    job_posting_link: {
      badge: '招聘启事',
      content:
        '将简历备份到 Google Drive 或 GitHub 上的私人仓库时，在导出对话框中粘贴招聘启事链接，之后随时可以从“我的简历”中打开。公开仓库永远不会收到该链接。',
      title: '记住你投递过哪里',
    },
  },
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  feat_cover_letter_style_default:
    '保存写作样本后，你的求职信现在会从“匹配我的写作风格”开始，即使在新的浏览器标签页中也是如此。如果改选某种语气，KiwiCV 会在该标签页中保留它。',
  feat_export_cmd_enter:
    '在导出对话框中按 Cmd+Enter（Windows 上为 Ctrl+Enter）即可开始导出，无需再去点按钮。',
  feat_export_cover_letter_switch:
    '导出对话框现在会显示是否包含你的求职信，并提供开关让你添加或移除它；当求职信可能与你刚刚用来定制简历的职位描述不符时，还会提醒你，方便你在发送前检查。',
  feat_job_posting_link:
    '将简历备份到 Google Drive 或 GitHub 上的私人仓库时，可以附上招聘启事链接，之后在“我的简历”中直接从该版本打开。公开的 GitHub 仓库永远不会收到该链接。',
  fix_basics_proposal_gap: '“基本信息”中的 AI 建议不再紧贴你的照片。',
  fix_json_resume_import_levels:
    '导入 JSON Resume 文件时，KiwiCV 现在会把语言的熟练程度（例如“Native”或“B2”）转换为对应的语言水平，并读取以文字写成的技能等级（例如“Expert”）。如果某条工作经历带有公司简介，导入时会提示你 KiwiCV 没有可保存它的字段，而不是悄悄丢掉。',
  fix_sign_out_forgets_export_details:
    '退出登录时，KiwiCV 现在也会清除你在导出对话框中填写的公司、职位和招聘启事链接，这样下一个在此浏览器登录的人就看不到它们。',
  fix_tailoring_matches_job_ad:
    '按职位定制简历时，现在会根据职位描述改写你的工作经历并调整“职位”一栏，而不只是重新构建你的技能。',
  ui_export_footer_pinned: '在较小的屏幕上，“导出”和“取消”按钮现在会始终显示在导出对话框底部。',
  ui_restructure_skills_default:
    '优化整份简历时，“重新构建 技能”现在默认勾选，因此定制时会默认按职位重新归类你的技能。取消勾选即可保留你自己的结构；每项更改仍会以建议的形式出现，你可以接受或放弃。',
};
