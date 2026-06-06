import type { Point } from '../types'

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
