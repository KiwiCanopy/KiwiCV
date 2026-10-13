import { PALETTES } from '@/components/preview/themes/oneColumn/plain2/helpers/shared/constants';
import {
  serializeAwards,
  serializeCertificates,
  serializeInterests,
  serializePublications,
  serializeReferences,
} from '@/components/preview/themes/oneColumn/plain2/helpers/typst/achievementsReferences';
import {
  serializeEducation,
  serializeLanguages,
  serializeSkills,
} from '@/components/preview/themes/oneColumn/plain2/helpers/typst/educationSkills';
import {
  serializeProjects,
  serializeVolunteer,
  serializeWork,
} from '@/components/preview/themes/oneColumn/plain2/helpers/typst/experience';
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
  getTypstEntryDetailsGap,
  getTypstFontList,
  getTypstResumeSpacingSettings,
} from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import type { SectionKey } from '@/utils/layout/constants';

export function serializeToTypst(data: ResumeData): string {
  const { meta, basics } = data;
  const { cvLocale, cvTitle, formatCVDate, formatCVDateRange } = getBoundFormatters(data);
  const labels = getSectionLabels(cvLocale.sections || {}, meta?.theme?.params?.sectionLabels);

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette);

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const oneColSectionIds = getOneColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);
  const contactItems = getContactItems(basics, v.profiles, address);
  const primary = p.primary || '#4f46e5';
  const textMain = p.textMain || '#374151';
  const textMuted = p.textMuted || '#6b7280';
  const border = p.border || '#e5e7eb';

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: '#374151',
    accent: textMuted,
    border,
    textMuted,
  });

  const imageShape = meta?.theme?.params?.imageShape || 'square';
  const imageVisible = v.imageVisible !== false && basics.image;

  const pageSetup = `#set page(
  paper: "a4",
  margin: (x: 36pt, y: 40pt)
)`;

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    pageMargin: '(x: 36pt, y: 40pt)',
    senderAddress: address,
    textColor: textMain,
    mutedColor: textMuted,
    borderColor: border,
    themeHeader: `#text(size: ${22 * fontScale}pt, weight: "bold", fill: brand-title, tracking: -0.3pt)[${escapeTypst(basics.name)}]
${basics.label ? `#v(${3 * fontScale}pt)\n#text(size: ${12 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? // Medium, where the sender line below runs regular at the same size:
          // the header contact row is the letterhead and the sender line is a
          // repeat of it, and at 8.5pt only weight separates the two.
          `#v(${8 * fontScale}pt)\n#text(size: ${8.5 * fontScale}pt, weight: "medium", fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]\n`
        : ''
    }#v(${6 * fontScale}pt)
#line(length: 100%, stroke: ${1.5 * fontScale}pt + brand-border)`,
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: Plain2)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getTypstFontList('sans')},
  size: ${9.5 * fontScale}pt,
  fill: rgb("${textMain}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

#let brand-primary = rgb("${primary}")
#let brand-title = rgb("#111827")
#let brand-text-main = rgb("${textMain}")
#let brand-text-muted = rgb("${textMuted}")
#let brand-date = rgb("#9ca3af")
#let brand-border = rgb("${border}")
#let brand-bg-light = rgb("${p.bgLight || '#f9fafb'}")

${commonMacros}

#let plain2-section(title) = block(width: 100%, breakable: false)[
  #text(size: ${9 * fontScale}pt, weight: "bold", tracking: 2pt, fill: brand-title)[#cv-upper(title)]
  #v(${4 * fontScale}pt)
  #line(length: 100%, stroke: ${1.5 * fontScale}pt + brand-border)
  #v(${4 * fontScale}pt)
]

#let plain2-entry(
   header: [],
   date: "",
   description: "",
   highlights: (),
   body: []
 ) = block(width: 100%, breakable: false)[
   #grid(
     columns: (1fr, auto),
     align: (left, right),
     column-gutter: ${8 * fontScale}pt,
     header,
     if date != "" { text(size: ${8 * fontScale}pt, fill: brand-date)[#date] } else { [] }
   )
   #if description != "" [
     ${getTypstEntryDetailsGap(fontScale)}
     #text(size: ${8.5 * fontScale}pt, fill: brand-text-main)[#description]
   ]
   #if highlights != none and highlights.len() > 0 [
     #v(${1 * fontScale}pt)
     #list(
       marker: text(size: ${8 * fontScale}pt, fill: brand-text-main)[•],
       ..highlights
     )
   ]
   #body
   #v(${12 * fontScale}pt)
 ]

#let plain2-skill-bar(value) = {
  if value > 0 {
    grid(
      columns: (1fr, 1fr, 1fr, 1fr),
      column-gutter: ${3 * fontScale}pt,
      ..range(1, 5).map(step => block(
        width: 100%,
        height: ${3 * fontScale}pt,
        fill: if step <= value { rgb("#374151") } else { rgb("#f3f4f6") },
        radius: ${1.5 * fontScale}pt
      ))
    )
  }
}

#let plain2-lang-dots(value) = {
  if value > 0 {
    box(
      grid(
        columns: (${15 * fontScale}pt, ${15 * fontScale}pt, ${15 * fontScale}pt, ${15 * fontScale}pt, ${15 * fontScale}pt),
        column-gutter: ${4 * fontScale}pt,
        ..range(1, 6).map(step => block(
          width: ${15 * fontScale}pt,
          height: ${5 * fontScale}pt,
          fill: if step <= value { rgb("#374151") } else { brand-border },
          radius: ${1 * fontScale}pt
        ))
      )
    )
  }
}

#let plain2-badge(text-val) = box(
  fill: rgb("#f5f5f5"),
  stroke: 1pt + rgb("#eeeeee"),
  radius: ${1 * fontScale}pt,
  inset: (x: ${5 * fontScale}pt, y: ${3 * fontScale}pt),
  text(size: ${8 * fontScale}pt, fill: brand-text-muted, text-val)
)

${coverLetterMarkup}
${pageSetup}

#block(width: 100%, breakable: false)[
  #place(top + right)[
    ${
      imageVisible
        ? `#${getProfileImageMarkup(
            basics.image,
            imageShape as 'circle' | 'square',
            64 * fontScale,
            3 * fontScale,
            border,
          )}`
        : ''
    }
  ]
  #block(width: 100%, inset: (right: ${imageVisible ? 80 * fontScale : 0}pt))[
    #text(size: ${22 * fontScale}pt, weight: "bold", fill: brand-title, tracking: -0.3pt)[${escapeTypst(basics.name)}]
    ${
      basics.label
        ? `\n    #v(${3 * fontScale}pt)\n    #text(size: ${12 * fontScale}pt, weight: "semibold", fill: brand-text-muted)[${escapeTypst(basics.label)}]`
        : ''
    }
    ${
      basics.summary
        ? `\n    #v(${10 * fontScale}pt)\n    #text(size: ${9.5 * fontScale}pt, fill: rgb("#4b5563"))[${escapeTypst(basics.summary)}]`
        : ''
    }
    ${
      contactItems.length > 0
        ? `\n    #v(${8 * fontScale}pt)\n    #text(size: ${8.5 * fontScale}pt, fill: brand-text-muted)[${contactItems.join(` #h(${12 * fontScale}pt) `)}]`
        : ''
    }
  ]
]

#v(${20 * fontScale}pt)
`;

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
