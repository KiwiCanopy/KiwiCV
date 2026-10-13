import { getVisibleData } from '@/components/preview/themes/shared';
import {
  escapeTypst,
  escapeTypstString,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  formatCVDate: (date?: string | null) => string;
  fontScale: number;
}

export function serializeAwards(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.awards || v.awards.length === 0) return '';

  let markup = '';
  v.awards.forEach((item, index) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';
    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(item.title || '')}],
  org: [${escapeTypst(item.awarder || '')}],
  location: [${escapeTypst(item.location || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${item.summary ? `${escapeTypst(item.summary)}\n` : ''}
]\n`;

    if (index === 0) {
      markup += `\n// Awards\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.awards)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  let markup = '';
  v.certificates.forEach((item, index) => {
    const dateStr = item.date ? formatCVDate(item.date) : '';
    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(item.name || '')}],
  org: [${escapeTypst(item.issuer || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[]\n`;

    if (index === 0) {
      markup += `\n// Certificates\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.certificates)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.publications || v.publications.length === 0) return '';

  let markup = '';
  v.publications.forEach((item, index) => {
    const dateStr = item.releaseDate ? formatCVDate(item.releaseDate) : '';
    const entryMarkup = `#elegant-entry(
  title: [${escapeTypst(item.name || '')}],
  org: [${escapeTypst(item.publisher || '')}],
  date: [${escapeTypst(dateStr)}],
  url: "${sanitizeUrl(item.url)}"
)[
  ${item.summary ? `${escapeTypst(item.summary)}\n` : ''}
]\n`;

    if (index === 0) {
      markup += `\n// Publications\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.publications)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  let markup = '';
  v.interests.forEach((interest, index) => {
    let entryMarkup = `#block(width: 100%, breakable: false)[
  #text(weight: "bold")[${escapeTypst(interest.name || '')}]
`;
    if (interest.keywords && interest.keywords.length > 0) {
      entryMarkup += `  #v(2pt)
  ${interest.keywords.map((kw) => `#badge([${escapeTypst(kw)}])`).join(` #h(${4 * fontScale}pt) `)}
`;
    }
    entryMarkup += `]\n#v(4pt)\n`;

    if (index === 0) {
      markup += `\n// Interests\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.interests)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}

export function serializeReferences(context: SectionContext): string {
  const { labels, v } = context;
  if (!v.references || v.references.length === 0) return '';

  let markup = '';
  v.references.forEach((ref, index) => {
    const entryMarkup = `#block(width: 100%, breakable: false)[
  ${ref.reference ? `#text(style: "italic", fill: brand-accent)["${escapeTypst(ref.reference)}"] \\ ` : ''}
  #text(weight: "bold")[${escapeTypst(ref.name || '')}]
]
#v(6pt)
`;

    if (index === 0) {
      markup += `\n// References\n#block(width: 100%, breakable: false)[
  #elegant-section("${escapeTypstString(labels.references)}")
  ${entryMarkup}
]\n`;
    } else {
      markup += entryMarkup;
    }
  });

  return markup;
}
