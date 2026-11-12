import type { Translations } from '@/locales/en';

export const v_005_003_000: Translations['changelog']['entries']['v_005_003_000'] = {
  _highlights: {
    signatures: {
      badge: '签名',
      content:
        '亲手绘制签名、上传签名，或选择一种飘逸的手写字体，签名就会出现在简历和求职信的页脚中。一如既往，隐私优先：你可以只将它保留在此设备上，也可以在你自己的 Google Drive 或私有 GitHub 仓库中保存一份副本，和你的其他数据放在同一处。',
      title: '为你的求职材料签名',
    },
  },
  chore_dependency_updates: '与往常一样，后台的一些微小包更新使 KiwiCV 背后的技术尽可能保持最新。',
  feat_document_signature:
    '现在可以在简历和求职信的 PDF 页脚中添加签名：手动绘制、用四种手写字体之一输入姓名，或上传或粘贴一张照片并进行裁剪和旋转。签名保留在此设备上，你也可以在 Google Drive 或私有 GitHub 仓库中保存一份副本。',
  fix_tailored_translation_every_field:
    '开启“同时翻译我的简历”并根据职位描述调整时，现在也会翻译所在地、院校、专业、课程、奖项名称和兴趣爱好，不再有内容停留在原来的语言。',
};
