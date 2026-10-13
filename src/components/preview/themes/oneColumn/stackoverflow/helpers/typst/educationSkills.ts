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

function badgeList(items?: string[]): string {
  if (!items || items.length === 0) return '';
  return `#v(2pt)
  #block(width: 100%)[${items.map((item) => `#stackoverflow-badge("${escapeTypstString(item)}")`).join(' ')}]`;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange } = context;
  if (!v.education || v.education.length === 0) return '';

  const entries = v.education.map((item) => {
    const titleBase =
      cvLocale.boldHeaderEducation === 'company' ? item.institution : item.studyType;
    const title =
      titleBase && cvLocale.boldHeaderEducation !== 'company' && item.area
        ? `${titleBase} — ${item.area}`
        : titleBase || (cvLocale.boldHeaderEducation === 'company' ? '' : item.area) || '';
    const org = [
      cvLocale.boldHeaderEducation === 'company'
        ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
        : item.institution,
      item.location,
    ]
      .filter(Boolean)
      .join(' · ');
    const titleMarkup = item.url
      ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", fill: brand-dark)[${escapeTypst(title)}] #link-icon("external-link")]`
      : `#text(weight: "bold", fill: brand-dark)[${escapeTypst(title)}]`;

    return `#stackoverflow-entry(
      title: [${titleMarkup}${org ? ` #text(fill: brand-text-muted)[${escapeTypst(org)}]` : ''}],
      date: [${escapeTypst(formatCVDateRange(item.startDate, item.endDate))}],
      body: [
        ${item.score ? `#text(size: 9pt, fill: brand-text)[ø ${escapeTypst(item.score)}]` : ''}
        ${badgeList(item.courses)}
      ]
    )`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.education || 'Education')}")`,
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
        text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-dark)[${escapeTypst(item.name)}],
        ${levelLabel ? `text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(levelLabel)}]` : '[]'}
      )
      ${value > 0 ? `#v(${2 * fontScale}pt)\n#stackoverflow-discrete-bar(${value}, max: 4)\n#v(${8 * fontScale}pt)` : ''}
      ${badgeList(item.keywords)}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#stackoverflow-section("${escapeTypstString(labels.skills || 'Skills')}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${20 * fontScale}pt`,
    rowGutter: `${12 * fontScale}pt`,
    remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    trailing: `#v(${10 * fontScale}pt)\n`,
  });
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const cards = v.languages.map((item) => {
    const { value, max } = getLevelInfo(item.level || item.certificate, 'language');
    const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale.code);

    return `block(width: 100%, breakable: false)[
      #grid(
        columns: (1fr, auto),
        align: (left + horizon, right + horizon),
        text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-dark)[${escapeTypst(item.language)}],
        ${displayLabel ? `text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(displayLabel)}]` : '[]'}
      )
      ${value > 0 ? `#v(${2 * fontScale}pt)\n#stackoverflow-discrete-bar(${value}, max: ${max})\n#v(${8 * fontScale}pt)` : ''}
    ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#stackoverflow-section("${escapeTypstString(labels.languages || 'Languages')}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${20 * fontScale}pt`,
    rowGutter: `${12 * fontScale}pt`,
    remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    trailing: `#v(${10 * fontScale}pt)\n`,
  });
}
