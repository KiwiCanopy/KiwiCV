import { getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  formatCVDate: (date?: string | null) => string;
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

export function serializeAwards(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const label = labels.awards || 'awards';

  const entries = v.awards.map((item) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(item.title, item.url, fontScale)}
    ${item.awarder || item.location ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}]` : ''}
  ]\n  #v(${10 * fontScale}pt)`;
    } else {
      return `  #block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      if "${item.url}" != "" [
        #link("${sanitizeUrl(item.url)}")[
          #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.title)}]
          #h(${4 * fontScale}pt)
          #link-icon("external-link")
        ]
      ] else [
        #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.title)}]
      ],
      if "${dateStr}" != "" [
        #box(
          fill: rgb("#f1f5f9"),
          radius: ${3 * fontScale}pt,
          inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
          text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
        )
      ]
    )
    #if "${item.awarder || item.location}" != "" [
      ${getTypstEntrySubheaderGap(fontScale, '      ', false)}
      #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}]
    ]
    #if "${item.summary}" != "" [
      #v(${4 * fontScale}pt)
      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]
    ]
  ]\n  #v(${7.5 * fontScale}pt)`;
    }
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializeCertificates(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const label = labels.certificates || 'certificates';

  const entries = v.certificates.map((item) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(item.name, item.url, fontScale)}
    ${item.issuer ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.issuer)}]` : ''}
  ]\n  #v(${10 * fontScale}pt)`;
    } else {
      return `  #block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      if "${item.url}" != "" [
        #link("${sanitizeUrl(item.url)}")[
          #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
          #h(${4 * fontScale}pt)
          #link-icon("external-link")
        ]
      ] else [
        #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
      ],
      if "${dateStr}" != "" [
        #box(
          fill: rgb("#f1f5f9"),
          radius: ${3 * fontScale}pt,
          inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
          text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
        )
      ]
    )
    #if "${item.issuer}" != "" [
      ${getTypstEntrySubheaderGap(fontScale, '      ', false)}
      #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.issuer)}]
    ]
  ]\n  #v(${7.5 * fontScale}pt)`;
    }
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializePublications(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const label = labels.publications || 'publications';

  const entries = v.publications.map((item) => {
    const dateStr = item.releaseDate ? formatCVDate(item.releaseDate) : '';

    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${item.releaseDate ? `#text(size: ${7 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(dateStr)}] \\ \n` : ''}    ${getEntryHeaderMarkupSide(item.name, item.url, fontScale)}
    ${item.publisher ? `\\ \n    #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.publisher)}]` : ''}
  ]\n  #v(${10 * fontScale}pt)`;
    } else {
      return `  #block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left, right),
      if "${item.url}" != "" [
        #link("${sanitizeUrl(item.url)}")[
          #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
          #h(${4 * fontScale}pt)
          #link-icon("external-link")
        ]
      ] else [
        #text(weight: "bold", size: ${10.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]
      ],
      if "${dateStr}" != "" [
        #box(
          fill: rgb("#f1f5f9"),
          radius: ${3 * fontScale}pt,
          inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
          text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(dateStr)}]
        )
      ]
    )
    #if "${item.publisher}" != "" [
      ${getTypstEntrySubheaderGap(fontScale, '      ', false)}
      #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.publisher)}]
    ]
    #if "${item.summary}" != "" [
      #v(${4 * fontScale}pt)
      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]
    ]
  ]\n  #v(${10 * fontScale}pt)`;
    }
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializeReferences(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const label = labels.references || 'references';

  const entries = v.references.map((ref) => {
    if (isSide) {
      return `  #block(width: 100%, breakable: false)[
    ${ref.reference ? `#text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-muted)["${escapeTypst(ref.reference)}"] \\ \n` : ''}    #text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-text)[${escapeTypst(ref.name)}]
  ]\n  #v(${14 * fontScale}pt)`;
    } else {
      const r = ref as Record<string, unknown>;
      return `  #block(width: 100%, breakable: false)[
    ${ref.reference ? `#text(size: ${8.5 * fontScale}pt, style: "italic", fill: brand-text-muted)["${escapeTypst(ref.reference)}"] \\ \n` : ''}    #text(weight: "bold", size: ${9 * fontScale}pt, fill: brand-text)[${escapeTypst(ref.name)}]\n    ${r.title ? `#v(${2 * fontScale}pt)\n    #text(size: ${9 * fontScale}pt, fill: brand-primary, weight: "medium")[${escapeTypst(r.title as string)}]\n` : ''}    ${r.email ? `#v(${2 * fontScale}pt)\n    #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(r.email as string)}]\n` : ''}  ]\n  #v(${10 * fontScale}pt)`;
    }
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: entries,
  });
}

export function serializeInterests(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const label = labels.interests || 'interests';
  let content = '';

  // Interests are usually a single flowing inline box, so they naturally sit in one [content] array item.
  if (isSide) {
    content += `  #box(
    (${v.interests.map((it) => `[#text(size: ${8 * fontScale}pt, fill: brand-text)[${escapeTypst(it.name)}]],`).join(' ')}).map(item => box(
      fill: rgb("#f1f5f9"),
      radius: ${4 * fontScale}pt,
      inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
      item
    )).join(h(${6 * fontScale}pt))
  )\n  #v(${10 * fontScale}pt)\n`;
  } else {
    content += `  #box(
    (${v.interests
      .map((interest) => {
        // Trailing commas so a single keyword / single interest stays a Typst
        // array rather than grouping — the macro calls `.len()`/`.map()`.
        const kwList = (interest.keywords || []).map((k) => `"${escapeTypstString(k)}",`).join(' ');
        return `misty-interest-card("${escapeTypstString(interest.name)}", (${kwList})),`;
      })
      .join(' ')}).join(h(${8 * fontScale}pt))
  )\n`;
  }

  return keepTypstHeaderWithFirstEntry({
    header: `#misty-section("${escapeTypstString(label)}", is-side: ${isSide})`,
    entries: [content],
  });
}
