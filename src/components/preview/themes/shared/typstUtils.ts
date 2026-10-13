import { getProfileDisplayPDF } from '@/components/preview/themes/shared/profiles-pdf';
import type { ResumeData } from '@/types/resume';

/**
 * Escapes a value for embedding inside a Typst string literal ("...").
 * Strings are displayed verbatim by Typst, so markup escaping (escapeTypst)
 * must NOT be used here — its backslashes would show up in the output.
 */
export function escapeTypstString(str: string | null | undefined): string {
  return (str || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

/**
 * The PDF's title and author. An empty field is omitted, never filled in: an
 * export carries no product name in its metadata (AGENTS.md, Product identity).
 */
export function getTypstDocumentMetadata(title: string, author?: string | null): string {
  const blankToEmpty = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
  const fields = [
    blankToEmpty(title) && `title: "${escapeTypstString(blankToEmpty(title))}"`,
    blankToEmpty(author) && `author: "${escapeTypstString(blankToEmpty(author))}"`,
  ].filter(Boolean);
  return fields.length > 0 ? `#set document(${fields.join(', ')})` : '';
}

export const DEFAULT_TYPST_LINE_HEIGHT_RATIO = 1.3;
export const DEFAULT_TYPST_BULLET_SPACING_RATIO = 0.4;
export const DEFAULT_TYPST_ENTRY_SUBHEADER_GAP_PT = 0.5;
export const DEFAULT_TYPST_ENTRY_DETAILS_GAP_PT = 1;

/**
 * Returns the shared resume text rhythm for Typst PDF serializers.
 * Typst `leading` is extra space beyond the font size, so 0.18em targets
 * a total line height of roughly 1.18x while list spacing adds 0.4x after bullets.
 * The `em` units scale automatically with the active Typst text size.
 */
export function getTypstResumeSpacingSettings(): string {
  return `#set par(leading: ${(DEFAULT_TYPST_LINE_HEIGHT_RATIO - 1).toFixed(2)}em, spacing: ${DEFAULT_TYPST_BULLET_SPACING_RATIO}em)
#set list(tight: false, spacing: ${DEFAULT_TYPST_BULLET_SPACING_RATIO}em)`;
}

/**
 * Returns the shared micro-gap for Typst entries that render a title/header
 * and a subheader on the next line. Keep this separate from global paragraph
 * rhythm: it is an entry-header layout detail, not body text spacing.
 */
export function getTypstEntrySubheaderGap(
  fontScale: number,
  indent = '',
  includeLineBreak = true,
): string {
  const lineBreak = includeLineBreak
    ? `\\
`
    : '';
  return `${lineBreak}${indent}#v(${DEFAULT_TYPST_ENTRY_SUBHEADER_GAP_PT * fontScale}pt)`;
}

/**
 * Returns the shared micro-gap between an entry header/subheader block and
 * the following details/body text. Keep this separate from section spacing,
 * badge spacing, and global paragraph/list rhythm.
 */
export function getTypstEntryDetailsGap(fontScale: number, indent = ''): string {
  return `${indent}#v(${DEFAULT_TYPST_ENTRY_DETAILS_GAP_PT * fontScale}pt)`;
}

/**
 * Escapes characters that have special syntactic meanings in Typst markup.
 */
export function escapeTypst(str: string | null | undefined): string {
  if (!str) return '';
  return (
    str
      .replace(/\\/g, '\\\\')
      .replace(/#/g, '\\#')
      .replace(/\$/g, '\\$')
      .replace(/\[/g, '\\[')
      .replace(/\]/g, '\\]')
      .replace(/_/g, '\\_')
      .replace(/\*/g, '\\*')
      .replace(/</g, '\\<')
      .replace(/>/g, '\\>')
      .replace(/@/g, '\\@')
      .replace(/\//g, '\\/') // `//` starts a line comment, `/ term:` a term list
      .replace(/`/g, '\\`') // an unbalanced backtick opens raw text and swallows content
      .replace(/~/g, '\\~') // `~` is a non-breaking space anywhere in markup
      // At the start of a line these become heading (`=`), list (`-`), or enum (`+`, `1.`) markers
      .replace(/^([ \t]*)([=\-+])/gm, '$1\\$2')
      .replace(/^([ \t]*)(\d+)\./gm, '$1$2\\.')
      .replace(/\n/g, ' \n ') // Keep linebreaks working as space + newline in Typst
  );
}

interface TypstMacroColors {
  primary: string;
  accent: string;
  border: string;
  textMuted: string;
}

/**
 * Uppercase in the document's language. Typst's `upper` is not locale-aware —
 * measured 2026-10-06: under `lang: "tr"` it maps `i` to `I`, so "Eğitim"
 * printed "EĞITIM". Turkish and Azerbaijani map a dotted `i` to `İ`;
 * `cv-upper-str` is the testable string half (`typstUpper.test.ts`).
 */
export const TYPST_CV_UPPER = `
#let cv-upper-str(s, lang) = if lang in ("tr", "az") { upper(s.replace("i", "İ")) } else { upper(s) }
#let cv-upper(body) = context {
  if type(body) == str { cv-upper-str(body, text.lang) }
  else if text.lang in ("tr", "az") { show "i": "İ"; upper(body) }
  else { upper(body) }
}`;

/**
 * Returns common Typst function macros for icons, badges, and level bars.
 * Generated dynamically to support custom font scaling and palette colors.
 */
export function getCommonTypstMacros(fontScale: number, colors: TypstMacroColors): string {
  return `
${TYPST_CV_UPPER}
#let icon(name) = box(baseline: 14%, image("/icons/" + name + ".svg", height: ${8.5 * fontScale}pt))
#let link-icon(name) = box(baseline: 4%, image("/icons/" + name + ".svg", height: ${6.5 * fontScale}pt))

#let badge(text-val) = {
  box(
    fill: rgb("#f7fafc"),
    stroke: 0.5pt + rgb("${colors.border}"),
    radius: ${4 * fontScale}pt,
    inset: (x: ${6 * fontScale}pt, y: ${3.5 * fontScale}pt),
    outset: 0pt,
    text(size: ${7.5 * fontScale}pt, fill: rgb("${colors.accent}"), text-val)
  )
}

#let discrete-level-bar(value, max: 5, style: "dots") = {
  if value > 0 {
    if style == "dots" {
      let dots = ()
      for i in range(max) {
        let active = i < value
        dots += (box(
          width: ${6 * fontScale}pt,
          height: ${6 * fontScale}pt,
          fill: if active { rgb("${colors.primary}") } else { rgb("#e2e8f0") },
          radius: ${3 * fontScale}pt
        ),)
      }
      box(dots.join(h(${4 * fontScale}pt)))
    } else {
      let cells = ()
      for i in range(max) {
        let active = i < value
        cells += (rect(
          width: 100%,
          height: ${4 * fontScale}pt,
          fill: if active { rgb("${colors.primary}") } else { rgb("${colors.border}") },
          radius: ${1 * fontScale}pt
        ),)
      }
      grid(
        columns: (1fr,) * max,
        column-gutter: ${4 * fontScale}pt,
        ..cells
      )
    }
  }
}

#let level-bar(value, max: 100) = {
  if value > 0 {
    let percent = (value / max) * 100%
    block(
      width: 100%,
      height: ${4 * fontScale}pt,
      fill: rgb("#e2e8f0"),
      radius: ${2 * fontScale}pt,
      clip: true,
      block(
        width: percent,
        height: 100%,
        fill: rgb("${colors.primary}"),
        radius: ${2 * fontScale}pt
      )
    )
  }
}
`;
}

/**
 * Normalizes and formats email, phone, website, address, and social links into
 * standard atomic inline boxes ready for Typst document headers.
 */
export function getContactItems(
  basics: ResumeData['basics'],
  profiles: NonNullable<ResumeData['basics']['profiles']>,
  address: string,
): string[] {
  const contactItems: string[] = [];
  if (basics.email) {
    contactItems.push(`#box[#icon("mail") ${escapeTypst(basics.email)}]`);
  }
  if (basics.phone) {
    contactItems.push(`#box[#icon("phone") ${escapeTypst(basics.phone)}]`);
  }
  if (basics.url) {
    const formattedUrl = sanitizeUrl(basics.url);
    const urlDisplay = basics.url.replace(/^https?:\/\//, '');
    if (formattedUrl) {
      contactItems.push(
        `#box[#link("${formattedUrl}")[#icon("globe") ${escapeTypst(urlDisplay)}]]`,
      );
    } else {
      contactItems.push(`#box[#icon("globe") ${escapeTypst(urlDisplay)}]`);
    }
  }
  if (address) {
    contactItems.push(`#box[#icon("map-pin") ${escapeTypst(address)}]`);
  }
  (profiles || []).forEach((profile) => {
    const { iconName, text } = getProfileDisplayPDF(profile);
    const profileUrl = sanitizeUrl(profile.url);
    if (profileUrl) {
      contactItems.push(
        `#box[#link("${profileUrl}")[#icon("${iconName}") ${escapeTypst(text)} #link-icon("external-link")]]`,
      );
    } else {
      contactItems.push(`#box[#icon("${iconName}") ${escapeTypst(text)}]`);
    }
  });
  return contactItems;
}

/**
 * Resolves the dynamic file extension for a profile picture from its base64 prefix or URL.
 */
export function getProfileImagePath(image: string | null | undefined): string {
  if (!image) return '/profile-image.png';
  if (image.startsWith('data:image/jpeg') || image.startsWith('data:image/jpg')) {
    return '/profile-image.jpg';
  }
  if (image.startsWith('data:image/gif')) {
    return '/profile-image.gif';
  }
  if (image.startsWith('data:image/svg')) {
    return '/profile-image.svg';
  }
  if (image.startsWith('data:image/webp')) {
    return '/profile-image.webp';
  }
  // Check URL suffix
  try {
    const url = new URL(image);
    const ext = url.pathname.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return `/profile-image.${ext === 'jpeg' ? 'jpg' : ext}`;
    }
  } catch (_) {
    // Fallback to simple split if not a valid URL
    const ext = image.split('.').pop()?.toLowerCase();
    if (ext && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
      return `/profile-image.${ext === 'jpeg' ? 'jpg' : ext}`;
    }
  }
  return '/profile-image.png';
}

/**
 * Generates the Typst block markup for a cropped profile picture.
 */
export function getProfileImageMarkup(
  image: string | null | undefined,
  shape: 'circle' | 'square',
  sizePt: number,
  borderPt: number,
  borderColorHex: string,
): string {
  if (!image) return '';
  const imagePath = getProfileImagePath(image);
  const isCircle = shape === 'circle';
  const radius = isCircle ? '50%' : '0pt';
  const totalSize = sizePt + borderPt * 2;

  return `block(
    width: ${totalSize}pt,
    radius: ${radius},
    clip: true,
    stroke: ${borderPt}pt + rgb("${borderColorHex}"),
    image("${imagePath}", width: 100%)
  )`;
}

const ALLOWED_URL_SCHEMES = ['http', 'https', 'mailto'];

/**
 * Helper to ensure a URL has an allowlisted scheme (http/https/mailto) for
 * Typst links. Disallowed schemes (e.g. javascript:) are neutralized by
 * prefixing https://, which yields a dead-but-safe link. The result is never
 * empty for a non-empty input because Typst rejects `link("")`, and the
 * characters that would break out of the Typst string literal the callers
 * embed the result in (`link("...")`) are escaped.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(trimmed)?.[1]?.toLowerCase();
  const withScheme =
    scheme && ALLOWED_URL_SCHEMES.includes(scheme) ? trimmed : `https://${trimmed}`;
  return withScheme.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/**
 * Helper to build standard bold title + muted details + optional link entry headers in Typst.
 */
export function getEntryHeaderMarkup(title: string, subtitle?: string, url?: string): string {
  let content = `#text(weight: "bold")[${escapeTypst(title)}]`;
  if (subtitle) {
    content += ` #text(fill: brand-text-muted)[ · ${escapeTypst(subtitle)}]`;
  }

  if (url) {
    const validUrl = sanitizeUrl(url);
    if (validUrl) {
      return `link("${validUrl}")[${content} #text(size: 8pt, fill: brand-text-muted)[#link-icon("external-link")]]`;
    }
  }
  return `[${content}]`;
}

/**
 * Shared font family arrays for Typst themes.
 * Lists fonts in priority order.
 * Exact names must match registered fonts in typst.worker.ts and public/fonts.
 */
export const TYPST_FONTS = {
  // Sans-serif stack: Inter primary, Noto Sans CJK for Han/Kana, DejaVu Sans for
  // Cyrillic/Greek and as the last resort. A plain `Noto Sans` sat between the
  // CJK faces and DejaVu here (and in `serif`) but was registered in neither
  // `EAGER_FONT_FILES` nor the lazy set, so Typst logged `unknown font family:
  // noto sans` on every compile and fell straight through to DejaVu — which
  // already covers Cyrillic, so dropping the name loses no glyphs.
  sans: ['Inter', 'Noto Sans CJK SC', 'Noto Sans CJK JP', 'DejaVu Sans'],
  // Serif stack: Lora primary, Inter fallback, Noto Sans CJK for Han/Kana, DejaVu last.
  serif: ['Lora', 'Inter', 'Noto Sans CJK SC', 'Noto Sans CJK JP', 'DejaVu Sans'],
};

/**
 * Returns a string formatted as a Typst font array, e.g., '("Inter", "Noto Sans CJK SC", "Noto Sans CJK JP", "DejaVu Sans")'
 */
export function getTypstFontList(type: 'sans' | 'serif'): string {
  const fontList = TYPST_FONTS[type];
  return '(' + fontList.map((font) => `"${font}"`).join(', ') + ')';
}
