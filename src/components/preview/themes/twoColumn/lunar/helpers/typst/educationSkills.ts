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
  getTypstEntrySubheaderGap,
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

export function serializeEducation(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.education || v.education.length === 0) return '';

  const label = labels.education || 'education';
  let content = '';
  const boldHeader = cvLocale.boldHeaderEducation;

  if (isSide) {
    v.education.forEach((item, idx) => {
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const titleText =
        (boldHeader === 'company' ? item.institution : item.studyType) &&
        (boldHeader === 'company' ? '' : item.area)
          ? `${boldHeader === 'company' ? item.institution : item.studyType} — ${boldHeader === 'company' ? '' : item.area}`
          : (boldHeader === 'company' ? item.institution : item.studyType) ||
            (boldHeader === 'company' ? '' : item.area) ||
            '';

      const subtitleText = [
        boldHeader === 'company'
          ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
          : item.institution,
        item.location,
      ]
        .filter(Boolean)
        .join(' · ');

      const entryMarkup = `
        ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(dateStr)}] \\ ` : ''}${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(titleText)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(titleText)}]`
        }${
          subtitleText
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
                #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst(subtitleText)}]`
            : ''
        }
                ${item.score ? ` \\ \n        #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-90)[ø ${escapeTypst(item.score)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
          ? `${boldHeader === 'company' ? item.institution : item.studyType} — ${boldHeader === 'company' ? '' : item.area}`
          : (boldHeader === 'company' ? item.institution : item.studyType) ||
            (boldHeader === 'company' ? '' : item.area) ||
            '';

      const subtitleText = [
        boldHeader === 'company'
          ? `${item.studyType}${item.area ? ` — ${item.area}` : ''}`
          : item.institution,
        item.location,
      ]
        .filter(Boolean)
        .join(' · ');

      const coursesBadges = (item.courses || [])
        .map((c) => `#lunar-main-badge("${escapeTypstString(c)}")`)
        .join(' ');

      const entryMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(dateStr)}]
          ]
        )
        ${
          subtitleText
            ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(subtitleText)}]`
            : ''
        }
        ${item.score ? `\n        #v(${2 * fontScale}pt)\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[ø ${escapeTypst(item.score)}]` : ''}
        ${
          item.courses && item.courses.length > 0
            ? `\n        #v(${2 * fontScale}pt)\n        #block(width: 100%)[${coursesBadges}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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

export function serializeSkills(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.skills || v.skills.length === 0) return '';

  const label = labels.skills || 'skills';
  let content = '';

  if (isSide) {
    v.skills.forEach((item, idx) => {
      const { value } = getLevelInfo(item.level, 'skill');
      const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);

      const nameLevelMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          text(size: ${8.5 * fontScale}pt, weight: "bold", fill: brand-sidebar-text)[${escapeTypst(item.name)}],
          if "${levelLabel || ''}" != "" [
            #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70, style: "italic")[${escapeTypst(levelLabel || '')}]
          ]
        )`;

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${3 * fontScale}pt)\n        #lunar-side-level-bar(${value}, max: 4)` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${12 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${12 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    v.skills.forEach((item, idx) => {
      const { value } = getLevelInfo(item.level, 'skill');
      const levelLabel = getSkillLevelLabel(item.level, cvLocale.code);
      const keywordsBadges = (item.keywords || [])
        .map((k) => `#lunar-main-badge("${escapeTypstString(k)}")`)
        .join(' ');

      const nameLevelMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          text(size: ${9.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}],
          if "${levelLabel || ''}" != "" [
            #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted, style: "italic")[${escapeTypst(levelLabel || '')}]
          ]
        )`;

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${1.5 * fontScale}pt)\n        #lunar-main-level-bar(${value}, max: 4)` : ''}
        ${item.keywords && item.keywords.length > 0 ? `#v(${2 * fontScale}pt)\n        #block(width: 100%)[${keywordsBadges}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.skills.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Skills Section\n${content}`;
}

export function serializeLanguages(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, fontScale } = context;
  if (!v.languages || v.languages.length === 0) return '';

  const label = labels.languages || 'languages';
  let content = '';

  if (isSide) {
    v.languages.forEach((item, idx) => {
      const { value, max } = getLevelInfo(item.level || item.certificate, 'language');
      const secondary = getLanguageLabel(item.level, item.certificate, cvLocale.code);

      const nameLevelMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          text(size: ${8.5 * fontScale}pt, weight: "bold", fill: brand-sidebar-text)[${escapeTypst(item.language)}],
          if "${secondary || ''}" != "" [
            #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70, style: "italic")[${escapeTypst(secondary || '')}]
          ]
        )`;

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${3 * fontScale}pt)\n        #lunar-side-level-bar(${value}, max: ${max})` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
    v.languages.forEach((item, idx) => {
      const { value, max } = getLevelInfo(item.level || item.certificate, 'language');
      const secondary = getLanguageLabel(item.level, item.certificate, cvLocale.code);

      const nameLevelMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          text(size: ${9.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.language)}],
          if "${secondary || ''}" != "" [
            #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted, style: "italic")[${escapeTypst(secondary || '')}]
          ]
        )`;

      const entryMarkup = `
        ${nameLevelMarkup}
        ${value > 0 ? `#v(${1.5 * fontScale}pt)\n        #lunar-main-level-bar(${value}, max: ${max})` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.languages.length - 1 ? `#v(${10 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.languages.length - 1 ? `#v(${10 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Languages Section\n${content}`;
}
