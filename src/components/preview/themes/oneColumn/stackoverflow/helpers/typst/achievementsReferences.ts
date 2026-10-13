import { getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';

interface SectionContext {
  labels: Record<string, string>;
  v: ReturnType<typeof getVisibleData>;
  formatCVDate: (date?: string | null) => string;
}

function entry({
  title,
  org,
  date,
  url,
  body,
}: {
  title?: string;
  org?: string;
  date?: string;
  url?: string;
  body?: string;
}): string {
  const titleMarkup = url
    ? `#link("${sanitizeUrl(url)}")[#text(weight: "bold", fill: brand-dark)[${escapeTypst(title)}] #link-icon("external-link")]`
    : `#text(weight: "bold", fill: brand-dark)[${escapeTypst(title)}]`;

  return `#stackoverflow-entry(
    title: [${titleMarkup}${org ? ` #text(fill: brand-text-muted)[${escapeTypst(org)}]` : ''}],
    date: [${escapeTypst(date || '')}],
    body: [${body || ''}]
  )`;
}

export function serializeAwards(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const entries = v.awards.map((item) =>
    entry({
      title: item.title,
      org: [item.awarder, item.location].filter(Boolean).join(' · '),
      date: formatCVDate(item.date),
      url: item.url,
      body: item.summary ? `#text(size: 9pt, fill: brand-text)[${escapeTypst(item.summary)}]` : '',
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.awards || 'Awards')}")`,
    entries,
  });
}

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const entries = v.certificates.map((item) =>
    entry({
      title: item.name,
      org: item.issuer,
      date: formatCVDate(item.date),
      url: item.url,
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.certificates || 'Certificates')}")`,
    entries,
  });
}

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const entries = v.publications.map((item) =>
    entry({
      title: item.name,
      org: item.publisher,
      date: formatCVDate(item.releaseDate),
      url: item.url,
      body: item.summary ? `#text(size: 9pt, fill: brand-text)[${escapeTypst(item.summary)}]` : '',
    }),
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.publications || 'Publications')}")`,
    entries,
  });
}

export function serializeReferences(context: SectionContext): string {
  const { labels, v } = context;
  if (!v.references || v.references.length === 0) return '';

  const entries = v.references.map(
    (
      item,
    ) => `#block(width: 100%, breakable: false, inset: (left: 12pt), stroke: (left: 3pt + brand-primary))[
      #text(size: 9pt, style: "italic", fill: brand-text)["${escapeTypst(item.reference)}"]
      #v(4pt)
      #text(size: 9pt, weight: "bold", fill: brand-dark)[— ${escapeTypst(item.name)}]
    ]\n#v(12pt)`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.references || 'References')}")`,
    entries,
  });
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const badges = v.interests.map((item) => {
    return `#stackoverflow-badge-rich([#text(weight: "bold", fill: brand-dark)[${escapeTypst(item.name)}]${
      item.keywords && item.keywords.length > 0
        ? ` #text(fill: brand-text-muted)[· ${escapeTypst(item.keywords.join(', '))}]`
        : ''
    }])`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#stackoverflow-section("${escapeTypstString(labels.interests || 'Interests')}")`,
    entries: [`#block(width: 100%, breakable: false)[${badges.join(' ')}]`],
    trailing: '#v(10pt)\n',
  });
}
