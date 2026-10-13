import { PALETTES } from '@/components/preview/themes/oneColumn/plain/helpers/shared/constants';
import {
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
import type { ResumeData } from '@/types/resume';
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
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  // ⚠️ `getSectionLabels`, not `cvLocale.sections`. The locale map holds
  // the *translated* headings and knows nothing about the ones a user renamed:
  // `meta.theme.params.sectionLabels` is the override layer, and dropping the
  // second argument silently discards it. This theme's own HTML component
  // passes both, so a user renamed a section, watched the preview update, and
  // exported a PDF with the old heading — all twelve sections. Ten of the twelve
  // serializers already call this; this was one of the two that did not.
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const oneColSectionIds = getOneColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#000000',
    accent: p.primary || '#000000',
    border: p.border || '#cccccc',
    textMuted: p.textMuted || '#333333',
  });

  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;

  const pageSetup = `#set page(
  paper: "a4",
  margin: (x: 40pt, y: 40pt)
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(x: 40pt, y: 40pt)',
    senderAddress: address,
    textColor: p.text || '#000000',
    mutedColor: p.textMuted || '#333333',
    borderColor: p.border || '#cccccc',
    themeHeader: `#text(size: ${20 * fontScale}pt, weight: "bold", fill: rgb("${p.text || '#000000'}"))[${escapeTypst(basics.name)}]
${basics.label ? `#v(${2 * fontScale}pt)\n#text(size: ${12 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? `#v(${8 * fontScale}pt)\n#text(size: ${9 * fontScale}pt)[${contactItems.join(` #h(${10 * fontScale}pt) `)}]\n`
        : ''
    }#v(${6 * fontScale}pt)
#line(length: 100%, stroke: 1pt + rgb("${p.text || '#000000'}").lighten(70%))`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Plain)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${10 * fontScale}pt,
  fill: rgb("${p.text || '#000000'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${p.primary || '#000000'}")
#let brand-text-muted = rgb("${p.textMuted || '#333333'}")
#let brand-border = rgb("${p.border || '#cccccc'}")

${commonMacros}

${coverLetterMarkup}
${pageSetup}

#let plain-section(title) = block(width: 100%, breakable: false)[
  #v(${8 * fontScale}pt)
  #text(size: ${9 * fontScale}pt, weight: "bold", tracking: 1.5pt, fill: rgb("${p.text || '#000000'}"))[#cv-upper(title)]
  #v(${2 * fontScale}pt)
  #line(length: 100%, stroke: 1pt + rgb("${p.text || '#000000'}").lighten(70%))
  #v(${8 * fontScale}pt)
]

#let plain-entry(
  header: [],
  date: "",
  description: "",
  highlights: (),
  body: []
) = block(width: 100%, breakable: false)[
  #grid(
    columns: (1fr, auto),
    align: (left, right),
    header,
    text(size: ${9 * fontScale}pt, fill: rgb("#666666"))[#date]
  )
  #if description != "" [
    #v(${2 * fontScale}pt)
    #text(size: ${10 * fontScale}pt, fill: brand-text-muted)[#description]
  ]
  #if highlights != none and highlights.len() > 0 [
    #v(${4 * fontScale}pt)
    #list(
      marker: text(size: ${10 * fontScale}pt)[#sym.bullet],
      ..highlights
    )
  ]
  #body
  #v(${14 * fontScale}pt)
]

#let skill-bar(value) = {
  if value > 0 {
    grid(
      columns: (1fr, 1fr, 1fr, 1fr),
      gutter: 3pt,
      ..range(1, 5).map(step => block(
        width: 100%,
        height: 3pt,
        fill: if step <= value { brand-primary } else { rgb("#eee") },
        radius: 1.5pt
      ))
    )
  }
}

#let lang-bar(value) = {
  if value > 0 {
    box(
      grid(
        columns: (15pt, 15pt, 15pt, 15pt, 15pt),
        gutter: 4pt,
        ..range(1, 6).map(step => block(
          width: 15pt,
          height: 5pt,
          fill: if step <= value { brand-primary } else { rgb("#eee") },
          radius: 1pt
        ))
      )
    )
  }
}

// Header Section
#grid(
  columns: ${imageVisible ? '(auto, 1fr)' : '(1fr,)'},
  gutter: ${imageVisible ? '15pt' : '0pt'},
  align: top + left,
  ${
    imageVisible
      ? `${getProfileImageMarkup(
          basics.image,
          imageShape as 'circle' | 'square',
          80 * fontScale,
          3 * fontScale,
          p.border || '#cccccc',
        )},`
      : ''
  }
  [
    #text(size: ${24 * fontScale}pt, weight: "bold", fill: rgb("${p.text || '#000000'}"))[${escapeTypst(basics.name)}]
    ${
      basics.label
        ? `\n    #v(${2 * fontScale}pt)\n    #text(size: ${13 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.label)}]`
        : ''
    }
    ${
      contactItems.length > 0
        ? `\n    #v(${12 * fontScale}pt)\n    #text(size: ${10 * fontScale}pt)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]`
        : ''
    }
  ]
)

#v(${18 * fontScale}pt)

${
  basics.summary
    ? `// Summary
#text(size: ${10 * fontScale}pt, fill: brand-text-muted)[${escapeTypst(basics.summary)}]
#v(${18 * fontScale}pt)
`
    : ''
}
`;

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

  oneColSectionIds.forEach((sectionId) => {
    const hasBreak = hasPageBreak(meta, 'oneColumn', sectionId);

    const section = resolveLayoutSection(sectionId, data, context);
    if (!section) return;
    const items = section.v[section.key];
    const hasItems = Array.isArray(items) && items.length > 0;

    if (hasBreak && hasItems) {
      markup += `\n#pagebreak()\n`;
    }

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
