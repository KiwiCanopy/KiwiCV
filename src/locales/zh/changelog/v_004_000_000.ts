import type { Translations } from '@/locales/en';

export const v_004_000_000: Translations['changelog']['entries']['v_004_000_000'] = {
  _highlights: {
    'kiwicv-rebrand': {
      badge: '全新品牌 🥝',
      content:
        'CVCanvas 现已正式更名为 KiwiCV 🥝✨！我们更新了名称，为编辑器赋予更加独立且独特的品牌个性。作为 KiwiCanopy 大家庭的一员，你所喜爱的强大功能、本地隐私保障以及已保存的简历均 100% 完整保留。',
      title: '全新名称，独特个性',
    },
  },
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  chore_product_tour: '下线旧版引导游览，保留“最新动态”弹窗。',
  chore_security: '常规的底层安全与隐私改进，包括在注销/删除账号时引入更严格的核验。',
  feat_accessibility:
    '无障碍体验重大升级：KiwiCV 现已完美支持屏幕阅读器，并且全程仅凭键盘即可操作，包括无需鼠标移动各个章节和条目。',
  feat_design_settings:
    '外观设置更加简洁：较少使用的板块操作现已收拢在小型菜单中，不再占用每一行空间。',
  feat_export_and_preview:
    '导出功能现可显示下载进度，且 PDF 预览在出现异常时会自动自我修复，不再留下空白页面。',
  feat_interface_redesign:
    'KiwiCV 焕然一新 —— 全新的首页、更整洁的工作区以及真正适配手机的移动端布局。',
  feat_translations:
    '补全所有 15 种语言的最后缺失部分 —— 此前仍显示为英文的少数提示消息与标签现已全部翻译。',
  fix_ai_import: '修复了 AI 导入可能卡在途中或重复扣除积分的问题。',
  fix_drive_connection:
    '修复了 Google Drive 静默失效但仍显示已连接的问题，并防止旧连接在同一浏览器中随你转到另一个 Google 账号。',
  fix_editor_layout:
    '编辑器排版多项修复：标题和行不再意外折行，双栏视图在窄屏上堆叠更合理，且取消拖拽时会精准还原位置。',
  ui_kiwicv_rebrand:
    '欢迎使用 KiwiCV！我们告别了旧名称 CVCanvas，并自豪地加入 KiwiCanopy 大家庭 🥝。你的简历编辑器将继续代表极佳的隐私保护、独特的视觉设计与卓越的品质。',
};
