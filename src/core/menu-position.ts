import { clamp } from '../fp/clamp'
import { fromBoolean } from '../fp/from-boolean'
import type { Corner, Point, Rect, Size, Viewport } from './types'

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
 * and clamped within the viewport margin. Derived from measured geometry, so the
 * result is correct for any trigger/menu content size (US-4).
 *
 * @param args - Corner, measured rects/sizes, gap, margin and viewport.
 * @returns The clamped top-left position for the menu in viewport coordinates.
 */
export const menuPosition = (args: MenuPositionArgs): Point => {
  const { corner, triggerRect, menuSize, gap, margin, vp } = args
  const anchoredX = fromBoolean(
    triggerRect.x + triggerRect.width - menuSize.width,
    triggerRect.x
  )(corner.endsWith('right'))
  const anchoredY = fromBoolean(
    triggerRect.y - gap - menuSize.height,
    triggerRect.y + triggerRect.height + gap
  )(corner.startsWith('bottom'))
  return {
    x: clamp(anchoredX, margin, vp.width - menuSize.width - margin),
    y: clamp(anchoredY, margin, vp.height - menuSize.height - margin),
  }
}
