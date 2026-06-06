/**
 * Position of the active element within the focus ring, or `-1` when focus is
 * outside it.
 *
 * @param items - The focus ring.
 * @param active - The currently focused element (if any).
 * @returns The index, or `-1`.
 */
export const indexOfActive = (
  items: readonly HTMLElement[],
  active: Element | undefined
): number => items.findIndex((item) => item === active)
