import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { CUSTOM_SECTION_TYPST_ICON } from '@/components/preview/themes/shared/customSections';
import {
  keepTypstHeaderWithFirstEntry,
  keepTypstHeaderWithFirstGridRow,
} from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import { isOngoingEndDate } from '@/utils/ongoingDate';

interface SectionContext {
  labels: Record<string, string>;
  /** A custom section in the volunteer slot: neutral header icon. */
  isCustomSection?: boolean;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDateRange: (start?: string | null, end?: string | null) => string;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
  p: Record<string, string>;
}

function escapeString(str: string | null | undefined): string {
  return escapeTypst(str).replace(/"/g, '\\"');
}

export function serializeWork(context: SectionContext): string {
  const { labels, v, cvLocale, formatCVDateRange, fontScale, p } = context;
  if (!v.work || v.work.length === 0) return '';

  const label = labels.work || 'Work Experience';
  const boldHeader = cvLocale.boldHeaderWork;
  const entries = v.work.map((item) => {
    const firstPart = boldHeader === 'company' ? item.name : item.position;
    const secondPart = boldHeader === 'company' ? item.position : item.name;
    const isWorking = isOngoingEndDate(item.endDate);

    let headerMarkup = `[`;
    if (item.url) {
      headerMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    headerMarkup += `#text(weight: "bold", fill: rgb("${isWorking ? p.primary : p.slate900}"))[${escapeTypst(firstPart)}]`;
    headerMarkup += `#text(fill: rgb("${p.slate300}"))[.]`;
    headerMarkup += `#text(fill: rgb("${p.entity}"))[${escapeTypst(secondPart)}]`;
    headerMarkup += `#text(fill: rgb("${p.slate300}"))[()]`;
    if (item.url) {
      headerMarkup += `#h(${2 * fontScale}pt)#link-icon("external-link")`;
      headerMarkup += `]`;
    }
    if (item.location) {
      headerMarkup += ` #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate400}"))[ · ${escapeTypst(item.location)}]`;
    }
    headerMarkup += `]`;

    const dateStr = formatCVDateRange(item.startDate, item.endDate);
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

    const bodyMarkup = `
      javascript-entry-content[
        ${item.summary ? `#text(font: js-prose-font, size: ${8.5 * fontScale}pt, fill: rgb("${p.slate600}"))[${escapeTypst(item.summary)}] \n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${2 * fontScale}pt)
              #set text(font: js-prose-font, size: ${8 * fontScale}pt, fill: rgb("${p.slate600}"))
              #list(
                marker: text(fill: rgb("${p.slate300}"))[->],
                ${highlightsList}
              )`
            : ''
        }
      ]
    `;

    return `  #javascript-timeline-entry(
      active: ${isWorking},
      header: ${headerMarkup},
      date: [#text(size: ${8 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]],
      body: ${bodyMarkup}
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeProjects(
  sectionId: 'projects' | 'privateProjects',
  context: SectionContext,
): string {
  const { labels, v, formatCVDateRange, fontScale, p } = context;
  const items = v[sectionId] as ResumeData['projects'];
  if (!items || items.length === 0) return '';

  const label = labels[sectionId] || (sectionId === 'projects' ? 'Projects' : 'Private Projects');
  const cards: string[] = [];

  items.forEach((item) => {
    const isWorking = isOngoingEndDate(item.endDate);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    let titleMarkup = `[`;
    if (item.url) {
      titleMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    titleMarkup += `#text(weight: "bold", fill: rgb("${isWorking ? p.primary : p.slate900}"))[${escapeTypst(item.name)}]`;
    if (item.url) {
      titleMarkup += `#h(${2 * fontScale}pt)#link-icon("external-link")`;
      titleMarkup += `]`;
    }
    titleMarkup += `]`;

    const metaText = [item.entity, item.location].filter(Boolean).join(' · ');
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

    const cardMarkup = `
      javascript-grid-box[
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          [
            #grid(
              columns: (auto, 1fr),
              column-gutter: ${4 * fontScale}pt,
              align: top,
              [#box(baseline: 10%)[#icon("folder")]],
              [
                #grid(
                  columns: (1fr,),
                  row-gutter: ${2 * fontScale}pt,
                  ${titleMarkup},
                  if "${escapeString(metaText)}" != "" [
                    #text(size: ${8 * fontScale}pt, fill: rgb("${p.entity}"))[${escapeTypst(metaText)}]
                  ]
                )
              ]
            )
          ],
          [
            #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]
          ]
        )
        ${item.type ? `#v(${4 * fontScale}pt)\n        #text(size: ${7 * fontScale}pt, fill: rgb("${p.comment}"))[#("// " + "${escapeString(item.type)}")]\n` : ''}        ${item.description ? `#v(${4 * fontScale}pt)\n        #text(font: js-prose-font, size: ${8.5 * fontScale}pt, fill: rgb("${p.slate600}"))[${escapeTypst(item.description)}]\n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${4 * fontScale}pt)
                      #set text(font: js-prose-font, size: ${7 * fontScale}pt, fill: rgb("${p.slate600}"))
              #list(
                marker: text(fill: rgb("${p.slate300}"))[->],
                ${highlightsList}
              )`
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

export function serializeVolunteer(context: SectionContext): string {
  const { labels, v, formatCVDateRange, fontScale, p } = context;
  if (!v.volunteer || v.volunteer.length === 0) return '';

  const label = labels.volunteer || 'Volunteer';
  const cards: string[] = [];

  v.volunteer.forEach((item) => {
    const isWorking = isOngoingEndDate(item.endDate);
    const dateStr = formatCVDateRange(item.startDate, item.endDate);

    let titleMarkup = `[`;
    if (item.url) {
      titleMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    titleMarkup += `#text(weight: "bold", fill: rgb("${isWorking ? p.primary : p.slate900}"))[${escapeTypst(item.position)}]`;
    if (item.url) {
      titleMarkup += `#h(${2 * fontScale}pt)#link-icon("external-link")`;
      titleMarkup += `]`;
    }
    titleMarkup += `]`;

    const metaText = [item.organization, item.location].filter(Boolean).join(' · ');
    const highlightsList = (item.highlights || []).map((h) => `[${escapeTypst(h)}]`).join(', ');

    const cardMarkup = `
      javascript-grid-box[
        #grid(
          columns: (1fr, auto),
          align: (left + top, right + top),
          [
            #grid(
              columns: (auto, 1fr),
              column-gutter: ${4 * fontScale}pt,
              align: top,
              [#box(baseline: 10%)[#icon("${context.isCustomSection ? CUSTOM_SECTION_TYPST_ICON : 'heart'}")]],
              [
                #grid(
                  columns: (1fr,),
                  row-gutter: ${2 * fontScale}pt,
                  ${titleMarkup},
                  if "${escapeString(metaText)}" != "" [
                    #text(size: ${8 * fontScale}pt, fill: rgb("${p.entity}"))[${escapeTypst(metaText)}]
                  ]
                )
              ]
            )
          ],
          [
            #text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]
          ]
        )
        ${item.summary ? `#v(${6 * fontScale}pt)\n        #text(font: js-prose-font, size: ${8.5 * fontScale}pt, fill: rgb("${p.slate600}"))[${escapeTypst(item.summary)}]\n` : ''}        ${
          item.highlights && item.highlights.length > 0
            ? `#v(${4 * fontScale}pt)
                      #set text(font: js-prose-font, size: ${7 * fontScale}pt, fill: rgb("${p.slate600}"))
              #list(
                marker: text(fill: rgb("${p.slate300}"))[->],
                ${highlightsList}
              )`
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
