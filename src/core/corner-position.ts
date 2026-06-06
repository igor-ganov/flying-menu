import type { Corner, Point, Size, Viewport } from './types'

/**
 * Compute the resting top-left pixel position of the trigger for a corner,
 * derived from its **measured** size so the result is correct for any slotted
 * content (not a fixed button dimension).
 *
 * @param corner - Target corner.
 * @param size - Measured trigger size.
 * @param margin - Edge inset in pixels.
 * @param vp - Viewport extent.
 * @returns Top-left position in viewport coordinates.
 */
export const cornerPosition = (
  corner: Corner,
  size: Size,
  margin: number,
  vp: Viewport
): Point => {
  const left = margin
  const top = margin
  const right = vp.width - size.width - margin
  const bottom = vp.height - size.height - margin
  const x = corner.endsWith('right') ? right : left
  const y = corner.startsWith('bottom') ? bottom : top
  return { x, y }
}
