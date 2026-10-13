/**
 * The DOM contract between `DiffDecisionRow`, which writes it, and
 * `useProposalFocusHandoff`, which reads it. Hyphenated JSX
 * attributes are never type-checked, so both sides take the names from here.
 */

/** Which of a row's two buttons was pressed. */
export type DiffAction = 'accept' | 'decline';

/** Spread onto a proposal row's `<li>`. */
export const diffRowProps = { 'data-diff-row': true } as const;

/** Spread onto the button that takes `action`. */
export const diffActionProps = (action: DiffAction) => ({ 'data-diff-action': action }) as const;

export const DIFF_ROW_SELECTOR = '[data-diff-row]';

export const diffActionSelector = (action: DiffAction) => `[data-diff-action="${action}"]`;
