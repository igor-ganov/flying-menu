import { expect, test } from '@playwright/test'
import { box, inlinePos, ready, triggerWrapper } from './helpers'

const MARGIN = 16

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

// setViewportSize dispatches `resize` asynchronously; expect.poll waits for the
// component to re-anchor without any fixed timeout.

test('the trigger re-anchors to its corner on resize while closed', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await page.goto('/?no-persist&corner=bottom-right')
  await ready(page)

  await page.setViewportSize({ width: 760, height: 540 })
  await expect
    .poll(async () => {
      const pos = await inlinePos(triggerWrapper(page))
      const b = await box(triggerWrapper(page))
      return { right: Math.round(pos.left + b.width), bottom: Math.round(pos.top + b.height) }
    })
    .toEqual({ right: 760 - MARGIN, bottom: 540 - MARGIN })
})

test('a top-left trigger stays pinned to the margin across resizes', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 700 })
  await page.goto('/?no-persist&corner=top-left')
  await ready(page)

  await page.setViewportSize({ width: 500, height: 900 })
  await expect.poll(() => inlinePos(triggerWrapper(page))).toEqual({ left: MARGIN, top: MARGIN })
})

test('an open menu re-anchors with the trigger on resize', async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  await page.goto('/?no-persist&corner=bottom-right')
  await ready(page)
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')

  await page.setViewportSize({ width: 700, height: 600 })
  const menu = page.locator('[part="menu"]')
  await expect
    .poll(async () => {
      const left = await menu.evaluate((el) => Number.parseFloat(el.style.left))
      const b = await box(menu)
      return Math.round(left + b.width)
    })
    .toBe(700 - MARGIN) // right-aligned to the bottom-right trigger at the new size
})
