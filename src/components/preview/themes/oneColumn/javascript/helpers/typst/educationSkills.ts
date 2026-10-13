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
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
  p: Record<string, string>;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale, p } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'Education';
  const boldHeader = cvLocale.boldHeaderEducation;

  let firstItem = '';
  let remainingItems = '';

  v.education.forEach((item, idx) => {
    const isWorking = isOngoingEndDate(item.endDate);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    const firstPart =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType}${item.area ? ` (${item.area})` : ''}`;
    const secondPart =
      boldHeader === 'company'
        ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
        : item.institution;

    let headerMarkup = `[`;
    if (item.url) {
      headerMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    headerMarkup += `#text(weight: "bold", fill: rgb("${isWorking ? p.primary : p.slate900}"))[${escapeTypst(firstPart)}]`;
    headerMarkup += `#text(fill: rgb("${p.slate300}"))[.]`;
    headerMarkup += `#text(fill: rgb("${p.entity}"))[${escapeTypst(secondPart)}]`;
    headerMarkup += `#text(fill: rgb("${p.slate300}"))[()]`;
    if (item.url) {
      headerMarkup += `#h(2pt)#link-icon("external-link")`;
      headerMarkup += `]`;
    }
    if (item.location) {
      headerMarkup += ` #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate400}"))[ · ${escapeTypst(item.location)}]`;
    }
    headerMarkup += `]`;

    const coursesBadges = (item.courses || [])
      .map((c) => `#javascript-badge("${escapeTypstString(c)}")`)
      .join('\n        ');

    const bodyMarkup = `
      javascript-entry-content[
        ${item.score ? `#text(size: ${7 * fontScale}pt, fill: rgb("${p.comment}"))[#("// ø " + "${escapeTypstString(item.score)}")] \n` : ''}        ${
          item.courses && item.courses.length > 0
            ? `#v(${4 * fontScale}pt)
              #block(width: 100%)[
                ${coursesBadges}
              ]`
            : ''
        }
      ]
    `;

    const entryMarkup = `  #javascript-timeline-entry(
      active: ${isWorking},
      header: ${headerMarkup},
      date: [#text(size: ${8 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]],
      body: ${bodyMarkup}
    )\n`;

    if (idx === 0) {
      firstItem = entryMarkup;
    } else {
      remainingItems += entryMarkup;
    }
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    entries: [firstItem, remainingItems],
  });
}

export function serializeSkills(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale, p } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'Skills';
  const cards: string[] = [];

  v.skills.forEach((item) => {
    const { value } = getLevelInfo(item.level, 'skill');
    const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);
    const keywordsBadges = (item.keywords || [])
      .map((k) => `#javascript-badge("${escapeTypstString(k)}")`)
      .join('\n            ');

    const cardMarkup = `
      javascript-lang-card[
        #grid(
          columns: (1fr, auto),
          align: (left + horizon, right + horizon),
          text(size: ${9 * fontScale}pt, weight: "bold", fill: rgb("${p.slate700}"))[${escapeTypst(item.name)}],
          if "${levelLabel || ''}" != "" [
            #box(fill: rgb("${p.slate50}"), inset: (x: 4pt, y: 2pt), radius: 3pt)[
              #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#cv-upper("${escapeTypstString(levelLabel)}")]
            ]
          ]
        )
        ${
          value > 0 ? `#v(${4 * fontScale}pt)\n        #javascript-skill-bar(${value})\n` : ''
        }        ${
          item.keywords && item.keywords.length > 0
            ? `#v(${6 * fontScale}pt)
              #block(width: 100%)[
                ${keywordsBadges}
              ]`
            : ''
        }
      ]
    `;

    cards.push(cardMarkup);
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${14 * fontScale}pt`,
    rowGutter: `${14 * fontScale}pt`,
    remainingPrefix: `#v(${14 * fontScale}pt)\n`,
  });
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale, p } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'Languages';
  const cards: string[] = [];

  v.languages.forEach((item) => {
    const { value: level } = getLevelInfo(item.level, 'language');
    const displayLabel = getLanguageLabel(item.level, item.certificate, cvLocale.code);

    const cardMarkup = `
      javascript-lang-card[
        #grid(
          columns: (1fr, auto),
          align: (left + horizon, right + horizon),
          text(font: js-prose-font, size: ${9 * fontScale}pt, weight: "bold", fill: rgb("${p.slate700}"))[${escapeTypst(item.language)}],
          if "${displayLabel || ''}" != "" [
            #box(fill: rgb("${p.slate50}"), inset: (x: 4pt, y: 2pt), radius: 3pt)[
              #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#cv-upper("${escapeTypstString(displayLabel)}")]
            ]
          ]
        )
        ${level > 0 ? `#v(${6 * fontScale}pt)\n        #javascript-lang-bar(${level})\n` : ''}
      ]
    `;

    cards.push(cardMarkup);
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${14 * fontScale}pt`,
    rowGutter: `${14 * fontScale}pt`,
    remainingPrefix: `#v(${14 * fontScale}pt)\n`,
  });
}
