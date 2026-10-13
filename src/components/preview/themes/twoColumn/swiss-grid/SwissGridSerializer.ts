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
import { PALETTES } from '@/components/preview/themes/twoColumn/swiss-grid/helpers/shared/constants';
import type { ResumeData } from '@/types/resume';
import type { LayoutSectionId } from '@/utils/layout/customSections';

import {
  serializeAwards,
  serializeCertificates,
  serializeFixedAboutBlock,
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

export function serializeToTypst(data: ResumeData): string {
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);

  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#ff5722',
    accent: p.primary || '#ff5722',
    border: p.border || '#ffedd5',
    textMuted: p.textMuted || '#71717a',
  });

  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;

  const footerParts = getTypstFooterParts(data, cvLocale);

  // Parse Name
  const nameParts = basics.name.split(' ');
  let nameMarkup: string;
  if (nameParts.length < 2) {
    nameMarkup = `#text(size: ${32 * fontScale}pt, weight: 900, fill: brand-text, tracking: 1.5pt)[#cv-upper[${escapeTypst(basics.name)}]]`;
  } else {
    nameMarkup = `#text(size: ${32 * fontScale}pt, weight: 900, fill: brand-text, tracking: 1.5pt)[#cv-upper[${escapeTypst(nameParts[0])}]] \\ \n    #text(size: ${32 * fontScale}pt, weight: 900, fill: brand-primary, tracking: 1.5pt)[#cv-upper[${escapeTypst(nameParts.slice(1).join(' '))}]]`;
  }

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 30pt, bottom: 30pt, left: 40pt, right: 40pt)
)`;

  // Letter-scale variant of the two-tone header name (the résumé's is 32pt).
  let letterNameMarkup: string;
  if (nameParts.length < 2) {
    letterNameMarkup = `#text(size: ${22 * fontScale}pt, weight: 900, fill: brand-text, tracking: 1.5pt)[#cv-upper[${escapeTypst(basics.name)}]]`;
  } else {
    letterNameMarkup = `#text(size: ${22 * fontScale}pt, weight: 900, fill: brand-text, tracking: 1.5pt)[#cv-upper[${escapeTypst(nameParts[0])}]] \\ \n  #text(size: ${22 * fontScale}pt, weight: 900, fill: brand-primary, tracking: 1.5pt)[#cv-upper[${escapeTypst(nameParts.slice(1).join(' '))}]]`;
  }

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(top: 30pt, bottom: 30pt, left: 40pt, right: 40pt)',
    senderAddress: address,
    textColor: p.text || '#000000',
    mutedColor: p.textMuted || '#71717a',
    borderColor: p.border || '#ffedd5',
    // Same treatment as a `swiss-section` title: brand orange, upper case,
    // tracked out. The subject is the letter's section heading.
    renderSubject: (subjectText, defaults) =>
      `#text(weight: "bold", size: ${defaults.size}pt, fill: brand-primary, tracking: ${1.5 * fontScale}pt)[#cv-upper[${subjectText}]]`,
    themeHeader: `${letterNameMarkup}
${basics.label ? `#v(${8 * fontScale}pt)\n#text(size: ${10 * fontScale}pt, weight: "bold", fill: brand-text-muted, tracking: 2pt)[#cv-upper[${escapeTypst(basics.label)}]]\n` : ''}${
      contactItems.length > 0
        ? `#v(${8 * fontScale}pt)\n#text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n`
        : ''
    }#v(${8 * fontScale}pt)
#line(length: 100%, stroke: ${2 * fontScale}pt + brand-text)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Swiss Grid)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.text || '#000000'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#ff5722'}")
#let brand-text = rgb("${p.text || '#000000'}")
#let brand-text-muted = rgb("${p.textMuted || '#71717a'}")
#let brand-border = rgb("${p.border || '#ffedd5'}")

${commonMacros}

// Section Header macro for Swiss Grid
#let swiss-section(title, is-side: false, num: "") = block(width: 100%, breakable: false)[
  #if is-side [
    #set text(size: ${10 * fontScale}pt, weight: "bold", tracking: 1pt)
    #block(
      width: 100%,
      stroke: (bottom: ${2 * fontScale}pt + brand-primary),
      inset: (bottom: ${2 * fontScale}pt),
      [#cv-upper(title)]
    )
    #v(${6 * fontScale}pt)
  ] else [
    #set text(size: ${22 * fontScale}pt, weight: "bold")
    #block(
      width: 100%,
      stroke: (bottom: ${3 * fontScale}pt + brand-text),
      inset: (bottom: ${8 * fontScale}pt),
      [
        #grid(
          columns: (auto, 1fr),
          column-gutter: ${10 * fontScale}pt,
          align: (left + horizon, left + horizon),
          if num != "" [
            #text(fill: brand-primary, font: "JetBrains Mono", weight: "bold", size: ${32 * fontScale}pt)[#num]
          ],
          [#cv-upper(title)]
        )
      ]
    )
    #v(${16 * fontScale}pt)
  ]
]

// Skill Level Bar (4 steps)
#let skill-level-bar(value, primary-color, scale, is-side: false) = {
  if value > 0 {
    let cells = ()
    for step in range(1, 5) {
      cells += (rect(
        width: 100%,
        height: if is-side { ${2 * fontScale}pt } else { ${3 * fontScale}pt },
        fill: if step <= value { primary-color } else { rgb("#f3f4f6") },
        radius: ${1 * fontScale}pt
      ),)
    }
    grid(
      columns: (1fr,) * 4,
      column-gutter: ${3 * fontScale}pt,
      ..cells
    )
  }
}

// Language Level Bar (5 steps)
#let lang-level-bar(value, primary-color, scale) = {
  if value > 0 {
    let cells = ()
    for step in range(1, 6) {
      cells += (rect(
        width: 100%,
        height: ${2 * fontScale}pt,
        fill: if step <= value { primary-color } else { rgb("#f3f4f6") }
      ),)
    }
    grid(
      columns: (1fr,) * 5,
      column-gutter: ${2 * fontScale}pt,
      ..cells
    )
  }
}

// Theme Specific Badge (Swiss tag)
#let swiss-badge(text-val) = {
  box(
    fill: brand-border,
    radius: ${2 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    text(size: ${8 * fontScale}pt, weight: "bold", fill: brand-text, [#cv-upper(text-val)])
  )
}

${coverLetterMarkup}
${pageSetup}

// Header Section
#grid(
  columns: ${imageVisible ? '(auto, 1fr)' : '(1fr,)'},
  column-gutter: ${20 * fontScale}pt,
  align: horizon,
  ${
    imageVisible
      ? `${getProfileImageMarkup(
          basics.image,
          imageShape as 'circle' | 'square',
          92 * fontScale,
          3 * fontScale,
          p.border || '#ffedd5',
        )},`
      : ''
  }
  [
    ${nameMarkup}
    ${
      basics.label
        ? `\n    #v(${20 * fontScale}pt)\n    #text(size: ${12 * fontScale}pt, weight: "bold", fill: brand-text-muted, tracking: 2pt)[#cv-upper[${escapeTypst(basics.label)}]]`
        : ''
    }
  ]
)

#v(${30 * fontScale}pt)
#line(length: 100%, stroke: ${2 * fontScale}pt + brand-text)
#v(${40 * fontScale}pt)
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
    address,
    contactItems,
  };

  // ⚠️ The switch is on `SectionKey`, not `string`: an arm for `about`,
  // `contact` or `profiles` would be `TS2678`. Ids come from
  // `getTwoColumnSections`; a custom-section token resolves to `volunteer`.
  const serializeSection = (
    sectionId: LayoutSectionId,
    isSide: boolean,
    baseCtx: typeof context & { num?: string },
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
  // ⚠️ Joined rather than concatenated. An earlier fix gated the separator on the
  // sections but not on the contact block, so a resume with no contact data
  // opened the column on a bare `#v()` separating nothing from the first
  // section. `joinBlocks` drops an empty block and its separator together.
  // Swiss Grid always has Contact first in the side column.
  const sideColContent = joinBlocks(
    [
      serializeFixedContactBlock(true, context),
      emitSectionsWithBreaks(sideSectionIds, {
        meta,
        column: 'sidebar',
        breakToken: '\n#colbreak()\n',
        separator: `\n#v(${24 * fontScale}pt)\n`,
        render: (sectionId) => serializeSection(sectionId, true, context),
      }),
    ],
    `\n#v(${24 * fontScale}pt)\n`,
  );

  let mainColContent = '';

  // ⚠️ The section number counts **emitted** sections, not positions in the
  // order. It used to be `idx + offset` over the unfiltered list, so a section
  // whose items were all hidden still consumed its number and the CV read
  // 01, 02, **04**.
  const offset = basics.summary ? 2 : 1;
  const mainSections = emitSectionsWithBreaks(mainSectionIds, {
    meta,
    column: 'main',
    breakToken: '\n#colbreak()\n',
    separator: `\n#v(${24 * fontScale}pt)\n`,
    render: (sectionId, emittedIndex) => {
      const num = emittedIndex + offset;
      const numStr = num < 10 ? `0${num}` : `${num}`;

      return serializeSection(sectionId, false, { ...context, num: numStr });
    },
  });

  // Swiss Grid always has About first in main column if present
  if (basics.summary) {
    mainColContent += serializeFixedAboutBlock(false, { ...context, num: '01' });
    if (mainSections) {
      mainColContent += `\n#v(${24 * fontScale}pt)\n`;
    }
  }

  mainColContent += mainSections;

  // Construct dual-column grid body
  markup += `
#grid(
  columns: ${sidebarPosition === 'left' ? '(160pt, 1fr)' : '(1fr, 160pt)'},
  column-gutter: ${20 * fontScale}pt,
  row-gutter: 0pt,
  ${
    sidebarPosition === 'left'
      ? `block(
          width: 100%,
          stroke: (right: 1.5pt + brand-border),
          inset: (right: 15pt),
          [
            ${sideColContent}
          ]
        ),
        block(
          width: 100%,
          [
            ${mainColContent}
          ]
        )`
      : `block(
          width: 100%,
          [
            ${mainColContent}
          ]
        ),
        block(
          width: 100%,
          stroke: (left: 1.5pt + brand-border),
          inset: (left: 15pt),
          [
            ${sideColContent}
          ]
        )`
  }
)
${renderTypstSignatureFooter({
  showFooter: meta?.theme?.params?.showFooter,
  parts: footerParts,
  name: basics.name,
  fontScale,
})}
`;

  return markup;
}
