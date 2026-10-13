import { getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getEntryHeaderMarkup,
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

  const label = labels.awards || 'awards';
  const entries = v.awards.map((item) => {
    const details = [item.awarder, item.location].filter(Boolean).join(' · ');
    const headerMarkup = getEntryHeaderMarkup(item.title, details, item.url);
    const dateStr = formatCVDate(item.date);

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}"
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeCertificates(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const label = labels.certificates || 'certificates';
  const entries = v.certificates.map((item) => {
    const headerMarkup = getEntryHeaderMarkup(item.name, item.issuer, item.url);
    const dateStr = formatCVDate(item.date);

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: ""
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializePublications(context: SectionContext): string {
  const { labels, v, formatCVDate } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const label = labels.publications || 'publications';
  const entries = v.publications.map((item) => {
    const headerMarkup = getEntryHeaderMarkup(item.name, item.publisher, item.url);
    const dateStr = formatCVDate(item.releaseDate);

    return `#plain-entry(
      header: ${headerMarkup},
      date: "${escapeTypstString(dateStr)}",
      description: "${escapeTypstString(item.summary)}"
    )\n`;
  });

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeInterests(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  const label = labels.interests || 'interests';
  const entries = v.interests.map(
    (item) => `  #block(width: 100%, breakable: false)[
    #text(weight: "bold", size: ${10 * fontScale}pt)[${escapeTypst(item.name)}]
    ${
      item.keywords && item.keywords.length > 0
        ? `\n    #v(${4 * fontScale}pt)\n    ${item.keywords.map((kw) => `#badge([${escapeTypst(kw)}])`).join(` #h(${4 * fontScale}pt) `)}`
        : ''
    }
    #v(${14 * fontScale}pt)
  ]\n`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}

export function serializeReferences(context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const label = labels.references || 'references';
  const entries = v.references.map(
    (item) => `  #block(width: 100%, breakable: false)[
    ${
      item.reference
        ? `#text(size: ${10 * fontScale}pt, style: "italic", fill: brand-text-muted)["${escapeTypst(item.reference)}"]\n    #v(${2 * fontScale}pt)\n`
        : ''
    }#text(weight: "bold", size: ${10 * fontScale}pt)[${escapeTypst(item.name)}]
    #v(${14 * fontScale}pt)
  ]\n`,
  );

  return keepTypstHeaderWithFirstEntry({
    header: `#plain-section("${escapeTypstString(label)}")`,
    entries,
  });
}
