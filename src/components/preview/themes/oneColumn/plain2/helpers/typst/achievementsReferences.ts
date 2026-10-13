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
  fontScale: number;
}

function plain2EntryHeader(
  title: string,
  subtitle: string | undefined,
  url: string | undefined,
  fontScale: number,
): string {
  const content = `#text(size: ${10.5 * fontScale}pt, weight: "bold", fill: brand-title)[${escapeTypst(title)}]${
    subtitle
      ? ` #text(size: ${9.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(subtitle)}]`
      : ''
  }`;

  if (url) {
    return `link("${sanitizeUrl(url)}")[${content} #text(fill: brand-text-muted)[#link-icon("external-link")]]`;
  }
  return `[${content}]`;
}

export function serializeAwards(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const label = labels.awards || 'awards';
  const entries = v.awards.map((item) => {
    const subtitleText = [item.awarder, item.location].filter(Boolean).join(' · ');
    const headerMarkup = plain2EntryHeader(
      item.title,
      subtitleText || undefined,
      item.url,
      fontScale,
    );
    const dateStr = formatCVDate(item.date);

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}"
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const label = labels.certificates || 'certificates';
  const entries = v.certificates.map((item) => {
    const headerMarkup = plain2EntryHeader(item.name, item.issuer, item.url, fontScale);
    const dateStr = formatCVDate(item.date);

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}"
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const label = labels.publications || 'publications';
  const entries = v.publications.map((item) => {
    const headerMarkup = plain2EntryHeader(item.name, item.publisher, item.url, fontScale);
    const dateStr = formatCVDate(item.releaseDate);

    return `#plain2-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}"
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const label = labels.interests || 'interests';
  const entries = v.interests.map(
    (item) => `#block(width: 100%, breakable: false)[
      #text(size: ${9 * fontScale}pt, weight: "semibold", fill: brand-title)[${escapeTypst(item.name)}]
      ${
        item.keywords && item.keywords.length > 0
          ? `#v(${2 * fontScale}pt)\n      ${item.keywords
              .map((keyword) => `#plain2-badge([${escapeTypst(keyword)}])`)
              .join(` #h(${4 * fontScale}pt) `)}`
          : ''
      }
      #v(${6 * fontScale}pt)
    ]\n`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeReferences(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const label = labels.references || 'references';
  const entries = v.references.map(
    (item) => `#block(
      width: 100%,
      breakable: false,
      fill: brand-bg-light,
      stroke: (left: 2pt + brand-primary),
      inset: ${8 * fontScale}pt,
    )[
      ${
        item.reference
          ? `#text(size: ${8 * fontScale}pt, style: "italic", fill: brand-text-main)["${escapeTypst(item.reference)}"]\n      #v(${4 * fontScale}pt)`
          : ''
      }
      #text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-title)[— ${escapeTypst(item.name)}]
    ]
    #v(${8 * fontScale}pt)\n`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#plain2-section("${escapeTypstString(label)}")`,
    entries,
  });
}
