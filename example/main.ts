import '@igor-ganov/flying-menu'
import type { FlyingMenu } from '@igor-ganov/flying-menu'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import 'highlight.js/styles/github-dark.css'

hljs.registerLanguage('xml', xml) // also handles `language-html`
hljs.registerLanguage('css', css)
hljs.registerLanguage('typescript', typescript)
hljs.registerLanguage('bash', bash)

/** Syntax-highlight every code snippet on the page. */
for (const block of document.querySelectorAll<HTMLElement>('pre code')) {
  hljs.highlightElement(block)
}

/** Wire the package-manager tabs (ARIA tablist with click + arrow-key control). */
for (const tablist of document.querySelectorAll<HTMLElement>('[role="tablist"]')) {
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')]
  const select = (tab: HTMLButtonElement): void => {
    for (const t of tabs) {
      const on = t === tab
      t.setAttribute('aria-selected', String(on))
      t.tabIndex = on ? 0 : -1
      document
        .getElementById(t.getAttribute('aria-controls') ?? '')
        ?.toggleAttribute('hidden', !on)
    }
  }
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab))
    tab.addEventListener('keydown', (e) => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
      if (!dir) return
      e.preventDefault()
      const next = tabs[(i + dir + tabs.length) % tabs.length]
      next?.focus()
      if (next) select(next)
    })
  })
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
