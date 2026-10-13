import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { ThemeRegistry } from '@/components/preview/ThemeRegistry';
import { SERIALIZERS } from '@/components/preview/ThemeSerializers';
import { ALL_THEME_IDS, type ThemeId } from '@/components/preview/themeIds';
import { buildSingleItemResume } from '@/test/singleItemResume';
import type { ResumeData } from '@/types/resume';
import { generateJSONWithPlaceholders, isResumeEmpty } from '@/utils/placeholder-fallback';
import { sanitizeResumeData } from '@/utils/validation';
import { describe, expect, it } from 'vitest';

/**
 * A stored **string** field is arbitrary JSON, and `sanitizeResumeData` is where
 * it stops being one.
 *
 * The premise this started from was that this invariant had been patched at six
 * producers and that the remaining work was to own it and delete them. The first half is
 * right; the second is not, and the six are not the scope. Measured
 * through `setResume` — the only production path into the store —
 * with `buildSingleItemResume`, all twelve themes, both renderers:
 *
 * | field | HTML themes | Typst themes | first message |
 * | --- | --- | --- | --- |
 * | `basics.url` | **12** | **12** | `basics.url.replace is not a function` |
 * | `basics.name` | 2–12 | **12** | `basics.name.replace is not a function` |
 * | `basics.label` | 2–11 | **12** | `basics.label?.toUpperCase is not a function` |
 * | `basics.email` / `phone` / `summary` | 0–11 | **12** | `str.replace` (`escapeTypst`) |
 * | `basics.image` | 0 | 9 | `image.startsWith is not a function` |
 * | `basics.location.city` / `countryCode` | 0 | **12**† | `…?.city?.trim is not a function` |
 *
 * † ⚠️ The one row with a condition on it, and the first draft omitted it.
 * Twelve is the count *with `coverLetter.enabled`* — every serializer calls
 * `buildCoverLetterTypst`, which owns that read and returns early otherwise.
 * With the letter disabled exactly **one** theme still throws (lunar, in its
 * own sidebar map). 4.1.0 makes the cover letter the headline feature and
 * `buildSingleItemResume` enables it, so the enabled population is the common
 * one — but a theme count is worth nothing without the state it was taken
 * under. Measured both ways.
 *
 * The `{}` row is worst in the editor (`Objects are not valid as a React
 * child`); a number or an array kills the PDF on all twelve while the preview
 * renders. So the theme renderers read the same stored scalars raw, and a
 * `?.trim()` on `location.city` survives in a Typst helper an earlier fix did not reach —
 * a *seventh* producer, found by scanning for the property rather than reading
 * the list of six.
 *
 * ⚠️ **This does not license deleting the six.** The boundary closes the
 * *entry*; the consumer guards cover the *read*, and they are not two copies of
 * one rule — they answer different questions.
 *
 * ⚠️ **The rehydration half is closed**, and this docblock once said the
 * opposite: `sanitizeResumeData` ran on the `setResume` paths only,
 * `onRehydrateStorage` ran `sanitizePageBreaks` and nothing else, and so
 * everything already in `localStorage` reached the renderers without passing
 * through here — which is how `addressSchema` and `separator` defects
 * were reachable at all. That callback now runs this function over the
 * rehydrated résumé; `rehydrationNormalisation.test.ts` is the guard, and it
 * drives `persist.rehydrate()` rather than calling the sanitizer, because a
 * test that called it would pass against the code before the fix too.
 *
 * ⚠️ Closing it does **not** retroactively make the theme reads in the table
 * above guarded — they are still unguarded, and nothing here asserts otherwise.
 * What changed is that no unvalidated value reaches them any more. Deleting the
 * six consumer guards, now that both paths normalise, is deliberately *not*
 * part of that change and remains open.
 */

const SCALARS = ['name', 'label', 'email', 'phone', 'url', 'summary', 'image'] as const;
const LOCATION = ['address', 'postalCode', 'city', 'region', 'countryCode'] as const;

const NON_STRINGS: Array<[string, unknown]> = [
  ['a number', 42],
  ['an object', {}],
  ['an array', ['x']],
  ['a boolean', true],
  ['null', null],
];

const importBasics = (basics: Record<string, unknown>): ResumeData['basics'] =>
  sanitizeResumeData({ basics } as Record<string, unknown>).sanitized.basics;

describe('a non-string value on a basics string field', () => {
  it.each(
    SCALARS.flatMap((field) =>
      NON_STRINGS.map(([label, value]) => [field, label, value] as [string, string, unknown]),
    ),
  )('basics.%s becomes an empty string when it is %s', (field, _label, value) => {
    expect(importBasics({ [field]: value })[field as 'name']).toBe('');
  });

  it.each(
    LOCATION.flatMap((field) =>
      NON_STRINGS.map(([label, value]) => [field, label, value] as [string, string, unknown]),
    ),
  )('basics.location.%s becomes an empty string when it is %s', (field, _label, value) => {
    expect(importBasics({ location: { [field]: value } }).location[field as 'city']).toBe('');
  });
});

/**
 * The same branch on the fields whose default is **not** `''`. Falling back to
 * `''` here would type-check and be wrong — a stored `sidebarPosition` of `42`
 * has to become `'left'`, not nothing.
 */
describe('a non-string value on a meta string field', () => {
  const meta = (value: unknown) =>
    sanitizeResumeData({
      meta: {
        version: value,
        theme: { name: value, locale: value },
        content: { order: { twoColumn: { sidebarPosition: value } } },
      },
    } as Record<string, unknown>).sanitized.meta;

  it.each(NON_STRINGS)('restores every default when the value is %s', (_label, value) => {
    const out = meta(value);
    expect(out.version).toBe('1.0.0');
    expect(out.theme.name).toBe('lunar');
    expect(out.theme.locale).toBe('en');
    expect(out.content.order.twoColumn.sidebarPosition).toBe('left');
  });
});

describe('half two: what the fix must NOT do', () => {
  it('keeps every well-formed basics string', () => {
    const basics = importBasics({
      name: 'Ada Lovelace',
      label: 'Analytical Engineer',
      email: 'ada@example.com',
      phone: '+44 20 7946 0000',
      url: 'https://example.com',
      summary: 'One paragraph.',
      image: 'data:image/png;base64,AAA',
      location: { address: '12 Nowhere Lane', postalCode: 'W1A 1AA', city: 'London' },
    });

    expect(basics.name).toBe('Ada Lovelace');
    expect(basics.label).toBe('Analytical Engineer');
    expect(basics.email).toBe('ada@example.com');
    expect(basics.phone).toBe('+44 20 7946 0000');
    expect(basics.url).toBe('https://example.com');
    expect(basics.summary).toBe('One paragraph.');
    expect(basics.image).toBe('data:image/png;base64,AAA');
    expect(basics.location.city).toBe('London');
    expect(basics.location.postalCode).toBe('W1A 1AA');
  });

  /**
   * ⚠️ The interior must survive. An earlier regression was a trim that reached a
   * part's *middle*, and a fix that collapsed whitespace rather than stripping
   * the ends would pass every assertion above.
   */
  it('trims only the ends, on basics and on nothing else', () => {
    const { sanitized } = sanitizeResumeData({
      basics: { name: '  Ada   Lovelace  ', location: { city: '  London  ' } },
      work: [{ name: '  Acme  ', summary: '  body text  ' }],
    } as Record<string, unknown>);

    expect(sanitized.basics.name).toBe('Ada   Lovelace');
    expect(sanitized.basics.location.city).toBe('London');
    // Body text a user wrote is left alone — the reason the trim is scoped to
    // `basics` rather than applied inside `s()`.
    expect(sanitized.work[0].name).toBe('  Acme  ');
    expect(sanitized.work[0].summary).toBe('  body text  ');
  });

  /**
   * What the trim is *for*, on a consumer the list of six does not name. swiss-grid
   * splits the name on `' '` and renders `parts[0]` as its first line;
   * `'  Ada Lovelace  '.split(' ')` is `['', '', 'Ada', 'Lovelace', '', '']`,
   * six parts, so the `length < 2` single-line branch is not taken and the name
   * block renders an **empty first line**. Both outputs, same code in
   * `SwissGridHTML.tsx` and `SwissGridSerializer.ts`.
   *
   * ⚠️ Asserted through the split rather than through the rendered markup: the
   * HTML puts the two lines in sibling elements and the Typst in two `#text`
   * calls, so a markup assertion would pin the theme's layout rather than the
   * property, and would move whenever that layout does.
   */
  it('leaves swiss-grid’s name split with no empty leading part', () => {
    const padded = sanitizeResumeData({ basics: { name: '  Ada Lovelace  ' } } as Record<
      string,
      unknown
    >).sanitized.basics.name;

    expect('  Ada Lovelace  '.split(' ')[0]).toBe('');
    expect(padded.split(' ')[0]).toBe('Ada');
    expect(padded.split(' ').filter((part) => part === '')).toEqual([]);
  });
});

/**
 * The behavioural half, on the fields the table above shows reaching twelve
 * themes. The fallback helpers are in the same block because they are the other
 * consumer that died: `isResumeEmpty` once threw on a non-string, and
 * `Viewer.tsx` and the placeholder enrichment went with it.
 */
describe('neither renderer throws on a non-string basics field', () => {
  const withBasics = (themeId: ThemeId, path: string, value: unknown): ResumeData => {
    const raw = structuredClone(buildSingleItemResume(themeId)) as unknown as Record<
      string,
      unknown
    >;
    const basics = raw.basics as Record<string, unknown>;
    if (path.startsWith('location.')) {
      (basics.location as Record<string, unknown>)[path.slice('location.'.length)] = value;
    } else {
      basics[path] = value;
    }
    return sanitizeResumeData(raw).sanitized;
  };

  const html = (themeId: ThemeId, data: ResumeData): string =>
    renderToStaticMarkup(
      createElement(ThemeRegistry[themeId].HTMLComponent, {
        data,
        formatCVDate: (value?: string) => value || '',
        formatCVDateRange: (start?: string, end?: string) => `${start || ''}-${end || ''}`,
      }),
    );

  it.each(ALL_THEME_IDS)('%s survives a non-string on every basics field', (themeId) => {
    for (const path of [...SCALARS, ...LOCATION.map((field) => `location.${field}`)]) {
      for (const value of [42, {}, ['x']]) {
        const data = withBasics(themeId, path, value);
        expect(() => html(themeId, data)).not.toThrow();
        expect(() => SERIALIZERS[themeId](data)).not.toThrow();
        expect(() => isResumeEmpty(data)).not.toThrow();
        expect(() => generateJSONWithPlaceholders(data, (key) => key)).not.toThrow();
      }
    }
  });

  /**
   * ⚠️ The positive control. Every assertion above is satisfied by a "fix" that
   * blanked the whole `basics` block, which is exactly what falling back to
   * `''` instead of `defaultValue` would look like one field over.
   */
  it.each(ALL_THEME_IDS)('%s still renders a well-formed name and url', (themeId) => {
    const data = withBasics(themeId, 'name', 'ZQNAME Person');
    expect(data.basics.name).toBe('ZQNAME Person');
    expect(html(themeId, data)).toContain('ZQNAME');
    expect(SERIALIZERS[themeId](data)).toContain('ZQNAME');
  });
});
