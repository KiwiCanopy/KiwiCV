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
  getEntryHeaderMarkup,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

export function serializeEducation(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'education';
  const boldHeader = cvLocale.boldHeaderEducation;
  const entries = v.education.map((item) => {
    const titleText =
      boldHeader === 'company'
        ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
        : item.institution;
    const subtitleText =
      boldHeader === 'company'
        ? item.institution
        : `${item.studyType}${item.area ? ` ${item.area}` : ''}`;
    const details = [subtitleText, item.location].filter(Boolean).join(' · ');

    const headerMarkup = getEntryHeaderMarkup(titleText, details, item.url);

    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    let entryBody = '';
    if (item.score) {
      entryBody += `    #text(size: ${9 * fontScale}pt)[ø ${escapeTypst(item.score)}]\n`;
    }
    if (item.courses && item.courses.length > 0) {
      entryBody += `    #v(${4 * fontScale}pt)\n    ${item.courses.map((c) => `#badge([${escapeTypst(c)}])`).join(` #h(${4 * fontScale}pt) `)}\n`;
    }

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "",
      body: [
        ${entryBody}
      ]
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeSkills(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'skills';
  const cards = v.skills.map((sk) => {
    const { value } = getLevelInfo(sk.level, 'skill');
    const levelLabel = getSkillLevelLabel(sk.level, cvLocale.code);
    return `[
        #grid(
          columns: (1fr, auto),
          text(weight: "bold", size: ${9 * fontScale}pt)[${escapeTypst(sk.name)}],
          ${levelLabel ? `badge([${escapeTypst(levelLabel)}])` : `[]`}
        )
        #v(${2 * fontScale}pt)
        ${value > 0 ? `#skill-bar(${value})\n` : ''}
        ${
          sk.keywords && sk.keywords.length > 0
            ? `#v(${4 * fontScale}pt)\n${sk.keywords.map((kw) => `#badge([${escapeTypst(kw)}])`).join(` #h(${4 * fontScale}pt) `)}`
            : ''
        }
      ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#plain-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${20 * fontScale}pt`,
    rowGutter: `${10 * fontScale}pt`,
    remainingPrefix: `#v(${10 * fontScale}pt)\n`,
    trailing: `#v(${14 * fontScale}pt)\n`,
  });
}

export function serializeLanguages(context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'languages';
  const cards = v.languages.map((lang) => {
    const { value } = getLevelInfo(lang.level, 'language');
    const displayLabel = getLanguageLabel(lang.level, lang.certificate, cvLocale.code);
    return `[
        #grid(
          columns: (1fr, auto),
          text(weight: "bold", size: ${9 * fontScale}pt)[${escapeTypst(lang.language)}],
          ${displayLabel ? `badge([${escapeTypst(displayLabel)}])` : `[]`}
        )
        #v(${2 * fontScale}pt)
        ${value > 0 ? `#lang-bar(${value})\n` : ''}
      ]`;
  });

  return keepTypstHeaderWithFirstGridRow({
    header: `#plain-section("${escapeTypstString(label)}")`,
    cards,
    columns: '(1fr, 1fr)',
    firstRowCount: 2,
    columnGutter: `${20 * fontScale}pt`,
    rowGutter: `${10 * fontScale}pt`,
    remainingPrefix: `#v(${10 * fontScale}pt)\n`,
    trailing: `#v(${14 * fontScale}pt)\n`,
  });
}
