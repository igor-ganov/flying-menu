import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { menuWrapper, ready, triggerWrapper } from './helpers'

const activeTestId = (page: import('@playwright/test').Page) =>
  page.evaluate(() => document.activeElement?.getAttribute('data-testid') ?? null)

test.beforeEach(async ({ page }) => {
  await page.goto('/?no-persist')
  await ready(page)
})

test('the slotted button carries the menu ARIA contract (AC-6.1)', async ({ page }) => {
  // The headless component places ARIA on the real control (the slotted <button>),
  // not on the roleless positioning wrapper.
  const btn = page.locator('[slot="trigger"]')
  await expect(btn).toHaveAttribute('aria-haspopup', 'menu')
  await expect(btn).toHaveAttribute('aria-controls', 'flying-menu-popup')
  await expect(btn).toHaveAttribute('aria-expanded', 'false')
  await expect(triggerWrapper(page)).not.toHaveAttribute('role', 'button')
  await triggerWrapper(page).click()
  await expect(btn).toHaveAttribute('aria-expanded', 'true')
})

test('opening moves focus into the menu (AC-6.2)', async ({ page }) => {
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  expect(await activeTestId(page)).toBe('item-home')
})

test('Escape closes the menu and restores focus to the trigger (AC-6.3)', async ({ page }) => {
  await page.locator('[slot="trigger"]').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  await page.keyboard.press('Escape')
  await expect(page.locator('flying-menu')).not.toHaveAttribute('open', '')
  expect(await activeTestId(page)).toBe('trigger')
})

test('an outside pointer interaction closes the menu (AC-6.4)', async ({ page }) => {
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  await page.locator('h1').click()
  await expect(page.locator('flying-menu')).not.toHaveAttribute('open', '')
})

test('reduced motion removes transitions (AC-6.6)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.reload()
  await ready(page)
  const transition = await menuWrapper(page).evaluate(
    (el) => getComputedStyle(el).transitionDuration
  )
  expect(transition).toBe('0s')
})

test('axe finds no serious or critical violations, closed and open (AC-6.7)', async ({ page }) => {
  const scan = async () => {
    const results = await new AxeBuilder({ page }).analyze()
    return results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    )
  }
  expect(await scan()).toEqual([])
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  expect(await scan()).toEqual([])
})
