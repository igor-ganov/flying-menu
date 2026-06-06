import { focusablesAmong } from '../a11y/focus'
import { indexOfActive } from '../core/focus-cycle/index-of-active'
import { nextIndex } from '../core/focus-cycle/next-index'
import { tabStep } from '../core/focus-cycle/tab-step'
import { isActivationKey } from '../core/keyboard/is-activation-key'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { assignedElements } from './slots'

/** The deepest focused element, piercing shadow roots. */
const deepActiveElement = (): Element | undefined => {
  let active = globalThis.document?.activeElement ?? undefined
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
  return active ?? undefined
}

const cycleFocus = (host: FlyingMenu, e: KeyboardEvent): void => {
  const items = focusablesAmong(assignedElements(host, 'menu'))
  when(items.length > 0, () => {
    e.preventDefault()
    const current = indexOfActive(items, deepActiveElement())
    items[nextIndex(current, tabStep(e.shiftKey), items.length)]?.focus()
  })
}

/** Enter/Space toggle the menu from the trigger. */
export const triggerKeydown = (host: FlyingMenu, e: KeyboardEvent): void => {
  when(isActivationKey(e.key), () => {
    e.preventDefault()
    host.toggle()
  })
}

/** Tab cycles focus within the open menu (a focus trap; Escape exits). */
export const menuKeydown = (host: FlyingMenu, e: KeyboardEvent): void => {
  when(e.key === 'Tab', () => cycleFocus(host, e))
}
