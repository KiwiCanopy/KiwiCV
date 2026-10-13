// @vitest-environment jsdom
import { SECTION_HEADING_ANCHOR_ID } from '@/constants/focusAnchors';
import {
  entryDeleteAnchor,
  firstEntryFieldAnchor,
  focusIfPossible,
  nextTabbableAfter,
  sectionHeadingAnchor,
} from '@/utils/focus';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  document.body.innerHTML = '';
});

/** A list of delete controls, as `Accordion` and `ProfileItem` render them. */
function renderEntries(count: number, listId = 'work') {
  document.body.innerHTML = Array.from(
    { length: count },
    (_, index) =>
      `<button data-entry-delete="${listId}" id="${listId}-${index}">Delete ${index}</button>`,
  ).join('');
}

describe('focusIfPossible', () => {
  it('reports whether the focus actually took', () => {
    document.body.innerHTML = '<button id="a">A</button>';
    const button = document.getElementById('a') as HTMLElement;

    expect(focusIfPossible(button)).toBe(true);
    expect(document.activeElement).toBe(button);
  });

  it('refuses a missing node', () => {
    expect(focusIfPossible(null)).toBe(false);
    expect(focusIfPossible(undefined)).toBe(false);
  });

  /**
   * ⚠️ `DialogFrame` holds a node captured when the dialog opened, and the
   * confirmed action routinely removes it before the dialog closes.
   */
  it('refuses a node that has left the document', () => {
    document.body.innerHTML = '<button id="a">A</button>';
    const button = document.getElementById('a') as HTMLElement;
    button.remove();

    expect(focusIfPossible(button)).toBe(false);
  });

  /**
   * ⚠️ Both spellings. `Button` renders `aria-disabled` rather than `disabled`
   * whenever it has something to announce, and refuses the activation itself.
   */
  it('refuses a control that cannot act, in either spelling', () => {
    document.body.innerHTML =
      '<button id="native" disabled>A</button><button id="aria" aria-disabled="true">B</button>';

    expect(focusIfPossible(document.getElementById('native'))).toBe(false);
    expect(focusIfPossible(document.getElementById('aria'))).toBe(false);
  });
});

describe('entryDeleteAnchor', () => {
  it('offers the same control on the entry that took the deleted one place', () => {
    renderEntries(3);
    // Row 1 was deleted; rows 0 and 2 remain, and index 1 is now the old row 2.
    document.getElementById('work-1')?.remove();

    expect(entryDeleteAnchor('work', 1)()).toBe(document.getElementById('work-2'));
  });

  /**
   * Deleting the first entry, where the clamp is a no-op — the case an
   * off-by-one in `Math.min` would break first.
   */
  it('offers the new first entry when the first one went', () => {
    renderEntries(3);
    document.getElementById('work-0')?.remove();

    expect(entryDeleteAnchor('work', 0)()).toBe(document.getElementById('work-1'));
  });

  /** Deleting the last entry has no successor: offer the one before it. */
  it('clamps to the last surviving entry', () => {
    renderEntries(3);
    document.getElementById('work-2')?.remove();

    expect(entryDeleteAnchor('work', 2)()).toBe(document.getElementById('work-1'));
  });

  it('falls back to the section heading once the list is empty', () => {
    document.body.innerHTML = `<h2 id="${SECTION_HEADING_ANCHOR_ID}" tabindex="-1">Work</h2>`;

    expect(entryDeleteAnchor('work', 0)()).toBe(document.getElementById(SECTION_HEADING_ANCHOR_ID));
  });

  /**
   * ⚠️ The case the list id exists for. Unscoped and queried document-wide,
   * this picked a control out of whichever list came first in the DOM and sent
   * focus to a row of an unrelated section — silently (measured in
   * review).
   */
  it('never reaches into another list', () => {
    document.body.innerHTML =
      '<button data-entry-delete="skills" id="skills-0">A</button>' +
      '<button data-entry-delete="skills" id="skills-1">B</button>' +
      '<button data-entry-delete="languages" id="languages-0">C</button>';

    expect(entryDeleteAnchor('languages', 1)()).toBe(document.getElementById('languages-0'));
    expect(entryDeleteAnchor('skills', 0)()).toBe(document.getElementById('skills-0'));
  });

  /**
   * Nothing to offer is a real answer — `DialogFrame` leaves focus alone rather
   * than inventing a destination.
   */
  it('answers null when neither an entry nor the heading is mounted', () => {
    expect(entryDeleteAnchor('work', 0)()).toBeNull();
    expect(sectionHeadingAnchor()).toBeNull();
  });
});

describe('firstEntryFieldAnchor', () => {
  it('skips controls that cannot take focus', () => {
    document.body.innerHTML = `<div data-entry-fields="work">
      <button aria-disabled="true">Off</button>
      <button tabindex="-1">Hint</button>
      <input id="first" />
    </div>`;
    expect(firstEntryFieldAnchor('work')()?.id).toBe('first');
  });

  // A custom section's id comes from imported JSON.
  it('does not throw on a list id holding a quote', () => {
    const listId = 'custom:a"b' as `custom:${string}`;
    const fields = document.createElement('div');
    fields.setAttribute('data-entry-fields', listId);
    fields.innerHTML = '<input id="first" />';
    document.body.append(fields);
    expect(firstEntryFieldAnchor(listId)()?.id).toBe('first');
  });
});

/** Where focus leaves a portalled tooltip going forward. */
describe('nextTabbableAfter', () => {
  const byId = (id: string) => document.getElementById(id)!;

  it('stays inside the dialog that holds the node', () => {
    document.body.innerHTML =
      '<div role="dialog"><button id="trigger">?</button><div id="tip"><a href="#x">x</a></div></div>' +
      '<button id="behind">Behind</button>';
    expect(nextTabbableAfter(byId('trigger'), byId('tip'))).toBeNull();
  });

  it('skips controls under aria-hidden and inside the skipped surface', () => {
    document.body.innerHTML =
      '<button id="trigger">?</button><div id="tip"><a href="#x">x</a></div>' +
      '<div aria-hidden="true"><button>Hidden</button></div><input id="next" />';
    expect(nextTabbableAfter(byId('trigger'), byId('tip'))?.id).toBe('next');
  });
});
