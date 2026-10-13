export const landing = {
  closing: {
    eyebrow: '开始前有什么问题吗？',
    kofi: '在 Ko-fi 上支持这个项目',
    primary_action: '创建你的简历',
    secondary_action: '导入一份简历',
    title: '准备好创建你的求职材料了吗？',
  },
  hero: {
    pricing_note: '使用 AI 需要 Pass — 无订阅费。编辑和 PDF 导出始终免费。',
    primary_action: '创建你的简历',
    secondary_action: '导入一份简历',
    subtitle:
      '<strong class="text-foreground">粘贴职位描述</strong>，KiwiCV 便会据此定制你的简历并撰写匹配的求职信 — 两者都以建议的形式呈现，你可以先审阅再保留。或者导入任意语言的简历，自己打磨，并在准备就绪后导出。',
    theme_switcher_label: '尝试一键切换设计',
    title: '数秒生成针对职位的求职申请 — 告别排版混乱，PDF 导出永不付费锁定。',
  },
  pricing: {
    eyebrow: '价格',
    free: {
      editor: '撰写和编辑简历',
      export: '不限次数导出 PDF',
      sync: '云端备份到 Google Drive 或 GitHub',
      templates: '所有模板',
      title: '始终免费',
    },
    pass: {
      import: '从 PDF 或 Word 导入你现有的简历',
      improve: '优化单个条目、某个章节或整份简历',
      keywords: '在你的经历可佐证的地方采用职位描述中的关键词 — 绝不虚构技能',
      letter: '撰写匹配求职信的草稿',
      tailor: '根据职位描述定制你的简历',
      title: '有了 Pass，即可使用 AI 帮助',
      translate: '将整份简历翻译成另一种语言',
    },
    promise_paywall:
      '你绝不会在精心制作简历 45 分钟后，才发现 PDF 被锁定在 20 €/月的订阅之后。导出功能始终完全免费。',
    promise_title: '“零人质”承诺：',
    subtitle: '创建和导出简历完全免费。只有在需要 AI 帮助时才需付费。',
    title: '公平的定价。无订阅费。',
  },
  privacy: {
    ai_description: 'AI 在欧盟服务器上运行（Google Vertex AI）。你的数据绝不用于训练模型。',
    ai_title: '可选 AI',
    eyebrow: '隐私与所有权',
    learn_more: '了解 KiwiCV 如何处理你的数据',
    summary:
      '默认情况下，你的简历保存在此浏览器中。AI 和云端备份是可选的。在你开启其中任何一项之前，KiwiCV 会说明哪些数据将离开你的设备。',
    title: '你的简历始终属于你',
  },
  proof: {
    eyebrow: '为真实的简历工作而生',
    languages: {
      description:
        '导入任意语言撰写的简历。KiwiCV 能够读取内容，并可将其翻译成其支持的任意语言 —— 当同一份简历日后需要适配不同职位时也可以翻译。',
      title: '任意语言',
    },
    ownership: {
      description: '以开放、可导出的格式保存你的信息。',
      title: '可移植的简历数据',
    },
    templates: {
      description: '无需重新输入内容即可切换设计。',
      title: '专业模板',
    },
    title: '无需繁琐的格式调整，即可获得出色的效果',
    versions: {
      description: '定制一份副本，同时保持原件完好无损。',
      title: '为每个职位准备一个版本',
    },
  },
  sections: {
    closing_cta: {
      subtitle:
        '加入那些使用 KiwiCV 抓住更多机会的求职者。你不再提供平庸的模板，而是创建独特的内容，统计显示这能大幅提高面试邀请率。告别“也许”，让你的专业能力被看见。',
      title: '你的才华值得 <span class="text-primary-strong">更出色的表现</span>。',
    },
    faq: {
      contact_desc:
        '透明度对我来说非常重要。如果你还有任何不清楚的地方，请随时发送电子邮件至 <a href="mailto:{CONTACT_EMAIL}" class="text-primary-strong hover:underline">{CONTACT_EMAIL}</a>。我的目标是在一天内亲自为你提供帮助。',
      contact_title: '你还有任何问题或建议吗？',
      q1: {
        answer:
          '我比大多数其他平台都更看重数据隐私。在 KiwiCV，你无需为了获取职位推荐而被迫透露个人数据。因此，你在这里既看不到职位推荐，也看不到任何广告。AI 本身完全在欧盟境内运行（Google Vertex AI，欧盟区域）。在此途中，你的请求会经过托管服务商 Netlify，其服务器位于美国。你的个人数据绝不会用于训练 AI 模型。',
        question: '我的简历中包含敏感数据。它们在 KiwiCV 中安全吗？',
      },
      q2: {
        answer:
          '不，恰恰相反。KiwiCV 保证你拥有完全的自由。你的数据随时对你保持 100% 可用。你在此处创建的所有信息都可以随时免费获取，既可以在本地浏览器中直接获取，也可以通过你自己的云端连接获取。KiwiCV 有意避免将你的简历“隐藏”在封闭的专有云中，因此你的数据永远不会面临被收入付费墙的风险。即使在极不可能的情况下 KiwiCV 停止服务，这也不会对你的数据产生任何影响，因为数据始终由你保存，绝不会永久存储在 KiwiCV 的服务器上。',
        question: '如果我在这里创建简历，它是否仅在 KiwiCV 中可用？',
      },
      q3: {
        answer:
          '不会。你的简历只是被 AI 进行了优化。AI 助手被配置为不虚构任何信息。它只是更精确地表述你现有的资历，以提高与目标职位的相关性，并最大程度地增加你的成功机会。',
        question: '招聘人员会发现我的简历是用 AI 撰写的吗？',
      },
      q4: {
        answer:
          '首先是拒绝成为“赚钱机器”的哲学。我的首要目标是帮助你最大化你的机会——公平且透明。KiwiCV 并不代表一个具体的产品，而是代表一个目标。例如，博客的诞生就是为了向你提供知识和背景信息，以便你自己了解如何提高自己的机会。',
        question: 'KiwiCV 与其他平台有什么不同？',
      },
      q5: {
        answer:
          'KiwiCV 有意避免将你制作完成的简历永久保存在中央服务器上。长期存储完全以去中心化的方式进行：要么保存在你的本地设备上，要么保存在你自己的云端空间（如 Google Drive 或 GitHub）中。\n\nDrive 权限请求旨在为你提供这个安全且专属的存储位置。在此期间：KiwiCV 仅获取访问其自身在你的 Drive 中创建的文件的权限。你的其他数据将完全不受影响。此外，该权限是完全可选的。你可以在注册时跳过它，并且仍然可以使用 AI 功能。你也可以稍后随时通过“保存”或“导出”按钮来启用云端存储。',
        question: '为什么 KiwiCV 会请求 Google Drive 权限？',
      },
      q6: {
        answer:
          '我有意避免空洞的承诺。在 KiwiCV，你不会读到类似“我们保证你能找到理想的工作”、“我们从 127 个维度进行优化”或“你的新 ATS 分数为 96/100”等无法证实的口号。我会尽可能公开且通俗易懂地阐明所有 application 策略——无论是在网站上还是在博客中。如果你觉得有什么不清楚的地方，请与我联系并告知我，你可能不是唯一有此疑问的人。',
        question: 'KiwiCV 中的“公平且透明”意味着什么？',
      },
      tag: '常见问题',
      title: '常见问题解答',
    },
    pricing_section: {
      auth_desc: '登录以解锁 AI 助手。你的数据将保持安全',
      tag: '价格总览',
      title: '公平价格。<span class="text-primary-strong">无订阅。</span>',
    },
  },
  testimonial: {
    label: '一位 KiwiCV 用户这样说',
    new_tab: '（在新标签页中打开）',
    next: '下一则用户心声',
    position: '{current} / {total}',
    position_label: '第 {current} 则用户心声，共 {total} 则',
    previous: '上一则用户心声',
    source_link: '阅读原帖',
  },
  workflow: {
    create: {
      description: '从头开始，或者导入你已有的简历。',
      title: '创建或导入',
    },
    edit: {
      description: '编辑你的内容并选择合适的设计。',
      title: '打磨细节',
    },
    export: {
      description: '下载结果或保留可选的云端备份。',
      title: '导出或备份',
    },
    eyebrow: '工作流程',
    preview: {
      description: '在分享之前检查制作完成的简历。',
      title: '预览效果',
    },
    tailor: {
      description: '当职位需要更具针对性的版本以及匹配的求职信时，使用可选的 AI 帮助。',
      title: '需要时进行定制',
    },
    title: '从初稿到发送就绪',
  },
};
