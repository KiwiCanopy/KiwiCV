import type { Translations } from '@/locales/en';

export const v_005_000_000: Translations['changelog']['entries']['v_005_000_000'] = {
  _highlights: {
    one_day_pass: {
      badge: '新功能',
      content:
        '不确定 KiwiCV 是否适合你？全新的 1 天 Pass 可为你的下一次求职申请开启所有 AI 功能，让你在选择更长的 Pass 之前先试一试。定价卡片现在提供 1 天、7 天和 30 天。',
      title: '试用一天',
    },
    open_source: {
      badge: '开源',
      content:
        'KiwiCV 的每一行代码现已在 GitHub 上以 AGPL 协议公开。你可以确切了解你的简历是如何处理的，也可以报告错误或提出功能建议：隐私承诺背后的代码，任何人都可以查看验证。',
      title: 'KiwiCV 现已开源',
    },
  },
  feat_ai_review_calmer:
    '审阅 AI 建议变得更从容。“技能”和“语言”现在每个条目都有审阅面板；被建议改写的字段会保持只读，直到你选择“保留原本用词”或“使用此建议”，“优化”会等你做出决定，因此再次运行不会替换你还没看到的建议。屏幕阅读器会播报每一项决定。',
  feat_ai_tailoring_keeps_facts:
    '根据招聘启事定制简历时，你的职位、雇主、日期和已列出的技能现在保持不变。简历中从未提到的技能会标记为“你的 CV 中没有 — 仅在属实时才接受”，让你在它加入之前自行决定。',
  feat_raw_data_extra_blocks:
    '“原始 JSON”页面现在会列出导入文件附带的额外数据，例如其他工具的设置块。打开某个块即可查看其 JSON，也可以移除你不想再出现在导出文件中的块。',
  fix_dates:
    '05.06.19 这类日在前的日期现在会读作 6 月 5 日，而不是 5 月 6 日。不存在的日期（如 31.02.2019）会保持你输入的样子，并显示红色错误标记。',
  fix_drive_reconnect: '重新连接 Google Drive 现在总能完成，会开启备份，并从一次真实上传开始。',
  fix_photos:
    '导入简历中的照片会去除相机元数据（包括 GPS 位置），GIF、HEIC 和 AVIF 照片会转为 JPEG。背景透明的照片裁剪后保持白色，而不再变黑。',
  fix_preview_pdf_match:
    '在 Soft、Misty、Skyline、Swiss Grid、Lunar 和 Elegant 中，实时预览与 PDF 现在更加一致：大写、时间线、字体和链接都相同。预览不再从第三方服务器加载字体，PDF 的标题和作者只包含你的姓名。',
  fix_privacy_controls:
    '哪些内容留在此设备上，由你决定。使用 Google 登录时，只有在你连接 Google Drive 时才会请求长期访问权限。“设置”中的 Google Drive 和 GitHub 卡片始终提供“断开连接”，退出登录或删除账户时可以一并移除 GitHub 连接，你的写作样本也会保留在保存它的账户下。',
  fix_privacy_policy:
    '隐私政策已重新撰写。其中列出了 KiwiCV 对你的 AI 请求保留的内容（绝不包含你的文本），说明你的反对权以及如何撤回同意，并列出每一项涉及的服务及其运行位置。',
  fix_small_things:
    '在侧边菜单打开时旋转平板，不再导致点击无响应；悬浮的“预览”按钮不再遮住手机菜单；更新期间一直开着的标签页会重新载入新版本；过长而无法翻译的简历会被直接拒绝，而不是等待很久后失败。',
  ui_editor_polish:
    '欢迎回来！起始页现在显示“继续编辑”，“创建你的简历”会直接打开你的个人信息。在求职信中，“主题”和“日期”位于信件正文上方，一旦有收件对象，“收件人”便会展开。“优化”在空白部分中依然可见，并附有先添加什么的提示，AI 字符计数器会在接近上限前变为琥珀色。',
  ui_informal_address_more_languages:
    '西班牙语、荷兰语、俄语、乌克兰语和保加利亚语现在也在整个应用中以随和的口吻称呼你，与其他语言一致。',
  ui_install_app:
    '像使用应用一样使用 KiwiCV：“设置”→“系统界面”中现在有“安装 KiwiCV”按钮；在 iPhone 和 iPad 上，添加到主屏幕后 KiwiCV 会有专属图标。',
};
