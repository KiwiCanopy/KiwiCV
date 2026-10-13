import {
  applyLayoutVariant,
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
import { PALETTES_PDF } from '@/components/preview/themes/twoColumn/skyline/helpers/shared/constants';
import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from '@/components/preview/themes/twoColumn/skyline/helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from '@/components/preview/themes/twoColumn/skyline/helpers/typst/educationSkills';
import {
  serializeProjects,
  serializeVolunteer,
  serializeWork,
} from '@/components/preview/themes/twoColumn/skyline/helpers/typst/experience';
import type { ResumeData, ResumeSectionItem } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';
import type { LayoutSectionId } from '@/utils/layout/customSections';

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
  const imageShape = meta?.theme?.params?.imageShape || 'circle';
  const imageVisible = v.imageVisible !== false && basics.image;
  const parts = getTypstFooterParts(data, cvLocale);

  const pageSetup = `#set page(
  paper: "a4",
  margin: 30pt,
  fill: rgb("${p.bg || '#e0f2fe'}")
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '30pt',
    pageFill: p.bg || '#e0f2fe',
    senderAddress: address,
    textColor: p.textMain || '#1e293b',
    mutedColor: p.textMuted || '#64748b',
    borderColor: p.border || '#bae6fd',
    themeHeader: `#skyline-card[
  #text(size: ${24 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
${basics.label ? `  #v(${3 * fontScale}pt)\n  #text(size: ${13 * fontScale}pt, weight: "medium", fill: brand-primary)[${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? `  #v(${10 * fontScale}pt)\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n`
        : ''
    }]`,
    // The header keeps the full white `skyline-card`; the body takes the
    // recessed `skyline-glass` the résumé uses for secondary blocks. Two equal
    // cards read as two headers — this gives the page a primary and a secondary.
    wrapBody: (content) => `#skyline-glass[\n${content}\n]`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Skyline)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${8.5 * fontScale}pt,
  fill: rgb("${p.text || '#1e293b'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#4cb2e6'}")
#let brand-primary-light = rgb("${p.primaryLight || '#e0f2fe'}")
#let brand-primary-very-light = rgb("${p.primaryVeryLight || '#f0f9ff'}")
#let brand-bg = rgb("${p.bg || '#e0f2fe'}")
#let brand-bg-light = rgb("${p.bgLight || '#f0f9ff'}")
#let brand-border = rgb("${p.border || '#bae6fd'}")
#let brand-text = rgb("${p.textMain || '#1e293b'}")
#let brand-text-muted = rgb("${p.textMuted || '#64748b'}")
#let brand-text-light = rgb("${p.textLight || '#64748b'}")

${getCommonTypstMacros(fontScale, {
  primary: p.primary || '#4cb2e6',
  accent: p.primary || '#4cb2e6',
  border: p.border || '#bae6fd',
  textMuted: p.textMuted || '#64748b',
})}

#let skyline-card(body) = block(
  width: 100%,
  fill: white,
  stroke: 1pt + white,
  radius: ${16 * fontScale}pt,
  inset: (x: ${24 * fontScale}pt, y: ${24 * fontScale}pt),
  body
)

#let skyline-glass(body) = block(
  width: 100%,
  fill: rgb("#fbfbfb"),
  stroke: 1pt + white,
  radius: ${12 * fontScale}pt,
  inset: (x: ${16 * fontScale}pt, y: ${16 * fontScale}pt),
  body
)

#let skyline-section-icon(name, height) = box(baseline: 14%, image("/icons/" + name + ".svg", height: height))

#let skyline-section(title, icon-name, is-side: false) = block(width: 100%, breakable: false)[
  #if is-side {
    grid(
      columns: (auto, 1fr),
      align: (left + horizon, left + horizon),
      column-gutter: ${8 * fontScale}pt,
      skyline-section-icon(icon-name, ${14 * fontScale}pt),
      text(size: ${10 * fontScale}pt, weight: "bold", fill: brand-text)[#title]
    )
    v(${12 * fontScale}pt)
  } else {
    block(width: 100%, stroke: (bottom: 1pt + rgb("#e2e8f0")), inset: (bottom: ${10 * fontScale}pt))[
      #grid(
        columns: (auto, auto, 1fr),
        align: (left + horizon, left + horizon, left + horizon),
        column-gutter: ${6 * fontScale}pt,
        box(fill: brand-primary-light, radius: ${6 * fontScale}pt, inset: ${6 * fontScale}pt, skyline-section-icon(icon-name, ${16 * fontScale}pt)),
        text(size: ${11.5 * fontScale}pt, weight: "bold", fill: brand-text)[#title],
        []
      )
    ]
    v(${16 * fontScale}pt)
  }
]

#let skyline-level-bar(value, max: 4) = {
  if value > 0 {
    let cells = ()
    for step in range(0, max) {
      cells += (rect(
        width: 100%,
        height: ${4 * fontScale}pt,
        fill: if step < value { brand-primary } else { rgb("#e2e8f0") },
        radius: ${2 * fontScale}pt
      ),)
    }
    grid(columns: (1fr,) * max, column-gutter: ${3 * fontScale}pt, ..cells)
  }
}

#let skyline-badge(text-val) = box(
  fill: white,
  stroke: 0.5pt + rgb("#e2e8f0"),
  radius: ${6 * fontScale}pt,
  inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
  text(size: ${7 * fontScale}pt, fill: brand-text-light, text-val)
)

#let skyline-interest-keyword(text-val) = box(
  fill: rgb("#f8fafc"),
  stroke: 1pt + rgb("#e2e8f0"),
  radius: ${8 * fontScale}pt,
  inset: (x: ${10 * fontScale}pt, y: ${5 * fontScale}pt),
  text(size: ${7.5 * fontScale}pt, fill: brand-text-muted, text-val)
)

#let skyline-side-interest(text-val) = box(
  fill: brand-primary-very-light,
  stroke: 1pt + brand-primary-light,
  radius: ${6 * fontScale}pt,
  inset: (x: ${8 * fontScale}pt, y: ${4 * fontScale}pt),
  text(size: ${8.5 * fontScale}pt, weight: "semibold", fill: brand-text, text-val)
)

#let skyline-timeline(rows: ()) = {
  let cells = ()
  for i in range(rows.len()) {
    let row-data = rows.at(i)
    let is-present = row-data.at("isPresent", default: true)
    let is-last = i == rows.len() - 1
    cells += ([
      #place(top + left, dx: ${6 * fontScale}pt, circle(
        radius: ${4 * fontScale}pt,
        fill: if is-present { brand-primary } else { rgb("#cbd5e1") },
        stroke: ${2.5 * fontScale}pt + white
      ))
    ], block(width: 100%, breakable: false, inset: (bottom: if is-last { 0pt } else { ${12 * fontScale}pt }), row-data.content))
  }
  grid(
    columns: (${10 * fontScale}pt, 1fr),
    column-gutter: ${14 * fontScale}pt,
    stroke: (col, row) => if col == 0 { (right: ${2 * fontScale}pt + brand-primary) } else { none },
    ..cells
  )
}

${coverLetterMarkup}
${pageSetup}

#skyline-card[
  #grid(
    columns: ${imageVisible ? '(auto, 1fr)' : '(1fr,)'},
    column-gutter: ${20 * fontScale}pt,
    align: (left + horizon, left + horizon),
    ${
      imageVisible
        ? `${getProfileImageMarkup(
            basics.image,
            imageShape as 'circle' | 'square',
            100 * fontScale,
            3 * fontScale,
            p.border || '#bae6fd',
          )},`
        : ''
    }
    [
      #text(size: ${26 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
      ${basics.label ? `#v(${4 * fontScale}pt)\n      #text(size: ${14 * fontScale}pt, weight: "medium", fill: brand-primary)[${escapeTypst(basics.label)}]` : ''}
      ${basics.summary ? `#v(${8 * fontScale}pt)\n      #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]` : ''}
    ]
  )
  ${
    contactItems.length > 0
      ? `#v(${12 * fontScale}pt)\n  #text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]`
      : ''
  }
]
#v(${24 * fontScale}pt)
`;

  const context = {
    basics,
    labels,
    v,
    cvLocale,
    formatCVDateRange,
    formatCVDate,
    fontScale,
    isCustomSection: false,
  };

  /**
   * ⚠️ **The side column's field blanks are a projection, and the serializer
   * has to apply the same one.** `SIDE_OVERRIDES`
   * (`utils/componentVariants.ts`) is where skyline records that its sidebar is
   * compact: `projects`/`privateProjects` drop `description`, `highlights`,
   * `entity` and `type`, `volunteer` drops `summary` and `highlights`.
   * `SkylineHTML.tsx` runs every section through `applyLayoutVariant`; this
   * file did not, so ten fields the preview blanked reached the PDF anyway —
   * the `export-only` half of the parity baseline, and the reason the fix
   * was a projection *and* a serializer change rather than either alone.
   *
   * Applied once here rather than inside the eleven sub-serializers, which read
   * `context.v.<section>` directly: the alternative is restating the blank list
   * per section, which is the twenty-fourth copy `componentVariants.ts` exists
   * to have deleted.
   *
   * ⚠️ **`main` is not projected, because `main` is the identity.**
   * `applyVariant` returns `items` unchanged for it, so routing both modes
   * through here would add a call that cannot do anything and imply the main
   * column has a projection to get wrong.
   */
  const contextFor = (key: SectionKey, isSide: boolean, base: typeof context): typeof context => {
    if (!isSide) return base;
    const items = base.v[key];
    return {
      ...base,
      v: {
        ...base.v,
        [key]: applyLayoutVariant(items as ResumeSectionItem[], key, 'side'),
      } as typeof v,
    };
  };

  // ⚠️ The switch is on `SectionKey`, not `string`: an arm for `about`,
  // `contact` or `profiles` would be `TS2678`. Ids come from
  // `getTwoColumnSections`; a custom-section token resolves to `volunteer`.
  const serializeSection = (sectionId: LayoutSectionId, isSide: boolean): string => {
    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return '';
    const ctx = contextFor(section.key, isSide, {
      ...context,
      v: section.v,
      labels: section.labels,
      isCustomSection: section.isCustom,
    });
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
        return `${prefix}#skyline-glass[\n${section}\n]`;
      })
      .filter(Boolean)
      .join(`\n#v(${area === 'sidebar' ? 15 * fontScale : 16 * fontScale}pt)\n`);

  const mainColContent = buildColumn(mainSectionIds, 'main');
  const sideColContent = buildColumn(sideSectionIds, 'sidebar');

  markup += `#grid(
  columns: ${sidebarPosition === 'left' ? `(${170 * fontScale}pt, 1fr)` : `(1fr, ${170 * fontScale}pt)`},
  column-gutter: ${30 * fontScale}pt,
  align: (top, top),
  ${sidebarPosition === 'left' ? `[${sideColContent}], [${mainColContent}]` : `[${mainColContent}], [${sideColContent}]`}
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
