import { FOCUSABLE } from './focusable-selector'
import { isFocusable } from './is-focusable'
import { isTabbable } from './is-tabbable'

/** The root element itself, kept only when it is focusable. */
const selfIfFocusable = (root: Element): readonly HTMLElement[] =>
  [root].filter(
    (el): el is HTMLElement => el instanceof HTMLElement && isFocusable(el)
  )

/** Tabbable descendants of a root, in DOM order. */
const descendants = (root: Element): readonly HTMLElement[] =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(isTabbable)

/**
 * Collect every tabbable element among a list of roots in DOM order, checking
 * each root itself before its descendants. Drives keyboard navigation through
 * slotted (light-DOM) menu content.
 *
 * @param roots - Candidate root elements (e.g. a slot's assigned elements).
 * @returns Tabbable elements in order (possibly empty).
 */
export const focusablesAmong = (
  roots: readonly Element[]
): readonly HTMLElement[] =>
  roots.flatMap((root) => [...selfIfFocusable(root), ...descendants(root)])
