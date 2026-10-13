// ⚠️ `import type`, not `import { type … }`. Under `verbatimModuleSyntax`
// (`tsconfig.app.json`) the second form emits a **side-effect import**, so the
// first draft of this file gave `types.ts` real runtime edges to four slices —
// each of which imports `ResumeStore` back — i.e. four new runtime import
// cycles from a file that declares nothing but types. Measured: 33 of 50 chunk
// filenames moved and five chunk bodies were reordered. With `import type` the
// build is byte-identical to the parent's.
import type { AISlice } from './slices/ai/types';
import type { CustomSectionsSlice } from './slices/customSectionsSlice';
import type { DataSlice } from './slices/dataSlice';
import type { LayoutSlice } from './slices/layoutSlice';
import type { StatusSlice } from './slices/statusSlice';
import type { SyncSlice } from './slices/syncSlice';
import type { VisibilitySlice } from './slices/visibilitySlice';

/**
 * The surface `useResumeStore` exposes — the union of its six slices and
 * nothing else.
 *
 * ⚠️ **It used to restate every slice member instead of extending, and that is
 * the repo's dominant bug shape on a new axis.** Every action was
 * declared twice with nothing checking the two agreed, so a slice-only addition
 * was invisible to callers and a slice-only *deletion* left the action running.
 * Measured before the fix: restoring `updateSection` to `dataSlice.ts` alone —
 * its declaration and its implementation, without touching this file — gave
 * `tsc -b --force` exit 0 with the suite green, putting the deleted action
 * back into the runtime store. The deletion's own `@ts-expect-error` pin could not see
 * it, because that pin reads `useResumeStore.getState()`, i.e. this copy. It is
 * also why each of the two deletions had to edit two files to land.
 *
 * ⚠️ **The body must stay empty**, and the guard below covers less of that than
 * an earlier draft of this comment claimed. Measured, one mutation per row:
 *
 * ```
 * foo: string;                    TS2344 (guard) and TS2345 at useResumeStore.ts:45
 * foo?: string;                   TS2344 only          <- the guard's own contribution
 * [k: string]: unknown;           TS2344 only          <- ditto
 * declare module … { … }          TS2344
 * resetSync: (x: number) => void; TS2430 from `extends`
 * resetSync: () => void;          NOTHING — it adds no key, so `Own` stays never
 * ```
 *
 * The draft said a redeclaration that *agrees* "compiles fine and drifts later"
 * and that the alias holds it. Both halves were wrong: the alias cannot see it
 * (it is computed from `keyof`), and it cannot drift silently either — the
 * moment the slice and the copy disagree, `extends` gives `TS2430`. So the
 * guard's real contribution is an **optional** member or an **index signature**
 * that no slice owns, which nothing else catches.
 *
 * ⚠️ **Making the hazard unexpressible is available and is declined
 * deliberately.** `type ResumeStore = AISlice & DataSlice & …` has no body and
 * cannot be augmented, so both hazards vanish — and it costs `TS2320`: with an
 * intersection, a genuine cross-slice conflict produces **no error here at all**
 * and surfaces as an unrelated assignability failure somewhere downstream.
 * Measured on both shapes. The repo's default is unexpressible;
 * this is the exception, and the reason is that the conflict error is worth more
 * than the augmentation hole.
 *
 * ⚠️ **The six-slice list appears twice in this file and that is NOT a copy to
 * delete.** The explicit `extends A, B, C, D, E, F` is what produces `TS2320`;
 * collapsing it to `extends AllSlices` where `AllSlices` is an intersection
 * loses the check entirely (measured — zero errors). Deriving it from
 * `ReturnType<typeof createDataSlice>` is worse: those creators are annotated
 * with `ResumeStore`, so the reference is circular and TypeScript silently
 * resolves it to an empty type, dropping every member.
 *
 * ⚠️ The merge was not purely mechanical: `toggleSectionVisibility`'s `items`
 * was **required** here and **optional** in the slice, and the two disagree
 * about behaviour rather than about strictness. Omitting `items` when unhiding a
 * section leaves that section's individually-hidden item ids in
 * `meta.content.hiddenIds`, so the section reappears with some of its entries
 * still missing. All **six** production call sites pass the array — two layout
 * editors and four editor forms; both reviewer passes counted six where this
 * said five — so required is the contract they were written against and is the
 * one kept.
 */
export interface ResumeStore
  extends
    AISlice,
    CustomSectionsSlice,
    DataSlice,
    LayoutSlice,
    StatusSlice,
    SyncSlice,
    VisibilitySlice {}

/**
 * Nothing may be declared on `ResumeStore` that no slice owns.
 *
 * An optional member or an index signature added to the interface body above is
 * an action with no implementation, or a second declaration of something a slice
 * owns. Either way it belongs in a slice. Adding one makes `Own` a non-`never`
 * key union and this alias `TS2344`.
 *
 * ⚠️ **`string extends keyof ResumeStore` is checked first, and it is not
 * theoretical.** An index signature on *any* slice makes `keyof` of both sides
 * `string | number`, `Exclude` returns `never`, and the guard vacates while
 * reading as green — the same degeneration as an earlier `Record<never, T>` and
 * `string extends Ids`, third time in this repo. Without this arm, an
 * index signature on `SyncSlice` plus an optional ghost member here is `tsc`
 * exit 0.
 */
type Own = string extends keyof ResumeStore
  ? 'A SLICE HAS AN INDEX SIGNATURE, SO THIS GUARD PROVES NOTHING'
  : Exclude<
      keyof ResumeStore,
      keyof (AISlice &
        CustomSectionsSlice &
        DataSlice &
        LayoutSlice &
        StatusSlice &
        SyncSlice &
        VisibilitySlice)
    >;
export type _ResumeStoreAddsNothing<_Check extends never = Own> = never;

/**
 * The positive control. Deleting `_ResumeStoreAddsNothing` or weakening its
 * constraint from `never` to anything wider is otherwise invisible — a guard
 * that has never been seen to fail proves nothing, and this one lives entirely
 * in the type system where a deletion leaves no trace.
 *
 * `TS2578: Unused '@ts-expect-error' directive` here means the constraint no
 * longer rejects a key no slice owns.
 */
// @ts-expect-error a key no slice owns must not satisfy the guard
export type _ResumeStoreGuardControl = _ResumeStoreAddsNothing<'notASliceMember'>;
