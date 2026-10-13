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
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function badgeList(items: string[] | undefined, fontScale: number): string {
  if (!items || items.length === 0) return '';
  return `#v(${8 * fontScale}pt)
  #block(width: 100%)[${items.map((item) => `#timeless-badge("${escapeTypstString(item)}")`).join(' ')}]`;
}

function levelBar(value: number, max: number, fontScale: number, fill = 'brand-text-main'): string {
  if (value <= 0) return '';
  return `#v(${2 * fontScale}pt)
  #grid(
    columns: (1fr,) * ${max},
    column-gutter: ${3 * fontScale}pt,
    ${Array.from({ length: max })
      .map(
        (_, index) =>
          `rect(width: 100%, height: ${3 * fontScale}pt, radius: ${1.5 * fontScale}pt, fill: ${index < value ? fill : 'rgb("#eeeeee")'})`,
      )
      .join(',\n    ')}
  )`;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const entries = v.education.map((item) => {
    const titleBase =
      cvLocale.boldHeaderEducation === 'company' ? item.institution : item.studyType;
    const title =
      titleBase && cvLocale.boldHeaderEducation !== 'company' && item.area
        ? `${titleBase} — ${item.area}`
        : titleBase || (cvLocale.boldHeaderEducation === 'company' ? '' : item.area) || '';
    const subtitle = [
      cvLocale.boldHeaderEducation === 'company'
        ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
        : item.institution,
      item.location,
    ]
      .filter(Boolean)
      .join(' · ');
    const titleMarkup = item.url
      ? `#link("${sanitizeUrl(item.url)}")[#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}] #link-icon("external-link")]`
      : `#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}]`;

    return `#block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        align: (left + bottom, right + bottom),
        [${titleMarkup}],
        [#text(size: ${9 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(formatCVDateRange(item.startDate, item.endDate))}]]
      )
      ${subtitle ? `#v(${2 * fontScale}pt)\n#text(size: ${10 * fontScale}pt, style: "italic", fill: rgb("#333333"))[${escapeTypst(subtitle)}]` : ''}
      ${item.score ? `#v(${2 * fontScale}pt)\n#text(size: ${9 * fontScale}pt, fill: rgb("#666666"))[ø ${escapeTypst(item.score)}]` : ''}
      ${badgeList(item.courses, fontScale)}
    ]
    #v(${16 * fontScale}pt)`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.education || 'Education')}")`,
    entries,
  });
}

export function serializeSkills(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const cards = v.skills.map((item) => {
    const { value } = getLevelInfo(item.level, 'skill');
    const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);
    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        text(size: ${10 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(item.name)}],
        ${levelLabel ? `text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(levelLabel)}]` : '[]'}
      )
      ${levelBar(value, 4, fontScale)}
      ${item.keywords && item.keywords.length > 0 ? `#v(${4 * fontScale}pt)\n#text(size: ${9 * fontScale}pt, fill: rgb("#444444"))[${escapeTypst(item.keywords.join(', '))}]` : ''}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#timeless-section("${escapeTypstString(labels.skills || 'Skills')}")`,
    cards,
    columns: '(48%, 48%)',
    firstRowCount: 2,
    columnGutter: '4%',
    rowGutter: `${12 * fontScale}pt`,
    remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    trailing: `#v(${20 * fontScale}pt)\n`,
  });
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const cards = v.languages.map((item) => {
    const { value } = getLevelInfo(item.level, 'language');
    const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale.code);
    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        align: (left + bottom, right + bottom),
        text(size: ${10 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(item.language)}],
        ${displayLabel ? `text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(displayLabel)}]` : '[]'}
      )
      ${levelBar(value, 5, fontScale, 'brand-primary')}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#timeless-section("${escapeTypstString(labels.languages || 'Languages')}")`,
    cards,
    columns: '(30%, 30%, 30%)',
    firstRowCount: 3,
    columnGutter: '3%',
    rowGutter: `${12 * fontScale}pt`,
    remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    trailing: `#v(${20 * fontScale}pt)\n`,
  });
}
