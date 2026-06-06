import type { Point } from './types'

/**
 * Immutable state of a pointer drag gesture. The trigger's live top-left while
 * dragging is `current`; `moved` flips once the gesture passes the threshold and
 * decides tap-vs-drag at release.
 */
export interface DragState {
  readonly dragging: boolean
  readonly moved: boolean
  readonly start: Point
  readonly origin: Point
  readonly current: Point
}

const ZERO: Point = { x: 0, y: 0 }

/** Initial, inactive drag state. */
export const idle: DragState = {
  dragging: false,
  moved: false,
  start: ZERO,
  origin: ZERO,
  current: ZERO,
}

/**
 * Begin a drag.
 * @param _s - Previous state (ignored; a down always resets the gesture).
 * @param input - Pointer position and the trigger's current top-left.
 */
export const onDown = (
  _s: DragState,
  input: { readonly pointer: Point; readonly origin: Point }
): DragState => ({
  dragging: true,
  moved: false,
  start: input.pointer,
  origin: input.origin,
  current: input.origin,
})

/**
 * Track pointer movement. No-op when not dragging.
 * @param s - Current state.
 * @param input - Live pointer and the tap/drag threshold.
 */
export const onMove = (
  s: DragState,
  input: { readonly pointer: Point; readonly threshold: number }
): DragState => {
  if (!s.dragging) return s
  const dx = input.pointer.x - s.start.x
  const dy = input.pointer.y - s.start.y
  const moved = s.moved || Math.abs(dx) + Math.abs(dy) > input.threshold
  return { ...s, moved, current: { x: s.origin.x + dx, y: s.origin.y + dy } }
}

/**
 * End the drag.
 * @param s - Current state.
 */
export const onUp = (s: DragState): DragState => ({ ...s, dragging: false })

/**
 * Whether the completed gesture should count as a tap (no significant movement).
 * @param s - State at or after release.
 */
export const wasTap = (s: DragState): boolean => !s.moved
