import { type CVLocaleMetadata, getVisibleData } from '@/components/preview/themes/shared';
import { normalizeCountryCode } from '@/components/preview/themes/shared/address';
import { getProfileDisplayPDF } from '@/components/preview/themes/shared/profiles-pdf';
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
  const { basics, labels, v, fontScale } = context;

  // Contact is always rendered in side column in Lunar
  // ⚠️ `.trim()` before `filter(Boolean)`. A whitespace-only city is
  // truthy and survives a bare filter, so lunar's sidebar contact line rendered
  // `   , DE` — the same dangling separator as the PDF footers.
  //
  // ⚠️ Re-derived because the set shrank: `getTypstFooterParts` was
  // the fourth and now routes through `getCityCountry`, so the hand-rolled
  // compositions left are this one and `coverLetterTypst` — plus
  // `getCityCountry` itself, which is the canonical one rather than a copy.
  // Grep `countryCode` across `src/components/preview/` to re-derive it again
  // rather than trusting this number.
  // The country code is normalized as the preview's `formatFullAddress` does.
  const address = basics.location
    ? [basics.location.city, normalizeCountryCode(basics.location.countryCode)]
        // ⚠️ `typeof`, not `?.` — same rule as `address.ts`'s `trimmed`.
        // A non-string `city` threw here on lunar's PDF, one of the seventh
        // producer's two files.
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
        .join(', ')
    : '';

  let rows = '';

  if (basics.email) {
    rows += `  #block(width: 100%, breakable: false)[#icon("mail") #h(${6 * fontScale}pt) #text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(basics.email)}]]\n`;
  }
  if (basics.phone) {
    rows += `  #block(width: 100%, breakable: false)[#icon("phone") #h(${6 * fontScale}pt) #text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(basics.phone)}]]\n`;
  }
  if (address) {
    rows += `  #block(width: 100%, breakable: false)[#icon("map-pin") #h(${6 * fontScale}pt) #text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(address)}]]\n`;
  }
  if (basics.url) {
    const displayUrl = basics.url.replace(/^https?:\/\//, '');
    const targetUrl = sanitizeUrl(basics.url);
    const urlText = `#text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(displayUrl)}]`;
    rows += `  #block(width: 100%, breakable: false)[#icon("globe") #h(${6 * fontScale}pt) ${targetUrl ? `#link("${targetUrl}")[${urlText}]` : urlText}]\n`;
  }
  v.profiles.forEach((profile) => {
    // Manually format profiles to keep contact helper independent
    const { iconName, text } = getProfileDisplayPDF(profile);
    const content = profile.url
      ? `#link("${sanitizeUrl(profile.url)}")[#text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(text)}] #h(${4 * fontScale}pt) #link-icon("external-link")]`
      : `#text(size: ${7.5 * fontScale}pt, fill: brand-sidebar-text-90)[${escapeTypst(text)}]`;

    rows += `  #block(width: 100%, breakable: false)[#icon("${iconName}") #h(${6 * fontScale}pt) ${content}]\n`;
  });

  if (!rows) return '';

  const label = labels.contact || 'contact';

  return `\n// Contact Section
#block(width: 100%, breakable: false)[
  #lunar-side-section("${escapeTypstString(label)}")
  #set par(spacing: 6pt, leading: 0.5em)
  ${rows.trim().replace(/ \\$/, '')}
]\n`;
}

export function serializeAwards(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.awards;
  if (!items || items.length === 0) return '';

  const label = labels.awards || 'awards';
  let content = '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(formatCVDate(item.date))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.title)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.title)}]`
        }
        ${
          item.awarder || item.location
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
                #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.title)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.title)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(formatCVDate(item.date))}]
          ]
        )
        ${
          item.awarder || item.location
            ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst([item.awarder, item.location].filter(Boolean).join(' · '))}]`
            : ''
        }
        ${
          item.summary
            ? `\n${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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

export function serializeCertificates(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.certificates;
  if (!items || items.length === 0) return '';

  const label = labels.certificates || 'certificates';
  let content = '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.date ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(formatCVDate(item.date))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]`
        }
        ${
          item.issuer
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
                #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst(item.issuer)}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(formatCVDate(item.date))}]
          ]
        )
        ${item.issuer ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(item.issuer)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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

export function serializePublications(isSide: boolean, context: SectionContext): string {
  const { labels, v, formatCVDate, fontScale } = context;
  const items = v.publications;
  if (!items || items.length === 0) return '';

  const label = labels.publications || 'publications';
  let content = '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.releaseDate ? `#text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70)[${escapeTypst(formatCVDate(item.releaseDate))}] \\ \n` : ''}        ${
          item.url
            ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]#h(${2 * fontScale}pt)#link-icon("external-link")]`
            : `#text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-sidebar-text)[${escapeTypst(item.name)}]`
        }
        ${
          item.publisher
            ? `${getTypstEntrySubheaderGap(fontScale, '        ')}
                #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-80)[${escapeTypst(item.publisher)}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
          columns: (1fr, auto),
          align: (left, right),
          [
            ${
              item.url
                ? `#link("${sanitizeUrl(item.url)}")[#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]#h(${3 * fontScale}pt)#link-icon("external-link")]`
                : `#text(weight: "bold", size: ${9.5 * fontScale}pt, fill: brand-text)[${escapeTypst(item.name)}]`
            }
          ],
          [
            #text(size: ${8 * fontScale}pt, fill: brand-text-muted, weight: "medium")[${escapeTypst(formatCVDate(item.releaseDate))}]
          ]
        )
        ${item.publisher ? `\n        ${getTypstEntrySubheaderGap(fontScale, '        ', false)}\n        #text(size: ${8.5 * fontScale}pt, fill: brand-primary, weight: "bold")[${escapeTypst(item.publisher)}]` : ''}
                ${item.summary ? `\n${getTypstEntryDetailsGap(fontScale, '        ')}\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(item.summary)}]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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

export function serializeReferences(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  const items = v.references;
  if (!items || items.length === 0) return '';

  const label = labels.references || 'references';
  let content = '';

  if (isSide) {
    items.forEach((item, idx) => {
      const entryMarkup = `
        #text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-sidebar-text)[${escapeTypst(item.name)}]
        ${item.reference ? `\\ \n        #text(size: ${7 * fontScale}pt, fill: brand-sidebar-text-70, style: "italic")["${escapeTypst(item.reference)}"]` : ''}`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-side-section("${escapeTypstString(label)}")
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
  } else {
    items.forEach((item, idx) => {
      const entryMarkup = `
        ${item.reference ? `#text(style: "italic", size: ${8 * fontScale}pt, fill: brand-text-muted)["${escapeTypst(item.reference)}"] \\ \n` : ''}        #text(size: ${9.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}]`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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

export function serializeInterests(isSide: boolean, context: SectionContext): string {
  const { labels, v, fontScale } = context;
  const items = v.interests;
  if (!items || items.length === 0) return '';

  const label = labels.interests || 'interests';
  let content = '';

  if (isSide) {
    const badges = items
      .map((item) => `#lunar-side-badge("${escapeTypstString(item.name)}")`)
      .join(' ');
    content = `  #block(width: 100%, breakable: false)[
      #lunar-side-section("${escapeTypstString(label)}")
      #block(width: 100%)[${badges}]
    ]\n`;
  } else {
    items.forEach((item, idx) => {
      const keywordsBadges = (item.keywords || [])
        .map((k) => `#lunar-main-badge("${escapeTypstString(k)}")`)
        .join(' ');

      const entryMarkup = `
        #text(size: ${9.5 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(item.name)}]
        ${
          item.keywords && item.keywords.length > 0
            ? `\n        #v(${2 * fontScale}pt)\n        #block(width: 100%)[${keywordsBadges}]`
            : ''
        }`;

      if (idx === 0) {
        content += `  #block(width: 100%, breakable: false)[
          #lunar-main-section("${escapeTypstString(label)}")
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
  }

  return `\n// Interests Section\n${content}`;
}
