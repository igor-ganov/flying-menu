import { isFocusable } from '../a11y/focus'
import { branch } from '../fp/branch'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { slottedTrigger } from './slots'
import { MENU_ID } from '../test-ids'

const setMenuAria = (host: FlyingMenu, el: HTMLElement | undefined): void => {
  el?.setAttribute('aria-haspopup', 'menu')
  el?.setAttribute('aria-controls', MENU_ID)
  el?.setAttribute('aria-expanded', String(host.open))
}

const clearAria = (el: Element | undefined): void => {
  for (const attr of ['aria-haspopup', 'aria-controls', 'aria-expanded', 'role']) {
    el?.removeAttribute(attr)
  }
}

const promoteWrapper = (el: HTMLElement): void => {
  el.setAttribute('role', 'button')
  when(!el.hasAttribute('tabindex'), () => el.setAttribute('tabindex', '0'))
}

/**
 * Place the menu's ARIA contract on the slotted trigger when it is itself a
 * control; otherwise promote the wrapper to a button (AC-6.1).
 */
export const applyAria = (host: FlyingMenu): void => {
  const slotted = slottedTrigger(host)
  branch(
    slotted !== undefined && isFocusable(slotted),
    () => {
      clearAria(host._triggerEl)
      setMenuAria(host, slotted)
    },
    () => {
      promoteWrapper(host._triggerEl)
      clearAria(slotted)
      setMenuAria(host, host._triggerEl)
    }
  )
}
