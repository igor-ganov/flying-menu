import { FOCUSABLE } from './focusable-selector'
import { isTabbable } from './is-tabbable'

/**
 * Whether an element is itself tabbable (matches the focusable selector and is
 * not opted out).
 *
 * @param el - Element to test.
 * @returns `true` when the element can receive sequential focus.
 */
export const isFocusable = (el: HTMLElement): boolean =>
  el.matches(FOCUSABLE) && isTabbable(el)
