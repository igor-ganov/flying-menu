import { firstFocusableAmong } from '../a11y/focus'
import { when } from '../fp/when'
import type { FlyingMenu } from '../flying-menu'
import { assignedElements, slottedTrigger } from './slots'

/** Return focus to the trigger (slotted control, or the wrapper). */
export const focusTrigger = (host: FlyingMenu): void => {
  ;(slottedTrigger(host) ?? host._triggerEl)?.focus()
}

/** Move focus into the open menu — first focusable, or the menu container. */
export const focusMenu = (host: FlyingMenu): void => {
  const menuEl = host._menuEl
  when(menuEl != null, () => {
    const target = firstFocusableAmong(assignedElements(host, 'menu')) ?? menuEl
    when(target === menuEl && !menuEl.hasAttribute('tabindex'), () => {
      menuEl.tabIndex = -1
    })
    target.focus()
  })
}
