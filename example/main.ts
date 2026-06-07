import '@igor-ganov/flying-menu'
import type { FlyingMenu } from '@igor-ganov/flying-menu'

const demo = document.querySelector<FlyingMenu>('#demo')

/** Open the menu from the hero CTA. */
document
  .querySelector<HTMLButtonElement>('[data-demo-open]')
  ?.addEventListener('click', () => demo?.openMenu())

/** Move the trigger to a chosen corner. Opening/closing stays with the trigger itself. */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-corner]')) {
  button.addEventListener('click', () => {
    const corner = button.dataset.corner
    if (demo && corner) demo.setAttribute('corner', corner)
  })
}
