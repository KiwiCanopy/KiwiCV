import {
  COMPOSER_RUN_ANCHOR_ID,
  CV_LIBRARY_LIST_ID,
  ENTRY_DELETE_ATTR,
  ENTRY_FIELDS_ATTR,
  type EntryListId,
  LIBRARY_EMPTY_CTA_ANCHOR_ID,
  LIBRARY_HEADING_ANCHOR_ID,
  REVIEW_NEXT_ANCHOR_ID,
  SECTION_HEADING_ANCHOR_ID,
} from '@/constants/focusAnchors';

/**
 * Where focus goes when the control that asked for something is gone. A getter,
 * not an element: the answer only exists once whatever was asked for has been
 * applied. Declared here because this file owns every producer of one;
 * `ConfirmOptions.restoreFocusTo` and `DialogFrame`'s prop are the consumers.
 */
export type FocusAnchor = () => HTMLElement | null | undefined;

/**
 * Whether a press came from a key, a voice command or a switch tool — `detail`
 * is 0 for all three, and non-zero for a pointer. Gates every handoff that
 * moves focus somewhere **new**; `code/UI_PATTERNS.md` § Focus Handoff When a
 * Control Removes Itself argues why a pointer user gains nothing from the move
 * and pays a scroll for it.
 */
export const isKeyboardActivation = (event: { detail: number }): boolean => event.detail === 0;

/** `focusIfPossible`'s refusal test, for a cascade that must pick before focusing. */
const canTakeFocus = (node: HTMLElement | null | undefined): node is HTMLElement =>
  !!node &&
  node.isConnected &&
  !(node as HTMLButtonElement).disabled &&
  node.getAttribute('aria-disabled') !== 'true';

/**
 * Focus `node`, reporting whether it actually took. Callers try anchors in
 * order and stop at the first `true`, so a refusal has to be honest.
 *
 * ⚠️ Both disabled spellings. `Button` renders `aria-disabled` instead of
 * `disabled` whenever it has something to announce, and refuses the activation
 * itself — so a natively-enabled node can still be a control that does nothing.
 *
 * ⚠️ `isConnected`, because a caller may be holding a node captured earlier.
 * `DialogFrame` captures the opener when the dialog opens and restores it when
 * it closes, and the opener is routinely gone by then — a row-level Delete
 * button whose row the confirmed action removed.
 */
export const focusIfPossible = (node: HTMLElement | null | undefined): boolean => {
  if (!canTakeFocus(node)) return false;
  node.focus();
  return document.activeElement === node;
};

/**
 * An anchor that resolves an element id at close time. The indirection is the
 * point: the naming caller and the dialog that honours it are in different
 * subtrees, and on the far side of a serializing boundary, so only an address
 * can make the crossing.
 *
 * The one `getElementById` in this file — every rung below is built from it, so
 * a rule the resolve step grows (a cast, a shadow-root lookup) lands once.
 */
export const anchorById =
  (id: string): FocusAnchor =>
  () =>
    document.getElementById(id);

/** The library's two lower rungs, named so the cascade below reads as one. */
const libraryEmptyCtaAnchor = anchorById(LIBRARY_EMPTY_CTA_ANCHOR_ID);
const libraryHeadingAnchor = anchorById(LIBRARY_HEADING_ANCHOR_ID);

/**
 * `[attr="listId"]`, with the value escaped: a custom section's id comes from
 * imported JSON, and a `"` in it would make `querySelector` throw.
 */
const listSelector = (attr: string, listId: EntryListId) =>
  `[${attr}="${listId.replace(/["\\]/g, '\\$&')}"]`;

/**
 * The enrolled control at `index` within `listId`, clamped so deleting the last
 * entry offers the one before it. `null` once the list is empty, which is what
 * hands each cascade below to its own final rung.
 */
const entryDeleteControl = (listId: EntryListId, index: number): HTMLElement | null => {
  const controls = [
    ...document.querySelectorAll<HTMLElement>(listSelector(ENTRY_DELETE_ATTR, listId)),
  ];
  return controls[Math.min(index, controls.length - 1)] ?? null;
};

/**
 * Where focus goes when a confirmed delete removes the control that asked for
 * it: the same control on the entry that took the deleted one's place, then the
 * section heading. The focus-handoff cascade, reached through a dialog instead of a
 * proposal row — `code/UI_PATTERNS.md` § Focus Handoff When a Control Removes
 * Itself argues why the anchor is the next thing the user would do.
 *
 * Returns a getter, not an element: the answer only exists once the entry is
 * gone, which is after the dialog has closed.
 *
 * `listId` scopes the query, so a second list on screen cannot be picked from.
 */
export const entryDeleteAnchor =
  (listId: EntryListId, index: number): FocusAnchor =>
  () =>
    entryDeleteControl(listId, index) ?? sectionHeadingAnchor();

const TABBABLE_SELECTOR =
  'a[href], button, input:not([type="hidden"]), select, textarea, summary, [tabindex], [contenteditable="true"]';

/** Controls under `root` that Tab would stop on, in DOM order (positive `tabindex` ignored). */
export const tabbablesIn = (root: ParentNode): HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)].filter(
    (node) =>
      node.tabIndex >= 0 &&
      !(node as HTMLButtonElement).disabled &&
      !node.closest('[inert], [hidden]') &&
      (typeof node.checkVisibility !== 'function' ||
        node.checkVisibility({ visibilityProperty: true })),
  );

/**
 * The first control, in tab order, of the first open entry in `listId` — where
 * the "add first entry" card sends focus once the new entry replaces it.
 * New entries are prepended open, so the first open panel is the new one. Falls
 * back to that entry's delete control, then the section heading.
 */
export const firstEntryFieldAnchor =
  (listId: EntryListId): FocusAnchor =>
  () => {
    const fields = document.querySelector(listSelector(ENTRY_FIELDS_ATTR, listId));
    const first = fields ? tabbablesIn(fields).find(canTakeFocus) : undefined;
    return first ?? entryDeleteControl(listId, 0) ?? sectionHeadingAnchor();
  };

/**
 * The same cascade for the CV library, whose lower rungs are different: the
 * editor rail's heading is not mounted on `/cvs`, so `entryDeleteAnchor` would
 * run out exactly when the last version is deleted.
 *
 * ⚠️ Three rungs, because the library has **two** empties. Deleting the last row
 * of a filtered view leaves `VersionTable`'s no-results panel; deleting the last
 * row of the library leaves `LibraryNoVersionsState`. Only the page's own
 * heading outlives both, so it is the terminal rung and the CTA the middle one.
 * The two-rung version of this shipped with the filtered branch uncovered.
 */
export const cvLibraryDeleteAnchor =
  (index: number): FocusAnchor =>
  () =>
    entryDeleteControl(CV_LIBRARY_LIST_ID, index) ??
    libraryEmptyCtaAnchor() ??
    libraryHeadingAnchor();

/**
 * The open section's heading — the last rung of the focus-handoff cascade, and the anchor
 * for a control that clears the whole surface it lives on (the pending bar
 * returns `null` once its work is gone, so the button that emptied it unmounts
 * itself). Always on screen: the rail mounts exactly one `page` section.
 */
export const sectionHeadingAnchor = anchorById(SECTION_HEADING_ANCHOR_ID);

const composerRunAnchor = anchorById(COMPOSER_RUN_ANCHOR_ID);
const reviewNextAnchor = anchorById(REVIEW_NEXT_ANCHOR_ID);

/**
 * Where the AI dialog sends focus when its opener is gone: the composer's run
 * button unmounts for the length of the run, and a successful run hides the
 * whole band behind the pending bar. The run button if it is back, then
 * the pending bar's Next section, then the section heading — the first that can
 * take focus, since `DialogFrame` tries the anchor once.
 */
export const aiDialogCloseAnchor: FocusAnchor = () =>
  [composerRunAnchor(), reviewNextAnchor(), sectionHeadingAnchor()].find(canTakeFocus);

/**
 * The control Tab would reach after `node` if `skip` were not in the document —
 * where focus leaves a portalled surface that logically sits beside `node`.
 * Searched within the dialog holding `node`, if any, and never behind
 * `aria-hidden`, so it cannot land on a control a modal has hidden.
 */
export const nextTabbableAfter = (
  node: HTMLElement,
  skip: HTMLElement | null,
): HTMLElement | null =>
  tabbablesIn(node.closest('[role="dialog"], [role="alertdialog"]') ?? document).find(
    (candidate) =>
      !skip?.contains(candidate) &&
      !node.contains(candidate) &&
      !candidate.closest('[aria-hidden="true"]') &&
      node.compareDocumentPosition(candidate) & Node.DOCUMENT_POSITION_FOLLOWING,
  ) ?? null;
