import { expect, test, type Page } from '@playwright/test'
import { box, menuWrapper, ready, triggerWrapper } from './helpers'

const openAt = async (page: Page, corner: string, scenario = 'default') => {
  const s = scenario === 'big' ? '&scenario=big' : ''
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/?no-persist&corner=${corner}${s}`)
  await ready(page)
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
}

test('bottom-right: menu right-aligns to the trigger and opens above (AC-4.1, AC-4.3)', async ({ page }) => {
  await openAt(page, 'bottom-right')
  const t = await box(triggerWrapper(page))
  const m = await box(menuWrapper(page))
  expect(Math.abs(m.x + m.width - (t.x + t.width))).toBeLessThan(1.5)
  expect(m.y + m.height).toBeLessThanOrEqual(t.y + 0.5)
})

test('bottom-left: menu left-aligns and opens above (AC-4.2, AC-4.3)', async ({ page }) => {
  await openAt(page, 'bottom-left')
  const t = await box(triggerWrapper(page))
  const m = await box(menuWrapper(page))
  expect(Math.abs(m.x - t.x)).toBeLessThan(1.5)
  expect(m.y + m.height).toBeLessThanOrEqual(t.y + 0.5)
})

test('top-left: menu left-aligns and opens below (AC-4.2, AC-4.4)', async ({ page }) => {
  await openAt(page, 'top-left')
  const t = await box(triggerWrapper(page))
  const m = await box(menuWrapper(page))
  expect(Math.abs(m.x - t.x)).toBeLessThan(1.5)
  expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 0.5)
})

test('top-right: menu right-aligns and opens below (AC-4.1, AC-4.4)', async ({ page }) => {
  await openAt(page, 'top-right')
  const t = await box(triggerWrapper(page))
  const m = await box(menuWrapper(page))
  expect(Math.abs(m.x + m.width - (t.x + t.width))).toBeLessThan(1.5)
  expect(m.y).toBeGreaterThanOrEqual(t.y + t.height - 0.5)
})

test('a content-driven menu stays within the viewport margin (AC-4.5, US-4)', async ({ page }) => {
  await openAt(page, 'top-left', 'big')
  const m = await box(menuWrapper(page))
  const vp = page.viewportSize()!
  // Left/top are clamped to the margin regardless of the menu content size.
  expect(m.x).toBeGreaterThanOrEqual(16 - 0.5)
  expect(m.y).toBeGreaterThanOrEqual(16 - 0.5)
  expect(m.x + m.width).toBeLessThanOrEqual(vp.width - 16 + 0.5)
})

test('the menu re-anchors when the corner changes while open (AC-4.6)', async ({ page }) => {
  await openAt(page, 'top-left')
  const before = await box(menuWrapper(page))
  await page.locator('flying-menu').evaluate((el) => el.setAttribute('corner', 'bottom-right'))
  await page.locator('flying-menu').evaluate((el) => (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete)
  const after = await box(menuWrapper(page))
  expect(after.x).not.toBe(before.x)
})
