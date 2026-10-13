import type { Translations } from '@/locales/en';

export const settings: Translations['settings'] = {
  components: {
    font_size_scale: {
      label: '字体大小比例',
    },
  },
  cv_defaults: {
    title: '简历默认设置',
  },
  danger: {
    delete_btn: '确认',
    delete_data: '全部删除',
    delete_data_desc: '不可逆。',
    title: '危险区域',
  },
  export: {
    available_variables: '支持的变量',
    format_tokens: 'FORMAT 标记:',
    pattern_error_brackets: '无效模式：括号不匹配。',
    pattern_tip: '格式化 {date-YYYYMMDD} / {date-YYYY-MM-DD_HHmm}',
    project_name: '项目名称',
    project_name_desc: '为你的导出定义项目名称基础。',
  },
  github: {
    disconnect_success: 'GitHub 已成功断开连接。',
    error_forbidden: '访问被拒绝或受速率限制',
    error_invalid_token: 'GitHub 令牌无效。请检查你的 PAT。',
    error_repo_not_found: '未找到仓库',
    hide_token: '隐藏令牌',
    modal_connect_btn: '连接并同步',
    modal_description:
      '连接你的 GitHub 仓库，让你的简历在不同设备间保持同步，并部署到 GitHub Pages。',
    modal_pat_placeholder: 'ghp_你的个人访问令牌',
    modal_repo_placeholder: '用户名/仓库名',
    modal_title: '与 GitHub 同步',
    pat_creation_tip: "请记得选择 'Only select repositories' 并指定你希望的过期日期。",
    pat_security_note:
      "安全提示：使用仅具有对你的特定仓库的 'Contents' 读/写访问权限的 'Fine-grained' Personal Access Token，以确保最大的安全性。你可以通过以下链接创建一个：{{link}}",
    personal_token: 'Personal Access Token (PAT)',
    public_repo_note:
      '在公开仓库或通过 GitHub Pages 发布的仓库中，备份不包含你隐藏的任何内容，也不包含你的求职信和导入文件中的数据。备份仍会包含你的推荐人的姓名和联系方式，以及你在导出时选择的文件名和文件夹名称，这些名称可能包含你所申请的公司。如果你之后将私有仓库设为公开或通过 GitHub Pages 发布，其中已有的内容也可能随之公开。',
    remember_pat: '在此浏览器中持久存储令牌',
    remember_pat_tip: '如果禁用，令牌仅存储在当前会话中，并在你关闭标签页时清除。',
    repo_name: '仓库名',
    show_token: '显示令牌',
  },
  interface: {
    appearance: '外观',
    install: {
      action: '安装 KiwiCV',
      description: '像其他应用一样打开 KiwiCV，在独立窗口中使用。',
      installed: '已安装在此设备上',
      ios_hint: '点击“分享”，然后点击“添加到主屏幕”。',
      label: '应用',
      unsupported: '如果你的浏览器支持安装应用，请在地址栏或菜单中查找“安装”。',
    },
    language: 'UI语言',
    language_description: '选择你偏好的应用程序界面语言。',
    theme_description: '选择喜欢的主题。',
    theme_options: {
      dark: '深色',
      light: '浅色',
      system: '系统',
    },
    title: '系统界面',
  },
  title: '设置',
};
