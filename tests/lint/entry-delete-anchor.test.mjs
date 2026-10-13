import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles, named } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `entryDeleteAnchor` reads `[data-entry-delete="<list>"]` and picks by
 * position, so a confirmed delete hands focus to the entry that took the
 * deleted one's place (`code/UI_PATTERNS.md`). The attribute is opt-in —
 * `AccordionItem` renders it only for an `entryListId` — and its value scopes
 * the query, so a second list on screen cannot be picked from.
 *
 * What is left to pin is the census: which controls carry it at all. A control
 * that is not the entry's Delete, or a list whose id collides with another's,
 * sends focus to a plausible-looking wrong button with nothing failing.
 */
const DELETE_CONTROL_FILES = [
  // Every accordion-based list: ArrayForm's ten sections plus custom sections
  // (which forward `sectionKey`), SkillsForm and LanguageForm (which name their
  // own id) all route their delete through this one control.
  'src/components/ui/Accordion.tsx',
  // `basics.profiles` renders its own row rather than an Accordion.
  'src/components/editor/ProfileList/ProfileItem.tsx',
  // ⚠️ The row's MENU TRIGGER, not its Delete item — the item lives inside a
  // `Popover` whose content is unmounted while closed, so the query would never
  // find it. The marked control has to outlive the entry's removal.
  'src/features/cv-library/VersionRow.tsx',
];

/**
 * ⚠️ Derived, never restated. A hard-coded copy here made a consistent rename
 * fail this test with the invariant intact, and coupled it to the file the
 * constant happened to live in — which broke the moment it moved.
 */
const ANCHORS = fs.readFileSync(path.join(ROOT, 'src/constants/focusAnchors.ts'), 'utf8');
const ATTRIBUTE = /ENTRY_DELETE_ATTR = '([^']+)'/.exec(ANCHORS)?.[1];

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: [named('__tests__')],
});

test('the focus anchor attribute is declared', () => {
  assert.ok(ATTRIBUTE, 'ENTRY_DELETE_ATTR is gone from src/constants/focusAnchors.ts.');
});

test('only the enrolled entry-delete controls carry the focus anchor attribute', () => {
  const found = sourceFiles
    // ⚠️ The bare name, not `${ATTRIBUTE}=`. JSX boolean shorthand —
    // `<button data-entry-delete>` — renders the attribute and matches the
    // query while carrying no `=`, so scanning for the spelling with one walks
    // past the control this test exists to catch.
    .filter((file) => fs.readFileSync(file, 'utf8').includes(ATTRIBUTE))
    .map((file) => path.relative(ROOT, file))
    // Declares the name; does not render it.
    .filter((file) => file !== 'src/constants/focusAnchors.ts')
    .sort();

  assert.deepEqual(
    found,
    [...DELETE_CONTROL_FILES].sort(),
    `A further control carrying ${ATTRIBUTE} joins the positional read in \`entryDeleteAnchor\`. ` +
      "It must mark a control that OUTLIVES its entry's removal — never one inside a popover or " +
      'menu, which is unmounted while closed — valued with an `ALL_ENTRY_LIST_IDS` member of its ' +
      'own, so `entryListInventory.test.tsx` deletes from it by keyboard and checks where focus ' +
      "lands. Routing it through `Accordion`'s `entryListId` does both.",
  );
});

/**
 * `firstEntryFieldAnchor` reads `[data-entry-fields="<list>"]` with
 * `querySelector`, so the first carrier in DOM order wins. Its carriers
 * are the editor half of the delete census — `VersionRow` has no fields — and
 * each renders both markers from one list-id expression.
 */
const FIELDS_ATTRIBUTE = /ENTRY_FIELDS_ATTR = '([^']+)'/.exec(ANCHORS)?.[1];

test('only the entry editors carry the entry-fields attribute', () => {
  assert.ok(FIELDS_ATTRIBUTE, 'ENTRY_FIELDS_ATTR is gone from src/constants/focusAnchors.ts.');
  const found = sourceFiles
    .filter((file) => fs.readFileSync(file, 'utf8').includes(FIELDS_ATTRIBUTE))
    .map((file) => path.relative(ROOT, file))
    .filter((file) => file !== 'src/constants/focusAnchors.ts')
    .sort();

  assert.deepEqual(
    found,
    DELETE_CONTROL_FILES.filter((file) => !file.includes('cv-library')).sort(),
    `A further carrier of ${FIELDS_ATTRIBUTE} can win \`firstEntryFieldAnchor\`'s query ahead of ` +
      "the new entry. Mark only an entry editor's field container, valued with its own list id.",
  );
});

/**
 * The other half of the chain: the attribute is only useful if the delete flows
 * actually name it. Each of these calls `confirm()` from a control that its own
 * confirmed action removes, so without `restoreFocusTo` the dialog closes onto
 * a dead opener and `DialogFrame` — correctly — leaves focus alone.
 *
 * ⚠️ **A regression pin over known files, not a forward guard.** No type can ask
 * "does this confirmed action unmount its own opener", and 13 destructive
 * confirms across 11 files mostly do not — binding it in the type would force
 * `restoreFocusTo: () => null` on nine innocent sites. A sixth flow that needs
 * an anchor is not noticed here; the per-surface keyboard tests are what catch
 * one of these losing its behaviour.
 *
 * ⚠️ **Confirm-gated only, and the name below says so.** This used to be called
 * "every entry-delete flow", which read as covering `useArrayForm`'s *second*
 * route out of `deleteItem`: an empty entry skips the confirm entirely, so there
 * is no dialog to hand an anchor to and this assertion passes while focus falls
 * to `<body>`. That route is armed instead of passed, and what pins it is
 * `ArrayForm/__tests__/arrayFormDeleteWiring.test.tsx`, which renders the real
 * `ArrayForm`.
 *
 * ⚠️ **The whole call is pinned, not just its shape.** An earlier cut matched
 * `/restoreFocusTo: entryDeleteAnchor\([^)]*index\)/`, whose `[^)]*` swallows
 * the list id — so rewriting `useArrayForm`'s anchor to
 * `entryDeleteAnchor('work', index)`, which points every ArrayForm section —
 * the ten named ones and every custom section — at Work's list, passed this test and 2,526 vitest tests (measured during
 * review). The list id is the argument that makes the query safe, so it
 * is the argument that has to be spelled out here.
 *
 * ⚠️ **`EntryListId` binds the inventory; this binds each file's entitlement to
 * a member.** Neither subsumes the other — `code/UI_PATTERNS.md` § Focus
 * Handoff argues it.
 */
const CONFIRM_GATED_DELETE_FLOWS = [
  ['src/components/editor/ArrayForm/useArrayForm.ts', 'entryDeleteAnchor(sectionKey, index)'],
  ['src/components/editor/SkillsForm/useSkillsForm.ts', "entryDeleteAnchor('skills', index)"],
  [
    'src/components/editor/LanguageForm/useLanguageForm.ts',
    "entryDeleteAnchor('languages', index)",
  ],
  [
    'src/components/editor/ProfileList/useProfileList.ts',
    'entryDeleteAnchor(PROFILES_LIST_ID, index)',
  ],
  // The library's cascade has its own terminal rung, so its own producer.
  ['src/features/cv-library/useCvLibrary.ts', 'cvLibraryDeleteAnchor(index)'],
  // ⚠️ The RENDER side of the two lists that name themselves at both ends.
  // Nothing else reaches them: they enrol through `entryListId` rather than
  // spelling the attribute, so the census above cannot see them, and
  // `'languages'` is a valid `EntryListId` for the skills list. Measured while
  // reviewing this change — `entryListId="languages"` in `SkillsFormItem`
  // compiled, passed all 78 lint tests and 102 editor vitest tests, and pointed
  // Skills' focus handoff at the Languages list. `profiles` and `cv-library`
  // need no row (one shared constant at both ends), nor does ArrayForm (it
  // passes its own `sectionKey`).
  ['src/components/editor/SkillsForm/SkillsFormItem.tsx', 'entryListId="skills"'],
  ['src/components/editor/LanguageForm/LanguageFormItem.tsx', 'entryListId="languages"'],
];

test('every confirm-gated entry-delete flow hands the dialog a focus anchor', () => {
  for (const [file, expected] of CONFIRM_GATED_DELETE_FLOWS) {
    const live = fs
      .readFileSync(path.join(ROOT, file), 'utf8')
      .split('\n')
      // A commented-out anchor is not an anchor.
      .filter((line) => !line.trim().startsWith('//'))
      .join('\n');

    assert.ok(
      live.includes(expected),
      `${file} deletes the entry its own delete control lives on, so that control is gone by ` +
        `the time the confirm dialog closes. It must pass \`${expected}\` — the list id ` +
        'included, since that is what scopes the positional query to the right list.',
    );
  }
});

/**
 * The library's cascade ends somewhere else than the editor's: deleting the last
 * version replaces the table with `LibraryNoVersionsState`, and
 * `SECTION_HEADING_ANCHOR_ID` — `entryDeleteAnchor`'s final rung — is the editor
 * rail's heading and is not mounted on `/cvs` at all. An id is only an
 * address while one element carries it.
 *
 * ⚠️ **Match the attribute, not a substring of one.** Two cuts of this test
 * failed the same way, and the second was written to fix the first. Asking for
 * the constant AND `'id={'` anywhere in the file is satisfied by `data-testid={`;
 * so is `includes('id={CONST}')`, because `data-testid={CONST}` *contains*
 * `id={CONST}`. Rewriting the anchor to `data-testid={…}` destroys it and passed
 * both (measured during review). The leading `\s` is what makes it an
 * attribute rather than the tail of a longer name.
 */
const LIBRARY_ANCHOR_RENDERERS = [
  // The middle rung: what replaces the table when the library itself is empty.
  ['LIBRARY_EMPTY_CTA_ANCHOR_ID', 'src/features/cv-library/LibraryStates.tsx'],
  // ⚠️ The terminal rung, and it has to be the page SHELL. `CvLibraryPage` gates
  // the empty panel on the unfiltered count, so deleting the last row matching an
  // active filter leaves `VersionTable`'s own no-results panel and the middle
  // rung never mounts. Only the page's own heading outlives both branches.
  ['LIBRARY_HEADING_ANCHOR_ID', 'src/pages/CvLibraryPage.tsx'],
];

for (const [constant, owner] of LIBRARY_ANCHOR_RENDERERS) {
  test(`${constant} is rendered as an id in exactly one place`, () => {
    const renderers = sourceFiles
      .filter((file) => new RegExp(`\\sid=\\{${constant}\\}`).test(fs.readFileSync(file, 'utf8')))
      .map((file) => path.relative(ROOT, file));

    assert.deepEqual(
      renderers,
      [owner],
      `${constant} addresses a focus rung. Two components rendering it makes ` +
        '`getElementById` pick one arbitrarily; none makes the rung silently absent.',
    );
  });
}
