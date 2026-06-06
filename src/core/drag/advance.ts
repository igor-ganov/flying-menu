import type { DragState } from './drag-state'
import type { MoveInput } from './move-input'

/**
 * Advance an active drag: recompute `current` from the pointer delta and flip
 * `moved` once the Manhattan distance crosses the threshold.
 *
 * @param s - Current (dragging) state.
 * @param input - Live pointer and the tap/drag threshold.
 * @returns The next drag state.
 */
export const advance = (s: DragState, input: MoveInput): DragState => {
  const dx = input.pointer.x - s.start.x
  const dy = input.pointer.y - s.start.y
  const moved = s.moved || Math.abs(dx) + Math.abs(dy) > input.threshold
  return { ...s, moved, current: { x: s.origin.x + dx, y: s.origin.y + dy } }
}
