import { PALETTES } from '@/components/preview/themes/oneColumn/timeless/helpers/shared/constants';
import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from '@/components/preview/themes/oneColumn/timeless/helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from '@/components/preview/themes/oneColumn/timeless/helpers/typst/educationSkills';
import {
  serializeProjects,
  serializeVolunteer,
  serializeWork,
} from '@/components/preview/themes/oneColumn/timeless/helpers/typst/experience';
import {
  type CVLocaleMetadata,
  formatFullAddress,
  getBoundFormatters,
  getOneColumnSections,
  getSectionLabels,
  getVisibleData,
  hasPageBreak,
  resolveLayoutSection,
  resolvePalette,
} from '@/components/preview/themes/shared';
import { buildCoverLetterTypst } from '@/components/preview/themes/shared/coverLetterTypst';
import { getProfileDisplayPDF } from '@/components/preview/themes/shared/profiles-pdf';
import {
  getTypstFooterParts,
  renderTypstSignatureFooter,
} from '@/components/preview/themes/shared/typstFooter';
import {
  escapeTypst,
  escapeTypstString,
  getCommonTypstMacros,
  getTypstDocumentMetadata,
  getTypstFontList,
  getTypstResumeSpacingSettings,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';

function contactLink(iconName: string, label: string, url?: string): string {
  const body = `#box[#icon("${iconName}") #text(size: 9pt)[${escapeTypst(label)}]${url ? ' #link-icon("external-link")' : ''}]`;
  return url
    ? `#link("${url.startsWith('mailto:') || url.startsWith('tel:') ? url : sanitizeUrl(url)}")[${body}]`
    : body;
}

function getHeaderContacts(data: ResumeData, cvLocale: CVLocaleMetadata): string[] {
  const { basics } = data;
  const contacts: string[] = [];
  if (basics.email) contacts.push(contactLink('mail', basics.email, `mailto:${basics.email}`));
  if (basics.phone) contacts.push(contactLink('phone', basics.phone, `tel:${basics.phone}`));

  const address = formatFullAddress(basics.location, cvLocale);
  if (address) contacts.push(contactLink('map-pin', address));

  if (basics.url) {
    contacts.push(contactLink('globe', basics.url.replace(/^https?:\/\//, ''), basics.url));
  }

  getVisibleData(data).profiles.forEach((profile) => {
    const { iconName, text } = getProfileDisplayPDF(profile);
    contacts.push(contactLink(iconName, text, profile.url || undefined));
  });

  return contacts;
}

/**
 * ⚠️ **The parts come from the shared producer now.** This function used
 * to restate `getTypstFooterParts` line for line — the same `explicitLocation` /
 * `explicitDate` branches, the same `getCityCountry` guard — and differed from it
 * in exactly one expression: the date, resolved through
 * `locale === 'de' ? 'de-DE' : 'en-US'`, a hand-written locale map with one entry
 * for the fifteen locales the repo ships. 13 of them got an English footer date
 * here and a localised one on the six themes already using the shared producer.
 *
 * ⚠️ **The markup is shared too now**, and the reason an earlier draft of
 * this comment gave for keeping a copy was wrong. It said timeless's own colour
 * and gaps were why this stopped at the parts instead of calling
 * `renderTypstSignatureFooter`; both are parameters of that function
 * (`textColor`, `textToLineGap`).
 *
 * ⚠️ **The headline measurement for collapsing this copy — "the only difference
 * is a literal `, inset: (x: 0pt)`, a Typst no-op, plus indentation" — was true
 * when it was taken and false by the time the change was made, and the docblock
 * it was about is this one.** It dates from when the renderer's defaults were
 * 40/20/10; two commits the same day moved them to 24/12/8 and then 28/24/6.
 * Against this theme's 40/30/10 the real difference at the parent
 * commit was **four** things: `#v(40)` vs `#v(28)`, `#v(30)` vs `#v(24)`,
 * `inset: (top: 10pt)` vs `(top: 6pt)`, and the no-op. So collapsing the copy is
 * a visible geometry change, not the pure refactor it was described as — see the
 * page-flow note on `renderTypstSignatureFooter`. A measurement expires when a
 * sibling commit touches what it measured.
 *
 * ⚠️ The `showFooter` early return went with it, and that is not the deletion
 * warned against elsewhere. The warning is about `getTypstFooterParts`, which returns
 * `[]`, and `[]` does not suppress the `basics.name` signature box.
 * `renderTypstSignatureFooter` takes `showFooter` itself and returns `''` for
 * it, so the check is now genuinely made — once, by the renderer.
 * `footerLocation.test.ts`'s name-count cases are what hold that.
 */
function footerMarkup(data: ResumeData, cvLocale: CVLocaleMetadata, fontScale: number): string {
  const { meta, basics } = data;

  return renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts: getTypstFooterParts(data, cvLocale),
    name: basics.name,
    fontScale,
    textColor: 'brand-text-muted',
  });
}

export function serializeToTypst(data: ResumeData): string {
  const { basics, meta } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const v = getVisibleData(data);
  const sectionIds = getOneColumnSections(meta, data);
  const contacts = getHeaderContacts(data, cvLocale);
  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#1a1a1a',
    accent: p.textMuted || '#3f3f46',
    border: p.border || '#e4e4e7',
    textMuted: p.textMuted || '#3f3f46',
  });

  const pageSetup = `#set page(paper: "a4", margin: (top: 30pt, bottom: 30pt, left: 40pt, right: 40pt), fill: rgb("${p.bg}"))`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(top: 30pt, bottom: 30pt, left: 40pt, right: 40pt)',
    pageFill: p.bg,
    senderAddress: formatFullAddress(basics.location, cvLocale),
    textColor: p.textMain,
    mutedColor: p.textMuted,
    borderColor: p.border,
    // `timeless-badge`'s soft box at subject scale — the theme states things in
    // tinted boxes rather than in colour.
    renderSubject: (subjectText, defaults) =>
      `#box(fill: brand-bg-light, stroke: 0.5pt + brand-border, radius: ${4 * fontScale}pt, inset: (x: ${10 * fontScale}pt, y: ${6 * fontScale}pt))[#text(weight: "semibold", size: ${defaults.size}pt, fill: brand-text-main)[${subjectText}]]`,
    themeHeader: `#align(center)[
  #text(font: "Lora", size: ${26 * fontScale}pt, weight: "medium", style: "italic", fill: brand-text-main)[${escapeTypst(basics.name)}]
${basics.label ? `  #v(${3 * fontScale}pt)\n  #text(size: ${9 * fontScale}pt, tracking: 2pt, fill: brand-text-muted)[#cv-upper[${escapeTypst(basics.label)}]]\n` : ''}${
      contacts.length > 0
        ? `  #v(${10 * fontScale}pt)\n  #text(size: ${9 * fontScale}pt)[${contacts.join(` #h(${15 * fontScale}pt) `)}]\n`
        : ''
    }]
#v(${6 * fontScale}pt)
#line(length: 100%, stroke: 1pt + brand-border)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  //
  // ⚠️ `brand-text-light` below carries a fallback that is unreachable, and this
  // comment has now been wrong twice about why. `textLight` was an optional on
  // `ThemePalette` and `TimelessPalette` narrowed it; now `ThemePalette`
  // has **no optionals at all** and `TimelessPalette` simply declares the field,
  // so "the only optional-field fallback" names a category with no members.
  // `TS2741` fires on a palette literal that omits it — but note where that
  // enforcement lives: **not on that line.**
  // A template literal accepts `string | undefined` silently under this config
  // (`strict: true`, no `exactOptionalPropertyTypes`, no
  // `restrict-template-expressions`), so removing the narrowing produces zero
  // errors there. Unguarded it would emit `rgb("undefined")`, which does not
  // compile at all. `#71717a` is what all seven timeless palettes declare.
  //
  // ⚠️ **`serif`, not `sans` — this theme is Lora on both sides.** It was
  // `sans` here while every HTML surface asked for Lora: `THEME_FONTS.timeless`
  // plus seven `fontFamily: "'Lora', serif"` call-sites under `helpers/HTML/`.
  // Eight votes to one, and `elegant` is the sibling that already pairs
  // Lora-in-HTML with `getTypstFontList('serif')` here, so the serializer was the
  // outlier. Neither renderer complained: the browser had no Lora face to load
  // and fell through to the generic `serif`, and Typst rendered Inter without
  // anything comparing the two. This is a visible change to existing timeless
  // PDFs and is in the changelog.
  let markup = `// Typst Template for KiwiCV (Theme: Timeless)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(font: ${getTypstFontList('serif')}, size: ${9 * fontScale}pt, fill: rgb("${p.textMain}"), hyphenate: true, lang: "${cvLocale.code}")
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary}")
#let brand-text-main = rgb("${p.textMain}")
#let brand-text-muted = rgb("${p.textMuted}")
#let brand-text-light = rgb("${p.textLight || '#71717a'}")
#let brand-border = rgb("${p.border}")
#let brand-primary-light = brand-border
#let brand-bg-light = rgb("${p.bgLight}")

${commonMacros}

#let timeless-section(title) = block(width: 100%, breakable: false)[
  #text(size: ${12 * fontScale}pt, weight: "semibold", tracking: 1.5pt, fill: brand-text-light)[#cv-upper(title)]
  #v(${4 * fontScale}pt)
  #line(length: 100%, stroke: 1pt + brand-border)
  #v(${12 * fontScale}pt)
]

#let timeless-badge(text-val) = box(
  fill: brand-bg-light,
  stroke: 0.5pt + brand-border,
  radius: ${4 * fontScale}pt,
  inset: (x: ${6 * fontScale}pt, y: ${2.5 * fontScale}pt),
  text(size: ${8 * fontScale}pt, fill: brand-text-muted, text-val)
)

${coverLetterMarkup}
${pageSetup}

#align(center)[
  #text(font: "Lora", size: ${32 * fontScale}pt, weight: "medium", style: "italic", fill: brand-text-main)[${escapeTypst(basics.name)}]
  ${basics.label ? `#v(4pt)\n#text(size: ${10 * fontScale}pt, tracking: 2pt, fill: brand-text-muted)[#cv-upper[${escapeTypst(basics.label)}]]` : ''}
  ${contacts.length > 0 ? `#v(12pt)\n#text(size: ${9 * fontScale}pt)[${contacts.join(` #h(${15 * fontScale}pt) `)}]` : ''}
]
#v(${30 * fontScale}pt)

${
  basics.summary
    ? `#block(width: 100%)[
  #timeless-section("${escapeTypstString(labels.about || 'ABOUT')}")
  #text(size: ${11 * fontScale}pt, fill: brand-text-main)[${escapeTypst(basics.summary)}]
]
#v(${24 * fontScale}pt)`
    : ''
}
`;

  const context = { labels, v, cvLocale, formatCVDateRange, formatCVDate, fontScale };
  // ⚠️ The switch is on `SectionKey`, not `string`: an arm for `about`,
  // `contact` or `profiles` would be `TS2678`. The key comes from
  // `resolveLayoutSection`; a custom-section token arrives as `volunteer`.
  const serializeSection = (sectionId: SectionKey, ctx: typeof context): string => {
    switch (sectionId) {
      case 'work':
        return serializeWork(ctx);
      case 'education':
        return serializeEducation(ctx);
      case 'projects':
      case 'privateProjects':
        return serializeProjects(sectionId, ctx);
      case 'volunteer':
        return serializeVolunteer(ctx);
      case 'skills':
        return serializeSkills(ctx);
      case 'languages':
        return serializeLanguages(ctx);
      case 'awards':
        return serializeAwards(ctx);
      case 'certificates':
        return serializeCertificates(ctx);
      case 'publications':
        return serializePublications(ctx);
      case 'references':
        return serializeReferences(ctx);
      case 'interests':
        return serializeInterests(ctx);
      default:
        return '';
    }
  };

  sectionIds.forEach((sectionId) => {
    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return;
    const items = section.v[section.key];
    const hasItems = Array.isArray(items) && items.length > 0;
    if (hasPageBreak(meta, 'oneColumn', sectionId) && hasItems) markup += '\n#pagebreak()\n';
    markup += serializeSection(section.key, { ...context, v: section.v, labels: section.labels });
  });

  markup += footerMarkup(data, cvLocale, fontScale);
  return markup;
}
