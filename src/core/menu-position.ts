import type { Corner, Point, Rect, Size, Viewport } from './types'

/** Clamp `value` into `[min, max]`; when the span is inverted (content larger than the slot) pin to `min`. */
const clamp = (value: number, min: number, max: number): number =>
  max < min ? min : Math.min(Math.max(value, min), max)

/** Arguments for {@link menuPosition}. */
export interface MenuPositionArgs {
  readonly corner: Corner
  readonly triggerRect: Rect
  readonly menuSize: Size
  readonly gap: number
  readonly margin: number
  readonly vp: Viewport
}

/**
 * Compute the menu wrapper's top-left position, anchored to the trigger's corner
 * and clamped within the viewport margin. Everything is derived from measured
 * geometry, so the result is correct for any trigger/menu content size (US-4).
 *
 * - `*-right` corners align the menu's right edge to the trigger's right edge.
 * - `*-left` corners align the left edges.
 * - `bottom-*` corners open the menu above the trigger; `top-*` open below.
 *
 * @param args - Corner, measured rects/sizes, gap, margin and viewport.
 * @returns The clamped top-left position for the menu in viewport coordinates.
 */
export const menuPosition = (args: MenuPositionArgs): Point => {
  const { corner, triggerRect, menuSize, gap, margin, vp } = args

  const anchoredX = corner.endsWith('right')
    ? triggerRect.x + triggerRect.width - menuSize.width
    : triggerRect.x

  const anchoredY = corner.startsWith('bottom')
    ? triggerRect.y - gap - menuSize.height
    : triggerRect.y + triggerRect.height + gap

  return {
    x: clamp(anchoredX, margin, vp.width - menuSize.width - margin),
    y: clamp(anchoredY, margin, vp.height - menuSize.height - margin),
  }
}
