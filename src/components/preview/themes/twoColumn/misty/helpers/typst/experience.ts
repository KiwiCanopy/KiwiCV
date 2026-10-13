import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  fontScale: number;
}

function getEntryHeaderMarkupSide(
  title: string,
  url: string | null | undefined,
  fontScale: number,
): string {
  const textMarkup = `#text(weight: "bold", size: ${8.5 * fontScale}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (url) {
    const validUrl = sanitizeUrl(url);
    return `#link("${validUrl}")[${textMarkup} #h(${2 * fontScale}pt) #link-icon("external-link")]`;
  }
  return textMarkup;
}

export function serializeWork(isSide: boolean, context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale } = context;
  if (!v.work || v.work.length === 0) return '';

  const label = labels.work || 'work';
  const boldHeader = cvLocale.boldHeaderWork;

  const entries = v.work.map((item, index) => {
    const titleText = boldHeader === 'company' ? item.name : item.position;
    const subtitleText = boldHeader === 'company' ? item.position : item.name;
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${item.startDate ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(titleText, item.url, fontScale)}
    ${subtitleText || item.location ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([subtitleText, item.location].filter(Boolean).join(' · '))}]` : ''}
  ]\n  #v(${10 * fontScale}pt)\n`;
    }

    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');
    const rowContent = `    (
      isPresent: ${isOngoingEndDate(item.endDate)},
      isLast: ${index === v.work.length - 1},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          if "${sanitizeUrl(item.url)}" != "" [
            #link("${sanitizeUrl(item.url)}")[
              #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]
              #h(${4 * fontScale}pt)
              #link-icon("external-link")
            ]
          ] else [
            #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(titleText)}]
          ],
          if "${escapeTypstString(dateStr)}" != "" [
            #box(
              fill: rgb("#f1f5f9"),
              radius: ${3 * fontScale}pt,
              inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
              text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
            )
          ]
        )
        #if "${escapeTypstString(subtitleText)}" != "" or "${escapeTypstString(item.location)}" != "" [
          ${getTypstEntrySubheaderGap(fontScale, '          ', false)}
          #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "medium")[
            #(("${escapeTypstString(subtitleText)}", "${escapeTypstString(item.location)}").filter(x => x != "").join(" · "))
          ]
        ]
        ${item.summary ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]\n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${4 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(size: ${8 * fontScale}pt, fill: brand-primary)[#sym.bullet], ${highlightsList})`
            : ''
        }
      ]
    ),\n`;
    return `#misty-timeline(rows: (\n${rowContent}))\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
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

  const entries = items.map((item, index) => {
    const subtitleText = [item.entity, item.type].filter(Boolean).join(' — ');
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    if (isSide) {
      // ⚠️ `item.location` alone, **not** `subtitleText` — `entity` and `type` are
      // both main-column-only. `MAIN_COLUMN_ONLY_FIELDS` is what
      // prints the badge promising both, and `mainColumnOnlyPromise.test.ts`
      // asserts it in both outputs. This branch reused the main column's string
      // and once put `type` and `entity` in the PDF — and
      // `side/Projects.tsx` leaked `entity` too, so the two renderers agreed and
      // `previewExportParity.test.ts` was green over all ten rows.
      return `  #block(width: 100%, breakable: false)[
    ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(item.name, item.url, fontScale)}
    ${item.location ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.location)}]` : ''}
  ]\n  #v(${10 * fontScale}pt)\n`;
    }

    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');
    const rowContent = `    (
      isPresent: ${isOngoingEndDate(item.endDate)},
      isLast: ${index === items.length - 1},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          if "${sanitizeUrl(item.url)}" != "" [
            #link("${sanitizeUrl(item.url)}")[
              #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
              #h(${4 * fontScale}pt)
              #link-icon("external-link")
            ]
          ] else [
            #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
          ],
          if "${escapeTypstString(dateStr)}" != "" [
            #box(
              fill: rgb("#f1f5f9"),
              radius: ${3 * fontScale}pt,
              inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
              text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
            )
          ]
        )
        #if "${escapeTypstString(subtitleText)}" != "" or "${escapeTypstString(item.location)}" != "" [
          ${getTypstEntrySubheaderGap(fontScale, '          ', false)}
          #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "medium")[
            #(("${escapeTypstString(subtitleText)}", "${escapeTypstString(item.location)}").filter(x => x != "").join(" · "))
          ]
        ]
        ${item.description ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.description)}]\n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${4 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(size: ${8 * fontScale}pt, fill: brand-primary)[#sym.bullet], ${highlightsList})`
            : ''
        }
      ]
    ),\n`;
    return `#misty-timeline(rows: (\n${rowContent}))\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializeVolunteer(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const label = labels.volunteer || 'volunteer';

  const entries = v.volunteer.map((item, index) => {
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${item.startDate || item.endDate ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(item.position, item.url, fontScale)}
    ${item.organization || item.location ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([item.organization, item.location].filter(Boolean).join(' · '))}]` : ''}
  ]\n  #v(${10 * fontScale}pt)\n`;
    }

    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');
    const rowContent = `    (
      isPresent: ${isOngoingEndDate(item.endDate)},
      isLast: ${index === v.volunteer.length - 1},
      content: [
        #grid(
          columns: (1fr, auto),
          align: (left, right),
          if "${sanitizeUrl(item.url)}" != "" [
            #link("${sanitizeUrl(item.url)}")[
              #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.position)}]
              #h(${4 * fontScale}pt)
              #link-icon("external-link")
            ]
          ] else [
            #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.position)}]
          ],
          if "${escapeTypstString(dateStr)}" != "" [
            #box(
              fill: rgb("#f1f5f9"),
              radius: ${3 * fontScale}pt,
              inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
              text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
            )
          ]
        )
        #if "${escapeTypstString(item.organization)}" != "" or "${escapeTypstString(item.location)}" != "" [
          ${getTypstEntrySubheaderGap(fontScale, '          ', false)}
          #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "medium")[
            #(("${escapeTypstString(item.organization)}", "${escapeTypstString(item.location)}").filter(x => x != "").join(" · "))
          ]
        ]
        ${item.summary ? `${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]\n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${4 * fontScale}pt)\n        #set text(size: ${8 * fontScale}pt, fill: brand-text-muted)\n        #list(marker: text(size: ${8 * fontScale}pt, fill: brand-primary)[#sym.bullet], ${highlightsList})`
            : ''
        }
      ]
    ),\n`;
    return `#misty-timeline(rows: (\n${rowContent}))\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}
