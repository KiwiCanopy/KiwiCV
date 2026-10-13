import {
  type CVLocaleMetadata,
  getLanguageLabel,
  getLevelInfo,
  getSkillLevelLabel,
  getVisibleData,
} from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstGridRow } from '@/components/preview/themes/shared/typstSectionGuards';
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
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
}

export function serializeEducation(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'education';
  let content = '';
  const boldHeader = cvLocale.boldHeaderEducation;
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    v.education.forEach((item, idx) => {
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const titleText = (boldHeader === 'company' ? '' : item.area)
        ? `${boldHeader === 'company' ? item.institution : item.studyType} ${boldHeader === 'company' ? '' : item.area}`
        : boldHeader === 'company'
          ? item.institution
          : item.studyType;

      const subtitleText = [
        boldHeader === 'company'
          ? `${item.studyType}${item.area ? ` ${item.area}` : ''}`
          : item.institution,
        item.location,
      ]
        .filter(Boolean)
        .join(' · ');

      const entryMarkup = `
        ${item.startDate ? `#text(size: ${7 * fontScale}pt, fill: brand-text-muted, weight: "bold")[${escapeTypst(dateStr)}] \\ ` : ''}${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(titleText)}]]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(titleText)}]]`
        }${subtitleText ? ` \\ \n        #text(size: ${8 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(subtitleText)}]` : ''}
        ${item.score ? ` \\ \n        #text(size: ${7 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
          ${entryMarkup}
        ]
        ${idx < v.education.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.education.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    v.education.forEach((item, idx) => {
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const titleText =
        (boldHeader === 'company' ? item.institution : item.studyType) &&
        (boldHeader === 'company' ? '' : item.area)
          ? `${boldHeader === 'company' ? item.institution : item.studyType} ${boldHeader === 'company' ? '' : item.area}`
          : (boldHeader === 'company' ? item.institution : item.studyType) ||
            (boldHeader === 'company' ? '' : item.area) ||
            '';

      const subtitleText = [
        boldHeader === 'company'
          ? `${item.studyType}${item.area ? ` ${item.area}` : ''}`
          : item.institution,
        item.location,
      ]
        .filter(Boolean)
        .join(' · ');

      const coursesBadges = (item.courses || [])
        .map((c) => `#swiss-badge("${escapeTypstString(c)}")`)
        .join(' ');

      const entryMarkup = `
        #grid(
          columns: (${80 * fontScale}pt, 1fr),
          column-gutter: ${10 * fontScale}pt,
          [
            #set text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-text-muted)
            #cv-upper[${escapeTypst(dateStr)}]
          ],
          [
            #set par(leading: 0.4em, spacing: 0.4em)
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(titleText)}]]#h(${4 * fontScale}pt)#link-icon("external-link")] \\ `
                : `#text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(titleText)}]] \\ `
            }#text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(subtitleText)}]
            ${item.score ? `\n            #v(${2 * fontScale}pt)\n            #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[Ø ${escapeTypst(item.score)}]` : ''}
            ${
              item.courses && item.courses.length > 0
                ? `\n            #v(${6 * fontScale}pt)\n            #block(width: 100%)[${coursesBadges}]`
                : ''
            }
          ]
        )`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
          ${entryMarkup}
        ]
        ${idx < v.education.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.education.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Education Section\n${content}`;
}

export function serializeSkills(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'skills';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    v.skills.forEach((item, idx) => {
      const { value } = getLevelInfo(item.level, 'skill');
      const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);

      let nameLevelMarkup: string;
      if (!levelLabel) {
        nameLevelMarkup = `#text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.name)}]]`;
      } else {
        nameLevelMarkup = `
          #grid(
            columns: (1fr, auto),
            align: (left + top, right + top),
            text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.name)}]],
            text(size: ${7 * fontScale}pt, fill: brand-text-muted, weight: "bold")[${escapeTypst(levelLabel)}]
          )`;
      }

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${4 * fontScale}pt)\n        #skill-level-bar(${value}, brand-primary, ${fontScale}, is-side: true)` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    const cards: string[] = [];
    v.skills.forEach((item) => {
      const { value } = getLevelInfo(item.level, 'skill');
      const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);
      const keywordsBadges = (item.keywords || [])
        .map((k) => `#swiss-badge("${escapeTypstString(k)}")`)
        .join(' ');

      let nameLevelMarkup: string;
      if (!levelLabel) {
        nameLevelMarkup = `#text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.name)}]]`;
      } else {
        nameLevelMarkup = `
          #grid(
            columns: (1fr, auto),
            align: (left + top, right + top),
            text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.name)}]],
            text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(levelLabel)}]
          )`;
      }

      cards.push(`block(width: 100%, breakable: false)[
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${4 * fontScale}pt)\n        #skill-level-bar(${value}, brand-primary, ${fontScale}, is-side: false)` : ''}
        ${item.keywords && item.keywords.length > 0 ? `#v(${4 * fontScale}pt)\n        #block(width: 100%)[${keywordsBadges}]` : ''}
      ]`);
    });

    content = keepTypstHeaderWithFirstGridRow({
      header: `#swiss-section("${escapeTypstString(label)}", is-side: false${numParam})`,
      cards,
      columns: '(1fr, 1fr)',
      firstRowCount: 2,
      columnGutter: `${20 * fontScale}pt`,
      rowGutter: `${12 * fontScale}pt`,
      remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    });
  }

  return `\n// Skills Section\n${content}`;
}

export function serializeLanguages(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'languages';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    v.languages.forEach((item, idx) => {
      const { value } = getLevelInfo(item.level, 'language');
      const secondary = getLanguageLabel(item.level, item.certificate, cvLocale.code);

      let nameLevelMarkup: string;
      if (!secondary) {
        nameLevelMarkup = `#text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.language)}]]`;
      } else {
        nameLevelMarkup = `
          #grid(
            columns: (1fr, auto),
            align: (left + top, right + top),
            text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.language)}]],
            text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(secondary)}]
          )`;
      }

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${4 * fontScale}pt)\n        #lang-level-bar(${value}, brand-primary, ${fontScale})` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
          ${entryMarkup}
        ]
        ${idx < v.languages.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.languages.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    const cards: string[] = [];
    v.languages.forEach((item) => {
      const secondary = getLanguageLabel(item.level, item.certificate, cvLocale.code);

      let nameLevelMarkup: string;
      if (!secondary) {
        nameLevelMarkup = `#text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.language)}]]`;
      } else {
        nameLevelMarkup = `
          #grid(
            columns: (1fr, auto),
            align: (left + top, right + top),
            text(size: ${9 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.language)}]],
            text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(secondary)}]
          )`;
      }

      cards.push(`block(width: 100%, breakable: false)[
        ${nameLevelMarkup}
        ${(item.level ?? 0) > 0 ? `#v(${4 * fontScale}pt)\n        #lang-level-bar(${item.level ?? 0}, brand-primary, ${fontScale})` : ''}
      ]`);
    });

    content = keepTypstHeaderWithFirstGridRow({
      header: `#swiss-section("${escapeTypstString(label)}", is-side: false${numParam})`,
      cards,
      columns: '(1fr, 1fr)',
      firstRowCount: 2,
      columnGutter: `${20 * fontScale}pt`,
      rowGutter: `${12 * fontScale}pt`,
      remainingPrefix: `#v(${12 * fontScale}pt)\n`,
    });
  }

  return `\n// Languages Section\n${content}`;
}
