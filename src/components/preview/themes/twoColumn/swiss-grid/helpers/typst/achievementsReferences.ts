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
  basics: ResumeData['basics'];
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
  contactItems: string[];
}

/**
 * ⚠️ **A fixed block, not a section.** `about` and `contact` are label-only keys
 * (`themes/shared/sections.ts`): `ResumeData` has no such array, so
 * `sectionExists` rejects them and no section getter can yield them. This is
 * emitted at a fixed position by the serializer, never dispatched through
 * `serializeSection` — ten `case 'about':` / `case 'contact':` arms that assumed
 * otherwise were dead code and were deleted.
 *
 * The name says so because three of the six two-column themes have one of these
 * and three do not, which reads as drift rather than design from any single
 * file — and because the deleted arms called functions of the *old* name.
 */
export function serializeFixedAboutBlock(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { basics, labels, fontScale } = context;
  if (!basics.summary) return '';

  const label = labels.about || 'about';
  const numStr = context.num || '01';

  if (isSide) {
    return `\n// About Section (Side)\n#block(width: 100%, breakable: false)[
      #swiss-section("${escapeTypstString(label)}", is-side: true)
      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]
    ]\n`;
  }

  return `\n// About Section\n#block(width: 100%, breakable: false)[
    #swiss-section("${escapeTypstString(label)}", is-side: false, num: "${escapeTypstString(numStr)}")
    #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]
  ]\n`;
}

/**
 * ⚠️ **A fixed block, not a section.** `about` and `contact` are label-only keys
 * (`themes/shared/sections.ts`): `ResumeData` has no such array, so
 * `sectionExists` rejects them and no section getter can yield them. This is
 * emitted at a fixed position by the serializer, never dispatched through
 * `serializeSection` — ten `case 'about':` / `case 'contact':` arms that assumed
 * otherwise were dead code and were deleted.
 *
 * The name says so because three of the six two-column themes have one of these
 * and three do not, which reads as drift rather than design from any single
 * file — and because the deleted arms called functions of the *old* name.
 */
export function serializeFixedContactBlock(_isSide: boolean, context: SectionContext): string {
  const { labels, contactItems, fontScale } = context;
  if (contactItems.length === 0) return '';

  const label = labels.contact || 'contact';

  // Swiss-Grid puts Contact in sidebar
  let content = '';
  contactItems.forEach((item, idx) => {
    content += `  #block(width: 100%, breakable: false)[${item}]\n`;
    if (idx < contactItems.length - 1) {
      content += `  #v(${4 * fontScale}pt)\n`;
    }
  });

  return `\n// Contact Section\n#block(width: 100%, breakable: false)[
    #swiss-section("${escapeTypstString(label)}", is-side: true)
    #block(width: 100%)[
      #set text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-text)
      #set par(spacing: 0pt)
${content}    ]
  ]\n`;
}

export function serializeAwards(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.awards;
  if (!items || items.length === 0) return '';

  const label = labels.awards || 'awards';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-text-muted, weight: "bold")[${escapeTypst(formatCVDate(item.date))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[
                #text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.title)}]]
                #h(${2 * fontScale}pt)
                #link-icon("external-link")
              ]`
            : `#text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.title)}]]`
        }
        ${item.awarder || item.location ? `\\ \n        #text(size: ${8 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
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
      const entryMarkup = `
        #grid(
          columns: (${80 * fontScale}pt, 1fr),
          column-gutter: ${10 * fontScale}pt,
          [
            #set text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-text-muted)
            #cv-upper[${escapeTypst(formatCVDate(item.date))}]
          ],
          [
            #set par(leading: 0.4em, spacing: 0.4em)
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[
                    #text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.title)}]]
                    #h(${4 * fontScale}pt)
                    #link-icon("external-link")
                  ]`
                : `#text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.title)}]]`
            }
            ${getTypstEntrySubheaderGap(fontScale, '            ', false)}
            #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "bold")[
              ${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}
            ]
            ${
              item.summary
                ? `\n${getTypstEntryDetailsGap(fontScale, '            ')}\n            #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]`
                : ''
            }
          ]
        )`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
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

  return `\n// Awards Section\n${content}`;
}

export function serializeCertificates(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.certificates;
  if (!items || items.length === 0) return '';

  const label = labels.certificates || 'certificates';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-text-muted, weight: "bold")[${escapeTypst(formatCVDate(item.date))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[
                #text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]
                #h(${2 * fontScale}pt)
                #link-icon("external-link")
              ]`
            : `#text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]`
        }
        ${item.issuer ? `\\ \n        #text(size: ${8 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(item.issuer)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
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
      const entryMarkup = `
        #grid(
          columns: (${80 * fontScale}pt, 1fr),
          column-gutter: ${10 * fontScale}pt,
          [
            #set text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-text-muted)
            #cv-upper[${escapeTypst(formatCVDate(item.date))}]
          ],
          [
            #set par(leading: 0.4em, spacing: 0.4em)
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[
                    #text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]
                    #h(${4 * fontScale}pt)
                    #link-icon("external-link")
                  ]`
                : `#text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]`
            }
            ${getTypstEntrySubheaderGap(fontScale, '            ', false)}
            #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "bold")[
              ${escapeTypst(item.issuer)}
            ]
          ]
        )`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
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

  return `\n// Certificates Section\n${content}`;
}

export function serializePublications(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.publications;
  if (!items || items.length === 0) return '';

  const label = labels.publications || 'publications';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.releaseDate ? `#text(size: ${7 * fontScale}pt, fill: brand-text-muted, weight: "bold")[${escapeTypst(formatCVDate(item.releaseDate))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[
                #text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]
                #h(${2 * fontScale}pt)
                #link-icon("external-link")
              ]`
            : `#text(weight: 900, size: ${8.5 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]`
        }
        ${item.publisher ? `\\ \n        #text(size: ${8 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(item.publisher)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
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
      const entryMarkup = `
        #grid(
          columns: (${80 * fontScale}pt, 1fr),
          column-gutter: ${10 * fontScale}pt,
          [
            #set text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-text-muted)
            #cv-upper[${escapeTypst(formatCVDate(item.releaseDate))}]
          ],
          [
            #set par(leading: 0.4em, spacing: 0.4em)
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[
                    #text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]
                    #h(${4 * fontScale}pt)
                    #link-icon("external-link")
                  ]`
                : `#text(weight: 900, size: ${11 * fontScale}pt, fill: brand-text)[#cv-upper[${escapeTypst(item.name)}]]`
            }
            ${getTypstEntrySubheaderGap(fontScale, '            ', false)}
            #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "bold")[
              ${escapeTypst(item.publisher)}
            ]
            ${
              item.summary
                ? `\n${getTypstEntryDetailsGap(fontScale, '            ')}\n            #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]`
                : ''
            }
          ]
        )`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
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

  return `\n// Publications Section\n${content}`;
}

export function serializeReferences(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, fontScale } = context;
  const items = v.references;
  if (!items || items.length === 0) return '';

  const label = labels.references || 'references';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        #block(
          width: 100%,
          stroke: (left: ${2 * fontScale}pt + brand-primary),
          inset: (left: ${10 * fontScale}pt),
          [
            #text(style: "italic", size: ${9 * fontScale}pt, fill: brand-text-muted)["${escapeTypst(item.reference)}"]
          ]
        )
        #v(${4 * fontScale}pt)
        #text(size: ${7 * fontScale}pt, weight: "bold")[— #cv-upper[${escapeTypst(item.name)}]]`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: true)
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${12 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${12 * fontScale}pt)\n` : ''}`;
      }
    });
  } else {
    items.forEach((item, idx) => {
      const entryMarkup = `
        #block(
          width: 100%,
          stroke: (left: ${2 * fontScale}pt + brand-primary),
          inset: (left: ${10 * fontScale}pt),
          [
            #text(style: "italic", size: ${9 * fontScale}pt, fill: brand-text-muted)["${escapeTypst(item.reference)}"]
          ]
        )
        #v(${4 * fontScale}pt)
        #text(size: ${7 * fontScale}pt, weight: "bold")[— #cv-upper[${escapeTypst(item.name)}]]`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
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

  return `\n// References Section\n${content}`;
}

export function serializeInterests(
  isSide: boolean,
  context: SectionContext & { num?: string },
): string {
  const { labels, v, fontScale } = context;
  const items = v.interests;
  if (!items || items.length === 0) return '';

  const label = labels.interests || 'interests';
  let content = '';
  const numParam = !isSide && context.num ? `, num: "${context.num}"` : '';

  if (isSide) {
    const badges = items.map((item) => `#swiss-badge("${escapeTypstString(item.name)}")`).join(' ');
    content = `  #block(width: 100%, breakable: false)[
      #swiss-section("${escapeTypstString(label)}", is-side: true)
      #block(width: 100%)[${badges}]
    ]\n`;
  } else {
    items.forEach((item, idx) => {
      const keywordsBadges = (item.keywords || [])
        .map((k) => `#swiss-badge("${escapeTypstString(k)}")`)
        .join(' ');

      const entryMarkup = `
        #text(size: ${11 * fontScale}pt, weight: "bold")[#cv-upper[${escapeTypst(item.name)}]]
        ${
          item.keywords && item.keywords.length > 0
            ? `\n        #v(${4 * fontScale}pt)\n        #block(width: 100%)[${keywordsBadges}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #swiss-section("${escapeTypstString(label)}", is-side: false${numParam})
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${10 * fontScale}pt)\n` : ''}`;
      } else {
        content += `  #block(width: 100%, breakable: false)[
          ${entryMarkup}
        ]
        ${idx < items.length - 1 ? `#v(${10 * fontScale}pt)\n` : ''}`;
      }
    });
  }

  return `\n// Interests Section\n${content}`;
}
