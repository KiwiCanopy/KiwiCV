import {
  type CVLocaleMetadata,
  getLanguageLabel,
  getLevelInfo,
  getSkillLevelLabel,
  getVisibleData,
} from '@/components/preview/themes/shared';
import {
  keepTypstHeaderWithFirstEntry,
  keepTypstHeaderWithFirstGridRow,
} from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function plain2EntryHeader(
  title: string,
  subtitle: string | undefined,
  url: string | undefined,
  fontScale: number,
): string {
  const content = `#text(size: ${10.5 * fontScale}pt, weight: "bold", fill: brand-title)[${escapeTypst(title)}]${
    subtitle
      ? ` #text(size: ${9.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]`
      : ''
  }`;

  if (url) {
    return `link("${sanitizeUrl(url)}")[${content} #text(fill: brand-text-muted)[#link-icon("external-link")]]`;
  }
  return `[${content}]`;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'education';
  const boldHeader = cvLocale.boldHeaderEducation;
  const entries = v.education.map((item) => {
    const titleText =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType}${item.area ? ` ${item.area}` : ''}`;
    const subtitleText = [
      boldHeader === 'company'
        ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
        : item.institution,
      item.location,
    ]
      .filter(Boolean)
      .join(' · ');
    const headerMarkup = plain2EntryHeader(titleText, subtitleText, item.url, fontScale);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    let entryBody = '';
    if (item.score) {
      entryBody += `${getTypstEntryDetailsGap(fontScale, '    ')}\n    #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]\n`;
    }
    if (item.courses && item.courses.length > 0) {
      entryBody += `    #v(${2 * fontScale}pt)\n    ${item.courses
        .map((course) => `#plain2-badge([${escapeTypst(course)}])`)
        .join(` #h(${4 * fontScale}pt) `)}\n`;
    }

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      body: [
${entryBody}      ]
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeSkills(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'skills';
  const cards = v.skills.map((skill) => {
    const { value } = getLevelInfo(skill.level, 'skill');
    const levelLabel = getSkillLevelLabel(skill.level, cvLocale.code);
    const keywords = skill.keywords?.filter(Boolean).join(' · ');

    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        column-gutter: ${6 * fontScale}pt,
        align: (left, right),
        text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-title)[${escapeTypst(skill.name)}],
        ${levelLabel ? `plain2-badge([${escapeTypst(levelLabel)}])` : `[]`}
      )
      ${value > 0 ? `#v(${2 * fontScale}pt)\n      #plain2-skill-bar(${value})\n      #v(${6 * fontScale}pt)` : ''}
      ${keywords ? `#text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(keywords)}]` : ''}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${12 * fontScale}pt`,
    rowGutter: `${12 * fontScale}pt`,
    trailing: `#v(${12 * fontScale}pt)\n`,
  });
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'languages';
  const cards = v.languages.map((language) => {
    const { value } = getLevelInfo(language.level, 'language');
    const displayLabel = getLanguageLabel(language.level, language.certificate, cvLocale.code);

    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        column-gutter: ${6 * fontScale}pt,
        align: (left, right),
        text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-title)[${escapeTypst(language.language)}],
        ${displayLabel ? `plain2-badge([${escapeTypst(displayLabel)}])` : `[]`}
      )
      ${value > 0 ? `#v(${3 * fontScale}pt)\n      #plain2-lang-dots(${value})` : ''}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${12 * fontScale}pt`,
    rowGutter: `${8 * fontScale}pt`,
    trailing: `#v(${12 * fontScale}pt)\n`,
  });
}
