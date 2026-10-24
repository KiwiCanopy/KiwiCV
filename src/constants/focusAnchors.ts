/**
 * Every address a focus handoff aims at, when the control the user pressed
 * removes itself from the DOM — the AI proposal flow and the dialog
 * flow both land here. Addresses rather than refs, because a handoff
 * crosses subtrees: `PendingProposalsBar` sits above the editor pane and the
 * heading above the form.
 *
 * The cascades and their rungs: `code/UI_PATTERNS.md` § Focus Handoff When a
 * Control Removes Itself. The resolvers are `src/utils/focus.ts`.
 */
// A runtime edge, so import the leaf directly, never the
// `@/utils/layoutMetadata` barrel, which can close a cycle (see `themeIds.ts`).
import { ALL_EMPTY_ITEM_KEYS } from '@/utils/layout/constants';
import type { CustomSectionToken } from '@/utils/layout/customSections';

/** Singletons, pinned by `tests/lint/section-page-anchor.test.mjs`. */
export const REVIEW_NEXT_ANCHOR_ID = 'ai-review-next';
export const SECTION_HEADING_ANCHOR_ID = 'editor-section-heading';
/**
 * The composer's run button. Singleton because `DashboardLayout` mounts one
 * `AIComposerBar`, and only its desktop shape renders the button.
 */
export const COMPOSER_RUN_ANCHOR_ID = 'ai-composer-run';
/** The composer's job-ad / instructions entry button, the run's stand-in while collapsed. */
export const COMPOSER_ENTRY_ANCHOR_ID = 'ai-composer-entry';

/**
 * Marks the control through which one list entry's delete is **reached**,
 * **valued with the list it belongs to** — read positionally within that list,
 * so the entry taking the deleted one's place offers the same control.
 *
 * ⚠️ The value is what makes this safe. Unvalued and queried document-wide it
 * depended on "one entry list is mounted at a time", which is a convention no
 * type holds: two lists on screen sent focus to a row of the *wrong* list,
 * silently (measured in review).
 *
 * ⚠️ "Reached", not "performs". Usually the two are the same control — the row's
 * Delete button. Where Delete sits behind a disclosure, the disclosure carries
 * this instead: the CV library's Delete lives inside a `Popover` that is
 * unmounted while closed, so marking it would enrol a control the query can
 * never find. The marked control must outlive the entry's removal —
 * driven per list by `entryListInventory.test.tsx`.
 */
export const ENTRY_DELETE_ATTR = 'data-entry-delete';

/**
 * Marks an open entry's editable fields, valued with its list like
 * `ENTRY_DELETE_ATTR`. Where "add first entry" sends focus. Carriers
 * pinned by `tests/lint/entry-delete-anchor.test.mjs`.
 */
export const ENTRY_FIELDS_ATTR = 'data-entry-fields';

/**
 * The CV library's rows. Named here rather than spelled twice, because the value
 * has to agree between the control that renders it and the delete that resolves
 * it, and a disagreement is silent.
 */
export const CV_LIBRARY_LIST_ID = 'cv-library';

/**
 * Every enumerable list `ENTRY_DELETE_ATTR` may be valued with — the item-shaped
 * sections plus the CV library. Spread from `ALL_EMPTY_ITEM_KEYS`, which
 * `utils/layout/constants.ts` owns, so a thirteenth section lands here
 * with no edit. `entryListInventory.test.tsx` renders every member's surface
 * and fails for one no control marks.
 */
export const ALL_ENTRY_LIST_IDS = [...ALL_EMPTY_ITEM_KEYS, CV_LIBRARY_LIST_ID] as const;

/**
 * Typed at `entryDeleteAnchor` and at `AccordionItemProps.entryListId`, at the
 * definitions, so a misspelling or a rename at either end is a build error.
 *
 * ⚠️ It does NOT bind the two surfaces that spell `data-entry-delete=`
 * themselves — a `data-*` JSX attribute is not typechecked at all. Those read
 * `PROFILES_LIST_ID` / `CV_LIBRARY_LIST_ID` at both ends instead, which is the
 * rule for when a list needs a named constant: the raw-attribute end has one,
 * the `entryListId` end does not need one.
 *
 * A custom section's entry list is keyed by its layout token — a template
 * family, so it has no inventory entry and the render test covers it by fixture.
 */
export type EntryListId = (typeof ALL_ENTRY_LIST_IDS)[number] | CustomSectionToken;

/** Marks `CustomSectionForm`'s title input, which "Add section" focuses. */
export const CUSTOM_SECTION_TITLE_ATTR = 'data-custom-section-title';

/**
 * `basics.profiles`, which renders its own row rather than an `AccordionItem`
 * and so spells the attribute itself. `satisfies` because nothing else checks
 * it: it is a raw `data-*` value at one end, and its only typed end is a call
 * site that could be rerouted away.
 */
export const PROFILES_LIST_ID = 'profiles' satisfies EntryListId;

/**
 * The type-level pin `EntryListId` needs, for `_AnchorIdIsNotWidened`'s reason
 * below: widening it back to `string` is a deletion, not an addition, and no
 * source scan can see one.
 */
export type _EntryListIdIsNotWidened<
  Widened extends false = string extends EntryListId ? true : false,
> = Widened;

/**
 * The library's middle rung: the empty state's call to action, which replaces
 * the table once the final version is deleted — the next thing that user would
 * do.
 *
 * ⚠️ It is NOT the terminal rung, and reading it as one is how a first fix
 * shipped a hole. `CvLibraryPage` gates this panel on the **unfiltered** version
 * count, so deleting the last row that matches an active filter leaves
 * `VersionTable`'s own no-results panel instead and this id never mounts.
 */
export const LIBRARY_EMPTY_CTA_ANCHOR_ID = 'cv-library-empty-cta';

/**
 * The library's terminal rung: the page's own `h1`, the one element that
 * outlives every branch below it — the table, the filtered no-results panel and
 * the empty-library panel alike.
 *
 * ⚠️ `SECTION_HEADING_ANCHOR_ID` cannot serve, being the editor rail's heading
 * and not mounted on `/cvs` at all. This is its analogue for this surface, and
 * it takes the same lighter focus mark: a landing target is not a control
 *
 */
export const LIBRARY_HEADING_ANCHOR_ID = 'cv-library-heading';

/**
 * The editor header's Export button — the control that starts the export flow,
 * and therefore the anchor for a dialog opened as the side effect of the export
 * dialog closing.
 */
export const EXPORT_TRIGGER_ANCHOR_ID = 'export-trigger';

/**
 * The anchors nameable through `useFlowStore` — an **id**, not a getter, because
 * that slice crosses a serializing boundary (`useFlowStore`'s `persist` call
 * states why).
 *
 * ⚠️ A union, not `string`. A past defect was the same mistake made one layer down: an id
 * typed `string` and spelled at both ends is a silent mismatch.
 *
 * ⚠️ Declared as an array first, the `ALL_SECTION_KEYS` shape, so the inventory
 * is enumerable at runtime. `tests/lint/flow-focus-anchor.test.mjs` reads it to
 * check every member is actually rendered — a union written straight as a type
 * can hide a member behind a one-hop alias, which was measured passing that
 * guard while the anchor resolved to `null`.
 */
export const ALL_FLOW_FOCUS_ANCHOR_IDS = [EXPORT_TRIGGER_ANCHOR_ID] as const;

export type FlowFocusAnchorId = (typeof ALL_FLOW_FOCUS_ANCHOR_IDS)[number];

/**
 * ⚠️ Two type-level pins, because the failures they catch are **type identity**
 * and no source scan can see them (both measured green in review):
 *
 * - dropping `as const` above collapses the union to `string` — that mistake
 *   reintroduced by deleting two words, with `const x: FlowFocusAnchorId =
 *   'not-an-anchor'` compiling happily;
 * - writing `= (typeof …)[number] | 'settings-trigger'` matched the lint test's
 *   `assert.match` — its pattern is unterminated — and added a member nothing
 *   renders.
 *
 * Same idiom as `_ArraySectionKeysCoverSections`: a default type argument that
 * violates its own constraint is the error.
 */
export type _AnchorIdIsNotWidened<
  Widened extends false = string extends FlowFocusAnchorId ? true : false,
> = Widened;

/** Nothing in the union that the inventory does not list. */
export type _AnchorIdsAreInventoried<
  Extra extends never = Exclude<FlowFocusAnchorId, (typeof ALL_FLOW_FOCUS_ANCHOR_IDS)[number]>,
> = Extra;
