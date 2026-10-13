// @vitest-environment jsdom
import { AddressSchemaEditor } from '@/features/dashboard/design/helpers/AddressSchemaEditor';
import { addressFieldLabel } from '@/features/dashboard/design/helpers/addressSchemaTypes';
import { createSortingAnnouncements } from '@/features/dashboard/design/sortingAnnouncements';
import { useResumeStore } from '@/store/resume/useResumeStore';
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * The editor half of the address-label fix. Same untrusted string as
 * `preview/__tests__/addressSchemaResolution.test.tsx` — a stored
 * `addressSchema.customFields[].field` — indexed against a different object
 * literal, in a different component tree, with a third failure mode.
 *
 * ⚠️ Measured on `main` before the fix. This half was first rated "lower
 * severity — a function reaches a React `label` prop rather than `.trim()`".
 * That was wrong for one key:
 *
 * - `__proto__` **threw**: `Objects are not valid as a React child (found:
 *   object with keys {})`. That is a second live crash, taking out the Design
 *   tab rather than the preview.
 * - `constructor` / `toString` and the other function-valued names rendered the
 *   chip with **no label at all** — React drops a function child silently — and
 *   put `function Object() { [native code] }` into the drag-and-drop screen
 *   reader announcement.
 *
 * Both directions again: an ordinary unknown key rendered as itself before the
 * fix and still must, and a declared key must still render its *translated*
 * label — without that control a `labelFor` that returned the raw key for
 * everything would satisfy the rest of this file.
 */

const initialState = useResumeStore.getState();
afterEach(() => useResumeStore.setState(initialState, true));

const seedCustomField = (field: string) => {
  const resume = structuredClone(initialState.resume);
  resume.meta.theme.params = {
    ...resume.meta.theme.params,
    addressSchema: { mode: 'custom', customFields: [{ field, separator: ',' }] as never },
  };
  useResumeStore.setState({ resume });
};

/** The twelve names a raw index resolves to — derived, not restated. */
const PROTOTYPE_KEYS = Object.getOwnPropertyNames(Object.prototype);

describe('AddressSchemaEditor with an unresolvable stored field key', () => {
  it.each(PROTOTYPE_KEYS)('renders %s as its own label instead of crashing', (field) => {
    seedCustomField(field);
    expect(() => render(<AddressSchemaEditor />)).not.toThrow();
    expect(screen.getByText(field)).toBeTruthy();
  });

  it('renders an ordinary unknown key as itself', () => {
    seedCustomField('nope');
    render(<AddressSchemaEditor />);
    expect(screen.getByText('nope')).toBeTruthy();
  });

  // ⚠️ `not.toThrow()` alone would pass for an implementation that dropped the
  // chip entirely, so the chip is counted too — the review's point about the one
  // case in this file with no positive assertion.
  it('renders an empty stored key as a chip rather than crashing or vanishing', () => {
    seedCustomField('');
    const { container } = render(<AddressSchemaEditor />);
    expect(container.querySelectorAll('[aria-roledescription]').length).toBeGreaterThan(0);
  });

  // The positive control: the lookup must still resolve a declared key, or the
  // assertions above are satisfied by a helper that never looks anything up.
  it('still resolves a declared key to its translated label', () => {
    seedCustomField('city');
    render(<AddressSchemaEditor />);
    expect(screen.getByText('City')).toBeTruthy();
    expect(screen.queryByText('city')).toBeNull();
  });
});

/**
 * ⚠️ The drag announcement is a **second sink, and no static render reaches it**:
 * `getLabel` runs only inside dnd-kit's `onDragStart` / `onDragOver` /
 * `onDragEnd` / `onDragCancel` (`sortingAnnouncements.ts:19,22-36`).
 *
 * The first draft of this file left that to a structural argument — one
 * `labelFor`, so the chip assertions cover the announcement too — and the code
 * review falsified it by mutation: reverting **just** the `getLabel` call site to
 * the old idiom passed all 103 tests, restoring
 * `Move items: function Object() { [native code] } (1/1)` at a live `aria-live`
 * region with no test, lint rule or type error objecting.
 *
 * A structural argument with nothing asserting the structure is not a guard. So
 * the rule now lives in `addressFieldLabel`, which is callable without a DOM, and
 * the announcement is driven directly below.
 */
describe('the drag announcement', () => {
  /** Echoes the key back, so an unresolved label is visible as the raw key. */
  const t = (key: string) => key.replace('editor.fields.', '').toUpperCase();

  const announce = (field: unknown): string => {
    const announcements = createSortingAnnouncements({
      items: [field as string],
      getLabel: (id) => addressFieldLabel(t, String(id)),
      t: ((key: string, vars?: Record<string, unknown>) =>
        `${key}|${JSON.stringify(vars)}`) as never,
    });
    return announcements.onDragStart?.({ active: { id: field } } as never) ?? '';
  };

  it.each(PROTOTYPE_KEYS)('never announces native code for %s', (field) => {
    expect(announce(field)).not.toContain('native code');
    expect(announce(field)).toContain(field);
  });

  // Positive control: without it, a `getLabel` that returned the raw id for
  // everything would satisfy every assertion above.
  it('announces the translated label for a declared key', () => {
    expect(announce('city')).toContain('CITY');
    expect(announce('postalCode')).toContain('POSTAL_CODE');
  });
});

/**
 * The shape boundary, which is the **hook's** and not the label helper's.
 *
 * ⚠️ Found by the code review: `Object.hasOwn` only converts the crash for values
 * that are strings. A non-string `field` still threw — and for `null` not even at
 * the label, but inside dnd-kit (`Cannot use 'in' operator to search for 'id' in
 * null`) from `itemIds`, before any lookup happens. So the guard belongs where the
 * ids are produced. `useAddressSchemaEditor` drops malformed entries, mirroring
 * `themes/shared/address.ts` so the editor and the rendered address agree on which
 * entries exist.
 */
describe('a malformed stored customFields entry', () => {
  it.each([{}, { a: 1 }, 42, null, undefined])(
    'is dropped rather than crashing the editor: field=%s',
    (field) => {
      seedCustomField(field as never);
      expect(() => render(<AddressSchemaEditor />)).not.toThrow();
      // Dropped, not rendered — the positive half. A guard that merely stopped
      // the throw while leaving a junk chip would pass `not.toThrow()` alone.
      expect(screen.getByText('Address Schema Management')).toBeTruthy();
      expect(screen.queryByText(String(field))).toBeNull();
    },
  );

  it('drops a null entry and keeps the well-formed ones', () => {
    const resume = structuredClone(initialState.resume);
    resume.meta.theme.params = {
      ...resume.meta.theme.params,
      addressSchema: {
        mode: 'custom',
        customFields: [null, { field: 'city', separator: '' }],
      } as never,
    };
    useResumeStore.setState({ resume });
    expect(() => render(<AddressSchemaEditor />)).not.toThrow();
    expect(screen.getByText('City')).toBeTruthy();
  });
});
