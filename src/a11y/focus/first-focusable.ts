import { FOCUSABLE } from './focusable-selector'
import { isTabbable } from './is-tabbable'

/**
 * Find the first tabbable descendant of `root` in DOM order.
 *
 * @param root - Container to search.
 * @returns The first tabbable element, or `undefined` when none exists.
 */
export const firstFocusable = (root: ParentNode): HTMLElement | undefined =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].find(isTabbable)
