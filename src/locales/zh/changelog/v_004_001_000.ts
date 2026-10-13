import type { Translations } from '@/locales/en';

export const v_004_001_000: Translations['changelog']['entries']['v_004_001_000'] = {
  _highlights: {
    'matching-cover-letters': {
      badge: '求职信',
      content:
        'KiwiCV 现已支持求职信。编写与简历设计完全一致的求职信，并将其合并导出为“一份精致的求职文档包”——告别样式不统的文档。',
      title: '完美匹配的求职信',
    },
  },
  chore_ai_model_upgrade:
    'KiwiCV 的 AI 现在基于 Google 最新一代的 Gemini（Gemini 3.1）运行，从而带来显著更佳的建议。隐私保持不变：处理完全在欧盟境内进行，符合 GDPR，并且你的数据绝不会用于训练 AI 模型。',
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  feat_matching_cover_letters:
    '制作与简历设计风格相配的求职信，并将其一同导出为统一的求职文档包。支持粗体、斜体及链接等文本格式，提供经典 DIN 5008 及主题匹配布局，可根据岗位需求自由显示或隐藏发件人、收件人和签名块。',
  fix_design_settings_reset:
    '你的 Design 设置现在在编辑时会保持不变。过去，一旦你在任意列表板块中添加、重排或编辑内容，“工作经历”和“教育背景”的加粗标题选项、自定义地址布局以及 GitHub 托管目标路径都会在没有任何警告或撤销选项的情况下自动重置为默认值。导入简历中的自定义板块标题现在也能在编辑后完好保留。',
  fix_elegant_page_breaks:
    '手动分页符现在可以在 Elegant 主题中正常工作。勾选分页符过去对导出的 PDF 没有效果；现在它会像其他主题一样，在你指定的位置准确开启新一页。',
  fix_empty_custom_address_layout:
    '没有有效字段的自定义地址布局不再会清空你的地址。过去在 Design 中移除自定义布局的所有字段会导致简历和 PDF 中的地址完全消失，且屏幕上没有任何提示。KiwiCV 现在会自动降级使用你所在国家的标准布局。',
  fix_footer_date_round_trip:
    '关闭简历页脚日期设置现在可以在导出并重新导入后保持生效，你手动输入的日期也会原封不动地保留，不会被清除。',
  fix_import_list_warnings:
    '导入警告现在已覆盖列表项。当 KiwiCV 必须丢弃工作要点、课程列表或技能关键词中无法读取的内容时，会在导入摘要中具体列出该条目和字段，而不是静默缩短列表。',
  fix_import_warning_headings:
    '导入警告现在会明确指出其来自简历的哪个部分（包括你的个人信息），不再显示内部标签。',
  fix_imported_list_fields:
    '列表格式存在轻微问题的简历文件不再会导致预览崩溃。如果导入的 JSON 将工作要点、课程列表或技能关键词写成了单行文本而非列表，预览和 PDF 曾会完全停止渲染。KiwiCV 现在会尽可能读取有效内容，并静默跳过其余部分。',
  fix_imported_text_fields:
    '格式错误的联系方式不再会破坏你的简历。如果导入文件中的姓名、网站、电话或城市不是纯文本格式，预览或 PDF 曾可能完全停止渲染。KiwiCV 现在会尽可能读取有效内容，并自动清理姓名和地址周围的冗余空格，避免将姓名拆分为两行显示的主题出现首行空白。',
  fix_imported_theme_name:
    '使用未识别主题名称导入的简历现在会渲染其所有板块，不会再显示为近乎空白。',
  fix_missing_sections_single_column:
    '调整布局后填写的板块在单栏主题上不再会丢失——所有包含内容的板块都会呈现在预览和导出的 PDF 中。',
  fix_pdf_special_characters: '简历中的特殊字符与链接现已可在所有主题导出 PDF 时保持稳定可靠。',
  fix_preview_pdf_parity:
    '所见即所得。已重命名的板块标题、特定主题细节、旁边的图标以及几个双栏主题上的项目板块在屏幕预览和导出的 PDF 之间可能会有所不同 —— 两者现在渲染得完全一致。',
  fix_reload_repairs_cv:
    '重新加载编辑器现在会自动实时修复损坏或旧的简历文件，防止潜在的预览和导出崩溃。',
  fix_signature_footer:
    '签名页脚已修复：它现在留出了实际签名的空间，不再将空白末页推到较长的简历上，并已应用在先前缺失该页脚的 Elegant、Plain 和 Plain 2 主题上。',
  fix_stackoverflow_page_breaks:
    '手动分页符在 Stack Overflow 主题中恢复正常。过去设置分页符会导致无法生成 PDF；现在预览和导出文件都会在你指定的位置准确分页。',
  fix_theme_fonts:
    'Elegant、Timeless 和 JavaScript 现在会在预览中使用其专属的设计字体。过去预览会降级使用系统通用字体，而 Timeless 的 PDF 导出时又会使用另一种字体——现在这三种主题在屏幕上的显示效果已与最终文档完全一致。',
  fix_two_column_stray_breaks:
    '在 Lunar、Misty 和 Swiss Grid 主题中，当某个板块的所有条目都被隐藏时，其手动分页符不再会被遗留在导出的 PDF 中，从而避免在该板块原位置留下空白栏。',
  other_discord_community:
    'KiwiCV 现已建立 Discord 社区 — 在这里交流反馈、请求“模板”并在求职路上互相支持。页脚和首页均预留了链接。',
  other_export_no_google_fonts:
    '打开导出的 HTML 简历不再会向 Google 发起字体请求。它直接使用 KiwiCV 已提供的字体文件，在保证完美一致渲染效果的同时，不会让其他人获知你打开了该文档。',
  other_import_clear_warning:
    '导入摘要现在会在纯文本字段中的非文本值被清除时提供清晰的警告，而不是静默清空它们。',
  other_kiwicanopy_family:
    '认识 KiwiCanopy 大家庭的其他成员——KiwiCV 现已在“关于”页面提供通往 KiwiCanopy 与 KiwiDesk 的链接。',
};
