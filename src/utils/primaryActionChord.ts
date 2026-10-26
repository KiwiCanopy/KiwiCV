import { type KeyboardEvent } from 'react';

/**
 * Cmd/Ctrl+Enter: a dialog's primary action, pressed from a text field
 * (`code/UI_MODALS.md`). Never while an IME is composing or the key repeats.
 */
export const isPrimaryActionChord = (event: KeyboardEvent): boolean =>
  event.key === 'Enter' &&
  (event.metaKey || event.ctrlKey) &&
  !event.repeat &&
  !event.nativeEvent.isComposing;

/** A control that takes typed text, where Cmd/Ctrl+Enter has no meaning of its own. */
export const isTextEntry = (target: EventTarget): boolean =>
  target instanceof HTMLTextAreaElement ||
  (target instanceof HTMLInputElement &&
    ['text', 'url', 'search', 'email', 'tel', 'number'].includes(target.type));
