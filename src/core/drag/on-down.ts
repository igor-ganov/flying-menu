import type { Point } from '../types'
import type { DragState } from './drag-state'

/** Input captured when a drag begins. */
export interface DownInput {
  readonly pointer: Point
  readonly origin: Point
}

/**
 * Begin a drag. A pointer-down always resets the gesture, so the previous state
 * is irrelevant.
 *
 * @param _s - Previous state (ignored).
 * @param input - Pointer position and the trigger's current top-left.
 * @returns The active drag state.
 */
export const onDown = (_s: DragState, input: DownInput): DragState => ({
  dragging: true,
  moved: false,
  start: input.pointer,
  origin: input.origin,
  current: input.origin,
})
