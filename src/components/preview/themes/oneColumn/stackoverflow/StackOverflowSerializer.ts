import { PALETTES } from '@/components/preview/themes/oneColumn/stackoverflow/helpers/shared/constants';
import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/typst/educationSkills';
import {
  serializeProjects,
  serializeVolunteer,
  serializeWork,
} from '@/components/preview/themes/oneColumn/stackoverflow/helpers/typst/experience';
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
  getCommonTypstMacros,
  getTypstDocumentMetadata,
  getTypstFontList,
  getTypstResumeSpacingSettings,
  sanitizeUrl,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';

function headerLink(text: string, url: string, iconName: string): string {
  const href = url.startsWith('mailto:') ? url : sanitizeUrl(url);
  return `#link("${href}")[#box[#icon("${iconName}") #text(fill: brand-text-muted)[${escapeTypst(text)}] #link-icon("external-link")]]`;
}

/**
 * ⚠️ **stackoverflow builds its own contact row, and it was the only theme whose
 * PDF drew no contact icons at all.** Every other theme reaches
 * `typstUtils.ts`'s shared row, which emits `#icon("mail")`, `#icon("phone")`,
 * `#icon("globe")` and `#icon("map-pin")`; this one emitted `external-link` and
 * nothing else, while `MainHeader.tsx` rendered `MapPin`, `Mail` and `Globe` on
 * screen. Three icons in the preview, none in the export — the same class of
 * defect as elegant's, in the opposite direction.
 *
 * The shared row's set is the intended one and each theme's hand-rolled
 * row matches it, so the four names are emitted here too. The icons are placed
 * *before* the text, as the shared row and this theme's own HTML both do; the
 * profile entries below keep their trailing-icon layout, which is a styling
 * choice and not a parity question.
 */
function getHeaderContacts(data: ResumeData, cvLocale: CVLocaleMetadata): string[] {
  const { basics } = data;
  const contacts: string[] = [];
  if (basics.email) contacts.push(headerLink(basics.email, `mailto:${basics.email}`, 'mail'));
  if (basics.phone)
    contacts.push(
      `#box[#icon("phone") #text(fill: brand-text-muted)[${escapeTypst(basics.phone)}]]`,
    );
  if (basics.url) contacts.push(headerLink(basics.url, basics.url, 'globe'));

  const address = formatFullAddress(basics.location, cvLocale);
  if (address)
    contacts.push(`#box[#icon("map-pin") #text(fill: brand-text-muted)[${escapeTypst(address)}]]`);

  (basics.profiles || []).forEach((profile) => {
    const { iconName, text } = getProfileDisplayPDF(profile);
    const body = `#box[#text(fill: brand-text-muted)[${escapeTypst(text)}] #icon("${iconName}")${
      profile.url ? ' #link-icon("external-link")' : ''
    }]`;
    contacts.push(profile.url ? `#link("${sanitizeUrl(profile.url)}")[${body}]` : body);
  });

  return contacts;
}

/**
 * ⚠️ **The parts come from the shared producer and the markup follows** — see
 * the note on `TimelessSerializer.ts`'s `footerMarkup`, which this
 * restated line for line. stackoverflow's date was the worse of the two: a
 * hardcoded `'en-US'`, correct for **1** of the 15 shipped locales.
 *
 * ⚠️ The block inset is the one thing this theme genuinely has and the others do
 * not, and it was the reason the copy survived the first collapse — the renderer had only an
 * `insetX` nobody passed. It is `insetTop`/`insetLeft` now. ⚠️ `insetTop` is not
 * decoration: it adds 20pt to the height of the unbreakable footer unit, so this
 * theme's page-flow demand is 20pt above the shared 58pt budget.
 */
function footerMarkup(data: ResumeData, cvLocale: CVLocaleMetadata, fontScale: number): string {
  const { meta, basics } = data;

  return renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts: getTypstFooterParts(data, cvLocale),
    name: basics.name,
    fontScale,
    textColor: 'brand-text-muted',
    insetTop: 20,
    insetLeft: 30,
  });
}

export function serializeToTypst(data: ResumeData): string {
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const v = getVisibleData(data);
  const oneColSectionIds = getOneColumnSections(meta, data);
  const contacts = getHeaderContacts(data, cvLocale);
  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary,
    accent: p.textMuted,
    border: p.border,
    textMuted: p.textMuted,
  });

  const pageSetup = `#set page(paper: "a4", margin: (top: 30pt, bottom: 30pt, left: 40pt, right: 40pt), fill: rgb("${p.bg}"))`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(top: 30pt, bottom: 30pt, left: 40pt, right: 40pt)',
    pageFill: p.bg,
    senderAddress: formatFullAddress(basics.location, cvLocale),
    textColor: p.text,
    mutedColor: p.textMuted,
    borderColor: p.border,
    // The tag motif, scaled up from `stackoverflow-badge`: same fill, hairline
    // border and 1pt radius, with an inset a full line of text can live in.
    renderSubject: (subjectText, defaults) =>
      `#box(fill: brand-bg-light, stroke: 0.5pt + brand-border, radius: ${1 * fontScale}pt, inset: (x: ${8 * fontScale}pt, y: ${5 * fontScale}pt))[#text(weight: "bold", size: ${defaults.size}pt, fill: brand-dark)[${subjectText}]]`,
    themeHeader: `#block(width: 100%, fill: rgb("${p.headerBg}"), inset: (x: ${16 * fontScale}pt, y: ${14 * fontScale}pt), stroke: (bottom: 3pt + brand-primary))[
  #text(size: ${20 * fontScale}pt, weight: "bold", fill: brand-dark)[${escapeTypst(basics.name)}]
${basics.label ? `  #v(${2 * fontScale}pt)\n  #text(size: ${11 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.label)}]\n` : ''}${
      contacts.length > 0
        ? `  #v(${8 * fontScale}pt)\n  #text(size: ${8 * fontScale}pt)[${contacts.join(` #h(${10 * fontScale}pt) `)}]\n`
        : ''
    }]`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: StackOverflow)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(font: ${getTypstFontList('sans')}, size: ${9 * fontScale}pt, fill: rgb("${p.text}"), hyphenate: true, lang: "${cvLocale.code}")
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary}")
#let brand-dark = rgb("${p.dark}")
#let brand-text = rgb("${p.text}")
#let brand-text-muted = rgb("${p.textMuted}")
#let brand-border = rgb("${p.border}")
#let brand-bg-light = rgb("${p.bgLight}")

${commonMacros}

#let stackoverflow-section(title) = block(width: 100%, breakable: false)[
  #text(size: ${10 * fontScale}pt, weight: "bold", tracking: 0.7pt, fill: brand-dark)[#cv-upper(title)]
  #v(${4 * fontScale}pt)
  #line(length: 100%, stroke: 2pt + brand-primary)
  #v(${10 * fontScale}pt)
]

#let stackoverflow-badge(text-val) = box(
  fill: brand-bg-light,
  stroke: 0.5pt + brand-border,
  radius: ${1 * fontScale}pt,
  inset: (x: ${4 * fontScale}pt, y: ${2.5 * fontScale}pt),
  text(size: ${7 * fontScale}pt, fill: brand-text-muted, text-val)
)

#let stackoverflow-badge-rich(body) = box(
  fill: brand-bg-light,
  stroke: 0.5pt + brand-border,
  radius: ${1 * fontScale}pt,
  inset: (x: ${4 * fontScale}pt, y: ${2.5 * fontScale}pt),
  body
)

#let stackoverflow-discrete-bar(value, max: 5) = grid(
  columns: (1fr,) * max,
  column-gutter: ${3 * fontScale}pt,
  ..range(max).map(i => rect(
    width: 100%,
    height: ${4 * fontScale}pt,
    radius: ${1 * fontScale}pt,
    fill: if i < value { brand-primary } else { brand-border }
  ))
)

#let stackoverflow-entry(title: [], date: [], body: []) = block(width: 100%, breakable: false, inset: (left: ${12 * fontScale}pt), stroke: (left: 2pt + brand-border))[
  #place(left, dx: ${-16 * fontScale}pt, circle(radius: ${4 * fontScale}pt, fill: brand-primary))
  #grid(columns: (1fr, auto), column-gutter: ${8 * fontScale}pt, align: (left + bottom, right + bottom),
    title,
    text(size: ${8 * fontScale}pt, fill: brand-text-muted)[#date]
  )
  #body
  #v(${12 * fontScale}pt)
]

${coverLetterMarkup}
${pageSetup}

#block(width: 100%, fill: rgb("${p.headerBg}"), inset: (x: 40pt, y: 30pt), stroke: (bottom: 3pt + brand-primary))[
  #grid(
    columns: (1fr, auto),
    column-gutter: 20pt,
    align: (left + bottom, right + bottom),
    [
      #text(size: ${20 * fontScale}pt, weight: "bold", fill: brand-dark)[${escapeTypst(basics.name)}]
      ${basics.label ? `#v(${2 * fontScale}pt)\n#text(size: ${11 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.label)}]` : ''}
      ${basics.summary ? `#v(${10 * fontScale}pt)\n#text(size: ${9 * fontScale}pt, fill: brand-text)[${escapeTypst(basics.summary)}]` : ''}
    ],
    [
      #set text(size: ${8 * fontScale}pt)
      ${contacts.join(`\n#v(${2 * fontScale}pt)\n`)}
    ]
  )
]

#block(inset: (top: 20pt, right: 40pt, bottom: 40pt, left: 40pt))[
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

  oneColSectionIds.forEach((sectionId) => {
    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return;
    const items = section.v[section.key];
    const hasItems = Array.isArray(items) && items.length > 0;
    // `#colbreak()`, not `#pagebreak()`. Unlike the other one-column themes,
    // every section here is emitted inside the `#block(inset: …)` opened above,
    // and Typst rejects a pagebreak inside a container outright — "pagebreaks
    // are not allowed inside of containers", hinting at exactly this
    // replacement. That failed the *whole* PDF export for any CV with a manual
    // break set on this theme. `#colbreak()` is what the two-column themes
    // already emit, and it paginates identically here.
    if (hasPageBreak(meta, 'oneColumn', sectionId) && hasItems) markup += '\n#colbreak()\n';
    markup += serializeSection(section.key, { ...context, v: section.v, labels: section.labels });
  });

  markup += footerMarkup(data, cvLocale, fontScale);
  markup += '\n]';

  return markup;
}
