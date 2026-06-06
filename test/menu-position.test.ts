import { describe, expect, it } from 'vitest'
import { menuPosition } from '../src/core/menu-position'
import type { Rect, Size, Viewport } from '../src/core/types'

const VP: Viewport = { width: 400, height: 800 }
const GAP = 8
const MARGIN = 16
const menu: Size = { width: 200, height: 150 }

// Trigger resting bottom-right: 56x56, inset 16.
const brRect: Rect = { x: 400 - 56 - 16, y: 800 - 56 - 16, width: 56, height: 56 }
// Trigger resting top-left.
const tlRect: Rect = { x: 16, y: 16, width: 56, height: 56 }

const call = (corner: Parameters<typeof menuPosition>[0]['corner'], triggerRect: Rect, menuSize = menu) =>
  menuPosition({ corner, triggerRect, menuSize, gap: GAP, margin: MARGIN, vp: VP })

describe('menuPosition', () => {
  it('bottom-right: aligns right edges and opens above', () => {
    const p = call('bottom-right', brRect)
    expect(p.x).toBe(brRect.x + brRect.width - menu.width) // right-aligned
    expect(p.y).toBe(brRect.y - GAP - menu.height) // above trigger
  })

  it('bottom-left: aligns left edges and opens above', () => {
    const blRect: Rect = { x: 16, y: brRect.y, width: 56, height: 56 }
    const p = call('bottom-left', blRect)
    expect(p.x).toBe(blRect.x) // left-aligned
    expect(p.y).toBe(blRect.y - GAP - menu.height)
  })

  it('top-left: aligns left edges and opens below', () => {
    const p = call('top-left', tlRect)
    expect(p.x).toBe(tlRect.x)
    expect(p.y).toBe(tlRect.y + tlRect.height + GAP) // below trigger
  })

  it('top-right: aligns right edges and opens below', () => {
    const trRect: Rect = { x: brRect.x, y: 16, width: 56, height: 56 }
    const p = call('top-right', trRect)
    expect(p.x).toBe(trRect.x + trRect.width - menu.width)
    expect(p.y).toBe(trRect.y + trRect.height + GAP)
  })

  it('clamps a tall menu within the top margin instead of overflowing (AC-4.5)', () => {
    // Anchored above the trigger this would land above the top margin; clamp pins it.
    const tall: Size = { width: 200, height: 760 }
    const p = call('bottom-right', brRect, tall)
    expect(p.y).toBe(MARGIN)
  })

  it('keeps a fitting menu within both vertical margins without clamping it away', () => {
    const tall: Size = { width: 200, height: 700 }
    const p = call('bottom-right', brRect, tall)
    expect(p.y).toBeGreaterThanOrEqual(MARGIN)
    expect(p.y + tall.height).toBeLessThanOrEqual(VP.height - MARGIN)
  })

  it('keeps a fitting wide menu within both horizontal margins', () => {
    const wide: Size = { width: 340, height: 100 }
    const p = call('top-right', { x: brRect.x, y: 16, width: 56, height: 56 }, wide)
    expect(p.x).toBeGreaterThanOrEqual(MARGIN)
    expect(p.x + wide.width).toBeLessThanOrEqual(VP.width - MARGIN)
  })

  it('pins to the margin when the menu is larger than the available space', () => {
    const huge: Size = { width: 999, height: 999 }
    const p = call('top-left', tlRect, huge)
    expect(p.x).toBe(MARGIN)
    expect(p.y).toBe(MARGIN)
  })
})
