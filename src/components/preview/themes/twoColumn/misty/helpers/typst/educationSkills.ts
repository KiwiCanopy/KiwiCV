import {
  type CVLocaleMetadata,
  getLanguageLabel,
  getLevelInfo,
  getSkillLevelLabel,
  getVisibleData,
} from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
  levelBarType: string;
}

function getEntryHeaderMarkupSide(
  title: string,
  url: string | null | undefined,
  fontScale: number,
): string {
  const textMarkup = `#text(weight: "bold", size: ${8.5 * fontScale}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (url) {
    const validUrl = sanitizeUrl(url);
    return `#link("${validUrl}")[${textMarkup} #h(${2 * fontScale}pt) #link-icon("external-link")]`;
  }
  return textMarkup;
}

export function serializeEducation(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'education';
  const boldHeader = cvLocale.boldHeaderEducation;

  const entries = v.education.map((item, index) => {
    const titleText =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType || ''}${item.area ? ` ${item.area}` : ''}`;
    const subtitleText =
      boldHeader === 'company'
        ? `${item.studyType || ''}${item.area ? ` — ${item.area}` : ''}`
        : item.institution;
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    #text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n    ${getEntryHeaderMarkupSide(titleText, item.url, fontScale)}
    ${subtitleText || item.location ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([subtitleText, item.location].filter(Boolean).join(' · '))}]` : ''}
    ${item.score ? ` \\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]` : ''}
  ]`;
    }

    const rowContent = `    (
      isPresent: ${isOngoingEndDate(item.endDate)},
      isLast: ${index === v.education.length - 1},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          if "${sanitizeUrl(item.url)}" != "" [
            #link("${sanitizeUrl(item.url)}")[
              #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]
              #h(${4 * fontScale}pt)
              #link-icon("external-link")
            ]
          ] else [
            #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]
          ],
          if "${escapeTypstString(dateStr)}" != "" [
            #box(fill: rgb("#f1f5f9"), radius: ${3 * fontScale}pt, inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt), text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}])
          ]
        )
        #if "${escapeTypstString(subtitleText)}" != "" or "${escapeTypstString(item.location)}" != "" [
          ${getTypstEntrySubheaderGap(fontScale, '          ', false)}
          #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "medium")[
            #(("${escapeTypstString(subtitleText)}", "${escapeTypstString(item.location)}").filter(x => x != "").join(" · "))
          ]
        ]
        ${item.score ? `#v(${4 * fontScale}pt)\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]\n` : ''}        ${
          item.courses && item.courses.length > 0
            ? `#v(${4 * fontScale}pt)\n        ${item.courses.map((c) => `#misty-badge([${escapeTypst(c)}])`).join(` #h(${4 * fontScale}pt) `)}`
            : ''
        }
      ]
    ),\n`;
    return `#misty-timeline(rows: (${rowContent}))`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializeSkills(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale, levelBarType } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'skills';
  const entries = v.skills.map((skill) => {
    const { value } = getLevelInfo(skill.level, 'skill');
    const levelLabel = getSkillLevelLabel(skill.level, cvLocale.code);
    // Trailing comma so a single keyword stays a Typst array (`([kw],)`), not
    // grouping — `.map()` below would otherwise fail to compile.
    const keywordsList = (skill.keywords || []).map((k) => `[${escapeTypst(k)}],`).join(' ');

    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        text(weight: "bold", size: ${9 * fontScale}pt)[#cv-upper[${escapeTypst(skill.name)}]],
        ${levelLabel ? `text(size: ${7 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(levelLabel)}]` : `[]`}
      )
      #v(${2 * fontScale}pt)
      ${value > 0 ? `#discrete-level-bar(${value}, max: 4, style: "${levelBarType === 'dots' ? 'dots' : 'bars'}")\n` : ''}
      ${!isSide && skill.keywords && skill.keywords.length > 0 ? `#v(${4 * fontScale}pt)\n      #box((${keywordsList}).map(kw => misty-badge(kw)).join(h(${4 * fontScale}pt)))` : ''}
    ]`;
  });

  const content = `#grid(
    columns: (${isSide ? '1fr' : '1fr, 1fr'}),
    column-gutter: ${isSide ? 0 : 16 * fontScale}pt,
    row-gutter: ${14 * fontScale}pt,
    ${entries.join(',\n')}
  )`;

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: [content],
  });
}

export function serializeLanguages(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale, levelBarType } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'languages';
  const entries = v.languages.map((lang) => {
    const { value } = getLevelInfo(lang.level, 'language');
    const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        text(weight: "bold", size: ${9 * fontScale}pt)[${escapeTypst(lang.language)}],
        ${displayLabel ? `text(size: ${7 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(displayLabel)}]` : `[]`}
      )
      #v(${2 * fontScale}pt)
      ${value > 0 ? `#discrete-level-bar(${value}, max: 5, style: "${levelBarType === 'dots' ? 'dots' : 'bars'}")\n` : ''}
    ]`;
  });

  const content = `#grid(
    columns: (${isSide ? '1fr' : '1fr, 1fr'}),
    column-gutter: ${isSide ? 0 : 16 * fontScale}pt,
    row-gutter: ${10 * fontScale}pt,
    ${entries.join(',\n')}
  )`;

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: [content],
  });
}
