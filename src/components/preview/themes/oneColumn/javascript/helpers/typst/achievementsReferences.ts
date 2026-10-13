import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
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
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
  p: Record<string, string>;
}

function escapeString(str: string | null | undefined): string {
  return escapeTypst(str).replace(/"/g, '\\"');
}

export function serializeAwards(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale, p } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const label = labels.awards || 'Awards';
  const cards: string[] = [];

  v.awards.forEach((item) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';

    let titleMarkup = `[`;
    if (item.url) {
      titleMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    titleMarkup += `#text(weight: "bold", fill: rgb("${p.slate900}"))[${escapeTypst(item.title)}]`;
    if (item.url) {
      titleMarkup += `#h(2pt)#link-icon("external-link")`;
      titleMarkup += `]`;
    }
    titleMarkup += `]`;

    const metaText = [item.awarder, item.location].filter(Boolean).join(' · ');

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
              [#box(baseline: 10%)[#icon("trophy")]],
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
            ${dateStr ? `#text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]` : ''}
          ]
        )
        ${
          item.summary
            ? `#v(${4 * fontScale}pt)
              #set text(font: js-prose-font, size: ${7 * fontScale}pt, fill: rgb("${p.slate600}"))
              #list(
                marker: text(fill: rgb("${p.slate300}"))[->],
                [${escapeTypst(item.summary)}]
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

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale, p } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const label = labels.certificates || 'Certificates';
  const cards: string[] = [];

  v.certificates.forEach((item) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';

    let titleMarkup = `[`;
    if (item.url) {
      titleMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    titleMarkup += `#text(weight: "bold", fill: rgb("${p.slate900}"))[${escapeTypst(item.name)}]`;
    if (item.url) {
      titleMarkup += `#h(2pt)#link-icon("external-link")`;
      titleMarkup += `]`;
    }
    titleMarkup += `]`;

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
              [#box(baseline: 10%)[#icon("award")]],
              [
                #grid(
                  columns: (1fr,),
                  row-gutter: ${2 * fontScale}pt,
                  ${titleMarkup},
                  if "${escapeString(item.issuer)}" != "" [
                    #text(size: ${8 * fontScale}pt, fill: rgb("${p.entity}"))[${escapeTypst(item.issuer)}]
                  ]
                )
              ]
            )
          ],
          [
            ${dateStr ? `#text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]` : ''}
          ]
        )
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

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale, p } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const label = labels.publications || 'Publications';
  const cards: string[] = [];

  v.publications.forEach((item) => {
    const dateStr = item.releaseDate ? formatCVDate(item.releaseDate) : '';

    let titleMarkup = `[`;
    if (item.url) {
      titleMarkup += `#link("${sanitizeUrl(item.url)}")[`;
    }
    titleMarkup += `#text(weight: "bold", fill: rgb("${p.slate900}"))[${escapeTypst(item.name)}]`;
    if (item.url) {
      titleMarkup += `#h(2pt)#link-icon("external-link")`;
      titleMarkup += `]`;
    }
    titleMarkup += `]`;

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
              [#box(baseline: 10%)[#icon("book-open")]],
              [
                #grid(
                  columns: (1fr,),
                  row-gutter: ${2 * fontScale}pt,
                  ${titleMarkup},
                  if "${escapeString(item.publisher)}" != "" [
                    #text(size: ${8 * fontScale}pt, fill: rgb("${p.entity}"))[${escapeTypst(item.publisher)}]
                  ]
                )
              ]
            )
          ],
          [
            ${dateStr ? `#text(size: ${7 * fontScale}pt, fill: rgb("${p.slate500}"))[#box(fill: rgb("${p.slate100}"), inset: (x: 4pt, y: 2pt), radius: 2pt)[${escapeTypst(dateStr)}]]` : ''}
          ]
        )
        ${
          item.summary
            ? `#v(${4 * fontScale}pt)
              #set text(font: js-prose-font, size: ${7 * fontScale}pt, fill: rgb("${p.slate600}"))
              #list(
                marker: text(fill: rgb("${p.slate300}"))[->],
                [${escapeTypst(item.summary)}]
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

export function serializeReferences(context: SectionContext): string {
  const { labels, v } = context;
  if (!v.references || v.references.length === 0) return '';

  const label = labels.references || 'References';
  const entries = v.references.map(
    (item) => `  #javascript-ref-box(
      "${item.reference ? `\\"${escapeString(item.reference)}\\"` : ''}",
      "${escapeString(item.name)}"
    )\n`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v, fontScale, p } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const label = labels.interests || 'Interests';
  const entries = v.interests.map((item) => {
    const keywordsBadges = (item.keywords || [])
      .map((kw) => `#javascript-badge("${escapeTypstString(kw)}")`)
      .join('\n          ');

    return `  #block(width: 100%, breakable: false)[
      #text(size: ${9 * fontScale}pt, weight: "bold", fill: rgb("${p.slate900}"))[${escapeTypst(item.name)}]
      ${
        item.keywords && item.keywords.length > 0
          ? `#v(${4 * fontScale}pt)\n      #block(width: 100%)[
            ${keywordsBadges}
          ]`
          : ''
      }
    ]
    #v(${12 * fontScale}pt)\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#javascript-section("${escapeTypstString(label)}")`,
    entries,
  });
}
