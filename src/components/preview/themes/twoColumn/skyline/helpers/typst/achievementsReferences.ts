import { getVisibleData } from '@/components/preview/themes/shared';
import { keepTypstHeaderWithFirstEntry } from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import {
  type SkylineCompactRow,
  awardRow,
  certificateRow,
  publicationRow,
  subtitleLine,
} from '@/components/preview/themes/twoColumn/skyline/helpers/shared/timelineRows';

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
    text(size: ${8 * fontScale}pt, fill: brand-primary)[${escapeTypst(date)}]
  )`;
}

function compactEntry(row: SkylineCompactRow, isSide: boolean, fontScale: number): string {
  const { title, date, summary, url } = row;
  const subtitle = subtitleLine(row);
  if (isSide) {
    return `#block(width: 100%, breakable: false)[
  ${date ? `#text(size: ${7.5 * fontScale}pt, weight: "medium", fill: brand-primary)[#cv-upper[${escapeTypst(date)}]]\\ ` : ''}
  ${linkTitle(title, url, 8.5 * fontScale)}
  ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '  ')}\n  #text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(subtitle)}]` : ''}
  ${summary ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${7.25 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
]
#v(${12 * fontScale}pt)`;
  }

  return `#block(width: 100%, breakable: false)[
  #grid(
    columns: (1fr, auto),
    align: (left + top, right + top),
    column-gutter: ${6 * fontScale}pt,
    [
      ${linkTitle(title, url, 9.5 * fontScale)}
      ${subtitle ? `${getTypstEntrySubheaderGap(fontScale, '      ')}\n      #text(size: ${8.5 * fontScale}pt, fill: brand-primary)[${escapeTypst(subtitle)}]` : ''}
    ],
    ${dateBadge(date, fontScale)}
  )
  ${summary ? `${getTypstEntryDetailsGap(fontScale, '  ')}\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(summary)}]` : ''}
]
#v(${20 * fontScale}pt)`;
}

function section(
  label: string,
  icon: string,
  isSide: boolean,
  entries: string[],
  fontScale: number,
): string {
  return keepTypstHeaderWithFirstEntry({
    header: `#skyline-section("${escapeTypstString(label)}", "${icon}", is-side: ${isSide})`,
    entries: entries, // FIX: Pass the array of distinct items directly!
    trailing: isSide ? '' : `\n#v(${16 * fontScale}pt)`,
  });
}

export function serializeAwards(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.awards || v.awards.length === 0) return '';

  const entries = v.awards.map((item) =>
    compactEntry(awardRow(item, formatCVDate), isSide, fontScale),
  );
  return section(labels.awards || 'awards', 'award', isSide, entries, fontScale);
}

export function serializeCertificates(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.certificates || v.certificates.length === 0) return '';

  const entries = v.certificates.map((item) =>
    compactEntry(certificateRow(item, formatCVDate), isSide, fontScale),
  );
  return section(labels.certificates || 'certificates', 'award', isSide, entries, fontScale);
}

export function serializePublications(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  if (!v.publications || v.publications.length === 0) return '';

  const entries = v.publications.map((item) =>
    compactEntry(publicationRow(item, formatCVDate), isSide, fontScale),
  );
  return section(labels.publications || 'publications', 'book-open', isSide, entries, fontScale);
}

export function serializeReferences(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.references || v.references.length === 0) return '';

  const entries = v.references.map(
    (ref) => `#block(width: 100%, breakable: false)[
  ${ref.reference ? `#text(size: ${isSide ? 7.5 : 8}pt * ${fontScale}, style: "italic", fill: brand-text-muted)["${escapeTypst(ref.reference)}"]` : ''}
  ${ref.reference ? `${getTypstEntrySubheaderGap(fontScale, '  ')}` : ''}
  #text(size: ${isSide ? 8.5 : 9.5}pt * ${fontScale}, weight: "bold", fill: brand-text)[${escapeTypst(ref.name)}]
]
#v(${isSide ? 10 : 12}pt)`,
  );

  return section(labels.references || 'references', 'users', isSide, entries, fontScale);
}

export function serializeInterests(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  if (!v.interests || v.interests.length === 0) return '';

  let entries: string[];
  if (isSide) {
    const sideContent = v.interests
      .map((interest) => `#skyline-side-interest([${escapeTypst(interest.name)}])`)
      .join(` #h(${6 * fontScale}pt) `);
    entries = [sideContent];
  } else {
    entries = v.interests.map((interest) => {
      const keywords = (interest.keywords || [])
        .map((kw) => `#skyline-interest-keyword([${escapeTypst(kw)}])`)
        .join(` #h(${4 * fontScale}pt) `);
      return `#block(width: 100%, breakable: false)[
  #text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text)[${escapeTypst(interest.name)}]
  ${keywords ? `#v(${4 * fontScale}pt)\n  ${keywords}` : ''}
]
#v(${10 * fontScale}pt)`;
    });
  }

  return keepTypstHeaderWithFirstEntry({
    header: `#skyline-section("${escapeTypstString(labels.interests || 'interests')}", "heart", is-side: ${isSide})`,
    entries,
    trailing: isSide ? '' : `\n#v(${16 * fontScale}pt)`,
  });
}
