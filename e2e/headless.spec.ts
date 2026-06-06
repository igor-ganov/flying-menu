import { expect, test } from '@playwright/test'
import { menuWrapper, ready, triggerWrapper } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/?no-persist')
  await ready(page)
})

test('exposes trigger and menu parts (AC-7.4)', async ({ page }) => {
  await expect(triggerWrapper(page)).toBeVisible()
  await expect(menuWrapper(page)).toBeAttached()
})

test('imperative openMenu/closeMenu/toggle drive the open state (AC-7.3)', async ({ page }) => {
  const fm = page.locator('flying-menu')
  await fm.evaluate((el) => (el as HTMLElement & { openMenu(): void }).openMenu())
  await expect(fm).toHaveAttribute('open', '')
  await fm.evaluate((el) => (el as HTMLElement & { closeMenu(): void }).closeMenu())
  await expect(fm).not.toHaveAttribute('open', '')
  await fm.evaluate((el) => (el as HTMLElement & { toggle(): void }).toggle())
  await expect(fm).toHaveAttribute('open', '')
})

test('imposes no visual chrome on its wrappers (AC-7.1)', async ({ page }) => {
  const styles = await triggerWrapper(page).evaluate((el) => {
    const s = getComputedStyle(el)
    return {
      background: s.backgroundColor,
      border: s.borderTopWidth,
      borderRadius: s.borderTopLeftRadius,
    }
  })
  expect(styles.background).toBe('rgba(0, 0, 0, 0)')
  expect(styles.border).toBe('0px')
  expect(styles.borderRadius).toBe('0px')
})

test('reflects configuration attributes as properties (AC-7.2)', async ({ page }) => {
  const props = await page.locator('flying-menu').evaluate((el) => {
    const e = el as HTMLElement & Record<string, unknown>
    return { margin: e.margin, gap: e.gap, dragThreshold: e.dragThreshold, storageKey: e.storageKey }
  })
  expect(props).toEqual({ margin: 16, gap: 8, dragThreshold: 10, storageKey: 'flying-menu-corner' })
})
