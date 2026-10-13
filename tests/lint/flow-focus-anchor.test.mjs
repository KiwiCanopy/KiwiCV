import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { sourceFiles as listSourceFiles, named } from '../../src/test/sourceFiles.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * `useFlowStore.auth.restoreFocusToId` names a focus anchor by **address**, for
 * the reason `_AuthIsSerializable` in that store states.
 *
 * An address only works while exactly one element carries it, and — unlike a
 * getter — a **missing** renderer is as silent as a duplicate one:
 * `getElementById` returns `null`, `focusIfPossible` declines, and focus falls
 * to `<body>`, which is the defect this seam exists to fix. So both directions
 * are pinned here.
 *
 * ⚠️ What this file CANNOT check is that the id lands on a **focusable**
 * element. Moving `id={id}` from `ExportButton`'s `<button>` onto its wrapping
 * `<div>` is a plausible refactor that breaks the real flow with every check
 * green — `layouts/main/__tests__/authModalFocusAnchor.test.tsx` renders the
 * real control and is what catches it.
 */
const ANCHORS_SRC = fs.readFileSync(path.join(ROOT, 'src/constants/focusAnchors.ts'), 'utf8');

/**
 * ⚠️ Read from the ARRAY, not the type. A union written straight as a type can
 * reach a member through a one-hop alias (`| ExtraAnchor`), which this scan
 * cannot see — measured passing while that member's anchor resolved to `null`
 * `ALL_FLOW_FOCUS_ANCHOR_IDS` is enumerable, and the type is derived
 * from it, so the two cannot disagree.
 */
const INVENTORY = /ALL_FLOW_FOCUS_ANCHOR_IDS = \[([^\]]*)\]/.exec(ANCHORS_SRC)?.[1];
/** Every non-empty entry, so a member this scan cannot name still fails below. */
const ENTRIES = (INVENTORY ?? '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);
const MEMBERS = ENTRIES.filter((entry) => /^[A-Z][A-Z0-9_]*$/.test(entry));

const sourceFiles = listSourceFiles(path.join(ROOT, 'src'), {
  extensions: ['.ts', '.tsx'],
  skip: [named('__tests__')],
});

test('the flow anchor inventory is declared and every entry is a named constant', () => {
  assert.ok(INVENTORY, 'ALL_FLOW_FOCUS_ANCHOR_IDS is gone from src/constants/focusAnchors.ts.');
  assert.ok(
    ENTRIES.length > 0,
    'The inventory names no constants. An id typed `string` is the mistake this guards.',
  );
  // ⚠️ Every entry, not just the ones this file can read. A bare `'save-trigger'`
  // in the array parses as an entry and not as a member, so without this it would
  // silently skip the census below rather than failing it.
  assert.deepEqual(
    ENTRIES.filter((entry) => !/^[A-Z][A-Z0-9_]*$/.test(entry)),
    [],
    'Every inventory entry must be a SCREAMING_CASE constant declared in this file, so the ' +
      'census below can find where it is rendered. A string literal has no declaration to scan.',
  );
});

test('FlowFocusAnchorId is derived from the inventory, not written beside it', () => {
  assert.match(
    ANCHORS_SRC,
    /export type FlowFocusAnchorId = \(typeof ALL_FLOW_FOCUS_ANCHOR_IDS\)\[number\]/,
    'A hand-written union can gain a member the inventory does not have, and this file ' +
      'only census-checks the inventory.',
  );
});

for (const member of MEMBERS) {
  test(`${member} is rendered as an id on exactly one element`, () => {
    // ⚠️ Occurrences, not matching FILES. Counting files cannot see the duplicate
    // this test's own message warns about: a second `id={…}` in the SAME file
    // passed a file-count assertion while making `getElementById` arbitrary.
    // ⚠️ `\sid={` matches the attribute rather than a substring of one —
    // `data-testid={NAME}` contains `id={NAME}`, and two earlier cuts of the
    // sibling guard shipped with that hole.
    const pattern = new RegExp(`\\sid=\\{${member}\\}`, 'g');
    const sites = sourceFiles.flatMap((file) => {
      const count = (fs.readFileSync(file, 'utf8').match(pattern) ?? []).length;
      return Array.from({ length: count }, () => path.relative(ROOT, file));
    });

    assert.equal(
      sites.length,
      1,
      `${member} is a focus anchor reached by address through \`useFlowStore\`. ` +
        `Rendered ${sites.length} times (${sites.join(', ') || 'nowhere'}): none makes the ` +
        'anchor silently null, two makes `getElementById` pick one arbitrarily. ' +
        'That the id lands on a FOCUSABLE element is not checkable here — ' +
        '`layouts/main/__tests__/authModalFocusAnchor.test.tsx` renders the real control.',
    );
  });
}
