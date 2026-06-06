import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { positionMenu, positionTrigger } from './position'

/** Re-anchor on viewport change (always-on, open or not). */
export const resize = (host: FlyingMenu): void => {
  positionTrigger(host)
  when(host.open, () => positionMenu(host))
}

/** Close when a pointer interaction lands outside the component. */
export const docPointerDown = (host: FlyingMenu, e: Event): void => {
  when(!e.composedPath().includes(host), () => host.closeMenu())
}

/** Escape closes the menu and restores focus to the trigger. */
export const docKeydown = (host: FlyingMenu, e: KeyboardEvent): void => {
  when(e.key === 'Escape', () => {
    host._ctl.restoreFocusOnClose = true
    host.closeMenu()
  })
}

/** Dismissal listeners are open-only (added on open, removed on close). */
export const addGlobalListeners = (host: FlyingMenu): void => {
  globalThis.addEventListener('pointerdown', host._ctl.onDocPointerDown, true)
  globalThis.addEventListener('keydown', host._ctl.onDocKeydown)
}

export const removeGlobalListeners = (host: FlyingMenu): void => {
  globalThis.removeEventListener('pointerdown', host._ctl.onDocPointerDown, true)
  globalThis.removeEventListener('keydown', host._ctl.onDocKeydown)
}
