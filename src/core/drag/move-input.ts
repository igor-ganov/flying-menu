import type { Point } from '../types'

/** Input for a pointer move during a drag. */
export interface MoveInput {
  readonly pointer: Point
  readonly threshold: number
}
