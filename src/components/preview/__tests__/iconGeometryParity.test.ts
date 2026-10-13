// @vitest-environment jsdom
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { StandardIcons } from '@/assets/pdf-icons/StandardIcons';
import { ThemeRegistry, paletteIconFills } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ThemeId } from '@/components/preview/themeIds';
import { serializeIconsMap } from '@/components/preview/themes/shared/iconSerializer';
import {
  ALL_SECTION_LABEL_KEYS,
  getBoundFormatters,
} from '@/components/preview/themes/shared/translations';
import { buildSingleItemResume } from '@/test/singleItemResume';
import { PLACEMENT_RUNS, type Placement, applyPlacement } from '@/test/themePlacements';
import type { ResumeData } from '@/types/resume';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { icons as LUCIDE_ICONS } from 'lucide-react';
import { describe, expect, it } from 'vitest';

/**
 * **The preview and the export must draw the same picture, not merely print the
 * same words.**
 *
 * `sectionLabelParity.test.ts` and `previewExportParity.test.ts` each say in
 * their own docblock that icons are the axis neither of them covers: a section
 * drawn with a briefcase on screen and a graduation cap in the PDF is green in
 * both. Probing that axis found three defects, and this file is the
 * guard for all three.
 *
 * ## Why geometry and not names
 *
 * The two outputs have **two unrelated catalogues**. The screen draws a
 * `lucide-react` component; the PDF emits a name string that
 * `serializeIconsMap` resolves against `StandardIcons`. Nothing relates them, so
 * a name comparison is not merely weak — it is *backwards* in both directions:
 * `work` vs `briefcase` reads as a defect (they are the same drawing) and
 * `briefcase` vs `briefcase-business` reads as a match (they are not). Every
 * comparison here is therefore on the drawn geometry, and the `work`/`briefcase`
 * and `edu`/`graduation-cap` aliases fall out of that rather than being listed.
 * There is no alias set in this file, and there must not be one.
 *
 * ⚠️ **Path data is compared numerically, not textually.** `d="…1.704.706…"`
 * and `d="…1.704 0.706…"` are the same curve, and lucide's own minifier emits
 * the first where a hand-copy tends to write the second. Comparing the raw
 * strings reports two of `StandardIcons`' entries as drifted when they are
 * identical — measured while regenerating the catalogue for Finding C.
 *
 * ## Scoped by the property, not by a list
 *
 * Sections come from `ALL_SECTION_KEYS` and runs from `PLACEMENT_RUNS`; the
 * *icon-bearing* subset is discovered per run by looking for an icon beside each
 * heading, never written out. Only three themes pass a section icon into Typst
 * today, and a fourth that started doing so would enter this sweep with no edit
 * here. The same applies to the contact row: the fields are discovered from the
 * seeded values, not from a list of which themes draw which.
 */

/* ------------------------------------------------------------------ *
 * Geometry fingerprinting
 * ------------------------------------------------------------------ */

/**
 * The attributes that describe *what is drawn*. Deliberately excludes `stroke`,
 * `fill` and the rest of the paint: `serializeIconsMap` recolours the whole
 * catalogue per theme — white on lunar, `#1a1a1a` on timeless, two more on
 * javascript — so a fingerprint that included colour would differ for every
 * theme and compare nothing.
 */
const GEOMETRY_ATTRS = [
  'd',
  'points',
  'cx',
  'cy',
  'r',
  'rx',
  'ry',
  'x',
  'y',
  'x1',
  'y1',
  'x2',
  'y2',
  'width',
  'height',
] as const;

const SHAPE_TAGS = 'path|rect|circle|ellipse|line|polyline|polygon';

/** `.706` and `0.706` are the same number; `7.54.54` and `7.54 0.54` the same pair. */
function normalizeNumberList(value: string): string {
  const tokens = value.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  return tokens.map((t) => (/^[a-zA-Z]$/.test(t) ? t : String(Number(t)))).join(' ');
}

/**
 * Reduce an SVG — a full document or a bare fragment — to its drawn geometry.
 *
 * ⚠️ The outer `<svg>` never contributes: only the shape tags are matched, so
 * the wrapper's own `width`/`height`/`viewBox` cannot leak in. That matters
 * because lucide's root carries `width="24" height="24"` and `<rect>` carries
 * the same attribute names; a naive attribute sweep compares the wrappers and
 * every icon looks identical.
 */
function fingerprint(svg: string): string {
  const shapes = [...svg.matchAll(new RegExp(`<(${SHAPE_TAGS})\\b([^>]*)>`, 'g'))];
  return shapes
    .map(([, tag, attrs]) => {
      const drawn = GEOMETRY_ATTRS.map((name) => {
        // ⚠️ `(?:^|\s)`, not `\b`. `\b` matches inside `stroke-width="2"`, so a
        // `width` lookup picks up the stroke of every element that carries one —
        // which the PDF catalogue's entries do individually and lucide's root
        // does once, making every icon differ from itself.
        const found = attrs.match(new RegExp(`(?:^|\\s)${name}="([^"]*)"`));
        return found ? `${name}=${normalizeNumberList(found[1])}` : null;
      }).filter(Boolean);
      return `${tag}[${drawn.join(',')}]`;
    })
    .join(';');
}

/* ------------------------------------------------------------------ *
 * Locating the icon beside a seeded string, in each output
 * ------------------------------------------------------------------ */

const sectionSentinel = (key: string) => `ZI${key.toUpperCase()}ZI`;

const CONTACT_SENTINELS = {
  email: 'zziemailizz',
  phone: 'ZZIPHONEIZZ',
  url: 'zziurlizz',
  address: 'ZZIADDRESSIZZ',
} as const;
type ContactField = keyof typeof CONTACT_SENTINELS;
const CONTACT_FIELDS = Object.keys(CONTACT_SENTINELS) as ContactField[];

/**
 * The icon name Typst is handed for the group containing `needle`.
 *
 * ⚠️ **Every occurrence is tried, because the first is often an `href`.** A
 * contact link emits `#link("mailto:<sentinel>")[#box[#icon("mail")
 * <sentinel>]]`, so the earliest match sits in the URL — ahead of the icon — and
 * a single `indexOf` reports "no icon" for exactly the fields that have one.
 */
function typstIconNameNear(typst: string, needle: string): string | null {
  let from = 0;
  for (;;) {
    const at = typst.indexOf(needle, from);
    if (at < 0) return null;
    from = at + 1;
    const head = typst.slice(0, at);
    const groupStart = Math.max(head.lastIndexOf('#box['), head.lastIndexOf('#link('));
    const window = groupStart < 0 ? head : head.slice(groupStart);
    const icons = [...window.matchAll(/#icon\("([a-z0-9-]+)"\)/g)];
    if (icons.length) return icons[icons.length - 1][1];
  }
}

/**
 * The icon name Typst is handed for the section heading whose title is `needle`.
 *
 * Matches "a macro whose first argument is this heading and whose second is a
 * bare string" — the shape all three section macros share
 * (`#skyline-section("…", "zap", is-side: false)`) — rather than naming them.
 */
function typstSectionIconName(typst: string, needle: string): string | null {
  const found = typst.match(new RegExp(`#[a-z-]+\\("${needle}",\\s*"([a-z0-9-]+)"`));
  return found ? found[1] : null;
}

/**
 * The rendered `<svg>` the preview draws beside `needle`, or `null`.
 *
 * ⚠️ **A scoped structural walk, not string proximity.** An earlier pass used
 * nearest-icon proximity and had to throw a theme's worth of rows away: it
 * attributed an entry's `external-link` to the section heading above it. Here
 * the search starts at the *text node* holding the sentinel and **stops climbing
 * as soon as an ancestor also contains a different sentinel**, so the window can
 * never cross into a neighbouring row, and then keeps only icons that precede
 * that text.
 *
 * ⚠️ **Positioned against the text node, not its element.** Comparing against
 * the enclosing element instead treats every icon *inside* it as preceding —
 * which silently swaps in the trailing `external-link` that misty, plain2 and
 * every other theme render after a linked contact value. Measured: three rows
 * reported the wrong glyph that way, all of them themes whose icon was in fact
 * correct.
 *
 * ⚠️ **Icons after the value are found too, but only inside the value's own
 * element.** `javascript` renders its contact row as source code — `'a@b.com'`
 * then the glyph — so a preceding-only rule reports all four of its fields as
 * export-only, which is what once discarded every `javascript` row as an
 * artefact. The fallback is deliberately *not* searched over the climbed scope:
 * for a section heading that scope reaches the section's entries, and the first
 * following icon would be an entry's `external-link` — turning all 144
 * legitimately icon-free heading rows into false mismatches.
 */
function htmlIconSvgNear(doc: Document, needle: string, otherNeedles: string[]): string | null {
  const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT);
  let anchor: Node | null = null;
  while (walker.nextNode()) {
    if (walker.currentNode.textContent?.includes(needle)) {
      anchor = walker.currentNode;
      break;
    }
  }
  if (!anchor?.parentElement) return null;

  let scope: Element = anchor.parentElement;
  while (scope.parentElement && scope.parentElement !== doc.body) {
    const parent = scope.parentElement;
    if (otherNeedles.some((other) => parent.textContent?.includes(other))) break;
    scope = parent;
  }

  const precedes = (svg: Element) =>
    (svg.compareDocumentPosition(anchor) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

  const before = [...scope.querySelectorAll('svg')].filter(precedes);
  if (before.length) return before[before.length - 1].outerHTML;

  const after = [...anchor.parentElement.querySelectorAll('svg')].filter((svg) => !precedes(svg));
  return after.length ? after[0].outerHTML : null;
}

/* ------------------------------------------------------------------ *
 * The sweep
 * ------------------------------------------------------------------ */

function seeded(themeId: string, placement: Placement): ResumeData {
  const data = buildSingleItemResume(themeId);
  applyPlacement(data, placement);

  const sectionLabels: Record<string, string> = {};
  for (const key of ALL_SECTION_LABEL_KEYS) sectionLabels[key] = sectionSentinel(key);
  data.meta.theme.params = { ...data.meta.theme.params, sectionLabels };

  data.basics.email = `${CONTACT_SENTINELS.email}@example.com`;
  data.basics.phone = CONTACT_SENTINELS.phone;
  data.basics.url = `https://${CONTACT_SENTINELS.url}.example.com`;
  data.basics.location = { ...data.basics.location, city: CONTACT_SENTINELS.address };

  return data;
}

interface Outcome {
  mismatches: string[];
  /** Rows where both outputs drew an icon and the geometry agreed. */
  sectionsBoth: number;
  contactsBoth: number;
}

function measure(themeId: ThemeId, placement: Placement): Outcome {
  const data = seeded(themeId, placement);
  const bound = getBoundFormatters(data);
  const html = renderToStaticMarkup(
    createElement(ThemeRegistry[themeId].HTMLComponent, {
      data,
      formatCVDate: bound.formatCVDate,
      formatCVDateRange: bound.formatCVDateRange,
    }),
  );
  const typst = SERIALIZERS[themeId](data);
  // ⚠️ Through `paletteIconFills`, like every other call site — `iconFillIsShared.test.ts`
  // is the guard, and a literal here is exactly the seventh copy of the grey that was removed.
  // The fill is irrelevant to this file (the fingerprint drops paint entirely), which is
  // precisely why a literal would have looked harmless.
  const iconsMap = serializeIconsMap(
    data,
    paletteIconFills(themeId, data.meta.theme.params?.palette),
  );

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');

  const mismatches: string[] = [];
  let sectionsBoth = 0;
  let contactsBoth = 0;

  const where = (what: string) => `${themeId} (${placement}) ${what}`;

  const compare = (what: string, htmlSvg: string | null, pdfName: string | null): boolean => {
    if (!htmlSvg && !pdfName) return false;
    if (!htmlSvg || !pdfName) {
      mismatches.push(where(`${what}: ${htmlSvg ? 'preview-only' : 'export-only'}`));
      return false;
    }
    const pdfSvg = iconsMap[pdfName];
    if (!pdfSvg) {
      mismatches.push(where(`${what}: export emits "${pdfName}", which resolves to no SVG`));
      return false;
    }
    if (fingerprint(htmlSvg) !== fingerprint(pdfSvg)) {
      mismatches.push(where(`${what}: preview glyph differs from export "${pdfName}"`));
      return false;
    }
    return true;
  };

  const sectionNeedles = ALL_SECTION_KEYS.map(sectionSentinel);
  for (const key of ALL_SECTION_KEYS) {
    const needle = sectionSentinel(key);
    const others = sectionNeedles.filter((n) => n !== needle);
    if (
      compare(
        `section ${key}`,
        htmlIconSvgNear(doc, needle, others),
        typstSectionIconName(typst, needle),
      )
    )
      sectionsBoth += 1;
  }

  const contactNeedles = CONTACT_FIELDS.map((f) => CONTACT_SENTINELS[f]);
  for (const field of CONTACT_FIELDS) {
    const needle = CONTACT_SENTINELS[field];
    const others = contactNeedles.filter((n) => n !== needle);
    if (
      compare(
        `contact ${field}`,
        htmlIconSvgNear(doc, needle, others),
        typstIconNameNear(typst, needle),
      )
    )
      contactsBoth += 1;
  }

  return { mismatches, sectionsBoth, contactsBoth };
}

const OUTCOMES = new Map<string, Outcome>(
  PLACEMENT_RUNS.map(([id, placement]) => [`${id}:${placement}`, measure(id, placement)]),
);
const ALL_MISMATCHES = [...OUTCOMES.values()].flatMap((o) => o.mismatches).sort();
const total = (pick: (o: Outcome) => number) =>
  [...OUTCOMES.values()].reduce((n, o) => n + pick(o), 0);

/**
 * ⚠️ **A shrinking baseline, not an allowlist**, asserted with `toEqual` so a
 * stale entry fails once a theme is fixed.
 *
 * Empty from the start: the three findings of the original measurement were
 * closed in the same change that added this file, so there is no "pre-existing"
 * tier to carry. An entry appearing here means a user is looking at one glyph on
 * screen and sending an employer a different one.
 */
const KNOWN_MISMATCHES: string[] = [];

describe('the preview and the export draw the same icons', () => {
  it('disagrees in exactly the places it already disagreed', () => {
    expect(ALL_MISMATCHES).toEqual(KNOWN_MISMATCHES);
  });
});

/**
 * The controls. Absent-from-both is scored as agreement — a theme is free to
 * print a heading with no icon — so an empty mismatch list is by itself
 * compatible with the sweep seeing nothing at all. That is precisely how
 * Finding B hid: stackoverflow's PDF drew *no* contact icons, and any sweep
 * that only compared icons present in both outputs would have called it clean.
 */
describe('the sweep can actually see the icons it compares', () => {
  it('sweeps the whole derived inventory', () => {
    expect(ALL_SECTION_KEYS.length).toBe(12);
    expect(PLACEMENT_RUNS).toHaveLength(18);
    expect(CONTACT_FIELDS).toEqual(['email', 'phone', 'url', 'address']);
  });

  /**
   * ⚠️ **Pinned exactly, not as a floor.** Only skyline, soft and foggy pass a
   * section icon into Typst — the other nine themes emit headings with no icon,
   * which is legitimate and scores as absent-from-both. So 3 themes × 2
   * placements × 12 sections = 72 rows carry an icon into both outputs, and the
   * remaining 144 are silent. A floor would let a theme quietly stop drawing
   * section icons and stay green; that is the regression this number exists to
   * catch.
   */
  it('carries section icons into both outputs for every theme that draws them', () => {
    expect(total((o) => o.sectionsBoth)).toBe(72);
  });

  /**
   * ⚠️ **The control for Finding B, and the reason the contact rows mean
   * anything.** Previously, elegant drew two of its four contact fields
   * without an icon on screen while the PDF drew all four, and stackoverflow
   * drew three on screen against none in the PDF. Both directions of the same
   * defect, and both invisible to a sweep that only checks the icons it can see
   * in both places.
   */
  it('carries every contact icon into both outputs, for every theme', () => {
    expect(total((o) => o.contactsBoth)).toBe(PLACEMENT_RUNS.length * CONTACT_FIELDS.length);
  });
});

/* ------------------------------------------------------------------ *
 * Finding C — the PDF catalogue against lucide itself
 * ------------------------------------------------------------------ */

const toPascal = (kebab: string) =>
  kebab
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

/**
 * ⚠️ Through lucide's own `icons` map rather than a namespace import. `import *
 * from 'lucide-react'` is a lint error here — the repo restricts lucide's
 * deprecated aliases (`AlertCircle`, `Wand2`, …) by name and a star import pulls
 * every one of them in. The map is also the honest lookup: it is lucide's
 * register of what exists, so "is this key a lucide icon name" is answered by
 * lucide instead of by anything written in this repo.
 */
const lucideFingerprint = (name: string): string | null => {
  const Component = LUCIDE_ICONS[toPascal(name) as keyof typeof LUCIDE_ICONS];
  if (!Component) return null;
  return fingerprint(renderToStaticMarkup(createElement(Component)));
};

/**
 * **`StandardIcons` is a hand-copy of lucide, and hand-copies drift.**
 *
 * Fingerprinting it once found six entries — `phone`, `book-open`, `heart`,
 * `folder-open`, `heart-handshake`, `messages-square` — drawing a *different*
 * glyph from the lucide icon of the same name. That is invisible to the sweep
 * above whenever both outputs happen to use the drifted pair, and it is why the
 * catalogue was regenerated from lucide's pinned `__iconNode` data rather than
 * patched. This keeps it honest.
 *
 * ⚠️ Scoped by "is this key a lucide icon name", asked of lucide's own exports.
 * The two keys that are not — `work` and `edu`, the spellings the serializers
 * emit for `briefcase` and `graduation-cap` — are exempt *here* and covered by
 * the parity sweep above, which compares them to whatever the preview draws
 * without caring what either side calls it.
 */
describe('the PDF icon catalogue is a faithful copy of lucide', () => {
  const KEYS = Object.keys(StandardIcons);
  const NAMED_AFTER_LUCIDE = KEYS.filter((key) => lucideFingerprint(key) !== null);

  it('is mostly named after lucide icons, and knows which entries are not', () => {
    expect(KEYS.length).toBeGreaterThanOrEqual(31);
    expect(KEYS.filter((key) => !NAMED_AFTER_LUCIDE.includes(key))).toEqual(['edu', 'work']);
  });

  it.each(NAMED_AFTER_LUCIDE)('%s draws the lucide glyph of that name', (key) => {
    const entry = renderToStaticMarkup(
      createElement('svg', null, StandardIcons[key]('#000000')) as never,
    );
    expect(fingerprint(entry)).toBe(lucideFingerprint(key));
  });
});
