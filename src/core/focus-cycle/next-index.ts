/**
 * Wrap an index by a step within `[0, length)` — the focus-cycle ring math.
 *
 * @param current - Current index (`-1` when focus is outside the ring).
 * @param step - Direction (`+1` forward, `-1` backward).
 * @param length - Number of items (assumed positive).
 * @returns The next index, wrapped.
 */
export const nextIndex = (current: number, step: number, length: number): number =>
  (current + step + length) % length
