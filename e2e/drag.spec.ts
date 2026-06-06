import { expect, test } from '@playwright/test'
import { box, dragTriggerTo, inlinePos, ready, triggerWrapper } from './helpers'

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' }) // stable geometry, no transitions
  await page.goto('/?no-persist&corner=bottom-right')
  await ready(page)
})

test('dragging past the threshold snaps to the nearest corner (AC-2.2)', async ({ page }) => {
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'bottom-right')
  await dragTriggerTo(page, { x: 60, y: 60 }) // top-left region
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')
})

test('dragging emits flying-menu-corner with the new corner (AC-2.4)', async ({ page }) => {
  const got = page.evaluate(
    () =>
      new Promise<string>((resolve) => {
        document.querySelector('flying-menu')!.addEventListener(
          'flying-menu-corner',
          (e) => resolve((e as CustomEvent<{ corner: string }>).detail.corner),
          { once: true }
        )
      })
  )
  await dragTriggerTo(page, { x: 60, y: 60 })
  expect(await got).toBe('top-left')
})

test('a drag does not toggle the menu (AC-1.3)', async ({ page }) => {
  await dragTriggerTo(page, { x: 60, y: 60 })
  await expect(page.locator('flying-menu')).not.toHaveAttribute('open', '')
})

test('a sub-threshold drag is a tap: the trigger returns to its corner and opens (AC-1.1)', async ({ page }) => {
  const before = await inlinePos(triggerWrapper(page))
  const b = await box(triggerWrapper(page))
  // Move less than the 10px threshold, then release.
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2)
  await page.mouse.down()
  await page.mouse.move(b.x + b.width / 2 + 4, b.y + b.height / 2 + 3) // 7px Manhattan
  await page.mouse.up()
  await expect(page.locator('flying-menu')).toHaveAttribute('open', '')
  const after = await inlinePos(triggerWrapper(page))
  expect(after).toEqual(before) // snapped back to the corner, not stuck at the drag offset
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'bottom-right')
})

test('after snapping, the trigger rests inset by the margin (AC-2.3)', async ({ page }) => {
  await dragTriggerTo(page, { x: 60, y: 60 })
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'top-left')
  const pos = await inlinePos(triggerWrapper(page))
  expect(pos.left).toBe(16)
  expect(pos.top).toBe(16)
})

test('a large custom trigger still snaps fully within the viewport (AC-3.2, US-3)', async ({ page }) => {
  await page.goto('/?scenario=big&no-persist&corner=top-left')
  await ready(page)
  const vp = page.viewportSize()!
  await dragTriggerTo(page, { x: vp.width - 30, y: vp.height - 30 }) // bottom-right region
  await expect(page.locator('flying-menu')).toHaveAttribute('corner', 'bottom-right')
  // Assert on the inline position (set synchronously) plus measured size — margin-inset on every edge.
  const pos = await inlinePos(triggerWrapper(page))
  const b = await box(triggerWrapper(page))
  expect(pos.left).toBeGreaterThanOrEqual(16 - 0.5)
  expect(pos.top).toBeGreaterThanOrEqual(16 - 0.5)
  expect(pos.left + b.width).toBeLessThanOrEqual(vp.width - 16 + 0.5)
  expect(pos.top + b.height).toBeLessThanOrEqual(vp.height - 16 + 0.5)
})
