import { advance } from './advance'
import type { DragState } from './drag-state'
import type { MoveInput } from './move-input'

/**
 * Track pointer movement. A move while not dragging is a no-op.
 *
 * @param s - Current state.
 * @param input - Live pointer and the tap/drag threshold.
 * @returns The next drag state.
 */
export const onMove = (s: DragState, input: MoveInput): DragState => {
  switch (s.dragging) {
    case true:
      return advance(s, input)
    case false:
      return s
  }
}
