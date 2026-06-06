import { expect, type Locator, type Page } from '@playwright/test'

/** Wait until the custom element is defined and has completed its first update. */
export const ready = async (page: Page): Promise<void> => {
  await page.waitForFunction(async () => {
    const el = document.querySelector('flying-menu')
    if (!el || !customElements.get('flying-menu')) return false
    await el.updateComplete
    return !!el.shadowRoot
  })
}

/** The shadow-piercing trigger wrapper locator. */
export const triggerWrapper = (page: Page): Locator => page.locator('[part="trigger"]')

/** The shadow-piercing menu wrapper locator. */
export const menuWrapper = (page: Page): Locator => page.locator('[part="menu"]')

/** Read the reflected `corner` attribute of the element. */
export const corner = (page: Page): Promise<string | null> =>
  page.locator('flying-menu').getAttribute('corner')

/** Inline left/top a component writes to a wrapper, as numbers. */
export const inlinePos = async (loc: Locator): Promise<{ left: number; top: number }> => {
  const style = await loc.evaluate((el) => ({ left: el.style.left, top: el.style.top }))
  return { left: Number.parseFloat(style.left), top: Number.parseFloat(style.top) }
}

/** Bounding box (non-null assertion for ergonomics). */
export const box = async (loc: Locator) => {
  const b = await loc.boundingBox()
  expect(b).not.toBeNull()
  return b!
}

/**
 * Perform a pointer drag of the trigger to an absolute viewport point using real
 * mouse events (Playwright dispatches pointer events from these).
 */
export const dragTriggerTo = async (
  page: Page,
  to: { x: number; y: number }
): Promise<void> => {
  const b = await box(triggerWrapper(page))
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  // Two staged moves so the threshold is crossed deterministically.
  await page.mouse.move(to.x, to.y, { steps: 8 })
  await page.mouse.move(to.x, to.y)
  await page.mouse.up()
}
