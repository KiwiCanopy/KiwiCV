import { PALETTES } from '@/components/preview/themes/oneColumn/elegant/helpers/shared/constants';
import {
  formatFullAddress,
  getBoundFormatters,
  getOneColumnSections,
  getSectionLabels,
  getVisibleData,
  resolveLayoutSection,
  resolvePalette,
} from '@/components/preview/themes/shared';
import { buildCoverLetterTypst } from '@/components/preview/themes/shared/coverLetterTypst';
import {
  getTypstFooterParts,
  renderTypstSignatureFooter,
} from '@/components/preview/themes/shared/typstFooter';
import {
  escapeTypst,
  getCommonTypstMacros,
  getContactItems,
  getTypstDocumentMetadata,
  getTypstFontList,
  getTypstResumeSpacingSettings,
} from '@/components/preview/themes/shared/typstUtils';
import { hasPageBreak } from '@/components/preview/themes/shared/visibility';
import { type ResumeData } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';

import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from './helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from './helpers/typst/educationSkills';
import { serializeProjects, serializeVolunteer, serializeWork } from './helpers/typst/experience';

export function serializeToTypst(data: ResumeData): string {
  const { basics, meta } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const oneColSectionIds = getOneColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);

  const commonMacros = getCommonTypstMacros(fontScale, p);

  const pageSetup = `#set page(
  paper: "a4",
  margin: (x: 50pt, y: 40pt)
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(x: 50pt, y: 40pt)',
    senderAddress: address,
    textColor: p.text || '#2d3748',
    mutedColor: p.textMuted || '#718096',
    borderColor: p.border || '#e2e8f0',
    themeHeader: `#align(center)[
  #text(size: ${20 * fontScale}pt, weight: "regular", fill: rgb("#1a202c"))[${escapeTypst(basics.name)}]
${basics.label ? `  #v(-4pt)\n  #text(size: ${11 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? `  #v(6pt)\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[
    ${contactItems.join('  #sym.dot.c  ')}
  ]\n`
        : ''
    }]
#v(6pt)
#line(length: 100%, stroke: 1pt + brand-border)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  // Base Typst document template structure
  let markup = `// Typst Template for KiwiCV (Theme: Elegant)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('serif')},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.text || '#2d3748'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#4a5568'}")
#let brand-accent = rgb("${p.accent || p.primary || '#4a5568'}")
#let brand-text-muted = rgb("${p.textMuted || '#718096'}")
#let brand-border = rgb("${p.border || '#e2e8f0'}")

${commonMacros}

${coverLetterMarkup}
${pageSetup}

#let elegant-section(title) = block(width: 100%, breakable: false)[
  #v(10pt)
  #text(font: "Lora", size: ${13 * fontScale}pt, fill: brand-accent)[#title]
  #v(-4pt)
  #line(length: 100%, stroke: 0.5pt + brand-border)
  #v(${4 * fontScale}pt)
]

#let elegant-entry(
  title: "",
  org: "",
  location: "",
  date: "",
  url: "",
  body
) = block(width: 100%, breakable: false)[
  #grid(
    columns: (1fr, auto),
    [
      #let header-content = [
        #text(weight: "bold", size: ${10 * fontScale}pt, fill: rgb("#1a202c"))[#title]
        #let details = (org, location).filter(x => x != "" and x != [])
        #if details.len() > 0 [
          #text(fill: brand-text-muted, size: ${9 * fontScale}pt)[ \u{00B7} #details.join(" \u{00B7} ") ]
        ]
        #if url != "" [
          #text(size: 8pt, fill: brand-text-muted)[ #link-icon("external-link") ]
        ]
      ]
      #if url != "" [
        #link(url)[#header-content]
      ] else [
        #header-content
      ]
    ],
    text(font: "Lora", style: "italic", fill: rgb("#a0aec0"), size: ${8 * fontScale}pt)[#date]
  )
  #v(2pt)
  #body
  #v(${6 * fontScale}pt)
]

// Header
#align(center)[
  #text(size: ${24 * fontScale}pt, weight: "regular", fill: rgb("#1a202c"))[${escapeTypst(basics.name)}]\n`;

  if (basics.label) {
    markup += `  #v(-4pt)\n  #text(size: ${12 * fontScale}pt, style: "italic", fill: brand-text-muted)[${escapeTypst(basics.label)}]\n`;
  }

  if (contactItems.length > 0) {
    markup += `  #v(6pt)\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[
    ${contactItems.join('  #sym.dot.c  ')}
  ]\n`;
  }

  markup += `]

#v(8pt)
#line(length: 100%, stroke: 1pt + brand-border)
#v(8pt)
`;

  if (basics.summary) {
    markup += `// Summary
#align(center)[
  #block(width: 80%)[
    #text(size: ${9.5 * fontScale}pt, style: "italic")[
      ${escapeTypst(basics.summary)}
    ]
  ]
]
#v(6pt)
`;
  }

  // Context to pass to the modularized sections helper
  const context = {
    basics,
    meta,
    labels,
    v,
    cvLocale,
    formatCVDateRange,
    formatCVDate,
    fontScale,
  };

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

  // Iterate and build sections in order of user layouts.
  //
  // The break is emitted before the section and only when the section has
  // items, matching the other one-column themes: a break before a section that
  // renders nothing leaves a blank page.
  //
  // `#pagebreak()` and not `#colbreak()`. Typst rejects a pagebreak inside
  // **any container**, which is what once broke StackOverflow — its sections
  // are emitted inside a `#block(inset: …)`. Elegant opens no container around
  // the loop, so its sections sit at the document's top level and the page form
  // is legal. The rule for a new theme is the container, not the specific one.
  oneColSectionIds.forEach((sectionId) => {
    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return;
    const items = section.v[section.key];
    const hasItems = Array.isArray(items) && items.length > 0;

    if (hasPageBreak(meta, 'oneColumn', sectionId) && hasItems) markup += '\n#pagebreak()\n';
    markup += serializeSection(section.key, { ...context, v: section.v, labels: section.labels });
  });

  markup += renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts: getTypstFooterParts(data, cvLocale),
    name: basics.name,
    fontScale,
    textColor: 'brand-text-muted',
    borderColor: 'brand-border',
  });

  return markup;
}
