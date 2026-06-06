import { saveCorner } from '../core/persist'
import { branch } from '../fp/branch'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { applyAria } from './aria'
import { addGlobalListeners, removeGlobalListeners } from './global-listeners'
import { focusMenu, focusTrigger } from './focus'
import { positionMenu } from './position'
import { EVENT_CORNER, EVENT_TOGGLE } from '../test-ids'

/** Toggle open state through a cancelable `flying-menu-toggle` event. */
export const setOpen = (host: FlyingMenu, next: boolean): void => {
  when(next !== host.open, () => {
    const allowed = host.dispatchEvent(
      new CustomEvent(EVENT_TOGGLE, {
        detail: { open: next },
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
    when(allowed, () => {
      host.open = next
    })
  })
}

const onClosed = (host: FlyingMenu): void => {
  removeGlobalListeners(host)
  when(host._ctl.restoreFocusOnClose, () => {
    host._ctl.restoreFocusOnClose = false
    focusTrigger(host)
  })
}

/** Open/close side effects: ARIA, custom state, positioning, listeners, focus. */
export const onOpenChanged = (host: FlyingMenu): void => {
  applyAria(host)
  branch(
    host.open,
    () => host._ctl.internals.states.add('open'),
    () => host._ctl.internals.states.delete('open')
  )
  branch(
    host.open,
    () => {
      positionMenu(host)
      addGlobalListeners(host)
      focusMenu(host)
    },
    () => onClosed(host)
  )
}

/** Re-anchor the menu, announce the corner, and persist it. */
export const cornerChanged = (host: FlyingMenu): void => {
  when(host.open, () => positionMenu(host))
  host.dispatchEvent(
    new CustomEvent(EVENT_CORNER, {
      detail: { corner: host.corner },
      bubbles: true,
      composed: true,
    })
  )
  when(!host.noPersist, () => saveCorner(host._ctl.storage, host.storageKey, host.corner))
}
