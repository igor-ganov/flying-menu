import { onDown, onMove, onUp, wasTap } from '../core/drag'
import { snapToCorner } from '../core/snap-to-corner'
import type { Corner } from '../core/types'
import { branch } from '../fp/branch'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { positionTrigger } from './position'
import { viewport } from './viewport'

const settleCorner = (host: FlyingMenu, next: Corner): void => {
  branch(
    next === host.corner,
    () => positionTrigger(host), // same corner: re-anchor immediately
    () => {
      host.corner = next // a corner change re-anchors via updated()
    }
  )
}

const finishDrag = (host: FlyingMenu, e: PointerEvent): void => {
  const finished = onUp(host._ctl.drag)
  host._ctl.drag = finished
  host._dragging = false
  when(host._triggerEl.hasPointerCapture(e.pointerId), () =>
    host._triggerEl.releasePointerCapture(e.pointerId)
  )
  branch(
    wasTap(finished),
    () => {
      positionTrigger(host) // undo any sub-threshold offset
      host.toggle()
    },
    () => settleCorner(host, snapToCorner({ x: e.clientX, y: e.clientY }, viewport()))
  )
}

export const pointerDown = (host: FlyingMenu, e: PointerEvent): void => {
  when(e.button === 0, () => {
    const rect = host._triggerEl.getBoundingClientRect()
    host._ctl.drag = onDown(host._ctl.drag, {
      pointer: { x: e.clientX, y: e.clientY },
      origin: { x: rect.x, y: rect.y },
    })
    host._dragging = true
    host._triggerEl.setPointerCapture(e.pointerId)
  })
}

export const pointerMove = (host: FlyingMenu, e: PointerEvent): void => {
  when(host._ctl.drag.dragging, () => {
    host._ctl.drag = onMove(host._ctl.drag, {
      pointer: { x: e.clientX, y: e.clientY },
      threshold: host.dragThreshold,
    })
    positionTrigger(host, host._ctl.drag.current)
  })
}

export const pointerUp = (host: FlyingMenu, e: PointerEvent): void => {
  when(host._ctl.drag.dragging, () => finishDrag(host, e))
}
