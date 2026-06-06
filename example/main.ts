import '../src/flying-menu'
import type { FlyingMenu } from '../src/flying-menu'

const demo = document.querySelector<FlyingMenu>('#demo')

/** Open the menu from the hero CTA. */
document
  .querySelector<HTMLButtonElement>('[data-demo-open]')
  ?.addEventListener('click', () => demo?.openMenu())

/** Restart the demo at a chosen corner. */
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-corner]')) {
  button.addEventListener('click', () => {
    const corner = button.dataset.corner
    if (demo && corner) {
      demo.setAttribute('corner', corner)
      demo.openMenu()
    }
  })
}
