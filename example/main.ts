import '@igor-ganov/flying-menu'
import type { FlyingMenu } from '@igor-ganov/flying-menu'
import hljs from 'highlight.js/lib/core'
import css from 'highlight.js/lib/languages/css'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('xml', xml) // also handles `language-html`
hljs.registerLanguage('css', css)
hljs.registerLanguage('typescript', typescript)

/** Syntax-highlight every code snippet on the page. */
for (const block of document.querySelectorAll<HTMLElement>('pre code')) {
  hljs.highlightElement(block)
}

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
