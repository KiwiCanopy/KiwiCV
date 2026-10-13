import { type CVLocaleMetadata, formatFullAddress } from '@/components/preview/themes/shared';
import {
  keepTypstHeaderWithFirstEntry,
  keepTypstHeaderWithFirstGridRow,
} from '@/components/preview/themes/shared/typstSectionGuards';
import {
  escapeTypst,
  escapeTypstString,
  getContactItems,
  getTypstEntryDetailsGap,
  getTypstEntrySubheaderGap,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';

interface SoftContext {
  basics: ResumeData['basics'];
  labels: Record<string, string>;
  v: Record<string, unknown>;
  cvLocale: CVLocaleMetadata;
  formatCVDate: (date?: string) => string;
  fontScale: number;
  address: string;
}

function timelineEntry(content: string, fontScale: number): string {
  return `#block(
    width: 100%,
    breakable: false,
    stroke: (left: ${2 * fontScale}pt + brand-border),
    inset: (left: ${10 * fontScale}pt)
  )[
    ${content}
  ]`;
}

function compactEntry({
  title,
  date,
  meta,
  body,
  url,
  fontScale,
  isSide = false,
}: {
  title: string;
  date?: string;
  meta?: string;
  body?: string;
  url?: string;
  fontScale: number;
  isSide?: boolean;
}): string {
  const validUrl = sanitizeUrl(url);
  const titleMarkup = validUrl
    ? `#link("${validUrl}")[#text(size: ${10.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(title)}] #link-icon("external-link")]`
    : `#text(size: ${10.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(title)}]`;

  if (isSide) {
    return timelineEntry(
      `
${date ? `#text(size: ${7.5 * fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(date)}]\\\n` : ''}
${titleMarkup}
${meta ? `${getTypstEntrySubheaderGap(fontScale, '', true)}\n#text(size: ${8 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(meta)}]` : ''}
`,
      fontScale,
    );
  }

  return timelineEntry(
    `
#grid(
  columns: (1fr, auto),
  align: (left + top, right + top),
  column-gutter: ${10 * fontScale}pt,
  [
    ${titleMarkup}
    ${meta ? `${getTypstEntrySubheaderGap(fontScale, '')}\n#text(size: ${8.75 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(meta)}]` : ''}
  ],
  ${date ? `[#box(fill: brand-primary-bg, radius: ${6 * fontScale}pt, inset: (x: ${7 * fontScale}pt, y: ${2.5 * fontScale}pt), text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(date)}])]` : '[]'}
)
${body ? `${getTypstEntryDetailsGap(fontScale)}\n#text(size: ${8.75 * fontScale}pt, fill: brand-text-light)[${escapeTypst(body)}]` : ''}
`,
    fontScale,
  );
}

function sectionFromEntries(header: string, entries: string[], gapPt: number): string {
  return keepTypstHeaderWithFirstEntry({
    header,
    entries: entries.map(
      (entry, idx) => `${entry}${idx < entries.length - 1 ? `\n#v(${gapPt}pt)\n` : ''}`,
    ),
  });
}

export function serializeAwards(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.awards as ResumeData['awards'];
  if (!items?.length) return '';
  return sectionFromEntries(
    `#soft-section("${escapeTypstString(ctx.labels.awards || 'Awards')}", "award", is-side: ${isSide})`,
    items.map((item) =>
      compactEntry({
        title: item.title || '',
        date: item.date ? ctx.formatCVDate(item.date) : undefined,
        // `awarder` alone, and no `url` at all — both were on screen and absent
        // from the PDF. `compactEntry` has taken a `url` since it was
        // written and links the title with it; awards were the one caller that
        // never passed one, so the omission is here rather than in the helper.
        meta: [item.awarder, item.location].filter(Boolean).join(' · ') || undefined,
        url: item.url,
        body: item.summary,
        fontScale: ctx.fontScale,
        isSide,
      }),
    ),
    (isSide ? 10 : 20) * ctx.fontScale,
  );
}

export function serializeCertificates(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.certificates as ResumeData['certificates'];
  if (!items?.length) return '';
  return sectionFromEntries(
    `#soft-section("${escapeTypstString(ctx.labels.certificates || 'Certificates')}", "sparkles", is-side: ${isSide})`,
    items.map((item) =>
      compactEntry({
        title: item.name || '',
        date: item.date ? ctx.formatCVDate(item.date) : undefined,
        meta: item.issuer || undefined,
        url: item.url,
        fontScale: ctx.fontScale,
        isSide,
      }),
    ),
    (isSide ? 10 : 20) * ctx.fontScale,
  );
}

export function serializePublications(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.publications as ResumeData['publications'];
  if (!items?.length) return '';
  return sectionFromEntries(
    `#soft-section("${escapeTypstString(ctx.labels.publications || 'Publications')}", "book-open", is-side: ${isSide})`,
    items.map((item) =>
      compactEntry({
        title: item.name || '',
        date: item.releaseDate ? ctx.formatCVDate(item.releaseDate) : undefined,
        meta: item.publisher || undefined,
        body: item.summary,
        url: item.url,
        fontScale: ctx.fontScale,
        isSide,
      }),
    ),
    (isSide ? 10 : 20) * ctx.fontScale,
  );
}

export function serializeReferences(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.references as ResumeData['references'];
  if (!items?.length) return '';
  const cards = items.map(
    (item) => `block(width: 100%, breakable: false)[
  #box(width: 100%, fill: brand-bg-soft, stroke: 1pt + brand-border, radius: ${10 * ctx.fontScale}pt, inset: ${12 * ctx.fontScale}pt)[
    #text(size: ${8.5 * ctx.fontScale}pt, style: "italic", fill: brand-text-muted)["${escapeTypst(item.reference)}"]
    #v(${6 * ctx.fontScale}pt)
    #text(size: ${8.75 * ctx.fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}]
  ]
]`,
  );
  return keepTypstHeaderWithFirstGridRow({
    header: `#soft-section("${escapeTypstString(ctx.labels.references || 'References')}", "messages-square", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${(isSide ? 10 : 18) * ctx.fontScale}pt`,
  });
}

function interestBlock(
  item: NonNullable<ResumeData['interests']>[number],
  isSide: boolean,
  fontScale: number,
): string {
  if (isSide) {
    return `block(width: 100%, breakable: false)[
  #box(fill: brand-bg-soft, stroke: 1pt + brand-border, radius: ${7 * fontScale}pt, inset: (x: ${7 * fontScale}pt, y: ${3 * fontScale}pt))[
    #text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(item.name)}]
  ]
]`;
  }
  const keywords = item.keywords?.length
    ? `\n#v(${4 * fontScale}pt)\n#box(${item.keywords
        .map(
          (kw) =>
            `box(fill: white, stroke: 1pt + brand-border, radius: ${8 * fontScale}pt, inset: (x: ${8 * fontScale}pt, y: ${3 * fontScale}pt), text(size: ${7.5 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(kw)}])`,
        )
        .join(` + h(${5 * fontScale}pt) + `)})`
    : '';
  return `block(width: 100%, breakable: false)[
  #text(size: ${9 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}]
  ${keywords}
]`;
}

export function serializeInterests(isSide: boolean, ctx: SoftContext): string {
  const items = ctx.v.interests as ResumeData['interests'];
  if (!items?.length) return '';
  const cards = items.map((item) => interestBlock(item, isSide, ctx.fontScale));
  return keepTypstHeaderWithFirstGridRow({
    header: `#soft-section("${escapeTypstString(ctx.labels.interests || 'Interests')}", "sparkles", is-side: ${isSide})`,
    cards,
    columns: '(1fr,)',
    firstRowCount: 1,
    rowGutter: `${(isSide ? 6 : 10) * ctx.fontScale}pt`,
  });
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
export function serializeFixedContactBlock(ctx: SoftContext): string {
  const address = ctx.address || formatFullAddress(ctx.basics.location, ctx.cvLocale);
  const items = getContactItems(
    ctx.basics,
    ctx.v.profiles as NonNullable<ResumeData['basics']['profiles']>,
    address,
  );
  if (!items.length) return '';
  return `#block(width: 100%, stroke: (bottom: 1pt + brand-border), inset: (bottom: ${16 * ctx.fontScale}pt))[
  #text(size: ${8.75 * ctx.fontScale}pt, fill: brand-text-light)[${items.join(` #h(${14 * ctx.fontScale}pt) `)}]
]`;
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
export function serializeFixedAboutBlock(ctx: SoftContext): string {
  if (!ctx.basics.summary) return '';
  return `#block(width: 100%, breakable: false)[
  #text(size: ${14 * ctx.fontScale}pt, weight: "bold", fill: brand-primary)[${escapeTypst(ctx.labels.about || 'About Me')}]
  #v(${10 * ctx.fontScale}pt)
  #text(size: ${10 * ctx.fontScale}pt, fill: brand-text-light)[${escapeTypst(ctx.basics.summary)}]
]`;
}
