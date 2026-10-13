import { getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
}

function linkTitle(title: string, url: string | null | undefined, size: number): string {
  const titleMarkup = `#text(weight: "bold", size: ${size}pt, fill: brand-text)[${escapeTypst(title)}]`;
  if (!url) return titleMarkup;
  return `#link("${sanitizeUrl(url)}")[${titleMarkup} #h(3pt) #link-icon("external-link")]`;
}

function dateBadge(date: string, fontScale: number): string {
  if (!date) return '[]';
  return `box(
    fill: brand-primary-very-light,
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${7 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

function compactEntry(
  title: string,
  subtitle: string,
  date: string,
  summary: string | undefined,
  url: string | null | undefined,
  isSide: boolean,
  fontScale: number,
): string {
  if (isSide) {
    return `#foggy-small-card[
  ${date ? `#text(size: ${7 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}] \\` : ''}
  ${linkTitle(title, url, 8.5 * fontScale)}
  ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${7.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]` : ''}
]
#v(${6 * fontScale}pt)`;
  }

  // UPDATED: Subtitle moved inside the first grid column and uses getTypstEntrySubheaderGap
  return `#block(width: 100%, breakable: false)[
  #grid(
    columns: (1fr, auto),
    align: (left + top, right + top),
    column-gutter: ${8 * fontScale}pt,
    [
      ${linkTitle(title, url, 10 * fontScale)}
      ${
        subtitle
          ? `${getTypstEntrySubheaderGap(fontScale, '      ')}
      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]`
          : ''
      }
    ],
    ${dateBadge(date, fontScale)}
  )
  ${summary ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
]
#v(${12 * fontScale}pt)`;
}

export function serializeAwards(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const entries = v.awards.map((item) =>
    compactEntry(
      item.title,
      [item.awarder, item.location].filter(Boolean).join(' · '),
      item.date ? formatCVDate(item.date) : '',
      item.summary,
      item.url,
      isSide,
      fontScale,
    ),
  );
  const content = entries.join('\n');

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.awards || 'awards')}", "award", is-side: ${isSide})`,
    entries: isSide ? entries : [content],
  });
}

export function serializeCertificates(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const entries = v.certificates.map((item) =>
    compactEntry(
      item.name,
      item.issuer || '',
      item.date ? formatCVDate(item.date) : '',
      undefined,
      item.url,
      isSide,
      fontScale,
    ),
  );
  const content = entries.join('\n');

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.certificates || 'certificates')}", "award", is-side: ${isSide})`,
    entries: isSide ? entries : [content],
  });
}

export function serializePublications(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const entries = v.publications.map((item) =>
    compactEntry(
      item.name,
      item.publisher || '',
      item.releaseDate ? formatCVDate(item.releaseDate) : '',
      item.summary,
      item.url,
      isSide,
      fontScale,
    ),
  );
  const content = entries.join('\n');

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.publications || 'publications')}", "book-open", is-side: ${isSide})`,
    entries: isSide ? entries : [content],
  });
}

export function serializeReferences(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const entries = v.references.map((ref) => {
    const r = ref as Record<string, unknown>;
    const referenceBody = `${ref.reference ? `#text(size: ${isSide ? 8 : 9}pt * ${fontScale}, style: "italic", fill: ${isSide ? 'brand-text' : 'brand-text-muted'})["${escapeTypst(ref.reference)}"]\\` : ''}
  #align(right)[
    #line(length: ${12 * fontScale}pt, stroke: 1pt + brand-border)
    #h(${6 * fontScale}pt)
    #text(size: ${isSide ? 7 : 8}pt * ${fontScale}, weight: "bold", fill: brand-primary)[${escapeTypst(ref.name)}]
  ]
  ${!isSide && r.title ? `#v(${2 * fontScale}pt)\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(String(r.title))}]` : ''}`;
    return isSide
      ? `#foggy-small-card[
  ${referenceBody}
]
#v(${6 * fontScale}pt)`
      : `#block(width: 100%, breakable: false)[
  ${referenceBody}
]
#v(${12 * fontScale}pt)`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.references || 'references')}", "users", is-side: ${isSide})`,
    entries: isSide ? entries : [entries.join('\n')],
  });
}

export function serializeInterests(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const content = isSide
    ? v.interests
        .map((interest) => `#foggy-side-interest([${escapeTypst(interest.name)}])`)
        .join(` #h(${4 * fontScale}pt) `)
    : v.interests
        .map((interest) => {
          const keywords = (interest.keywords || [])
            .map((kw) => `#foggy-interest-keyword([${escapeTypst(kw)}])`)
            .join(' ');
          return `#block(width: 100%, breakable: false)[
  #text(size: ${10 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(interest.name)}]
  ${keywords ? `#v(${4 * fontScale}pt)\n  ${keywords}` : ''}
]
#v(${12 * fontScale}pt)`;
        })
        .join('\n');

  return keepTypstHeaderWithFirstEntry({
    header: `#foggy-card-section("${escapeTypstString(labels.interests || 'interests')}", "sparkles", is-side: ${isSide})`,
    entries: [content],
  });
}
