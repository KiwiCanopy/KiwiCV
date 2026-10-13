import {
  emitSectionsWithBreaks,
  formatFullAddress,
  getBoundFormatters,
  getSectionLabels,
  getTwoColumnSections,
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
  getProfileImageMarkup,
  getTypstDocumentMetadata,
  getTypstFontList,
  getTypstResumeSpacingSettings,
} from '@/components/preview/themes/shared/typstUtils';
import { PALETTES_PDF } from '@/components/preview/themes/twoColumn/misty/helpers/shared/constants';
import type { ResumeData } from '@/types/resume';
import type { LayoutSectionId } from '@/utils/layout/customSections';

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
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES_PDF, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);

  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#1a7a4a',
    accent: p.primary || '#1a7a4a',
    border: p.border || '#ddeee5',
    textMuted: p.textMuted || '#3d5e4a',
  });

  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;
  const levelBarType =
    ((meta?.theme?.params as Record<string, unknown>)?.levelBarType as string) || 'bars';

  const footerParts = getTypstFooterParts(data, cvLocale);

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 30pt, bottom: 30pt, left: 0pt, right: 0pt),
  background: place(
    top + ${sidebarPosition === 'left' ? 'left' : 'right'},
    rect(
      fill: rgb("${p.bgSidebar || '#f5f9f6'}"),
      width: 32%,
      height: 100%,
      stroke: (
        right: ${sidebarPosition === 'left' ? `1pt + rgb("${p.border || '#ddeee5'}")` : 'none'},
        left: ${sidebarPosition === 'right' ? `1pt + rgb("${p.border || '#ddeee5'}")` : 'none'}
      )
    )
  )
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    // The letter page gets conventional margins — the résumé's zero side
    // margins and sidebar background only make sense with the sidebar.
    pageMargin: '(x: 40pt, y: 40pt)',
    senderAddress: address,
    textColor: p.text || '#0a1f14',
    mutedColor: p.textMuted || '#3d5e4a',
    borderColor: p.border || '#ddeee5',
    themeHeader: `#block(
  width: 100%,
  fill: rgb("${p.bg}"),
  inset: (x: ${16 * fontScale}pt, y: ${14 * fontScale}pt),
  stroke: (bottom: 1pt + rgb("${p.border}")),
  radius: ${6 * fontScale}pt,
  [
    #text(size: ${20 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
${basics.label ? `    #v(${2 * fontScale}pt)\n    #text(size: ${10 * fontScale}pt, fill: brand-primary, weight: "medium", tracking: 0.5pt)[#cv-upper[${escapeTypst(basics.label)}]]\n` : ''}${
      contactItems.length > 0
        ? `    #v(${6 * fontScale}pt)\n    #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${8 * fontScale}pt) `)}]\n`
        : ''
    }  ]
)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Misty)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.text || '#0a1f14'}"),
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#1a7a4a'}")
#let brand-text = rgb("${p.text || '#0a1f14'}")
#let brand-text-muted = rgb("${p.textMuted || '#3d5e4a'}")
#let brand-border = rgb("${p.border || '#ddeee5'}")

${commonMacros}

// Section Header macro
#let misty-section(title, is-side: false) = block(width: 100%, breakable: false)[
  #grid(
    columns: (${15 * fontScale}pt, 1fr),
    align: (left + horizon, left + horizon),
    column-gutter: ${6 * fontScale}pt,
    rect(width: ${15 * fontScale}pt, height: ${2 * fontScale}pt, fill: brand-primary, radius: ${1 * fontScale}pt),
    text(size: ${8.5 * fontScale}pt, weight: "bold", tracking: 0.8pt, fill: brand-text)[#cv-upper(title)]
  )
  #v(if is-side { ${8 * fontScale}pt } else { ${14 * fontScale}pt })
]

// Timeline Layout for a Section
#let misty-timeline(
  col-gutter: ${13 * fontScale}pt,
  row-gutter: 0pt,
  stroke-color: brand-primary,
  stroke-width: ${2 * fontScale}pt,
  dot-radius: ${3.5 * fontScale}pt,
  dot-stroke: ${1.5 * fontScale}pt,
  last-row-short-line: ${5 * fontScale}pt,
  rows: ()
) = {
  let num-rows = rows.len()
  let grid-cells = ()
  for i in range(num-rows) {
    let row-data = rows.at(i)
    let is-present = row-data.at("isPresent", default: true)
    let is-last = row-data.at("isLast", default: i == num-rows - 1)

    // Left cell (col 0): dot and end line segment
    let left-cell = [
      #place(
        top + left,
        dx: ${11 * fontScale}pt - dot-radius,
        dy: 0pt,
        circle(
          radius: dot-radius,
          fill: if is-present { stroke-color } else { rgb("#cbd5e1") },
          stroke: dot-stroke + rgb("#ffffff")
        )
      )
    ]

    // Right cell (col 1): text content
    let right-cell = block(
      width: 100%,
      breakable: false,
      inset: (bottom: if is-last { 0pt } else { ${20 * fontScale}pt }),
      row-data.content
    )

    grid-cells += (left-cell, right-cell)
  }

  grid(
    columns: (${11 * fontScale}pt, 1fr),
    column-gutter: col-gutter,
    row-gutter: row-gutter,
    stroke: (col, row) => {
      if col == 0 {
        (right: stroke-width + stroke-color)
      } else {
        none
      }
    },
    ..grid-cells
  )
}


// Theme Specific Badge (Misty tag)
#let misty-badge(text-val) = {
  box(
    fill: rgb("${p.primaryVeryLight || '#f3f9f6'}"),
    radius: ${2 * fontScale}pt,
    inset: (x: ${4 * fontScale}pt, y: ${2 * fontScale}pt),
    text(size: ${7 * fontScale}pt, fill: brand-text-muted, text-val)
  )
}

// Interest Card for Main Column
#let misty-interest-card(name, keywords) = {
  box(
    stroke: 1pt + brand-border,
    fill: rgb("${p.bgPage || '#ffffff'}"),
    radius: ${8 * fontScale}pt,
    inset: (x: ${10 * fontScale}pt, y: ${8 * fontScale}pt),
    width: auto,
    [
      #text(weight: "bold", size: ${8 * fontScale}pt, fill: brand-primary)[#name]
      #if keywords.len() > 0 [
        #v(${4 * fontScale}pt)
        #keywords.map(kw => box(
          stroke: 0.5pt + brand-border,
          fill: rgb("${p.primaryVeryLight || '#f3f9f6'}"),
          radius: ${4 * fontScale}pt,
          inset: (x: ${4 * fontScale}pt, y: ${2 * fontScale}pt),
          text(size: ${7 * fontScale}pt, fill: brand-text-muted)[#kw]
        )).join(h(${4 * fontScale}pt))
      ]
    ]
  )
}

${coverLetterMarkup}
${pageSetup}

// Header Section
#v(-30pt)
#block(
  width: 100%,
  fill: rgb("${p.bg}"),
  inset: (top: 32pt, bottom: 16pt, left: 20pt, right: 20pt),
  stroke: (bottom: 1pt + rgb("${p.border}")),
  [
    #grid(
      columns: ${imageVisible ? '(auto, 1fr)' : '(1fr,)'},
      gutter: ${imageVisible ? `${24 * fontScale}pt` : '0pt'},
      align: top + left,
      ${
        imageVisible
          ? `${getProfileImageMarkup(
              basics.image,
              imageShape as 'circle' | 'square',
              80 * fontScale,
              3 * fontScale,
              p.border || '#ddeee5',
            )},`
          : ''
      }
      [
        #text(size: ${24 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
        ${
          basics.label
            ? `\n        #v(${2 * fontScale}pt)\n        #text(size: ${11 * fontScale}pt, fill: brand-primary, weight: "medium", tracking: 0.5pt)[#cv-upper[${escapeTypst(basics.label)}]]`
            : ''
        }
        ${
          basics.summary
            ? `\n        #v(${8 * fontScale}pt)\n        #text(size: ${9 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]`
            : ''
        }
        ${
          contactItems.length > 0
            ? `\n        #v(${6 * fontScale}pt)\n        #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${8 * fontScale}pt) `)}]`
            : ''
        }
      ]
    )
  ]
)
#v(${4 * fontScale}pt)
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
    levelBarType,
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
  const sideColContent = emitSectionsWithBreaks(sideSectionIds, {
    meta,
    column: 'sidebar',
    breakToken: '\n#colbreak()\n',
    separator: `\n#v(${13.5 * fontScale}pt)\n`,
    render: (sectionId) => serializeSection(sectionId, true, context),
  });

  const mainColContent = emitSectionsWithBreaks(mainSectionIds, {
    meta,
    column: 'main',
    breakToken: '\n#colbreak()\n',
    separator: `\n#v(${18 * fontScale}pt)\n`,
    render: (sectionId) => serializeSection(sectionId, false, context),
  });

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
      top: 16pt,
      bottom: 16pt,
      left: ${sidebarPosition === 'left' ? '12pt' : '32pt'},
      right: ${sidebarPosition === 'left' ? '12pt' : '32pt'}
    ),
    [
      ${sidebarPosition === 'left' ? sideColContent : mainColContent}
    ]
  ),
  block(
    width: 100%,
    inset: (
      top: 16pt,
      bottom: 16pt,
      left: ${sidebarPosition === 'left' ? '32pt' : '12pt'},
      right: ${sidebarPosition === 'left' ? '32pt' : '12pt'}
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
    inset: (left: 32pt, right: 12pt),
    [${footerContent}]
  )`
      : `block(
    width: 100%,
    inset: (left: 32pt, right: 32pt),
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
