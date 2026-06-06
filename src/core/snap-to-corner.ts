import type { Corner, Point, Viewport } from './types'

/**
 * Determine the nearest screen corner to a point using a half-plane test on
 * each axis. The dividing lines are inclusive toward the top-left half, so the
 * exact center resolves to `top-left`.
 *
 * @param point - Pointer position in viewport coordinates.
 * @param vp - Viewport extent.
 * @returns The nearest corner.
 */
export const snapToCorner = (point: Point, vp: Viewport): Corner => {
  const row = point.y > vp.height / 2 ? 'bottom' : 'top'
  const col = point.x > vp.width / 2 ? 'right' : 'left'
  return `${row}-${col}`
}
