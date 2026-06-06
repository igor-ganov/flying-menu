import { expect, test } from '@playwright/test'
import { menuWrapper, ready, triggerWrapper } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.goto('/?no-persist')
  await ready(page)
})

test('tap on the trigger opens the menu (AC-1.1)', async ({ page }) => {
  await expect(page.locator('flying-menu')).not.toHaveAttribute('open', '')
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  await expect(menuWrapper(page)).not.toHaveAttribute('hidden', '')
})

test('a second tap closes the menu (AC-1.2)', async ({ page }) => {
  const fm = page.locator('flying-menu')
  await triggerWrapper(page).click()
  await expect(fm).toHaveAttribute('open', '')
  await triggerWrapper(page).click()
  await expect(fm).not.toHaveAttribute('open', '')
})

test('toggle emits a cancelable flying-menu-toggle event (AC-1.4)', async ({ page }) => {
  const detail = page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        document.querySelector('flying-menu')!.addEventListener(
          'flying-menu-toggle',
          (e) => resolve((e as CustomEvent<{ open: boolean }>).detail.open),
          { once: true }
        )
      })
  )
  await triggerWrapper(page).click()
  expect(await detail).toBe(true)
})

test('preventing the toggle event keeps the menu closed (cancelable)', async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector('flying-menu')!.addEventListener(
      'flying-menu-toggle',
      (e) => e.preventDefault(),
      { once: true }
    )
  })
  await triggerWrapper(page).click()
  await expect(page.locator('flying-menu')).not.toHaveAttribute('open', '')
})

test('keyboard Enter and Space toggle the menu (AC-6.5)', async ({ page }) => {
  const fm = page.locator('flying-menu')
  await page.locator('[slot="trigger"]').focus()
  await page.keyboard.press('Enter')
  await expect(fm).toHaveAttribute('open', '')
  await page.keyboard.press('Escape') // close to reset focus to trigger
  await expect(fm).not.toHaveAttribute('open', '')
  await page.keyboard.press('Space')
  await expect(fm).toHaveAttribute('open', '')
})
