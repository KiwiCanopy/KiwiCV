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
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function linkTitle(title: string, url: string | null | undefined, fontScale: number): string {
  const titleMarkup = `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (!url) return titleMarkup;
  return `#link("${sanitizeUrl(url)}")[${titleMarkup} #h(${3 * fontScale}pt) #link-icon("external-link")]`;
}

function dateBadge(date: string, fontScale: number): string {
  if (!date) return '[]';
  return `box(
    fill: brand-primary-very-light,
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${7 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

export function serializeEducation(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const boldHeader = cvLocale.boldHeaderEducation;
  const entries = v.education.map((item) => {
    const title =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType || ''}${item.area ? ` ${item.area}` : ''}`;
    const subtitle =
      boldHeader === 'company'
        ? `${item.studyType || ''}${item.area ? ` — ${item.area}` : ''}`
        : item.institution;
    const date = formatCVDateRange(item.startDate, item.endDate);

    if (isSide) {
      return `#foggy-small-card[
  ${date ? `#text(size: ${7 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}] \\` : ''}
  ${linkTitle(title, item.url, fontScale)}
  ${subtitle || item.location ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([subtitle, item.location].filter(Boolean).join(' · '))}]` : ''}
  ${item.score ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]` : ''}
]
#v(${6 * fontScale}pt)`;
    }

    const courseBadges = (item.courses || [])
      .map((course) => `#foggy-badge([${escapeTypst(course)}])`)
      .join(` #h(${4 * fontScale}pt) `);

    return `    (
      isPresent: ${isOngoingEndDate(item.endDate)},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          column-gutter: ${8 * fontScale}pt,
          [
            ${linkTitle(title, item.url, fontScale)}
            ${
              subtitle || item.location
                ? `${getTypstEntrySubheaderGap(fontScale, '            ')}
                            #text(size: ${8.5 * fontScale}pt, weight: "semibold", fill: brand-text-light)[${escapeTypst([subtitle, item.location].filter(Boolean).join(' · '))}]`
                : ''
            }
          ],
          ${dateBadge(date, fontScale)}
        )
        ${item.score ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]` : ''}
        ${courseBadges ? `#v(${2 * fontScale}pt)\n        ${courseBadges}` : ''}
      ]
    ),`;
  });

  const firstTimeline = `#foggy-timeline(rows: (\n${entries[0]}\n))`;
  const remainingTimeline =
    entries.length > 1 ? `\n#foggy-timeline(rows: (\n${entries.slice(1).join('\n')}\n))` : '';
  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.education || 'education')}", "edu", is-side: ${isSide})`,
    entries: isSide ? entries : [firstTimeline, remainingTimeline].filter(Boolean),
  });
}

function skillOrLanguageBlock({
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
    .map((kw) => `#foggy-badge([${escapeTypst(kw)}])`)
    .join(` #h(${4 * fontScale}pt) `);

  return `block(width: 100%, breakable: false)[
  #layout(size => context {
    let name-content = text(weight: "bold", size: ${isSide ? 8 : 8}pt * ${fontScale}, fill: brand-text)[${escapeTypst(name)}]
    let level-content = text(size: 7pt * ${fontScale}, style: "italic", fill: brand-text-light)[${escapeTypst(levelLabel)}]
    let name-w = measure(name-content).width
    let level-w = if "${escapeTypstString(levelLabel)}" == "" { 0pt } else { measure(level-content).width }
    if name-w + level-w + ${8 * fontScale}pt < size.width {
      grid(columns: (1fr, auto), align: (left, right), name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { level-content })
    } else {
      stack(dir: ttb, spacing: ${2 * fontScale}pt, name-content, if "${escapeTypstString(levelLabel)}" == "" { [] } else { align(right)[#level-content] })
    }
  })
  ${value > 0 ? `#v(${2 * fontScale}pt)\n  #foggy-level-bar(${value}, max: ${max})` : ''}
  ${!isSide && badges ? `#v(${4 * fontScale}pt)\n  ${badges}\n  #v(${12 * fontScale}pt)` : ''}
]`;
}

export function serializeSkills(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const cards = v.skills.map((skill) => {
    const { value } = getLevelInfo(skill.level, 'skill');
    const levelLabel = getSkillLevelLabel(skill.level, cvLocale.code);
    return skillOrLanguageBlock({
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
    header: `#foggy-card-section("${escapeTypstString(labels.skills || 'skills')}", "zap", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${isSide ? 8 * fontScale : 4 * fontScale}pt`,
  });
}

export function serializeLanguages(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const cells = v.languages
    .map((lang) => {
      const { value } = getLevelInfo(lang.level, 'language');
      const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);
      return skillOrLanguageBlock({
        name: lang.language,
        levelLabel: displayLabel,
        value,
        max: 5,
        isSide,
        fontScale,
      });
    })
    .join(',\n');

  const content = `#grid(
  columns: ${isSide ? '(1fr,)' : '(1fr, 1fr)'},
  column-gutter: ${16 * fontScale}pt,
  row-gutter: ${isSide ? 8 * fontScale : 14 * fontScale}pt,
  ${cells}
)`;

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.languages || 'languages')}", "languages", is-side: ${isSide})`,
    entries: [content],
  });
}
