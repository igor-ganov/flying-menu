import { idle, type DragState } from '../core/drag'
import { localStoragePort, type StoragePort } from '../core/persist'
import type { FlyingMenu } from '../flying-menu'
import { docKeydown, docPointerDown, resize } from './global-listeners'

/** Non-reactive internal state and stable listener references for the element. */
export interface Controller {
  drag: DragState
  readonly internals: ElementInternals
  readonly storage: StoragePort
  cornerInitialized: boolean
  restoreFocusOnClose: boolean
  readonly onResize: () => void
  readonly onDocPointerDown: (e: Event) => void
  readonly onDocKeydown: (e: KeyboardEvent) => void
}

/**
 * Build the element's controller, capturing stable bound listeners (needed for
 * add/removeEventListener) and the single `ElementInternals` instance.
 *
 * @param host - The owning element.
 * @returns The controller state.
 */
export const createController = (host: FlyingMenu): Controller => ({
  drag: idle,
  internals: host.attachInternals(),
  storage: localStoragePort(),
  cornerInitialized: false,
  restoreFocusOnClose: false,
  onResize: () => resize(host),
  onDocPointerDown: (e) => docPointerDown(host, e),
  onDocKeydown: (e) => docKeydown(host, e),
})
