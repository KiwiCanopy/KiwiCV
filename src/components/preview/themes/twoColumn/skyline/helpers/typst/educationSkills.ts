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
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import {
  educationTimelineRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function linkTitle(title: string, url: string | null | undefined, size: number): string {
  const titleMarkup = `#text(weight: "bold", size: ${size}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (!url) return titleMarkup;
  return `#link("${sanitizeUrl(url)}")[${titleMarkup} #h(3pt) #link-icon("external-link")]`;
}

function dateBadge(date: string, fontScale: number): string {
  if (!date) return '[]';
  return `box(
    fill: brand-primary-very-light,
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${8 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

export function serializeEducation(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const entries = v.education.map((item, index) => {
    const row = educationTimelineRow(item, cvLocale, formatCVDateRange);
    const { title, date, score, url } = row;
    const line = subtitleLine(row);

    if (isSide) {
      return `#block(width: 100%, breakable: false)[
  ${date ? `#text(size: ${7.5 * fontScale}pt, weight: "medium", fill: brand-primary)[#cv-upper[${escapeTypst(date)}]]\\ ` : ''}
  ${linkTitle(title, url, 8.5 * fontScale)}
  ${line ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(line)}]` : ''}
  ${score ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${7 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(score)}]` : ''}
]
#v(${index < v.education.length - 1 ? 20 * fontScale : 0}pt)`;
    }

    const courseBadges = (row.courses || [])
      .map((course) => `#skyline-badge([${escapeTypst(course)}])`)
      .join(` #h(${4 * fontScale}pt) `);

    return `#block(width: 100%, breakable: false)[
  #grid(
    columns: (1fr, auto),
    align: (left + top, right + top),
    column-gutter: ${6 * fontScale}pt,
    [
      ${linkTitle(title, url, 9.5 * fontScale)}
      ${line ? `${getTypstEntrySubheaderGap(fontScale, '      ')}\n      #text(size: ${8.5 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(line)}]` : ''}
    ],
    ${dateBadge(date, fontScale)}
  )
  ${score ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${7 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(score)}]` : ''}
  ${courseBadges ? `#v(${8 * fontScale}pt)\n  ${courseBadges}` : ''}
]
#v(${index < v.education.length - 1 ? 20 * fontScale : 0}pt)`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#skyline-section("${escapeTypstString(labels.education || 'education')}", "edu", is-side: ${isSide})`,
    entries: entries,
    trailing: isSide ? '' : `\n#v(${16 * fontScale}pt)`,
  });
}

function levelBlock({
  name,
  levelLabel,
  value,
  max,
  keywords,
  isSide,
  fontScale,
}: {
  name: string;
  levelLabel: string;
  value: number;
  max: number;
  keywords?: string[];
  isSide: boolean;
  fontScale: number;
}): string {
  const badges = (keywords || [])
    .map((kw) => `#skyline-badge([${escapeTypst(kw)}])`)
    .join(` #h(${4 * fontScale}pt) `);

  return `block(width: 100%, breakable: false)[
  #layout(size => context {
    let name-content = text(weight: "bold", size: ${isSide ? 8.5 : 9}pt * ${fontScale}, fill: brand-text)[${escapeTypst(name)}]
    let level-content = text(size: ${isSide ? 7.5 : 7.25}pt * ${fontScale}, style: "italic", fill: brand-text-light)[${escapeTypst(levelLabel)}]
    let name-w = measure(name-content).width
    let level-w = if "${escapeTypstString(levelLabel)}" == "" { 0pt } else { measure(level-content).width }
    if name-w + level-w + ${8 * fontScale}pt < size.width {
      grid(columns: (1fr, auto), align: (left, right), name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { level-content })
    } else {
      stack(dir: ttb, spacing: ${2 * fontScale}pt, name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { align(right)[#level-content] })
    }
  })
  ${value > 0 ? `#v(${6 * fontScale}pt)\n  #skyline-level-bar(${value}, max: ${max})` : ''}
  ${!isSide && badges ? `#v(${4 * fontScale}pt)\n  ${badges}` : ''}
]`;
}

export function serializeSkills(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const cards = v.skills.map((skill) => {
    const { value } = getLevelInfo(skill.level, 'skill');
    const levelLabel = getSkillLevelLabel(skill.level, cvLocale.code);
    return levelBlock({
      name: skill.name,
      levelLabel,
      value,
      max: 4,
      keywords: skill.keywords,
      isSide,
      fontScale,
    });
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#skyline-section("${escapeTypstString(labels.skills || 'skills')}", "zap", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${isSide ? 12 * fontScale : 8 * fontScale}pt`,
    trailing: isSide ? '' : `\n#v(${16 * fontScale}pt)`,
  });
}

export function serializeLanguages(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const cards = v.languages.map((lang) => {
    const { value, max } = getLevelInfo(lang.level, 'language');
    const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);
    return levelBlock({
      name: lang.language,
      levelLabel: displayLabel,
      value,
      max,
      isSide,
      fontScale,
    });
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#skyline-section("${escapeTypstString(labels.languages || 'languages')}", "languages", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${10 * fontScale}pt`,
    trailing: isSide ? '' : `\n#v(${16 * fontScale}pt)`,
  });
}
