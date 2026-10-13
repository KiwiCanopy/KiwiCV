import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
}

export function serializeWork(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const label = labels.work || 'work';
  let content = '';
  const boldHeader = cvLocale.boldHeaderWork;

  if (isSide) {
    v.work.forEach((item, idx) => {
      const titleText = boldHeader === 'company' ? item.name : item.position;
      const subtitleText = boldHeader === 'company' ? item.position : item.name;
      const dateStr = formatCVDateRange(item.startDate, item.endDate);

      const entryMarkup = `
        ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(dateStr)}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(titleText)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(titleText)}]`
        }
        ${
          subtitleText || item.location
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
        #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst([subtitleText, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.work.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.work.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    v.work.forEach((item, idx) => {
      const titleText = boldHeader === 'company' ? item.name : item.position;
      const subtitleText = boldHeader === 'company' ? item.position : item.name;
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

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
          subtitleText || item.location
            ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst([subtitleText, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }
        ${
          item.summary
            ? `\n${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]`
            : ''
        }
        ${
          item.highlights && item.highlights.length > 0
            ? `\n        #v(${1.5 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(fill: brand-text-muted)[•], ${highlightsList})`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.work.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.work.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Work Section\n${content}`;
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  isSide: boolean,
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  const items = v[sectionId as keyof typeof v] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const label = labels[sectionId] || sectionId;
  let content = '';

  if (isSide) {
    items.forEach((item, idx) => {
      // ⚠️ `entity` and `type` are both main-column-only, so the
      // side subtitle is the location alone. `MAIN_COLUMN_ONLY_FIELDS` is what
      // prints the badge promising both, and `mainColumnOnlyPromise.test.ts`
      // asserts it in both outputs. `type` and `entity` both once leaked here,
      // and `entity` leaked from `side/Projects.tsx` too — the two
      // renderers agreed, so `previewExportParity.test.ts` was green over all ten
      // rows. The main branch below keeps both.
      const dateStr = formatCVDateRange(item.startDate, item.endDate);

      const entryMarkup = `
        ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(dateStr)}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]`
        }
        ${
          item.location
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
        #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst(item.location)}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    items.forEach((item, idx) => {
      const subtitleText = [item.entity, item.type].filter(Boolean).join(' · ');
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

      const entryMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(dateStr)}]
          ]
        )
        ${
          subtitleText || item.location
            ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst([subtitleText, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }
        ${
          item.description
            ? `\n${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.description)}]`
            : ''
        }
        ${
          item.highlights && item.highlights.length > 0
            ? `\n        #v(${1.5 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(fill: brand-text-muted)[•], ${highlightsList})`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Projects Section\n${content}`;
}

export function serializeVolunteer(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const label = labels.volunteer || 'volunteer';
  let content = '';

  if (isSide) {
    v.volunteer.forEach((item, idx) => {
      const dateStr = formatCVDateRange(item.startDate, item.endDate);

      const entryMarkup = `
        ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(dateStr)}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.position)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.position)}]`
        }
        ${
          item.organization || item.location
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
        #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst([item.organization, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.volunteer.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.volunteer.length - 1 ? `#v(${8 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    v.volunteer.forEach((item, idx) => {
      const dateStr = formatCVDateRange(item.startDate, item.endDate);
      const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

      const entryMarkup = `
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.position)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.position)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(dateStr)}]
          ]
        )
        ${
          item.organization || item.location
            ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst([item.organization, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }
        ${
          item.summary
            ? `\n${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]`
            : ''
        }
        ${
          item.highlights && item.highlights.length > 0
            ? `\n        #v(${1.5 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(fill: brand-text-muted)[•], ${highlightsList})`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
          ${entryMarkup}
        ]
        ${idx < v.volunteer.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < v.volunteer.length - 1 ? `#v(${14 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Volunteer Section\n${content}`;
}
