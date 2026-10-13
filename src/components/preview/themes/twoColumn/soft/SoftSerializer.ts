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
import { PALETTES } from '@/components/preview/themes/twoColumn/soft/helpers/shared/constants';
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
  const { basics, meta } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);
  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);
  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const v = getVisibleData(data);
  const { main: mainSectionIds, sidebar: sideSectionIds } = getTwoColumnSections(meta, data);
  const sidebarPosition = meta?.content?.order?.twoColumn?.sidebarPosition || 'left';
  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;
  const address = formatFullAddress(basics.location, cvLocale);
  const footerParts = getTypstFooterParts(data, cvLocale);

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#6366f1',
    accent: p.primary || '#6366f1',
    border: p.border || '#c7d2fe',
    textMuted: p.textMuted || '#64748b',
  });

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 30pt, bottom: 30pt, left: 0pt, right: 0pt),
  fill: rgb("${p.bg || '#ffffff'}"),
  background: place(
    top + ${sidebarPosition === 'left' ? 'left' : 'right'},
    rect(
      fill: rgb("#fdfdfd"),
      width: 30%,
      height: 100%,
      stroke: none
    )
  )
)`;

  const contactItems = getContactItems(basics, v.profiles, address);

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    // The letter page gets conventional margins — the résumé's zero side
    // margins and sidebar background only make sense with the sidebar.
    pageMargin: '(x: 40pt, y: 40pt)',
    pageFill: p.bg || '#ffffff',
    senderAddress: address,
    textColor: p.textMain || '#1e293b',
    mutedColor: p.textMuted || '#64748b',
    borderColor: p.border || '#c7d2fe',
    // The header rule is `brand-border`, not `soft-border-neutral`: every soft
    // palette pages white, and `#f1f5f9` on `#ffffff` is a contrast ratio of
    // about 1.06:1 — a divider that exists in the markup and not on paper. The
    // résumé's sidebar divider keeps the neutral, where it sits on a tinted
    // column and is meant to be barely there.
    themeHeader: `#text(size: ${20 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
${basics.label ? `#v(${6 * fontScale}pt)\n#box(fill: soft-primary-10, radius: ${14 * fontScale}pt, inset: (x: ${12 * fontScale}pt, y: ${4 * fontScale}pt))[\n  #text(size: ${7.5 * fontScale}pt, weight: "bold", tracking: 1pt, fill: brand-primary)[#cv-upper[${escapeTypst(basics.label)}]]\n]\n` : ''}${
      contactItems.length > 0
        ? `#v(${8 * fontScale}pt)\n#text(size: ${8 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n`
        : ''
    }#v(${6 * fontScale}pt)
#line(length: 100%, stroke: 1pt + brand-border)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Soft)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.textMain || '#1e293b'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#6366f1'}")
#let brand-primary-bg = brand-primary.transparentize(93%)
#let brand-secondary = rgb("${p.secondary}")
#let brand-text = rgb("${p.textMain || '#1e293b'}")
#let brand-text-muted = rgb("${p.textMuted || '#64748b'}")
#let brand-text-light = rgb("${p.textLight || '#94a3b8'}")
#let brand-bg-light = rgb("${p.bgLight || '#f8fafc'}")
#let brand-bg-soft = rgb("${p.bgSoft || p.bgLight || '#f8fafc'}")
#let brand-border = rgb("${p.border || '#c7d2fe'}")
#let soft-sidebar-bg = rgb("#fdfdfd")
#let soft-border-neutral = rgb("#f1f5f9")
#let soft-primary-10 = brand-bg-light
#let soft-primary-20 = brand-border
#let soft-primary-40 = brand-border

#let soft-section-icon(name, height) = box(baseline: 14%, image("/icons/" + name + ".svg", height: height))

${commonMacros}

#let soft-section(title, icon-name, is-side: false) = block(width: 100%, breakable: false)[
  #grid(
    columns: (auto, 1fr),
    column-gutter: if is-side { ${8 * fontScale}pt } else { ${10 * fontScale}pt },
    align: (left + horizon, left + horizon),
    box(
      fill: soft-primary-10,
      radius: if is-side { ${7 * fontScale}pt } else { ${10 * fontScale}pt },
      inset: if is-side { ${5 * fontScale}pt } else { ${7 * fontScale}pt },
      soft-section-icon(icon-name, if is-side { ${12 * fontScale}pt } else { ${16 * fontScale}pt })
    ),
    text(
      size: if is-side { ${9.5 * fontScale}pt } else { ${12 * fontScale}pt },
      weight: "bold",
      fill: brand-text,
      tracking: if is-side { 0.4pt } else { 0pt }
    )[#if is-side { cv-upper(title) } else { title }]
  )
  #v(if is-side { ${10 * fontScale}pt } else { ${16 * fontScale}pt })
]

${coverLetterMarkup}
${pageSetup}
`;

  const context = {
    basics,
    labels,
    v,
    cvLocale,
    formatCVDateRange,
    formatCVDate,
    fontScale,
    address,
  };

  // ⚠️ The switch is on `SectionKey`, not `string`: an arm for `about`,
  // `contact` or `profiles` would be `TS2678`. Ids come from
  // `getTwoColumnSections`; a custom-section token resolves to `volunteer`.
  const serializeSection = (sectionId: LayoutSectionId, isSide: boolean): string => {
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

  let headerBlock = `#align(center)[
`;
  if (imageVisible) {
    headerBlock += `#${getProfileImageMarkup(
      basics.image,
      imageShape as 'circle' | 'square',
      90 * fontScale,
      3 * fontScale,
      p.border || '#c7d2fe',
    )}
#v(${16 * fontScale}pt)
`;
  }
  headerBlock += `#text(size: ${18 * fontScale}pt, weight: "bold", fill: brand-text)[${escapeTypst(basics.name)}]
`;
  if (basics.label) {
    headerBlock += `#v(${6 * fontScale}pt)
#box(fill: soft-primary-10, radius: ${14 * fontScale}pt, inset: (x: ${12 * fontScale}pt, y: ${4 * fontScale}pt))[
  #text(size: ${7.5 * fontScale}pt, weight: "bold", tracking: 1pt, fill: brand-primary)[#cv-upper[${escapeTypst(basics.label)}]]
]
`;
  }
  headerBlock += `]
`;

  // ⚠️ Soft already skipped empty sections (`if (!section) return`), which is
  // why an earlier fix recorded it as correct. It was not: the separator was still keyed
  // on `idx < length - 1` over the **unfiltered** list, so when the *last*
  // section rendered empty the one before it emitted a trailing `#v()` into
  // nothing. Exactly two sections could hit it — `publications`, last in
  // soft's default main column, and `references`, last in its sidebar —
  // which is why it reads as correct on every other section.
  const sideSections = emitSectionsWithBreaks(sideSectionIds, {
    meta,
    column: 'sidebar',
    breakToken: '\n#colbreak()\n',
    separator: `\n#v(${16 * fontScale}pt)\n`,
    render: (sectionId) => serializeSection(sectionId, true),
  });

  // ⚠️ Joined rather than concatenated. The separator used to be emitted
  // with the header, unconditionally, so an all-hidden sidebar closed on
  // `…]\n#v(24pt)\n` and padded a column with nothing left to separate.
  const sideColContent = joinBlocks([headerBlock, sideSections], `#v(${24 * fontScale}pt)\n`);

  const mainSections = emitSectionsWithBreaks(mainSectionIds, {
    meta,
    column: 'main',
    breakToken: '\n#colbreak()\n',
    separator: `\n#v(${24 * fontScale}pt)\n`,
    render: (sectionId) => serializeSection(sectionId, false),
  });

  // ⚠️ The main column had the mirror of the sidebar's separator bug and the review
  // caught it four lines from the fix: the contact separator was gated on the
  // contact block — the one *before* it — so with contact present, no summary
  // and every main section hidden the column closed on `…]\n#v(24pt)\n`.
  //
  // The about/sections separator is 32pt rather than the column's 24pt, so this
  // is two joins rather than one: contact and the about-plus-sections group.
  const mainColContent = joinBlocks(
    [
      serializeFixedContactBlock(context),
      joinBlocks(
        [basics.summary ? serializeFixedAboutBlock(context) : '', mainSections],
        `\n#v(${32 * fontScale}pt)\n`,
      ),
    ],
    `\n#v(${24 * fontScale}pt)\n`,
  );

  const footerContent = renderTypstSignatureFooter({
    showFooter: meta?.theme?.params?.showFooter,
    parts: footerParts,
    name: basics.name,
    fontScale,
  });

  markup += `#grid(
  columns: ${sidebarPosition === 'left' ? '(30%, 70%)' : '(70%, 30%)'},
  column-gutter: 0pt,
  row-gutter: 0pt,
  stroke: (col, row) => if col == ${sidebarPosition === 'left' ? '0' : '1'} { (
    right: ${sidebarPosition === 'left' ? '1pt + soft-border-neutral' : 'none'},
    left: ${sidebarPosition === 'right' ? '1pt + soft-border-neutral' : 'none'}
  ) } else { none },
  block(
    width: 100%,
    inset: ${sidebarPosition === 'left' ? '(x: 30pt, y: 24pt)' : '(x: 45pt, y: 40pt)'},
    [${sidebarPosition === 'left' ? sideColContent : mainColContent}]
  ),
  block(
    width: 100%,
    inset: ${sidebarPosition === 'left' ? '(x: 45pt, y: 40pt)' : '(x: 30pt, y: 24pt)'},
    [${sidebarPosition === 'left' ? mainColContent : sideColContent}]
  )
)
${
  footerContent
    ? `#grid(
  columns: ${sidebarPosition === 'left' ? '(30%, 70%)' : '(70%, 30%)'},
  column-gutter: 0pt,
  row-gutter: 0pt,
  ${
    sidebarPosition === 'left'
      ? `[],
  block(
    width: 100%,
    inset: (x: 45pt),
    [${footerContent}]
  )`
      : `block(
    width: 100%,
    inset: (x: 45pt),
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
