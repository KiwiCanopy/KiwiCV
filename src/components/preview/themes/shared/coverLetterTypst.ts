import { markdownToTypst } from '@/components/preview/themes/shared/markdownTypst';
import { renderTypstSignatureFooter } from '@/components/preview/themes/shared/typstFooter';
import { escapeTypst } from '@/components/preview/themes/shared/typstUtils';
import type { ResumeData } from '@/types/resume';
import { isCoverLetterPrinted } from '@/utils/coverLetter';

/**
 * Theme-provided styling for the cover letter page. The letter is emitted as a
 * self-contained page BEFORE the theme's own `#set page(...)`: it sets its own
 * page geometry, and the theme's subsequent `#set page` then starts the résumé
 * on a fresh page with the theme's settings. Callers must therefore emit the
 * result of `buildCoverLetterTypst` between the shared `#set text`/macro setup
 * and their own `#set page` rule.
 */
export interface CoverLetterTypstOptions {
  fontScale: number;
  /** The theme's page margin tuple (e.g. `(x: 40pt, y: 40pt)`), used by the theme-header variant. */
  pageMargin: string;
  /**
   * Theme-styled header markup rendered when `classicLayout` is off. The
   * caller owns escaping for everything inside this string (it is emitted
   * verbatim).
   */
  themeHeader: string;
  /** Sender address pre-formatted for the CV locale (`formatFullAddress`). */
  senderAddress: string;
  /**
   * The résumé's own signature-footer parts, from `getTypstFooterParts`.
   *
   * ⚠️ Passed in rather than derived here, so the letter's footer and the CV's
   * are ONE computation with two consumers. It used to hand-build
   * `[city, countryCode], coverLetter.date`, which meant the letter ignored the
   * design tab's `footerLocation`/`footerDate` and instead reused the letter's
   * own top date line — so clearing that field silently blanked the signature
   * date too, and `footerDate: 'auto'` never reached the letter.
   */
  footerParts: string[];
  /**
   * Page background fill for the letter page. Themes whose résumé pages have a
   * non-white background (a `fill` or full-page `background` rect) must pass
   * their page color here — dark palettes set light text via the shared
   * `#set text`, which would be unreadable on the default white page.
   */
  pageFill?: string;
  /**
   * Page `background` content for the letter page, replacing the default
   * `background: none` — a decorative element drawn behind the whole page, such
   * as an edge rule. Emitted verbatim, so the caller owns escaping. `pageFill`
   * stays the flat page colour; this is what sits on top of it.
   */
  pageBackground?: string;
  /** Hex colors from the theme palette. */
  textColor: string;
  mutedColor: string;
  borderColor: string;
  /**
   * Fill for the subject line. Defaults to `textColor` — themes pass an accent
   * here rather than repurposing the body-text colour.
   */
  subjectColor?: string;
  /**
   * Full control over the subject line, for themes whose subject is a badge or
   * a tracked upper-case run rather than a coloured text run. Receives the
   * subject with markdown already converted plus the resolved defaults, and
   * returns complete markup — a theme that passes this owns the fill, so
   * `subjectColor` is ignored.
   */
  renderSubject?: (subject: string, defaults: { size: number; color: string }) => string;
  /**
   * Wraps the sender/recipient/subject/body chain of the theme-header variant,
   * so card-based themes can put the letter content in their own card macro.
   * The signature footer is deliberately *outside* this wrapper — it is
   * bottom-anchored on the page, which a wrapper of automatic height cannot do.
   * Not applied to the classic DIN 5008 variant, which stays plain.
   */
  wrapBody?: (content: string) => string;
  /**
   * Themed treatment for the sender line of the theme-header variant, rendered
   * *above* `wrapBody`'s wrapper instead of inside the chain — for themes whose
   * sender reads as a tag sitting on top of the body card. Receives the
   * already-styled sender run.
   */
  renderSender?: (sender: string) => string;
  /**
   * Markup emitted verbatim before the sender line of the theme-header
   * variant (e.g. a comment-style `\/\/ ` prefix). Caller owns escaping.
   */
  senderPrefix?: string;
}

/**
 * Emits the cover-letter Typst markup for a résumé, or `''` when the letter is
 * disabled or has no content. Two variants, chosen by `layout.classicLayout`:
 *
 * - Classic: DIN 5008-style letter geometry — 25/20 mm margins, the
 *   sender/recipient address window placed 45 mm from the page top, body text
 *   starting below it, date right-aligned, bold subject line.
 * - Theme header: the caller's `themeHeader` markup on the theme's own page
 *   margins, followed by recipient/date, subject, and body.
 *
 * Escaping: this function performs no escaping logic of its own. Paragraphs
 * and the subject go through `markdownToTypst` (which escapes every literal
 * run); every other user-supplied field goes through `escapeTypst`.
 *
 * Set-rule hygiene: apart from its own `#set page`, the markup contains no
 * top-level set rules, so nothing leaks into the résumé that follows.
 * Justification is applied per paragraph via `#par(justify: ..)`.
 *
 * The signature footer is bottom-anchored via `#v(1fr)` and therefore sits
 * outside `wrapBody`: fractional spacing resolves against the page flow, so a
 * wrapper of automatic height would swallow it.
 */
export function buildCoverLetterTypst(data: ResumeData, options: CoverLetterTypstOptions): string {
  const coverLetter = data.coverLetter;
  // An enabled but still-empty letter must not produce a blank leading page.
  if (!isCoverLetterPrinted(coverLetter)) return '';
  const paragraphs = coverLetter.paragraphs.filter((p) => p.trim() !== '');
  const subject = coverLetter.subject.trim();

  const { basics } = data;
  const { layout, recipient } = coverLetter;
  const fs = options.fontScale;
  const justify = layout.textAlign === 'justify';
  const date = (coverLetter.date || '').trim();
  // ⚠️ `.trim()`. A whitespace-only city is truthy, so `dateLine`
  // below rendered `   , 2026-07-25` — the same dangling separator as the PDF
  // footers, in the cover letter's date line, on every theme that emits one.
  // Found by extending the footer guard to whitespace inputs.
  //
  // ⚠️ **`typeof`, not `?.`, though this site was once recorded as already
  // fixed. It was not** — the first fix closed the nullish half and left the type half,
  // which is the crash. Same rule as `address.ts`'s `trimmed` and
  // `placeholder-fallback.ts`'s `filled`; this was the
  // seventh producer, found by scanning for `?.trim()` rather than by reading
  // a list of six.
  //
  // ⚠️ **Measured, and the number has a condition on it that the
  // first draft of this comment left off.** A stored
  // `{"basics":{"location":{"city":42}}}` threw
  // `basics.location?.city?.trim is not a function` on **all twelve** Typst
  // serializers *with `coverLetter.enabled`* — every serializer calls
  // `buildCoverLetterTypst`, and it is the line below. With the letter
  // **disabled** the builder returns at `!coverLetter?.enabled` and exactly
  // **one** theme still threw: lunar, in its own sidebar `.map(value =>
  // value?.trim())`. So "twelve" is the enabled population, which 4.1.0 makes
  // the headline feature and the house fixture sets — not the whole one. A
  // theme count is worth nothing without the state it was taken under.
  const stored = (value?: string) => (typeof value === 'string' ? value.trim() : '');
  const city = stored(basics.location?.city);

  const bodyMarkup = paragraphs
    .map((p) => `#par(justify: ${justify})[${markdownToTypst(p)}]`)
    .join(`\n#v(${8 * fs}pt)\n`);

  // The single-line address field is split on commas so the recipient block
  // reads as a conventional multi-line postal address.
  const recipientLines = [
    recipient.name,
    recipient.company,
    ...(recipient.address || '').split(','),
  ]
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => escapeTypst(line));
  const recipientBlock =
    layout.showRecipient && recipientLines.length > 0
      ? `#text(size: ${10 * fs}pt)[${recipientLines.join(' #linebreak() ')}]`
      : '';

  const senderLine = layout.showSender
    ? [basics.name, options.senderAddress]
        .map((part) => (part || '').trim())
        .filter(Boolean)
        .map((part) => escapeTypst(part))
        .join(' #sym.dot.c ')
    : '';

  const dateLine = date ? escapeTypst(city ? `${city}, ${date}` : date) : '';
  const subjectSize = 11 * fs;
  const subjectColor = options.subjectColor || options.textColor;
  const subjectMarkup = subject
    ? options.renderSubject
      ? options.renderSubject(markdownToTypst(subject), { size: subjectSize, color: subjectColor })
      : `#text(weight: "bold", size: ${subjectSize}pt, fill: rgb("${subjectColor}"))[${markdownToTypst(subject)}]`
    : '';

  const footerMarkup = renderTypstSignatureFooter({
    showFooter: layout.showFooter,
    parts: options.footerParts,
    name: basics.name,
    fontScale: fs,
    textColor: `rgb("${options.mutedColor}")`,
    borderColor: `rgb("${options.borderColor}")`,
  });

  // A short letter used to strand its signature directly under the last
  // paragraph, mid-page. Fractional spacing anchors it to the bottom of the
  // text area instead — and unlike `#place(bottom, ..)` it degrades correctly:
  // on a letter that already fills the page the `1fr` collapses to zero and the
  // footer flows onto the next page rather than printing over the body.
  const anchoredFooter = footerMarkup ? `#v(1fr)\n${footerMarkup}` : '';
  const pageBackground = options.pageBackground || 'none';

  if (layout.classicLayout) {
    // DIN 5008 address window: 85 mm wide, 45 mm from the page top (25 mm
    // below the 20 mm margin), body text starting at ~98 mm. Geometry is in
    // fixed mm — it is postal layout, not typography, so it ignores fontScale.
    const addressWindow =
      senderLine || recipientBlock
        ? `#place(top + left, dy: 25mm, block(width: 85mm)[
  ${senderLine ? `#text(size: ${8 * fs}pt, fill: rgb("${options.mutedColor}"))[${senderLine}]` : ''}
  ${senderLine && recipientBlock ? `#v(3mm)` : ''}
  ${recipientBlock}
])
#v(78mm)`
        : '';

    return `// Cover letter (classic DIN 5008 layout)
#set page(paper: "a4", margin: (left: 25mm, right: 20mm, top: 20mm, bottom: 20mm), background: ${pageBackground}${options.pageFill ? `, fill: rgb("${options.pageFill}")` : ''})
${addressWindow}
${dateLine ? `#align(right)[#text(size: ${10 * fs}pt)[${dateLine}]]\n#v(8mm)` : ''}
${subjectMarkup ? `${subjectMarkup}\n#v(6mm)` : ''}
${bodyMarkup}
${anchoredFooter}
`;
  }

  const recipientDateRow =
    recipientBlock || dateLine
      ? `#grid(
  columns: (1fr, auto),
  align: (left, right),
  [${recipientBlock}],
  [${dateLine ? `#text(size: ${10 * fs}pt)[${dateLine}]` : ''}]
)
#v(${14 * fs}pt)`
      : '';

  const senderRun = senderLine
    ? `#text(size: ${8.5 * fs}pt, fill: rgb("${options.mutedColor}"))[${options.senderPrefix || ''}${senderLine}]`
    : '';
  // A themed sender is hoisted out of the wrapper, so it can read as a tag
  // sitting above the body card rather than as the card's first line.
  const hoistedSender =
    senderRun && options.renderSender ? `${options.renderSender(senderRun)}\n#v(${10 * fs}pt)` : '';
  const inlineSender = senderRun && !options.renderSender ? `${senderRun}\n#v(${10 * fs}pt)` : '';

  const bodyChain = `${inlineSender}
${recipientDateRow}
${subjectMarkup ? `${subjectMarkup}\n#v(${10 * fs}pt)` : ''}
${bodyMarkup}`;

  return `// Cover letter (theme-matching header layout)
#set page(paper: "a4", margin: ${options.pageMargin}, background: ${pageBackground}${options.pageFill ? `, fill: rgb("${options.pageFill}")` : ''})
${options.themeHeader}
#v(${18 * fs}pt)
${hoistedSender}
${options.wrapBody ? options.wrapBody(bodyChain) : bodyChain}
${anchoredFooter}
`;
}
