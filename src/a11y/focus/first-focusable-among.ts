import { focusablesAmong } from './focusables-among'

/**
 * Find the first tabbable element among a list of roots.
 *
 * @param roots - Candidate root elements (e.g. a slot's assigned elements).
 * @returns The first tabbable element, or `undefined` when none exists.
 */
export const firstFocusableAmong = (
  roots: readonly Element[]
): HTMLElement | undefined => focusablesAmong(roots)[0]
