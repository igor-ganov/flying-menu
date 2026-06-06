import { loadCorner } from '../core/persist'
import type { PropertyValues } from 'lit'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { applyAria } from './aria'
import { removeGlobalListeners } from './global-listeners'
import { cornerChanged, onOpenChanged } from './open'
import { positionTrigger } from './position'

/** Restore the persisted corner and start listening for viewport changes. */
export const connect = (host: FlyingMenu): void => {
  when(!host._ctl.cornerInitialized && !host.noPersist, () => {
    host.corner = loadCorner(host._ctl.storage, host.storageKey)
  })
  host._ctl.cornerInitialized = true
  globalThis.addEventListener('resize', host._ctl.onResize)
}

export const disconnect = (host: FlyingMenu): void => {
  globalThis.removeEventListener('resize', host._ctl.onResize)
  removeGlobalListeners(host)
}

/** Position the trigger and wire ARIA after the first render. */
export const firstUpdated = (host: FlyingMenu): void => {
  positionTrigger(host)
  applyAria(host)
}

/** React to reactive property changes. */
export const onUpdated = (
  host: FlyingMenu,
  changed: PropertyValues<FlyingMenu>
): void => {
  when(changed.has('corner') || changed.has('margin'), () => {
    positionTrigger(host)
    when(changed.has('corner'), () => cornerChanged(host))
  })
  when(changed.has('open'), () => onOpenChanged(host))
}
