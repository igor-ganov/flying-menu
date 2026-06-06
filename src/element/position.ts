import { cornerPosition } from '../core/corner-position'
import { menuPosition } from '../core/menu-position'
import type { Point, Rect, Viewport } from '../core/types'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { toSize, viewport } from './viewport'

/** Place the trigger at `point`, or at its resting corner when none is given. */
export const positionTrigger = (host: FlyingMenu, point?: Point): void => {
  const el = host._triggerEl
  when(el != null, () => {
    const pos =
      point ??
      cornerPosition(host.corner, toSize(el.getBoundingClientRect()), host.margin, viewport())
    el.style.left = `${pos.x}px`
    el.style.top = `${pos.y}px`
  })
}

/** The trigger's logical resting rect: measured size at its corner anchor. */
const anchorRect = (host: FlyingMenu, vp: Viewport): Rect => {
  const size = toSize(host._triggerEl.getBoundingClientRect())
  const at = cornerPosition(host.corner, size, host.margin, vp)
  return { x: at.x, y: at.y, width: size.width, height: size.height }
}

/** Anchor the menu to the trigger's resting position, clamped to the viewport. */
export const positionMenu = (host: FlyingMenu): void => {
  const menuEl = host._menuEl
  when(menuEl != null && host._triggerEl != null, () => {
    const vp = viewport()
    const pos = menuPosition({
      corner: host.corner,
      triggerRect: anchorRect(host, vp),
      menuSize: toSize(menuEl.getBoundingClientRect()),
      gap: host.gap,
      margin: host.margin,
      vp,
    })
    menuEl.style.left = `${pos.x}px`
    menuEl.style.top = `${pos.y}px`
  })
}
