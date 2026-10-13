import {
  formatFullAddress,
  getBoundFormatters,
  getSectionLabels,
  getTwoColumnSections,
  getVisibleData,
  hasPageBreak,
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
import { PALETTES_PDF } from '@/components/preview/themes/twoColumn/foggy/helpers/shared/constants';
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
  const { basics, meta } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const p = resolvePalette(PALETTES_PDF, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const v = getVisibleData(data);
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';
  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);
  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;
  const parts = getTypstFooterParts(data, cvLocale);

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#1a7a4a',
    accent: p.primary || '#1a7a4a',
    border: p.border || '#ddeee5',
    textMuted: p.textMuted || '#3d5e4a',
  });

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 35pt, bottom: 35pt, left: 30pt, right: 30pt),
  fill: rgb("${p.bg || '#f5f9f6'}")
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(top: 35pt, bottom: 35pt, left: 30pt, right: 30pt)',
    pageFill: p.bg || '#f5f9f6',
    senderAddress: address,
    textColor: p.text || '#0a1f14',
    mutedColor: p.textMuted || '#3d5e4a',
    borderColor: p.border || '#ddeee5',
    themeHeader: `#foggy-card[
  #text(size: ${22 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
${basics.label ? `  #v(${2 * fontScale}pt)\n  #text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? `  #v(${10 * fontScale}pt)\n  #block(width: 100%, stroke: (top: 1pt + brand-border), inset: (top: ${8 * fontScale}pt))[\n    #text(size: ${8 * fontScale}pt, weight: "medium", fill: brand-text)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n  ]\n`
        : ''
    }]`,
    // Foggy's résumé puts every section in a white card — the letter body
    // gets the same treatment below the header card.
    wrapBody: (content) => `#foggy-card[\n${content}\n]`,
    // The sender is a tinted strip above the body card, matching the small
    // cards the résumé uses for its side content.
    renderSender: (sender) => `#foggy-small-card[${sender}]`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Foggy)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${10 * fontScale}pt,
  fill: rgb("${p.text || '#0a1f14'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#1a7a4a'}")
#let brand-primary-very-light = rgb("${p.primaryVeryLight || '#f3f9f6'}")
#let brand-bg = rgb("${p.bg || '#f5f9f6'}")
#let brand-border = rgb("${p.border || '#ddeee5'}")
#let brand-text = rgb("${p.text || '#0a1f14'}")
#let brand-text-muted = rgb("${p.textMuted || '#3d5e4a'}")
#let brand-text-light = rgb("${p.textLight || '#567865'}")

${commonMacros}

#let foggy-card(body) = block(
  width: 100%,
  fill: white,
  stroke: 1pt + brand-border,
  radius: ${10 * fontScale}pt,
  inset: (x: ${20 * fontScale}pt, y: ${16 * fontScale}pt),
  body
)

#let foggy-small-card(body) = block(width: 100%, breakable: false)[
  #box(
    width: 100%,
    fill: brand-bg,
    stroke: 1pt + brand-border,
    radius: ${6 * fontScale}pt,
    inset: (x: ${10 * fontScale}pt, y: ${8 * fontScale}pt),
    body
  )
]

#let foggy-card-section(title, icon-name, is-side: false) = block(width: 100%, breakable: false)[
  #if is-side {
    grid(
      columns: (auto, 1fr),
      align: (left + horizon, left + horizon),
      column-gutter: ${4 * fontScale}pt,
      icon(icon-name),
      text(size: ${7 * fontScale}pt, weight: "bold", tracking: 0.8pt, fill: brand-text)[#cv-upper(title)]
    )
  } else {
    grid(
      columns: (${24 * fontScale}pt, auto, 1fr),
      align: (left + horizon, left + horizon, left + horizon),
      column-gutter: ${4 * fontScale}pt,
      rect(width: ${24 * fontScale}pt, height: ${2 * fontScale}pt, fill: brand-primary, radius: ${1 * fontScale}pt),
      icon(icon-name),
      text(size: ${8 * fontScale}pt, weight: "bold", tracking: 0.8pt, fill: brand-text)[#cv-upper(title)]
    )
  }
  #v(if is-side { ${8 * fontScale}pt } else { ${6 * fontScale}pt })
]

#let foggy-level-bar(value, max: 4) = {
  if value > 0 {
    let cells = ()
    for step in range(0, max) {
      cells += (rect(
        width: 100%,
        height: ${2.5 * fontScale}pt,
        fill: if step < value { brand-primary } else { rgb("#e2e8f0") },
        radius: ${1.25 * fontScale}pt
      ),)
    }
    grid(columns: (1fr,) * max, column-gutter: ${2 * fontScale}pt, ..cells)
  }
}

#let foggy-badge(text-val) = box(
  fill: brand-primary-very-light,
  stroke: 1pt + brand-border,
  radius: ${4 * fontScale}pt,
  inset: (x: ${4 * fontScale}pt, y: ${2.5 * fontScale}pt),
  text(size: ${7.5 * fontScale}pt, fill: brand-text, text-val)
)

#let foggy-interest-keyword(text-val) = box(
  fill: rgb("#f1f5f9"),
  stroke: 1pt + brand-border,
  radius: ${10 * fontScale}pt,
  inset: (x: ${6 * fontScale}pt, y: ${2.5 * fontScale}pt),
  text(size: ${7.5 * fontScale}pt, fill: brand-text-muted, text-val)
)

#let foggy-side-interest(text-val) = box(
  fill: brand-bg,
  stroke: 1pt + brand-border,
  radius: ${3 * fontScale}pt,
  inset: (x: ${6 * fontScale}pt, y: ${2.5 * fontScale}pt),
  text(size: ${7.5 * fontScale}pt, fill: brand-text, text-val)
)

#let foggy-timeline(rows: ()) = {
  let cells = ()
  for i in range(rows.len()) {
    let row-data = rows.at(i)
    let is-present = row-data.at("isPresent", default: true)
    let is-last = i == rows.len() - 1
    cells += ([
      #place(top + left, dx: ${6 * fontScale}pt, circle(
        radius: ${4 * fontScale}pt,
        fill: if is-present { brand-primary } else { rgb("#cbd5e1") },
        stroke: ${2 * fontScale}pt + white
      ))
    ], block(width: 100%, breakable: false, inset: (bottom: if is-last { 0pt } else { ${10 * fontScale}pt }), row-data.content))
  }
  grid(
    columns: (${10 * fontScale}pt, 1fr),
    column-gutter: ${12 * fontScale}pt,
    stroke: (col, row) => if col == 0 { (right: ${1.5 * fontScale}pt + brand-primary) } else { none },
    ..cells
  )
}

${coverLetterMarkup}
${pageSetup}

#foggy-card[
  #grid(
    columns: ${imageVisible ? '(auto, 1fr)' : '(1fr,)'},
    column-gutter: ${16 * fontScale}pt,
    align: (left + horizon, left + horizon),
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
      #text(size: ${22 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
      ${basics.label ? `#v(${2 * fontScale}pt)\n      #text(size: ${11 * fontScale}pt, weight: "semibold", fill: brand-primary)[${escapeTypst(basics.label)}]` : ''}
      ${basics.summary ? `#v(${6 * fontScale}pt)\n      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]` : ''}
    ]
  )
  ${
    contactItems.length > 0
      ? `#v(${16 * fontScale}pt)\n  #block(width: 100%, stroke: (top: 1pt + brand-border), inset: (top: ${12 * fontScale}pt))[\n    #text(size: ${8 * fontScale}pt, weight: "medium", fill: brand-text)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n  ]`
      : ''
  }
]
#v(${20 * fontScale}pt)
`;

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
  const serializeSection = (sectionId: LayoutSectionId, isSide: boolean): string => {
    // A custom section renders through the volunteer serializer.
    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return '';
    const ctx = {
      ...context,
      v: section.v,
      labels: section.labels,
      isCustomSection: section.isCustom,
    };
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

  const buildColumn = (sectionIds: LayoutSectionId[], area: 'main' | 'sidebar') =>
    sectionIds
      .map((sectionId) => {
        const section = serializeSection(sectionId, area === 'sidebar');
        if (!section) return '';
        const prefix = hasPageBreak(meta, area, sectionId) ? '\n#colbreak()\n' : '';
        return `${prefix}#foggy-card[\n${section}\n]`;
      })
      .filter(Boolean)
      .join(`\n#v(${10 * fontScale}pt)\n`);

  const mainColContent = buildColumn(mainSectionIds, 'main');
  const sideColContent = buildColumn(sideSectionIds, 'sidebar');

  markup += `#grid(
  columns: ${sidebarPosition === 'left' ? `(1fr, ${170 * fontScale}pt)` : `(${170 * fontScale}pt, 1fr)`},
  column-gutter: ${20 * fontScale}pt,
  align: (top, top),
  ${sidebarPosition === 'left' ? `[${mainColContent}], [${sideColContent}]` : `[${sideColContent}], [${mainColContent}]`}
)
`;

  markup += renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts,
    name: basics.name,
    fontScale,
    textColor: 'brand-text-light',
    borderColor: 'brand-border',
    textSize: 8,
    width: 160,
    topGap: 28,
    textToLineGap: 24,
    lineInsetTop: 6,
  });

  return markup;
}
