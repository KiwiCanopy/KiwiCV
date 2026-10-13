import {
  emitSectionsWithBreaks,
  formatFullAddress,
  getBoundFormatters,
  getSectionLabels,
  getTwoColumnSections,
  getVisibleData,
  joinBlocks,
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
  getProfileImageMarkup,
  getTypstDocumentMetadata,
  getTypstFontList,
  getTypstResumeSpacingSettings,
} from '@/components/preview/themes/shared/typstUtils';
import { PALETTES } from '@/components/preview/themes/twoColumn/lunar/helpers/shared/constants';
import type { ResumeData } from '@/types/resume';
import type { LayoutSectionId } from '@/utils/layout/customSections';

import {
  serializeAwards,
  serializeCertificates,
  serializeFixedContactBlock,
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

function hexToRgbString(hex: string, alphaPercent: number): string {
  const cleanHex = hex.replace('#', '');
  let r = 255,
    g = 255,
    b = 255;
  if (cleanHex.length === 6) {
    r = parseInt(cleanHex.substring(0, 2), 16);
    g = parseInt(cleanHex.substring(2, 4), 16);
    b = parseInt(cleanHex.substring(4, 6), 16);
  } else if (cleanHex.length === 3) {
    r = parseInt(cleanHex.substring(0, 1) + cleanHex.substring(0, 1), 16);
    g = parseInt(cleanHex.substring(1, 2) + cleanHex.substring(1, 2), 16);
    b = parseInt(cleanHex.substring(2, 3) + cleanHex.substring(2, 3), 16);
  }
  return `rgb(${r}, ${g}, ${b}, ${alphaPercent}%)`;
}

export function serializeToTypst(data: ResumeData): string {
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const v = getVisibleData(data);

  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const sidebarText = p.sidebarText || '#e0e0e0';
  const primaryColor = p.primary || '#1a1a2e';

  const sidebarText90 = hexToRgbString(sidebarText, 90);
  const sidebarText80 = hexToRgbString(sidebarText, 80);
  const sidebarText70 = hexToRgbString(sidebarText, 70);
  const sidebarText20 = hexToRgbString(sidebarText, 20);

  const primary90 = hexToRgbString(primaryColor, 90);

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: primaryColor,
    accent: primaryColor,
    border: p.border || '#eeeeee',
    textMuted: p.textMuted || '#666666',
  });

  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;

  const footerParts = getTypstFooterParts(data, cvLocale);

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 30pt, bottom: 30pt, left: 0pt, right: 0pt),
  background: place(
    top + ${sidebarPosition === 'left' ? 'left' : 'right'},
    rect(
      fill: rgb("${p.sidebarBg || '#1a1a2e'}"),
      width: 32%,
      height: 100%,
      stroke: none
    )
  )
)`;

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    // The letter page gets conventional margins — the résumé's zero side
    // margins and sidebar background only make sense with the sidebar.
    pageMargin: '(x: 40pt, y: 40pt)',
    senderAddress: address,
    textColor: p.textMain || '#1a1a2e',
    mutedColor: p.textMuted || '#666666',
    borderColor: p.border || '#eeeeee',
    // The résumé's defining feature is a full-height dark sidebar. The letter
    // drops it (there is nothing to put in it) but echoes it as a thin rule
    // down the left page edge, so the two pages read as one document.
    pageBackground: `place(left + top, rect(width: ${7 * fontScale}pt, height: 100%, fill: rgb("${p.sidebarBg || '#1a1a2e'}")))`,
    themeHeader: `#block(
  width: 100%,
  stroke: (bottom: ${2 * fontScale}pt + brand-primary),
  inset: (bottom: ${10 * fontScale}pt),
  [
    #text(size: ${22 * fontScale}pt, weight: "bold", fill: brand-text, tracking: 1pt)[#cv-upper[${escapeTypst(basics.name)}]]
${basics.label ? `    #v(${4 * fontScale}pt)\n    #text(size: ${10 * fontScale}pt, weight: "bold", fill: brand-primary, tracking: 0.5pt)[#cv-upper[${escapeTypst(basics.label)}]]\n` : ''}${
      contactItems.length > 0
        ? `    #v(${6 * fontScale}pt)\n    #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${10 * fontScale}pt) `)}]\n`
        : ''
    }  ]
)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Lunar)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.textMain || '#1a1a2e'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#1a1a2e'}")
#let brand-primary-90 = ${primary90}
#let brand-text = rgb("${p.textMain || '#1a1a2e'}")
#let brand-text-muted = rgb("${p.textMuted || '#666666'}")
#let brand-border = rgb("${p.border || '#eeeeee'}")

#let brand-sidebar-text = rgb("${sidebarText}")
#let brand-sidebar-text-90 = ${sidebarText90}
#let brand-sidebar-text-80 = ${sidebarText80}
#let brand-sidebar-text-70 = ${sidebarText70}
#let brand-sidebar-text-20 = ${sidebarText20}
#let brand-sidebar-heading = rgb("${p.sidebarHeading || p.sidebarText || '#8892b0'}")
#let brand-sidebar-border = rgb("${p.sidebarBorder || '#30304a'}")

${commonMacros}

// Section Header macro for Main Column
#let lunar-main-section(title) = block(width: 100%, breakable: false)[
  #set text(size: ${11.5 * fontScale}pt, weight: "bold", fill: brand-primary, tracking: 1pt)
  #block(
    width: 100%,
    stroke: (bottom: ${1.5 * fontScale}pt + brand-border),
    inset: (bottom: ${2 * fontScale}pt),
    [#cv-upper(title)]
  )
  #v(${8 * fontScale}pt)
]

// Section Header macro for Sidebar
#let lunar-side-section(title) = block(width: 100%, breakable: false)[
  #set text(size: ${7.9 * fontScale}pt, weight: "bold", fill: brand-sidebar-heading, tracking: 1pt)
  #block(
    width: 100%,
    stroke: (bottom: ${1 * fontScale}pt + brand-sidebar-border),
    inset: (bottom: ${4 * fontScale}pt),
    [#cv-upper(title)]
  )
  #v(${6 * fontScale}pt)
]

// Sidebar Discrete Level Bar (using brand-sidebar-text-90 and brand-sidebar-text-20)
#let lunar-side-level-bar(value, max: 4) = {
  if value > 0 {
    let cells = ()
    for step in range(0, max) {
      cells += (rect(
        width: 100%,
        height: ${2 * fontScale}pt,
        fill: if step < value { brand-sidebar-text-90 } else { brand-sidebar-text-20 },
        radius: ${1 * fontScale}pt
      ),)
    }
    grid(
      columns: (1fr,) * max,
      column-gutter: ${2 * fontScale}pt,
      ..cells
    )
  }
}

// Main Column Discrete Level Bar (using brand-primary-90 and rgb(0, 0, 0, 10%))
#let lunar-main-level-bar(value, max: 4) = {
  if value > 0 {
    let cells = ()
    for step in range(0, max) {
      cells += (rect(
        width: 100%,
        height: ${2 * fontScale}pt,
        fill: if step < value { brand-primary-90 } else { rgb(0, 0, 0, 10%) },
        radius: ${1 * fontScale}pt
      ),)
    }
    grid(
      columns: (1fr,) * max,
      column-gutter: ${2 * fontScale}pt,
      ..cells
    )
  }
}

// Main Column Tag Badge
#let lunar-main-badge(text-val) = {
  box(
    stroke: 1pt + brand-border,
    fill: rgb("#f1f5f9"),
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${2 * fontScale}pt),
    text(size: ${7.5 * fontScale}pt, weight: "bold", fill: brand-primary, text-val)
  )
}

// Sidebar Tag Badge
#let lunar-side-badge(text-val) = {
  box(
    fill: rgb("${p.tagBg || '#30304a'}"),
    radius: ${2 * fontScale}pt,
    inset: (x: ${4 * fontScale}pt, y: ${1 * fontScale}pt),
    text(size: ${6.5 * fontScale}pt, fill: brand-sidebar-text, text-val)
  )
}

${coverLetterMarkup}
${pageSetup}
`;

  // Context to pass to the modularized sections helper
  const context = {
    basics,
    labels,
    v,
    cvLocale,
    formatCVDateRange,
    formatCVDate,
    fontScale,
  };

  // ⚠️ The switch is on `SectionKey`, not `string`: an arm for `about`,
  // `contact` or `profiles` would be `TS2678`. Ids come from
  // `getTwoColumnSections`; a custom-section token resolves to `volunteer`.
  const serializeSection = (
    sectionId: LayoutSectionId,
    isSide: boolean,
    baseCtx: typeof context,
  ): string => {
    const section = resolveLayoutSection(sectionId, data, baseCtx);
    if (!section) return '';
    const ctx = { ...baseCtx, v: section.v, labels: section.labels };
    switch (section.key) {
      case 'work':
        return serializeWork(isSide, ctx);
      case 'education':
        return serializeEducation(isSide, ctx);
      case 'projects':
      case 'privateProjects':
        return serializeProjects(section.key, isSide, ctx);
      case 'volunteer':
        return serializeVolunteer(isSide, ctx);
      case 'skills':
        return serializeSkills(isSide, ctx);
      case 'languages':
        return serializeLanguages(isSide, ctx);
      case 'awards':
        return serializeAwards(isSide, ctx);
      case 'certificates':
        return serializeCertificates(isSide, ctx);
      case 'publications':
        return serializePublications(isSide, ctx);
      case 'references':
        return serializeReferences(isSide, ctx);
      case 'interests':
        return serializeInterests(isSide, ctx);
      default:
        return '';
    }
  };

  // Generate Body Columns
  //
  // ⚠️ Joined rather than concatenated. An earlier fix gated the separator on the
  // sections but not on what precedes them, so with the profile image hidden
  // *and* no contact data the column opened on a bare `#v()` separating nothing
  // from the first section. `joinBlocks` drops an empty block and its separator
  // together, on either side.
  //
  // ⚠️ The image is a joined part, and does **not** carry its own trailing
  // `#v()`. A first draft kept the spacer inside the block "because its spacing
  // differs from the separator" — it does not, both are `15 * fontScale`, and
  // the review caught it. A block that owns its separator is the whole bug:
  // with the image shown, no contact data and every sidebar section hidden, the
  // column closed on that spacer.
  const imageBlock = imageVisible
    ? `#align(center)[#${getProfileImageMarkup(
        basics.image,
        imageShape as 'circle' | 'square',
        80 * fontScale,
        3 * fontScale,
        p.sidebarBorder || p.primary || '#30304a',
      )}]`
    : '';

  const sideColContent = joinBlocks(
    [
      imageBlock,
      serializeFixedContactBlock(true, context),
      emitSectionsWithBreaks(sideSectionIds, {
        meta,
        column: 'sidebar',
        breakToken: '\n#colbreak()\n',
        separator: `\n#v(${15 * fontScale}pt)\n`,
        render: (sectionId) => serializeSection(sectionId, true, context),
      }),
    ],
    `\n#v(${15 * fontScale}pt)\n`,
  );

  // Render main header (name, label, summary). ⚠️ Its `#v(20pt)` used to be
  // appended with the block, unconditionally, so a layout with every section in
  // the sidebar — no hiding required — closed the main column on a bare spacer.
  const mainHeader = `#block(
    width: 100%,
    stroke: (bottom: ${2 * fontScale}pt + brand-primary),
    inset: (bottom: ${15 * fontScale}pt),
    [
      #set par(spacing: ${8 * fontScale}pt)
      #text(size: ${24 * fontScale}pt, weight: "bold", fill: brand-text, tracking: 1pt)[#cv-upper[${escapeTypst(basics.name)}]]
      ${basics.label ? `\\ \n      #v(${4.5 * fontScale}pt)\n      #text(size: ${11 * fontScale}pt, weight: "bold", fill: brand-primary, tracking: 0.5pt)[#cv-upper[${escapeTypst(basics.label)}]]` : ''}
      ${basics.summary ? `\\ \n      #v(${2 * fontScale}pt)\n      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]` : ''}
    ]
  )`;

  const mainColContent = joinBlocks(
    [
      mainHeader,
      emitSectionsWithBreaks(mainSectionIds, {
        meta,
        column: 'main',
        breakToken: '\n#colbreak()\n',
        separator: `\n#v(${18 * fontScale}pt)\n`,
        render: (sectionId) => serializeSection(sectionId, false, context),
      }),
    ],
    `\n  #v(${20 * fontScale}pt)\n  `,
  );

  const footerContent = renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts: footerParts,
    name: basics.name,
    fontScale,
  });

  // Construct dual-column grid body
  markup += `
#grid(
  columns: ${sidebarPosition === 'left' ? '(32%, 68%)' : '(68%, 32%)'},
  column-gutter: 0pt,
  row-gutter: 0pt,
  block(
    width: 100%,
    inset: (
      left: ${sidebarPosition === 'left' ? '15pt' : '30pt'},
      right: ${sidebarPosition === 'left' ? '15pt' : '25pt'},
      top: 0pt,
      bottom: 0pt
    ),
    [
      ${sidebarPosition === 'left' ? sideColContent : mainColContent}
    ]
  ),
  block(
    width: 100%,
    inset: (
      left: ${sidebarPosition === 'left' ? '25pt' : '15pt'},
      right: ${sidebarPosition === 'left' ? '30pt' : '15pt'},
      top: 0pt,
      bottom: 0pt
    ),
    [
      ${sidebarPosition === 'left' ? mainColContent : sideColContent}
    ]
  )
)
${
  footerContent
    ? `#grid(
  columns: ${sidebarPosition === 'left' ? '(32%, 68%)' : '(68%, 32%)'},
  column-gutter: 0pt,
  row-gutter: 0pt,
  ${
    sidebarPosition === 'left'
      ? `[],
  block(
    width: 100%,
    inset: (left: 25pt, right: 30pt),
    [${footerContent}]
  )`
      : `block(
    width: 100%,
    inset: (left: 30pt, right: 25pt),
    [${footerContent}]
  ),
  []`
  }
)`
    : ''
}
`;

  return markup;
}
