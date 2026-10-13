import type { Translations } from '@/locales/en';

export const extras: Translations['extras'] = {
  about: {
    family_intro: 'KiwiCV 是 KiwiCanopy 旗下构建的众多工具之一。探索该系列的其余成员。',
    family_title: 'KiwiCanopy 大家庭的一员',
    kiwicanopy_desc: 'KiwiCanopy 大家庭的大本营，所有工具汇聚于此。',
    kiwidesk_desc: 'KiwiCanopy 大家庭中的姐妹应用。',
    story_p1:
      '无论是对我自己，还是在与朋友、熟人的交流中，我都一再经历同样的挫折：为每一次新的申请而辛苦地重写简历。每个人都希望针对特定职位精准调整自己的经历，而又不会显得简历过于臃肿。然而，传统工具却让这一切变得非常痛苦：为了每一次微小的调整，往往需要重新创建一个完整的文件，这很快就会演变成无休止的版本混乱。',
    story_p2:
      '正因如此，我创立了 KiwiCV：一个模块化的简历生成器，你可以从中非常容易地开启或关闭单个经历，自由移动板块并灵活导出——所有这些都可以在一个中央视图中完成。不再需要在无数的 Word 文档之间进行麻烦的复制粘贴。你的整个职业历史都有了一个固定的家，而你只需轻松地为每一次申请挑选出你现在想要展示的内容。',
    story_title: 'KiwiCV 背后的故事',
    title: '关于 KiwiCV',
    visit_site: '访问网站',
  },
  howto: {
    core: {
      ai_assistant: 'AI 助手',
      ai_assistant_desc: '使用 AI 助手优化单个项目、部分或整个简历。寻找 {wardsymbol} 图标！',
      hide_show: '显示/隐藏',
      hide_show_desc: '为了避免不断删除和重新插入条目，你可以单击一下隐藏单个项目或整个部分。',
      move_items_desc: '在侧边栏和主列之间拖放部分或单个项目。',
      page_breaks: '分页符',
      page_breaks_desc:
        '插入手动分页符，确保你的 PDF 导出效果符合你的预期。这仅影响 PDF，不影响 Web 版本。',
      rearrange: '重新排列',
      rearrange_desc: '重新排列任何部分内的项目，以重点展示你想要突出的内容。',
      switch_sides: '切换侧边',
      switch_sides_desc: '轻松交换主列和侧边栏，找到内容的最佳布局。',
      title: '核心功能',
    },
    footer: {
      message: '希望未来使用 KiwiCV 编写简历会不再烦人，变得更有趣！祝你求职顺利！',
    },
    github: {
      create_pat_link: '在 GitHub 上创建令牌',
      create_repo_link: '在 GitHub 上创建仓库',
      go_to_settings: '前往设置',
      intro:
        '将你的简历连接到GitHub仓库，实现自动多语言处理、版本控制和简单的托管。请按照以下三个步骤操作：',
      pat_security_tip:
        "安全性提示：使用仅对你的特定仓库具有 'Contents' 读/写权限的 'Fine-grained' Personal Access Token。请记住选择 'Only select repositories' 并设置你的首选过期日期。",
      step1_desc:
        '在 GitHub 上创建一个新的私有仓库。你可以先将其完全留空（不需要 README 和 .gitignore）。',
      step1_title: '创建一个仓库',
      step2_desc:
        '你需要一个 Personal Access Token (PAT) 才能允许 KiwiCV 将你的简历推送到你的仓库。为了获得最大的安全性，我建议使用 fine-grained 令牌。',
      step2_title: '创建 Personal Access Token',
      step3_desc:
        '前往设置页面，在 GitHub 部分输入你的仓库详细信息和令牌。或者，点击右上角的 GitHub 按钮打开一个表单，你也可以在该处输入你的 PAT。',
      step3_title: '在 KiwiCV 中连接',
      title: 'GitHub 连接指南',
    },
    hosting: {
      automated_title: '选项 B：自动托管（通过 GitHub）',
      github_pages_desc:
        '使用 KiwiCV 生成的 HTML 文件并将其上传到 GitHub 仓库。在仓库设置中启用 GitHub Pages，即可为你的简历获得免费的公开 URL。',
      github_pages_title: 'GitHub Pages',
      intro: '你可以免费托管生成的 HTML 版本简历。以下是最常见的选项：',
      manual_title: '选项 A：手动上传（不需要 GitHub）',
      netlify_desc:
        'Netlify 或 Vercel 等服务提供免费的静态托管，支持简单的拖放部署或与你的 GitHub 仓库自动同步。你可以在那里上传 HTML 简历，而无需公开你的编辑历史记录。',
      netlify_drop_desc:
        '通过个人 URL 确保你的竞争优势。有许多 **免费提供商** 可以在 **几秒钟内** 将你的简历上线。无论是通过上面链接的工具还是 [Tiiny.host](https://tiiny.host) 等替代方案：只需快速 **拖放** 你的网站即可在网络上拥有专业形象。',
      netlify_drop_title: '快速简便：Netlify Drop',
      netlify_title: 'Netlify, Vercel & Co.',
      privacy_warning:
        '注意： 除非你拥有付费的 GitHub 计划，否则你必须将仓库公开才能使用 GitHub Pages。这意味着你的整个简历历史记录（所有提交记录）都将对所有人可见！如果隐私很重要，请考虑使用第一个选项。',
      push_folder_hint:
        'KiwiCV 专门支持仅将 HTML 文件推送到仓库中的特定文件夹。请查看预览页面上的高级设置。',
      sensitive_data_warning:
        '隐私警告：如果你通过公开 URL 托管简历，任何人都可以访问你的数据。请考虑删除高度敏感的个人信息，例如你的详细地址、电话号码和电子邮件地址。',
      title: '托管你的简历',
    },
    pdf_guide: {
      font_size: '字体大小',
      font_size_desc: '在设计选项卡中调整字体大小以优化空间。',
      intro: 'PDF 渲染很复杂。你可以尝试以下功能，直到文档完全符合你的要求：',
      rearrange_sections: '重新排列',
      rearrange_sections_desc: '重新排列部分通常可以解决“孤行”或尴尬的分页符。',
      space_opt: '空间优化',
      space_opt_desc: '有时将较短的部分移动到侧边栏可以释放足够的空间以获得整洁的布局。',
      title: 'PDF 布局技巧',
      use_pagebreaks: '使用分页符',
      use_pagebreaks_desc: '靠近边缘的项目有时会渲染不佳。使用分页符将其干净地推送到下一页。',
    },
    sync_guide: {
      auto_recognition_desc: '切换语言会触发检查云端是否已存在该版本。',
      auto_recognition_title: '自动识别',
      desc: 'KiwiCV 支持多种语言。当你保存或备份简历时，应用程序会为当前激活的语言创建一个特定版本。稍后切换语言时，KiwiCV 将识别现有备份并提供恢复。',
      language_specific_desc: '每个语言版本都作为单独的条目存储在你的云存储库中。',
      language_specific_title: '语言特定',
      title: '智能语言备份',
    },
    toc_title: '目录',
  },
  page_description:
    '背景、支持与愿景：探索如何充分利用 KiwiCV，我们的发展方向，以及你的简历生成器背后的故事。',
  page_title: '扩展',
  tabs: {
    about: '关于 KiwiCV',
    changelog: '更新日志',
    howto: '使用指南',
    roadmap: '路线图',
  },
};
