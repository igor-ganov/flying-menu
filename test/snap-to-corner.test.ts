import { describe, expect, it } from 'vitest'
import { snapToCorner } from '../src/core/snap-to-corner'
import type { Viewport } from '../src/core/types'

const VP: Viewport = { width: 390, height: 844 }

describe('snapToCorner', () => {
  it('snaps a bottom-right point to bottom-right', () => {
    expect(snapToCorner({ x: 350, y: 700 }, VP)).toBe('bottom-right')
  })

  it('snaps a top-left point to top-left', () => {
    expect(snapToCorner({ x: 50, y: 100 }, VP)).toBe('top-left')
  })

  it('snaps a top-right point to top-right', () => {
    expect(snapToCorner({ x: 300, y: 100 }, VP)).toBe('top-right')
  })

  it('snaps a bottom-left point to bottom-left', () => {
    expect(snapToCorner({ x: 50, y: 700 }, VP)).toBe('bottom-left')
  })

  it('treats the exact center as top-left (inclusive lower half)', () => {
    expect(snapToCorner({ x: 195, y: 422 }, VP)).toBe('top-left')
  })
})
