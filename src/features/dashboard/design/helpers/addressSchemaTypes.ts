import type { AddressField, AddressFieldKey } from '@/types/resume';

/**
 * ⚠️ The `AddressField` unions and their runtime inventories moved to
 * `@/types/resume`, beside the `AddressSchemaConfig` declaration, when
 * `utils/validation.ts` needed them too. Re-exported here so the design
 * editor keeps one import surface — this module is where its call sites look.
 *
 * ⚠️ The `_…AreExhaustive` aliases deliberately do **not** travel with them: they
 * fire at their own declaration site, so re-exporting them adds a second name for
 * a guard nothing imports.
 */
export {
  ALL_ADDRESS_FIELD_KEYS,
  ALL_ADDRESS_SEPARATORS,
  type AddressField,
  type AddressFieldKey,
  type AddressSeparator,
} from '@/types/resume';

export type AddressPreset = 'european' | 'us_ca';

/**
 * Resolve one stored address field key to its display label.
 *
 * ⚠️ **Takes the translator, not a map, and that is the point.** The label map is
 * built here and never escapes, so `AddressSchemaEditor` has no indexable object
 * in scope and the old `fieldLabels[field] || field` idiom cannot be written there
 * at all. That is deliberate: the first fix kept the map in the component and
 * routed three sites through one helper, and the code review then reverted **just
 * the drag-announcement call site** to the raw index — restoring the defect with
 * the entire suite still green. A structural argument that nothing asserts is not
 * a guard, and a hazard that cannot be expressed beats one that is detected.
 *
 * The stored key is typed as a five-member union and is an arbitrary value at
 * runtime. ⚠️ **The reason changed and the guard did not.** It used to be
 * that `validation.ts` *stripped* `addressSchema` rather than narrowing it;
 * `sanitizeAddressSchema` now narrows every leaf, so the import path is closed.
 * What is still open is `persist` rehydration and `updateMeta`, neither of which
 * runs the sanitizer at all — so arbitrary stored JSON still reaches here and this
 * stays load-bearing. Only the premise moved. A raw index reaches `Object.prototype`,
 * whose twelve own property names are all truthy — measured on `main`, `__proto__`
 * **crashed** the editor with `Objects are not valid as a React child`, and
 * `constructor` blanked the chip (React drops a function child silently) while
 * putting `function Object() { [native code] }` into the drag announcement.
 *
 * `Object.hasOwn` is what makes those fall through; the branch *not* firing is
 * what keeps an ordinary unknown key rendering as itself, which already worked and
 * is the easy casualty of fixing the prototype direction.
 *
 * ⚠️ Non-string values are the **hook's** boundary, not this one:
 * `useAddressSchemaEditor` drops any entry whose `field` is not a string, because a
 * `null` id crashes dnd-kit from `itemIds` before any label is looked up. A
 * `String()` coercion here as well was mutation-tested and failed nothing, so it is
 * not here — one boundary, asserted, rather than two with one decorative.
 */
export function addressFieldLabel(t: (key: string) => string, field: string): string {
  // Annotated, not inferred: the key type is what makes a sixth member of
  // `AddressFieldKey` a `TS2741` here rather than a chip silently rendering its
  // own raw identifier.
  const labels: Record<AddressFieldKey, string> = {
    address: t('editor.fields.address'),
    postalCode: t('editor.fields.postal_code'),
    city: t('editor.fields.city'),
    region: t('editor.fields.region'),
    countryCode: t('editor.fields.country_code'),
  };

  return Object.hasOwn(labels, field) ? labels[field as AddressFieldKey] : field;
}

/**
 * The two presets the editor offers.
 *
 * ⚠️ Still unguarded against a sixth `AddressFieldKey`: these are ordinary array
 * literals, so a new key would simply be absent from both with no build error.
 * `ALL_ADDRESS_FIELD_KEYS` above is guarded in both directions; these are not,
 * and a preset is a curated subset rather than an inventory, so exhaustiveness is
 * not obviously the right property. Noted rather than fixed.
 */
export const EUROPEAN_ADDRESS_FIELDS: AddressField[] = [
  { field: 'address', separator: ',' },
  { field: 'postalCode', separator: ' ' },
  { field: 'city', separator: ',' },
  { field: 'region', separator: ',' },
  { field: 'countryCode', separator: '' },
];

export const US_CA_ADDRESS_FIELDS: AddressField[] = [
  { field: 'address', separator: ',' },
  { field: 'city', separator: ',' },
  { field: 'region', separator: ' ' },
  { field: 'postalCode', separator: ',' },
  { field: 'countryCode', separator: '' },
];

export const DEFAULT_ADDRESS_FIELDS = EUROPEAN_ADDRESS_FIELDS;

export function matchesAddressFields(current: AddressField[], expected: AddressField[]) {
  return (
    current.length === expected.length &&
    current.every((field, index) => {
      const expectedField = expected[index];
      return field.field === expectedField.field && field.separator === expectedField.separator;
    })
  );
}
