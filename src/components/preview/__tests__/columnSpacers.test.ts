import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS } from '@/components/preview/themeIds';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { ALL_SECTION_KEYS } from '@/utils/layout/constants';
import { describe, expect, it } from 'vitest';

/**
 * No column may begin or end with a spacer.
 *
 * A `#v(…)` exists to separate two things. One sitting at a column boundary
 * separates nothing — it just pads the grid cell, which sets the row height the
 * column rules and the footer are laid out against. Two earlier fixes both
 * handled the *inter-section* case and left the blocks a theme puts around
 * the sections.
 *
 * ⚠️ **The obvious version of this test does not work, and measuring it is what
 * produced the version below.** A regex for "a `#v()` with only a bracket on
 * one side" does not distinguish a dangling separator from a legitimate leading
 * spacer inside a `#block(…)[…]` — they are the same bytes — and matches **81**
 * places in the twelve themes' default output. A baseline of 81 is the
 * "may only shrink" shape an earlier guard shipped with, and this defect was
 * very nearly closed with a note claiming the property was untestable because of it.
 *
 * The discriminator is the **kind of group**. A themed component is always a
 * group attached to a call — `#block(…)[`, `#align(center)[`, `#text(…)[`,
 * `#upper[` — so a leading spacer inside one is deliberate. A *column* is
 * always dropped into a **bare** group: a `[` preceded by `,`, `(` or nothing,
 * because the serializers write the enclosing `#grid` themselves. Restrict to
 * bare groups at bracket depth zero and the two cases separate cleanly:
 * the baseline is **0**, on all twelve themes in every state below.
 *
 * Run against `main` this reports 14 offenders across lunar, soft and
 * swiss_grid — every instance of the defect, including the three the first draft of
 * the fix missed and the reviewer pass found.
 */

/**
 * One exemption, and it is a real one. See `themes/shared/typstFooter.ts`.
 *
 * ⚠️ **The old anchor was `breakable: false,` — with a comma the renderer only
 * emitted because of a constant `inset: (x: 0pt)` no caller ever set.** A later
 * fix dropped that no-op and made the inset conditional, and the exemption stopped
 * matching for the themes that pass no inset: 3 failing themes, **24**
 * offenders (8 states each), from deleting bytes that are inert in Typst. *A
 * pattern anchored on a neighbouring argument's punctuation depends on
 * arguments it is not about.*
 *
 * ⚠️ **Widening it to `[,)]` was measurably too permissive, which is the
 * second half of the same lesson.** `#block(width: 100%, breakable: false)[` is
 * how **384** ordinary section wrappers open, typically preceded by `#v(6pt)` —
 * exactly the defect shape — so the exemption would have swallowed the thing
 * it exists to let through. It costs nothing today (instrumented over 12 themes
 * × 8 states × cover letter on/off: every exemption fires on a real footer, 0
 * unexpected offenders), but the anchor was a spelling shared with 384
 * unrelated blocks.
 *
 * The discriminator is one line further in: the footer is the only such block
 * whose body opens `#align(right)[`. Anchor on the renderer's own shape rather
 * than on an argument list that may or may not carry an inset.
 */
const FOOTER_LEAD =
  /^#v\([^)]*\)\s*#block\(width: 100%, breakable: false[^[]*\[\s*#align\(right\)\[/;

const isAttachedGroupChar = (character: string) => /[\w)\]-]/.test(character);

/**
 * Every `#v(…)` that is the first or last token of a bare depth-zero content
 * group. Skips `\`-escapes (`escapeTypst` emits `\[`, `\]`, `\#`, `\/` for user
 * text), string literals and `//` comments, so user content cannot forge a
 * bracket. The stack is asserted balanced below — if the model of Typst's
 * delimiters were wrong, that is where it shows up.
 */
function findBoundarySpacers(markup: string): string[] {
  const offenders: string[] = [];
  const stack: Array<{ start: number; bare: boolean }> = [];
  let unbalanced = false;

  for (let i = 0; i < markup.length; i++) {
    const character = markup[i];

    if (character === '\\') {
      i += 1;
    } else if (character === '"') {
      i += 1;
      while (i < markup.length && markup[i] !== '"') {
        if (markup[i] === '\\') i += 1;
        i += 1;
      }
    } else if (character === '/' && markup[i + 1] === '/') {
      while (i < markup.length && markup[i] !== '\n') i += 1;
    } else if (character === '[') {
      let j = i - 1;
      while (j >= 0 && /\s/.test(markup[j])) j -= 1;
      stack.push({ start: i, bare: j < 0 || !isAttachedGroupChar(markup[j]) });
    } else if (character === ']') {
      const open = stack.pop();
      if (!open) {
        unbalanced = true;
        continue;
      }
      if (!open.bare || stack.length !== 0) continue;

      const body = markup.slice(open.start + 1, i).trim();
      if (!body) continue;

      if (/^#v\([^)]*\)/.test(body) && !FOOTER_LEAD.test(body)) {
        offenders.push(`leading ${JSON.stringify(body.slice(0, 60))}`);
      }
      if (/#v\([^)]*\)$/.test(body)) {
        offenders.push(`trailing ${JSON.stringify(body.slice(-60))}`);
      }
    }
  }

  if (unbalanced || stack.length !== 0) offenders.push('UNBALANCED — the scan is not sound here');
  return offenders;
}

const noContact = (data: ResumeData) => {
  data.basics.email = '';
  data.basics.phone = '';
  data.basics.url = '';
  data.basics.location = { address: '', postalCode: '', city: '', region: '', countryCode: '' };
  data.basics.profiles = [];
  return data;
};
const noImage = (data: ResumeData) => {
  data.basics.image = '';
  return data;
};
const withImage = (data: ResumeData) => {
  data.basics.image = 'data:image/png;base64,AAA';
  return data;
};
const hideEverySection = (data: ResumeData) => {
  data.meta.content.hiddenSections = [...ALL_SECTION_KEYS];
  return data;
};
const noSummary = (data: ResumeData) => {
  data.basics.summary = '';
  return data;
};
/**
 * ⚠️ Not a hiding case. Dragging every section into the sidebar is one layout
 * edit on a fully populated CV, and it is what makes lunar's main-column
 * dangler reachable without anything being hidden at all.
 */
const everythingInSidebar = (data: ResumeData) => {
  const { main, sidebar, sidebarPosition } = data.meta.content.order.twoColumn;
  data.meta.content.order.twoColumn = { main: [], sidebar: [...main, ...sidebar], sidebarPosition };
  return data;
};

/**
 * Each state empties a *different* block, which is the point — a state that
 * empties nothing tests nothing, and every one of the six defects this file
 * reports on `main` needs a different combination.
 */
const STATES: Array<[string, (data: ResumeData) => ResumeData]> = [
  ['default', (data) => data],
  ['no contact', (data) => noImage(noContact(data))],
  ['every section hidden', hideEverySection],
  ['every section hidden, no summary', (data) => noSummary(hideEverySection(data))],
  ['nothing at all', (data) => noSummary(hideEverySection(noImage(noContact(data))))],
  ['image but no contact', (data) => withImage(noContact(data))],
  ['image, no contact, all hidden', (data) => hideEverySection(withImage(noContact(data)))],
  ['every section in the sidebar', everythingInSidebar],
];

describe('column spacers', () => {
  it.each(ALL_THEME_IDS)('%s never opens or closes a column on a spacer', (themeId) => {
    const offenders = STATES.flatMap(([label, mutate]) =>
      findBoundarySpacers(SERIALIZERS[themeId](mutate(buildSingleItemResume(themeId)))).map(
        (offender) => `${label}: ${offender}`,
      ),
    );

    expect(offenders).toEqual([]);
  });

  /**
   * ⚠️ Half two. The scan above passes trivially if it stops finding anything —
   * a broken bracket model, a `render` that returns nothing, a fixture that
   * serializes to `''`. This pins that the states really do reach the
   * serializers and really do differ from each other.
   */
  it('drives eight distinct, non-empty documents per theme', () => {
    for (const themeId of ALL_THEME_IDS) {
      const documents = STATES.map(([, mutate]) =>
        SERIALIZERS[themeId](mutate(buildSingleItemResume(themeId))),
      );

      expect(documents.every((document) => document.length > 500)).toBe(true);
      // Six distinct, not eight: `image but no contact` collapses into
      // `no contact` on the ten themes with no sidebar image, and `nothing at
      // all` into `every section hidden, no summary` where contact is not shown.
      expect(new Set(documents).size).toBeGreaterThanOrEqual(5);
    }
  });
});
