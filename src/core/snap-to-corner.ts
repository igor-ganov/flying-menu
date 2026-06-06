import { fromBoolean } from '../fp/from-boolean'
import type { Corner, Point, Viewport } from './types'

const rowOf = fromBoolean<'bottom' | 'top'>('bottom', 'top')
const colOf = fromBoolean<'right' | 'left'>('right', 'left')

/**
 * Determine the nearest screen corner to a point via a half-plane test on each
 * axis. The dividing lines lean toward the top-left half, so the exact center
 * resolves to `top-left`.
 *
 * @param point - Pointer position in viewport coordinates.
 * @param vp - Viewport extent.
 * @returns The nearest corner.
 */
export const snapToCorner = (point: Point, vp: Viewport): Corner =>
  `${rowOf(point.y > vp.height / 2)}-${colOf(point.x > vp.width / 2)}`
