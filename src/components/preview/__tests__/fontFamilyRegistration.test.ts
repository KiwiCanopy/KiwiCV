import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { getThemeList } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { type ResumeData, initialResumeState } from '@/types/resume';
import { enrichResumeWithPlaceholders } from '@/utils/placeholder-fallback';
import { EAGER_FONT_FILES } from '@/workers/eagerFonts';
import lazyFontInfo from '@/workers/lazy-font-info.json';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * **No renderer is handed a font family it cannot supply.**
 *
 * The forward guard for a defect where four families were named in stacks nothing
 * had registered: `Lora` and `JetBrains Mono` had `@font-face` nowhere, so
 * elegant, timeless and javascript previewed in a system fallback; `Montserrat`
 * was loadable on neither side; and a plain `Noto Sans` sat in the javascript
 * theme's Typst stack, logging `unknown font family: noto sans` on every
 * compile. Every one of them was silent — a browser substitutes without
 * complaint, and Typst treats an unknown family as a warning and still emits a
 * PDF.
 *
 * ⚠️ **Scoped by what the renderers are actually handed, not by any spelling.**
 * It renders all twelve themes both ways and reads the families back out of the
 * output. That matters because the shapes producing those families do not share
 * a name: `HTML_FONT_STACKS`, inline `fontFamily` literals in theme components,
 * `TYPST_FONTS` via `getTypstFontList`, and the javascript theme's private
 * `getJavascriptFontList`. A scan keyed on `getTypstFontList` would have walked
 * straight past that last one — which is precisely how the `Noto Sans` removed
 * from the shared stacks earlier survived there for another round.
 *
 * ⚠️ **The two halves assert different rules, and the asymmetry is real.**
 * A CSS stack is a preference list: the first family is what the app intends to
 * render and everything after it is fallback, so `-apple-system`, `'Segoe UI'`
 * and the generics are *supposed* to be unregistered. Only the primary is
 * checked. Typst has no system fallback at all — the compiler has exactly what
 * the worker registers — so a family anywhere in a Typst stack is a family we
 * claimed to ship, and **every** entry is checked. That is why the earlier bug lived
 * in the middle of a list.
 *
 * ⚠️ **The inventory pins below are not the guard**, they only prove it is not
 * vacuous. A test that renders and finds nothing passes just as quietly as one
 * that renders and finds everything registered, and "the extractor stopped
 * matching" is exactly the failure a font refactor would cause. The pins fail
 * when a theme stops naming a family; the registration checks are what fail when
 * a named family is unloadable, and they hold for families nobody has written
 * yet.
 */

/** Resolved from this file, not `process.cwd()` — `ops/TESTING.md` § Paths in tests. */
const SELF = fileURLToPath(import.meta.url);
const TOKENS_CSS = join(dirname(SELF), '..', '..', '..', 'styles', 'tokens.css');

/**
 * CSS keywords and system-font names that are fallbacks by construction. Nothing
 * ships a face for these and nothing should: they exist so a stack still renders
 * when the primary is unavailable.
 *
 * Only consulted when deciding whether a *primary* is a real family — a stack
 * whose first entry is `monospace` names no family at all and has nothing to
 * check.
 */
const CSS_FALLBACK_TOKENS = new Set([
  'serif',
  'sans-serif',
  'monospace',
  'cursive',
  'fantasy',
  'system-ui',
  'ui-serif',
  'ui-sans-serif',
  'ui-monospace',
  'ui-rounded',
  'math',
  'emoji',
  'inherit',
  'initial',
  'revert',
  'unset',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
]);

const buildResume = (themeId: string): ResumeData => {
  const resume = structuredClone(initialResumeState);
  resume.meta.theme.name = themeId;
  resume.meta.theme.locale = 'en';
  return enrichResumeWithPlaceholders(resume);
};

/** `'Lora', serif` → `['Lora', 'serif']`, quotes and padding stripped. */
const splitFontStack = (stack: string): string[] =>
  stack
    .split(',')
    .map((part) =>
      part
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .trim(),
    )
    .filter(Boolean);

/**
 * Every `font-family` a theme's rendered HTML actually carries.
 *
 * `renderToStaticMarkup` HTML-escapes the quotes inside a `style` attribute, so
 * `'Lora', serif` arrives as `&#x27;Lora&#x27;, serif`. Decoding first is not
 * cosmetic: the `;` in `&#x27;` terminates the declaration for any regex that
 * reads the attribute raw, and the family silently comes back as the empty
 * string — a passing test that checks nothing.
 *
 * ⚠️ **Style attributes are extracted before declarations are split, and the
 * first version of this did neither.** It ran one regex over the whole document
 * with a `[^;"]+` capture, which excludes the double quote — so a stack written
 * `"Inter", sans-serif` matched the empty string and vanished. That is not
 * hypothetical: the javascript theme's `FONT_SANS` is spelled with double
 * quotes, and this guard first shipped without ever having seen it. The theme
 * sets Inter on 40 of its 154 text runs and the check was blind to every one.
 *
 * A family is only as checked as the spelling the extractor happens to match,
 * so the parse is now structural — take the attribute, then split it on `;`,
 * rather than pattern-matching a declaration out of the middle of a document.
 */
const htmlFontStacksIn = (markup: string): string[] => {
  const decoded = markup.replace(/&#x27;/g, "'").replace(/&quot;/g, '"');
  const stacks: string[] = [];
  for (const attribute of decoded.matchAll(/\sstyle="([^"]*(?:"[^"]*"[^"]*)*?)"(?=[\s/>])/g)) {
    for (const declaration of attribute[1].split(';')) {
      const [property, ...rest] = declaration.split(':');
      if (property?.trim() === 'font-family' && rest.length) stacks.push(rest.join(':').trim());
    }
  }
  return stacks;
};

/**
 * Every font stack a serializer hands Typst, whether written inline or bound.
 *
 * ⚠️ **`font:` takes a value, and a tuple literal is only one spelling of one.**
 * Matching `font: (…)` alone misses `font: some-binding`, which is ordinary
 * Typst and is what the javascript theme uses for its prose face. Caught by this
 * file's own parity check reporting `Inter in the preview, absent from the
 * export` for a theme whose PDF demonstrably embeds Inter — the extractor could
 * not see the binding, and a guard that cannot see a construct reports its
 * absence rather than staying silent, which is the good failure mode.
 *
 * So `#let x = ("A", "B")` definitions are collected first and `font: x`
 * references resolved through them. A bare `font: "A"` is the third spelling;
 * Swiss Grid's unregistered `"Courier"` hid behind it.
 */
const typstFontStacksIn = (markup: string): string[] => {
  const bindings = new Map<string, string>();
  for (const define of markup.matchAll(/#let\s+([\w-]+)\s*=\s*\(([^)]*)\)/g)) {
    if (/["']/.test(define[2])) bindings.set(define[1], define[2]);
  }
  return [...markup.matchAll(/font:\s*(\(([^)]*)\)|"([^"]*)"|[\w-]+)/g)].flatMap((match) => {
    if (match[2] !== undefined) return [match[2]];
    if (match[3] !== undefined) return [match[3]];
    const bound = bindings.get(match[1]);
    return bound === undefined ? [] : [bound];
  });
};

/**
 * Families the browser can load: the `@font-face` declarations in `tokens.css`.
 *
 * ⚠️ Read off the stylesheet, not off `public/fonts`. A file that is served but
 * never declared is not loadable, and that distinction is the whole bug —
 * `lora-*.ttf` and `jetbrains-mono-*.ttf` sat in `public/fonts` and were
 * registered with *Typst* the entire time the browser was falling back.
 */
const browserFamilies = (): Set<string> => {
  const css = readFileSync(TOKENS_CSS, 'utf8');
  const families = new Set<string>();
  for (const block of css.match(/@font-face\s*\{[^}]*\}/g) || []) {
    const name = /font-family:\s*['"]([^'"]+)['"]/.exec(block);
    if (name) families.add(name[1]);
  }
  return families;
};

/** Lowercased and stripped of everything but letters and digits. */
const slug = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Whether the Typst worker registers a face for this family.
 *
 * The lazy set carries real family names, so it matches exactly. The eager set
 * is a list of *filenames*, so it matches on a slug prefix: `DejaVu Sans` →
 * `dejavusans` against `DejaVuSans.ttf` → `dejavusansttf`.
 *
 * ⚠️ **Stated limitation: the prefix rule is a hole, not a false alarm.** A
 * family whose slug happened to prefix an unrelated filename would read as
 * registered. Parsing the `name` table out of each TTF would close it; that is
 * more machinery than the failure mode has ever warranted, and the direction of
 * the error is the safe one — this can miss a bad family, it cannot invent one.
 */
const typstRegisters = (family: string): boolean => {
  if (lazyFontInfo.fonts.some((font) => font.info.info.some((face) => face.family === family))) {
    return true;
  }
  return EAGER_FONT_FILES.some((file) => slug(file).startsWith(slug(family)));
};

interface Site {
  readonly themeId: string;
  readonly stack: string;
  readonly families: string[];
}

const htmlSites: Site[] = getThemeList().flatMap((theme) => {
  const markup = renderToStaticMarkup(
    createElement(theme.HTMLComponent, {
      data: buildResume(theme.id),
      formatCVDate: (value?: string) => value || '',
      formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
    }),
  );
  return htmlFontStacksIn(markup).map((stack) => ({
    themeId: theme.id,
    stack,
    families: splitFontStack(stack),
  }));
});

const typstSites: Site[] = Object.entries(SERIALIZERS).flatMap(([themeId, serialize]) =>
  typstFontStacksIn(serialize(buildResume(themeId))).map((stack) => ({
    themeId,
    stack,
    families: splitFontStack(stack),
  })),
);

const sorted = (values: Iterable<string>): string[] => [...new Set(values)].sort();

describe('font families the renderers are handed', () => {
  describe('the extractors', () => {
    it('reads a family back out of escaped inline markup', () => {
      const markup = '<div style="font-family:&#x27;Lora&#x27;, serif;color:red">x</div>';
      expect(htmlFontStacksIn(markup)).toEqual(["'Lora', serif"]);
      expect(splitFontStack(htmlFontStacksIn(markup)[0])).toEqual(['Lora', 'serif']);
    });

    it('reads every family out of a Typst tuple, not just the first', () => {
      const markup = '#set text(font: ("Lora", "Inter", "DejaVu Sans"), size: 9pt)';
      expect(splitFontStack(typstFontStacksIn(markup)[0])).toEqual([
        'Lora',
        'Inter',
        'DejaVu Sans',
      ]);
    });

    it('reads a bare string family, not only tuples and bindings', () => {
      const markup = '#text(fill: red, font: "JetBrains Mono", weight: "bold")[01]';
      expect(typstFontStacksIn(markup)).toEqual(['JetBrains Mono']);
    });

    it('knows an unregistered family from a registered one', () => {
      expect(typstRegisters('Inter')).toBe(true);
      expect(typstRegisters('Noto Sans CJK SC')).toBe(true);
      expect(typstRegisters('Noto Sans')).toBe(false);
      expect(typstRegisters('Montserrat')).toBe(false);
      expect(browserFamilies().has('Lora')).toBe(true);
      expect(browserFamilies().has('Montserrat')).toBe(false);
    });
  });

  describe('Typst', () => {
    it('every theme hands the compiler a font stack', () => {
      expect(sorted(typstSites.map((site) => site.themeId))).toEqual(
        sorted(Object.keys(SERIALIZERS)),
      );
    });

    it('names exactly these families', () => {
      expect(sorted(typstSites.flatMap((site) => site.families))).toEqual([
        'DejaVu Sans',
        'Inter',
        'JetBrains Mono',
        'Lora',
        'Noto Sans CJK JP',
        'Noto Sans CJK SC',
      ]);
    });

    it('registers every family in every position, not just the primary', () => {
      const unregistered = typstSites.flatMap((site) =>
        site.families
          .filter((family) => !typstRegisters(family))
          .map((family) => `${site.themeId}: ${family}`),
      );
      expect(sorted(unregistered)).toEqual([]);
    });
  });

  describe('the browser', () => {
    it('every theme renders a font-family declaration', () => {
      expect(sorted(htmlSites.map((site) => site.themeId))).toEqual(
        sorted(getThemeList().map((theme) => theme.id)),
      );
    });

    it('asks for exactly these primary families', () => {
      const primaries = htmlSites
        .map((site) => site.families[0])
        .filter((family) => family && !CSS_FALLBACK_TOKENS.has(family));
      expect(sorted(primaries)).toEqual(['Inter', 'JetBrains Mono', 'Lora']);
    });

    it('has an @font-face for every primary family', () => {
      const registered = browserFamilies();
      const missing = htmlSites
        .filter((site) => {
          const primary = site.families[0];
          return primary && !CSS_FALLBACK_TOKENS.has(primary) && !registered.has(primary);
        })
        .map((site) => `${site.themeId}: ${site.stack}`);
      expect(sorted(missing)).toEqual([]);
    });
  });

  /**
   * **A family the preview renders must be one the export can render too.**
   *
   * The registration checks above are per-renderer: each asks whether the family
   * named is one *that* renderer can supply. Both pass happily while the two
   * renderers name different families for the same text, which is its own bug
   * class — the javascript theme set body copy in Inter on
   * screen and JetBrains Mono in the PDF, because its Typst stack had no Inter
   * in it at all.
   *
   * ⚠️ **Subset, not equality, and the asymmetry is not laziness.** A Typst stack
   * legitimately carries families the HTML never names — `Noto Sans CJK SC`,
   * `DejaVu Sans` — because Typst has only what the worker registers, while a
   * browser reaches the OS for a script it lacks. So the export may know more
   * families than the preview; it must not know fewer.
   *
   * `plain` names none of its own: its root sets `fontFamily: 'inherit'` and it
   * takes whatever the page gives it. An empty set is a subset, so it passes
   * without a special case.
   */
  describe('preview and export', () => {
    it('names no family in the HTML that the theme’s Typst stack lacks', () => {
      const typstByTheme = new Map<string, Set<string>>();
      for (const site of typstSites) {
        const families = typstByTheme.get(site.themeId) ?? new Set<string>();
        for (const family of site.families) families.add(family);
        typstByTheme.set(site.themeId, families);
      }

      const previewOnly = htmlSites.flatMap((site) =>
        site.families
          .filter((family) => !CSS_FALLBACK_TOKENS.has(family))
          .filter((family) => !typstByTheme.get(site.themeId)?.has(family))
          .map((family) => `${site.themeId}: ${family} in the preview, absent from the export`),
      );

      expect(sorted(previewOnly)).toEqual([]);
    });
  });
});
