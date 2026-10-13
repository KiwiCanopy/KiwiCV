import { getVisibleData } from '@/components/preview/themes/shared';
import {
  keepTypstHeaderWithFirstEntry,
  keepTypstHeaderWithFirstGridRow,
} from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
}

function itemEntry({
  title,
  subtitle,
  date,
  url,
  summary,
  fontScale,
}: {
  title?: string;
  subtitle?: string;
  date?: string;
  url?: string;
  summary?: string;
  fontScale: number;
}): string {
  const titleMarkup = url
    ? `#link("${sanitizeUrl(url)}")[#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}] #link-icon("external-link")]`
    : `#text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(title)}]`;

  return `#block(width: 100%, breakable: false)[
    #grid(
      columns: (1fr, auto),
      align: (left + bottom, right + bottom),
      [${titleMarkup}],
      [#text(size: ${9 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(date)}]]
    )
    ${subtitle ? `#v(${2 * fontScale}pt)\n#text(size: ${10 * fontScale}pt, style: "italic", fill: rgb("#333333"))[${escapeTypst(subtitle)}]` : ''}
    ${summary ? `${getTypstEntryDetailsGap(fontScale)}\n#text(size: ${9 * fontScale}pt, fill: rgb("#444444"))[${escapeTypst(summary)}]` : ''}
  ]
  #v(${16 * fontScale}pt)`;
}

export function serializeAwards(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const entries = v.awards.map((item) =>
    itemEntry({
      title: item.title,
      subtitle: [item.awarder, item.location].filter(Boolean).join(' · '),
      date: formatCVDate(item.date),
      url: item.url,
      summary: item.summary,
      fontScale,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.awards || 'Awards')}")`,
    entries,
  });
}

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const entries = v.certificates.map((item) =>
    itemEntry({
      title: item.name,
      subtitle: item.issuer,
      date: formatCVDate(item.date),
      url: item.url,
      fontScale,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.certificates || 'Certificates')}")`,
    entries,
  });
}

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const entries = v.publications.map((item) =>
    itemEntry({
      title: item.name,
      subtitle: item.publisher,
      date: formatCVDate(item.releaseDate),
      url: item.url,
      summary: item.summary,
      fontScale,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.publications || 'Publications')}")`,
    entries,
  });
}

export function serializeReferences(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const cards = v.references.map(
    (item) => `block(width: 100%, breakable: false)[
      ${
        item.reference
          ? `#block(stroke: (left: 1pt + brand-primary-light), inset: (left: ${8 * fontScale}pt))[#text(size: ${10 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(item.reference)}]]\n#v(${6 * fontScale}pt)`
          : ''
      }
      #text(size: ${9 * fontScale}pt, weight: "medium", fill: brand-text-main)[${escapeTypst(item.name)}]
    ]`,
  );

  return keepTypstHeaderWithFirstGridRow({
    header: `#timeless-section("${escapeTypstString(labels.references || 'References')}")`,
    cards,
    columns: '(48%, 48%)',
    firstRowCount: 2,
    columnGutter: '4%',
    rowGutter: `${16 * fontScale}pt`,
    remainingPrefix: `#v(${16 * fontScale}pt)\n`,
  });
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const entries = v.interests.map((item) => {
    const keywords = (item.keywords || [])
      .map((keyword) => `#timeless-badge("${escapeTypstString(keyword)}")`)
      .join(' ');
    return `#block(width: 100%, breakable: false)[
      #text(size: ${10 * fontScale}pt, weight: "semibold", fill: brand-text-main)[${escapeTypst(item.name)}]
      ${keywords ? `#v(${4 * fontScale}pt)\n#block(width: 100%)[${keywords}]` : ''}
    ]
    #v(${10 * fontScale}pt)`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#timeless-section("${escapeTypstString(labels.interests || 'Interests')}")`,
    entries,
  });
}
