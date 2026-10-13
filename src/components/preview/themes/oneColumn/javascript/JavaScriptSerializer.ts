import { PALETTES } from '@/components/preview/themes/oneColumn/javascript/helpers/shared/constants';
import {
  formatFullAddress,
  getBoundFormatters,
  getOneColumnSections,
  getProfileDisplayPDF,
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
  getTypstResumeSpacingSettings,
  sanitizeUrl,
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

/**
 * This theme's own Typst stack: JetBrains Mono primary, Noto Sans CJK for
 * Han/Kana, DejaVu Sans for Cyrillic/Greek and as the last resort.
 *
 * ⚠️ **A private copy of `TYPST_FONTS`, and that is why it went stale.** A plain
 * `Noto Sans` sat between the CJK faces and DejaVu here. A fix removed exactly
 * that name from `typstUtils.ts`'s shared `sans`/`serif` stacks — it is
 * registered in neither `EAGER_FONT_FILES` nor the lazy set, so Typst logged
 * `unknown font family: noto sans` on every compile and fell straight through to
 * DejaVu, which already covers Cyrillic. That fix could not reach this function,
 * because nothing connects the two, so javascript-theme compiles kept emitting
 * the warning for another round.
 *
 * `fontFamilyRegistration.test.ts` now covers both, and is scoped by the font
 * family strings rather than by the `getTypstFontList` spelling for this reason.
 */
function getJavascriptFontList() {
  return '("JetBrains Mono", "Noto Sans CJK SC", "Noto Sans CJK JP", "DejaVu Sans")';
}

/**
 * The prose half of this theme's two-font design — see the `js-prose-font`
 * binding in the markup for why it exists and what it covers.
 *
 * Same shape as the mono stack: Inter primary, Noto Sans CJK for Han/Kana,
 * DejaVu Sans for Cyrillic/Greek and as the last resort. Every family is
 * registered in `EAGER_FONT_FILES`, which `fontFamilyRegistration.test.ts`
 * checks for every entry rather than only the first.
 */
function getJavascriptProseFontList() {
  return '("Inter", "Noto Sans CJK SC", "Noto Sans CJK JP", "DejaVu Sans")';
}

function escapeString(str: string | null | undefined): string {
  return escapeTypst(str).replace(/"/g, '\\"');
}

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

  const p = resolvePalette(PALETTES, meta?.theme?.params?.palette, 'light');

  const fontScale = meta?.theme?.params?.fontSizeScale || 1;
  const oneColSectionIds = getOneColumnSections(meta, data);
  const v = getVisibleData(data);

  const address = formatFullAddress(basics.location, cvLocale);

  const commonMacros = getCommonTypstMacros(fontScale, {
    primary: p.primary || '#196ee6',
    accent: p.primary || '#196ee6',
    border: p.slate100 || '#f1f5f9',
    textMuted: p.slate600 || '#475569',
  });

  const imageShape = meta?.theme?.params?.imageShape || 'circle';
  const imageVisible = v.imageVisible !== false && basics.image;

  // Header property rows mapping — each row is a self-contained 2-column grid
  const avatarRow = imageVisible
    ? `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[avatar:], [#grid(columns: 2, column-gutter: 2pt, align: bottom, [#${getProfileImageMarkup(basics.image, imageShape as 'circle' | 'square', 20 * fontScale, 1 * fontScale, p.slate200 || '#e2e8f0')}], [#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]])])`
    : '';

  const roleRow = `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[role:], [#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.entity}"))[#set smartquote(enabled: false); '${escapeString(basics.label)}']#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]])`;

  const locationRow = address
    ? `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[location:], [#box(baseline: 10%)[#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.string}"))[#set smartquote(enabled: false); '${escapeString(address)}'] #icon("map-pin")#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]]])`
    : '';

  const emailRow = basics.email
    ? `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[email:], [#link("mailto:${basics.email}")[#box(baseline: 10%)[#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.string}"))[#set smartquote(enabled: false); '${escapeString(basics.email)}'] #icon("mail")]#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]]])`
    : '';

  const phoneRow = basics.phone
    ? `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[phone:], [#box(baseline: 10%)[#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.string}"))[#set smartquote(enabled: false); '${escapeString(basics.phone)}'] #icon("phone")#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]]])`
    : '';

  const webRow = basics.url
    ? `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[web:], [#link("${sanitizeUrl(basics.url)}")[#box(baseline: 10%)[#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.string}"))[#set smartquote(enabled: false); '${escapeString(basics.url.replace(/^https?:\/\//, ''))}'] #icon("globe")]#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]]])`
    : '';

  const socialRows = v.profiles
    .map((profile) => {
      const { iconName, text } = getProfileDisplayPDF(profile);
      const labelMarkup = profile.network ? profile.network.toLowerCase() + ':' : 'profile:';

      let profileContent = `#box(baseline: 10%)[#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.string}"))[#set smartquote(enabled: false); '${escapeString(text)}'] #h(${4 * fontScale}pt) #icon("${iconName}")`;
      if (profile.url) {
        profileContent += ` #link-icon("external-link")`;
      }
      profileContent += ` #text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[#sym.comma]]`;

      if (profile.url) {
        return `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[${escapeString(labelMarkup)}], [#link("${sanitizeUrl(profile.url)}")[${profileContent}]])`;
      } else {
        return `#grid(columns: (70pt, 1fr), row-gutter: ${4 * fontScale}pt, align: horizon + left, text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate400}"))[${escapeString(labelMarkup)}], [${profileContent}])`;
      }
    })
    .join('\n      ');

  // Sign-off footer logic.
  //
  // ⚠️ **This was a second copy of `getTypstFooterParts`'s branch structure and
  // is now a call to it.** The two matched line for line — the same
  // three-way `footerLocation === 'auto' || undefined || ''` test, the same
  // `explicitLocation`/`explicitDate` expressions, the same `getCityCountry` and
  // `getFooterDate` calls — and differed in exactly one sub-expression, the
  // placeholder-city fallback, which is now an option. That fallback is a real
  // product difference (javascript is the only footer with one; timeless,
  // stackoverflow and the six two-column footers print nothing there), but it is
  // one `||`, not a reason to keep a second copy of the branching. Two footer
  // defects came from a refinement landing in one copy and not the other.
  //
  // ⚠️ What the deleted copy did that the survivor does not: it pushed the
  // placeholder **unguarded**. The shared function tests the resolved value, so
  // a blank placeholder would now be dropped rather than emitted as a stray
  // leading comma. Inert today — `getPlaceholderCity` ends in `|| 'London'` — and
  // measured byte-identical across all twelve themes.
  //
  // ⚠️ The locale mismatch this block used to document is unchanged and still
  // real: `PdfFooterSection.tsx:23` shows the user what the footer will say and
  // resolves its locale as `resume.meta.theme.locale || lang`, the only site in
  // `src/` that falls back to the route param, while `cvLocale.code` is
  // `meta?.theme?.locale || 'en'`. On a German UI with a résumé whose stored
  // locale is empty, the panel promises `Berlin` and this prints `New York`.
  const footerParts = getTypstFooterParts(data, cvLocale, { placeholderCity: true });

  // ⚠️ **Still read separately, and it is NOT the redundancy it looks like** —
  // exactly the finding on timeless and stackoverflow. `getTypstFooterParts`
  // returns `[]` when the footer is switched off, and `[]` does not suppress the
  // `basics.name` **signature block** below: without this the theme would print a
  // right-aligned name and signature rule on a résumé with the footer off.
  const showFooter = meta?.theme?.params?.showFooter;

  const pageSetup = `#set page(
  paper: "a4",
  margin: (top: 39pt, bottom: 44pt, left: 24pt, right: 24pt),
  background: place(rect(fill: rgb("${p.paper}"), width: 100%, height: 100%)),
  footer: [
    #set text(font: ${getJavascriptFontList()}, size: ${8 * fontScale}pt, fill: rgb("${p.slate600}"))
    #line(length: 100%, stroke: 1pt + rgb("${p.slate200}"))
    #v(6pt)
    #grid(
      columns: (1fr, auto),
      align: (left + horizon, right + horizon),
      [
        #text()[Ln 42, Col 21]
        #h(${12 * fontScale}pt)
        #text()[UTF-8]
        #h(${12 * fontScale}pt)
        #text()[JavaScript]
      ],
      [
        #box(
          width: ${4 * fontScale}pt,
          height: ${4 * fontScale}pt,
          fill: rgb("#22c55e"),
          radius: ${2 * fontScale}pt,
          baseline: 10%
        )
        #h(${4 * fontScale}pt)
        #text()[Ready to interview]
      ]
    )
  ]
)`;

  const contactItems = getContactItems(basics, v.profiles, address);

  const coverLetterMarkup = buildCoverLetterTypst(data, {
    footerParts: getTypstFooterParts(data, cvLocale),
    fontScale,
    // Conventional letter margins — the theme's 24pt side margins are an IDE
    // aesthetic, too narrow for a formal letter page.
    pageMargin: '(x: 40pt, y: 40pt)',
    pageFill: p.paper,
    senderAddress: address,
    textColor: p.slate900 || '#0f172a',
    mutedColor: p.slate600 || '#475569',
    borderColor: p.slate200 || '#e2e8f0',
    // The subject reads as the letter's identifier, so it takes the same
    // syntax-highlight blue the header name does.
    subjectColor: p.primary,
    themeHeader: `#text(size: ${18 * fontScale}pt, weight: "bold", fill: rgb("${p.primary}"))[${escapeTypst(basics.name)}]
${basics.label ? `#v(${2 * fontScale}pt)\n#text(size: ${9.5 * fontScale}pt, fill: rgb("${p.comment}"))[\\/\\/ ${escapeTypst(basics.label)}]\n` : ''}${
      contactItems.length > 0
        ? `#v(${8 * fontScale}pt)\n#text(size: ${8.5 * fontScale}pt, fill: rgb("${p.slate600}"))[${contactItems.join(` #h(${10 * fontScale}pt) `)}]\n`
        : ''
    }#v(${6 * fontScale}pt)
#line(length: 100%, stroke: (paint: rgb("${p.slate200}"), dash: "dashed", thickness: 1pt))`,
    // Extend the comment-style motif to the sender line.
    senderPrefix: '\\/\\/ ',
  });

  // The cover letter (when present) sets its own page geometry for page 1;
  // the theme's `#set page` after it then starts the résumé on a fresh page.
  let markup = `// Typst Template for KiwiCV (Theme: JavaScript)
${getTypstDocumentMetadata(cvTitle, basics?.name)}
#set text(
  font: ${getJavascriptFontList()},
  size: ${9 * fontScale}pt,
  fill: rgb("${p.slate900 || '#0f172a'}"),
  hyphenate: true,
  lang: "${cvLocale.code}"
)
${getTypstResumeSpacingSettings()}

${commonMacros}

// The prose font. This theme deliberately sets two faces and the
// document default above is only one of them: JetBrains Mono carries the
// code-editor chrome — the comment header, the object-literal contact block,
// the section headings, entry titles and dates — while running prose is Inter.
//
// Measured off the theme's own rendered HTML rather than guessed: 114 of its
// 154 text runs are mono and 40 are sans, and the sans forty are exactly the
// job descriptions, the keyword badges and the language names. Until this
// existed the PDF set all 154 in mono, so a third of every exported CV — the
// part a recruiter actually reads — came out monospaced against an Inter
// preview.
//
// A Typst binding rather than another JS helper: the eight prose sites live in
// helpers/typst/, and this way they name the font without importing anything
// from the serializer.
//
// NOTE: this comment is inside a JS template literal. No backticks.
#let js-prose-font = ${getJavascriptProseFontList()}

// Custom Section Macros for JavaScript Theme
#let javascript-section(title) = block(width: 100%, breakable: false)[
  #v(${10 * fontScale}pt)
  #text(font: ${getJavascriptFontList()}, size: ${10 * fontScale}pt, fill: rgb("${p.slate300}"))[#("// ")]
  #text(font: ${getJavascriptFontList()}, size: ${10 * fontScale}pt, weight: "bold", fill: rgb("${p.slate900}"))[#title]
  #v(${4 * fontScale}pt)
]

#let javascript-timeline-entry(
  active: false,
  header: [],
  date: [],
  body: []
) = block(
  width: 100%,
  stroke: (left: 1pt + rgb("${p.slate200}")),
  inset: (left: 12pt),
  breakable: false,
  [
    #place(
      left,
      dx: -15.5pt,
      dy: ${4 * fontScale}pt,
      circle(
        radius: ${3.5 * fontScale}pt,
        fill: if active { rgb("${p.primary}") } else { rgb("${p.slate300}") },
        stroke: 1pt + rgb("${p.paper}")
      )
    )
    #grid(
      columns: (1fr, auto),
      align: (left + horizon, right + horizon),
      header,
      date
    )
    #v(${6 * fontScale}pt)
    #body
  ]
)

#let javascript-entry-content(body) = block(
  width: 100%,
  fill: rgb("${p.slate50}"),
  inset: ${10 * fontScale}pt,
  radius: ${6 * fontScale}pt,
  stroke: 1pt + rgb("${p.slate100}"),
  breakable: false,
  body
)

#let javascript-grid-box(body) = block(
  width: 100%,
  fill: rgb("${p.paper}"),
  inset: ${10 * fontScale}pt,
  radius: ${6 * fontScale}pt,
  stroke: 1pt + rgb("${p.slate200}"),
  breakable: false,
  body
)

#let javascript-lang-card(body) = block(
  width: 100%,
  fill: rgb("${p.paper}"),
  inset: ${10 * fontScale}pt,
  stroke: 1pt + rgb("${p.slate200}"),
  radius: ${6 * fontScale}pt,
  breakable: false,
  body
)

#let javascript-badge(text-val) = {
  box(
    fill: rgb("${p.paper}"),
    stroke: 1pt + rgb("${p.slate100}"),
    radius: ${4 * fontScale}pt,
    inset: (x: ${8 * fontScale}pt, y: ${4 * fontScale}pt),
    [
      #box(
        width: ${4 * fontScale}pt,
        height: ${4 * fontScale}pt,
        fill: rgb("${p.primary}"),
        radius: ${2 * fontScale}pt,
        baseline: 10%
      )
      #h(${4 * fontScale}pt)
      #text(font: js-prose-font, size: ${8 * fontScale}pt, fill: rgb("${p.slate700}"))[#text-val]
    ]
  )
}

#let javascript-skill-bar(value) = {
  if value > 0 {
    grid(
      columns: (1fr,) * 4,
      column-gutter: 3pt,
      ..range(1, 5).map(step => block(
        width: 100%,
        height: 3pt,
        fill: if step <= value { rgb("${p.primary}") } else { rgb("${p.slate200}") },
        radius: 1.5pt
      ))
    )
  }
}

#let javascript-lang-bar(value) = {
  if value > 0 {
    grid(
      columns: (1fr,) * 5,
      column-gutter: 2pt,
      ..range(1, 6).map(step => block(
        width: 100%,
        height: 3pt,
        fill: if step <= value { rgb("${p.primary}") } else { rgb("${p.slate200}") },
        radius: 1pt
      ))
    )
  }
}

#let javascript-ref-box(quote, name) = block(
  width: 100%,
  fill: rgb("${p.slate50}"),
  stroke: (left: 2pt + rgb("${p.primary}")),
  inset: (left: 10pt, y: 10pt, right: 10pt),
  radius: (right: 6pt),
  breakable: false,
  [
    #if quote != "" [
      #text(size: ${8.5 * fontScale}pt, style: "italic", fill: rgb("${p.slate600}"))[#quote] \\
      #v(${4 * fontScale}pt)
    ]
    #text(size: ${8 * fontScale}pt, weight: "bold", fill: rgb("${p.slate700}"))[#name]
  ]
)

${coverLetterMarkup}
${pageSetup}

// Header Section
#block(width: 100%, inset: (bottom: 16pt), stroke: (bottom: (paint: rgb("${p.slate200}"), dash: "dashed", thickness: 1pt)))[
  #set text(font: ${getJavascriptFontList()})
  #text(size: ${8.5 * fontScale}pt, fill: rgb("${p.comment}"))[
    #("/**") \\
    #("* " + "${escapeString(basics.label)}") \\
    ${
      basics.summary
        ? basics.summary
            .split('\n')
            .map((line) => `    #("* " + "${escapeString(line)}") \\`)
            .join('\n')
        : ''
    }
    #("*/")
  ]
  #v(${10 * fontScale}pt)
  #grid(
    columns: (auto, auto, auto),
    column-gutter: ${6 * fontScale}pt,
    align: bottom,
    [#text(size: ${14 * fontScale}pt, weight: "bold", fill: rgb("${p.keyword}"))[const]],
    [#text(size: ${16 * fontScale}pt, weight: "bold", fill: rgb("${p.primary}"))[${escapeTypst(basics.name)}]],
    [#text(size: ${16 * fontScale}pt, weight: "bold", fill: rgb("${p.slate300}"))[= {]]
  )
  #v(${4 * fontScale}pt)
  #pad(left: 24pt)[
    ${avatarRow}
    ${roleRow}
    ${locationRow}
    ${emailRow}
    ${phoneRow}
    ${webRow}
    ${socialRows}
  ]
  #v(${4 * fontScale}pt)
  #text(size: ${16 * fontScale}pt, weight: "bold", fill: rgb("${p.slate300}"))[};]
]
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
    p: p as unknown as Record<string, string>,
    isCustomSection: false,
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

    markup += serializeSection(section.key, {
      ...context,
      v: section.v,
      labels: section.labels,
      isCustomSection: section.isCustom,
    });
  });

  // Render sign-off footer at the end of the content flow.
  //
  // ⚠️ **This was the fourth copy of the signature block and is now a call to
  // the shared renderer.** The consolidation named timeless and stackoverflow;
  // javascript's copy was the same markup at the same defaults the renderer
  // already carries, so it was in scope for the same reason. Everything it used
  // to spell out — the colour, the 180pt rule, the `#888888` text — is what the
  // renderer emits with no options at all.
  markup += renderTypstSignatureFooter({
    showFooter,
    parts: footerParts,
    name: basics.name,
    fontScale,
  });

  return markup;
}
