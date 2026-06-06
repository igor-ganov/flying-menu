import { expect, test } from '@playwright/test'
import { menuWrapper, ready, triggerWrapper } from './helpers'

// These run WITHOUT reduced-motion emulation: motion is on, exposing any
// position-slide regression.

test('the menu never transitions its position (no slide from the previous corner)', async ({ page }) => {
  await page.goto('/?no-persist')
  await ready(page)
  const transitionProperty = await menuWrapper(page).evaluate(
    (el) => getComputedStyle(el).transitionProperty
  )
  expect(transitionProperty).not.toContain('left')
  expect(transitionProperty).not.toContain('top')
  expect(transitionProperty).toContain('opacity')
  expect(transitionProperty).toContain('transform')
})

test('after moving the trigger, the menu opens anchored to the new corner with motion on', async ({ page }) => {
  await page.goto('/?no-persist&corner=bottom-right')
  await ready(page)
  const fm = page.locator('flying-menu')

  // Open once at bottom-right, close, switch corner, reopen — all with transitions enabled.
  await triggerWrapper(page).click()
  await expect(fm).toHaveAttribute('open', '')
  await triggerWrapper(page).click()
  await expect(fm).not.toHaveAttribute('open', '')

  await fm.evaluate((el) => el.setAttribute('corner', 'top-left'))
  await fm.evaluate((el) => (el as HTMLElement & { openMenu(): void }).openMenu())
  await expect(fm).toHaveAttribute('open', '')

  // The menu's anchored top-left position is set immediately, independent of the
  // trigger's left/top transition. Read the inline anchor (set synchronously).
  const inline = await menuWrapper(page).evaluate((el) => ({
    left: Number.parseFloat(el.style.left),
    top: Number.parseFloat(el.style.top),
  }))
  expect(inline.left).toBe(16) // left-aligned to the trigger at the margin
  expect(inline.top).toBeGreaterThan(16) // opens below the top-left trigger
})

test('the host exposes a :state(open) custom state for external animation styling', async ({ page }) => {
  await page.goto('/?no-persist')
  await ready(page)
  const fm = page.locator('flying-menu')
  expect(await fm.evaluate((el) => el.matches(':state(open)'))).toBe(false)
  await triggerWrapper(page).click()
  await expect(fm).toHaveAttribute('open', '')
  expect(await fm.evaluate((el) => el.matches(':state(open)'))).toBe(true)
})
