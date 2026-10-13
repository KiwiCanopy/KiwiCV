import {
  type CVLocaleMetadata,
  getLanguageLabel,
  getLevelInfo,
  getSkillLevelLabel,
  getVisibleData,
} from '@/components/preview/themes/shared';
import {
  escapeTypst,
  escapeTypstString,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange } = context;
  if (!v.education || v.education.length === 0) return '';

  let markup = '';
  const boldHeader = cvLocale.boldHeaderEducation;
  v.education.forEach((item, index) => {
    const title =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType || ''}${item.area ? ` ${item.area}` : ''}`;
    const org =
      boldHeader === 'company'
        ? `${item.studyType || ''}${item.area ? ` — ${item.area}` : ''}`
        : item.institution;
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    let studyDetails = '';
    if (item.score) {
      studyDetails += `ø ${item.score}`;
    }

    const coursesText =
      item.courses && item.courses.length > 0
        ? `\n  #v(2pt)\n  ${item.courses
            .map((c) => `#badge([${escapeTypst(c)}])`)
            .join(' #h(4pt) ')}`
        : '';

    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(title || '')}],
  org: [${escapeTypst(org || '')}],
  location: [${escapeTypst(item.location || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${studyDetails ? `${escapeTypst(studyDetails)}\n` : ''}
  ${coursesText}
]\n`;

    if (index === 0) {
      markup += `\n// Education\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.education)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeSkills(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  let gridMarkup = `#grid(
  columns: (1fr, 1fr),
  column-gutter: ${20 * fontScale}pt,
  row-gutter: ${10 * fontScale}pt,
`;
  v.skills.forEach((skill) => {
    const { value: levelVal } = getLevelInfo(skill.level, 'skill');
    const levelLabel = getSkillLevelLabel(skill.level, cvLocale.code);

    gridMarkup += `  block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      text(weight: "bold")[${escapeTypst(skill.name || '')}],
      ${levelLabel ? `text(fill: brand-text-muted, size: ${8 * fontScale}pt, style: "italic")[${escapeTypst(levelLabel)}]` : '[]'}
    )
    #v(${2 * fontScale}pt)
    ${levelVal > 0 ? `#discrete-level-bar(${levelVal}, max: 4)` : ''}
    ${
      skill.keywords && skill.keywords.length > 0
        ? `\n    #v(${2 * fontScale}pt)\n    ${skill.keywords
            .map((kw) => `#badge([${escapeTypst(kw)}])`)
            .join(` #h(${4 * fontScale}pt) `)}`
        : ''
    }
  ],\n`;
  });
  gridMarkup += `)\n`;

  return `\n// Skills\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.skills)}")
  ${gridMarkup}
]\n`;
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  let gridMarkup = `#grid(
  columns: (1fr, 1fr),
  column-gutter: ${20 * fontScale}pt,
  row-gutter: ${10 * fontScale}pt,
`;
  v.languages.forEach((lang) => {
    const { value: levelVal, max } = getLevelInfo(lang.level, 'language');
    const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);

    gridMarkup += `  block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      text(weight: "bold")[${escapeTypst(lang.language || '')}],
      ${displayLabel ? `text(fill: brand-text-muted, size: ${8 * fontScale}pt, style: "italic")[${escapeTypst(displayLabel)}]` : '[]'}
    )
    #v(${2 * fontScale}pt)
    ${levelVal > 0 ? `#discrete-level-bar(${levelVal}, max: ${max})` : ''}
  ],\n`;
  });
  gridMarkup += `)\n`;

  return `\n// Languages\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.languages)}")
  ${gridMarkup}
]\n`;
}
