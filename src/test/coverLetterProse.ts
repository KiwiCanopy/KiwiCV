import { type CoverLetterCharacterLang } from '@/constants/ai';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { countCoverLetterCharacters, countCoverLetterWords } from '@/utils/coverLetterLength';

/**
 * The English letter the KiwiCanopy print flyers show, paired with the
 * placeholder résumé. `renderThemePdf`'s `placeholder-letter` fixture renders
 * it, and the capacity sweep cycles its body: real application prose, ~5
 * letters a word, so a capacity read off it is a capacity for the letters the
 * generator writes rather than for filler.
 */
export const PLACEHOLDER_LETTER_EN = [
  'Dear Ms Muster,',
  'I read your posting for the Senior Software Engineer position with great interest. Muster GmbH has been guiding mid-sized companies through the digitalisation of their core processes for over twenty years, and it is exactly this combination of technical ambition and tangible value for your customers that makes me want to join you.',
  "Over the past eight years I have built scalable web applications and distributed systems, most recently as a Senior Software Engineer at Google in Munich. There I led the migration of a legacy monolith to a microservices architecture and co-designed a global search indexing service that handles more than a billion queries a day. Along the way I learned that good software comes from clear interfaces, honest tests and a team that has each other's backs.",
  'What appeals to me most about your posting is owning the whole lifecycle of an application: from gathering requirements with your customers, through architecture, to running it in the cloud. With TypeScript, React, Node.js, Docker and Kubernetes I bring the toolbox your posting names, and with leading a team of seven the experience of passing knowledge on without letting go of the code.',
  'I would be glad to discuss in person how I can support your team in Berlin. My notice period is three months; an earlier start is possible by arrangement. I very much look forward to your invitation.',
  'Kind regards',
];

/**
 * The same letter in Simplified Chinese, for the character-unit capacity sweep
 * Not a translation of the flyer copy for its own sake — it exists so a
 * capacity is read off a realistic glyph and punctuation mix. Full-width commas
 * and the enumeration comma matter: they occupy a full em like an ideograph, so
 * filler made of ideographs alone measures a page that real prose never fills.
 */
export const PLACEHOLDER_LETTER_ZH = [
  '尊敬的招聘负责人：',
  '贵公司发布的高级软件工程师职位让我非常感兴趣。慕斯特有限公司二十多年来一直帮助中型企业完成核心业务流程的数字化转型，这种将技术追求与客户实际价值相结合的理念，正是我希望加入贵公司的原因。',
  '过去八年间，我一直从事可扩展网络应用与分布式系统的开发工作，最近在慕尼黑谷歌担任高级软件工程师。在那里，我主导了将遗留单体架构迁移至微服务架构的项目，并参与设计了每天处理超过十亿次查询的全球搜索索引服务。这段经历让我明白，优秀的软件源于清晰的接口、诚实的测试，以及一支相互信任的团队。',
  '职位描述中最吸引我的，是能够全程负责一个应用的完整生命周期：从与客户共同梳理需求，到架构设计，再到云端运维。我熟悉贵公司所要求的技术栈，同时具备带领七人团队的经验，懂得如何在传授知识的同时不脱离代码。',
  '我很期待有机会当面探讨如何为贵公司柏林的团队提供支持。我的离职通知期为三个月，经协商可以更早入职。期待您的回复。',
  '此致敬礼',
];

/**
 * The same letter in Japanese. Kept separate from `zh` so the sweep can
 * measure the two rather than assume them equal — the kana share differs from
 * the Chinese text's.
 *
 * ⚠️ **Both render on the SC face.** `TYPST_FONTS` lists `Noto Sans CJK SC`
 * ahead of `Noto Sans CJK JP` in both stacks, so Typst resolves this fixture's
 * kana and kanji against SC, here and in production alike. Do not describe the
 * two readings as coming from different faces.
 */
export const PLACEHOLDER_LETTER_JA = [
  '採用ご担当者様',
  '貴社が募集されているシニアソフトウェアエンジニアの求人を拝見し、大変興味を持ちました。ムスター社は二十年以上にわたり、中堅企業の基幹業務のデジタル化を支援してこられました。技術的な高い志とお客様にとっての確かな価値を両立させるその姿勢こそが、私が貴社で働きたいと考える理由です。',
  'この八年間、拡張性の高いウェブアプリケーションと分散システムの開発に携わり、直近ではミュンヘンのグーグルでシニアソフトウェアエンジニアを務めておりました。そこではレガシーなモノリスからマイクロサービスへの移行を主導し、一日あたり十億件を超えるクエリを処理するグローバル検索インデックスサービスの設計にも参加いたしました。優れたソフトウェアは明確なインターフェース、誠実なテスト、そして互いを支え合うチームから生まれるのだと学びました。',
  '求人内容で最も魅力を感じたのは、要件の整理からアーキテクチャ設計、クラウドでの運用まで、アプリケーションのライフサイクル全体を担える点です。貴社が挙げておられる技術を扱ってまいりましたし、七名のチームを率いた経験から、コードを手放すことなく知識を引き継ぐ方法も心得ております。',
  'ベルリンのチームをどのように支援できるか、ぜひ直接お話しさせていただければ幸いです。退職までの期間は三か月ですが、ご相談により早期の着任も可能です。ご連絡を心よりお待ちしております。',
  '敬具',
];

const SALUTATION = PLACEHOLDER_LETTER_EN[0];
const CLOSING = PLACEHOLDER_LETTER_EN.at(-1) as string;
const BODY_WORDS = PLACEHOLDER_LETTER_EN.slice(1, -1).join(' ').split(/\s+/).filter(Boolean);
/** Body paragraphs are cut every this many words — the shape of a real letter. */
const WORDS_PER_PARAGRAPH = 90;

/**
 * A letter whose paragraphs total exactly `words` as `countCoverLetterWords`
 * counts them, salutation and closing included.
 */
export function buildLetterParagraphs(words: number): string[] {
  const bodyWords = Math.max(0, words - countCoverLetterWords([SALUTATION, CLOSING]));

  const stream: string[] = [];
  while (stream.length < bodyWords) stream.push(...BODY_WORDS);
  stream.length = bodyWords;

  const body: string[] = [];
  for (let start = 0; start < stream.length; start += WORDS_PER_PARAGRAPH) {
    body.push(stream.slice(start, start + WORDS_PER_PARAGRAPH).join(' '));
  }
  return [SALUTATION, ...body, CLOSING];
}

/**
 * ⚠️ Derived from `COVER_LETTER_CHARACTER_LANGS`, never restated: adding a
 * language there must fail this file to compile until it has a fixture, rather
 * than let the sweep measure it on another script's face.
 */
export type LetterScript = CoverLetterCharacterLang;

const CJK_LETTERS: Record<LetterScript, readonly string[]> = {
  zh: PLACEHOLDER_LETTER_ZH,
  ja: PLACEHOLDER_LETTER_JA,
};

/** Body paragraphs are cut every this many characters — the shape of a real CJK letter. */
const CHARS_PER_PARAGRAPH = 160;

/**
 * A CJK letter whose paragraphs total exactly `chars` as
 * `countCoverLetterCharacters` counts them, salutation and closing included.
 *
 * ⚠️ Cycles **characters**, not words, and cuts paragraphs on a character count.
 * The Latin builder can slice on word boundaries because they exist; here the
 * stream is graphemes-as-code-units and a cut can land mid-sentence. That is
 * fine for a capacity measurement — the renderer breaks CJK lines between any
 * two characters anyway, which is exactly why the character is the unit — but
 * it makes this fixture unfit for anything that reads the prose.
 */
export function buildCjkLetterParagraphs(chars: number, script: LetterScript): string[] {
  const letter = CJK_LETTERS[script];
  const salutation = letter[0];
  const closing = letter.at(-1) as string;
  const bodyChars = Math.max(0, chars - countCoverLetterCharacters([salutation, closing]));
  const source = [...letter.slice(1, -1).join('').replace(/\s+/g, '')];

  const stream: string[] = [];
  while (stream.length < bodyChars) stream.push(...source);
  stream.length = bodyChars;

  const body: string[] = [];
  for (let start = 0; start < stream.length; start += CHARS_PER_PARAGRAPH) {
    body.push(stream.slice(start, start + CHARS_PER_PARAGRAPH).join(''));
  }
  return [salutation, ...body, closing];
}

/**
 * The `single` fixture carrying a letter of `words` words in the given layout,
 * with the fullest furniture a letter can carry — sender and recipient shown,
 * subject, date, signature footer — so the capacity it measures is the floor.
 */
export function buildLetterResume(
  themeId: string,
  options: {
    classicLayout: boolean;
    fontScale?: number;
  } & (
    | { words: number; script?: undefined }
    // ⚠️ A union, so the unit and the script cannot be supplied apart. Passing a
    // word count with a script, or a character count without one, both used to
    // typecheck and both produce a valid PDF at roughly 2.5x the wrong size —
    // the exact failure this type exists to remove.
    | { chars: number; script: LetterScript }
  ),
): ResumeData {
  const data = buildSingleItemResume(themeId, { classicLetter: options.classicLayout });
  data.coverLetter = {
    ...data.coverLetter,
    paragraphs: options.script
      ? buildCjkLetterParagraphs(options.chars, options.script)
      : buildLetterParagraphs(options.words),
    recipient: {
      name: 'Ms Erika Muster',
      company: 'Muster GmbH',
      address: '1 Example Street, 10115 Berlin',
    },
    subject: 'Application as Senior Software Engineer',
  };
  data.meta.theme.params = { ...data.meta.theme.params, fontSizeScale: options.fontScale ?? 1 };
  return data;
}
