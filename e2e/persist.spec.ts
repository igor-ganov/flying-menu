import { expect, test } from '@playwright/test'
import { dragTriggerTo, ready } from './helpers'

test('the snapped corner survives a reload (AC-5.1, AC-5.2)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  // Fresh context => empty storage => default bottom-right. No corner query param so
  // that the second load is driven purely by persistence, not the URL.
  await page.goto('/')
  await ready(page)
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'bottom-right')
  await dragTriggerTo(page, { x: 60, y: 60 })
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')

  await page.goto('/')
  await ready(page)
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')
})

test('a custom storage-key isolates persistence (AC-5.3)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?corner=bottom-right&storage-key=fm-custom')
  await ready(page)
  await dragTriggerTo(page, { x: 60, y: 60 })
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')

  const stored = await page.evaluate(() => ({
    custom: localStorage.getItem('fm-custom'),
    default: localStorage.getItem('flying-menu-corner'),
  }))
  expect(stored.custom).toBe('top-left')
  expect(stored.default).toBeNull()
})

test('no-persist does not write to storage (US-5 escape hatch)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/?corner=bottom-right&no-persist')
  await ready(page)
  await dragTriggerTo(page, { x: 60, y: 60 })
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')
  const stored = await page.evaluate(() => localStorage.getItem('flying-menu-corner'))
  expect(stored).toBeNull()
})
