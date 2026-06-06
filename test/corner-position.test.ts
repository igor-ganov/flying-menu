import { describe, expect, it } from 'vitest'
import { cornerPosition } from '../src/core/corner-position'
import type { Size, Viewport } from '../src/core/types'

const VP: Viewport = { width: 390, height: 844 }
const MARGIN = 16

describe('cornerPosition', () => {
  describe('square trigger', () => {
    const size: Size = { width: 56, height: 56 }

    it('places top-left at the margin', () => {
      expect(cornerPosition('top-left', size, MARGIN, VP)).toEqual({ x: 16, y: 16 })
    })

    it('places top-right inset by width + margin', () => {
      expect(cornerPosition('top-right', size, MARGIN, VP)).toEqual({
        x: VP.width - 56 - MARGIN,
        y: 16,
      })
    })

    it('places bottom-left inset by height + margin', () => {
      expect(cornerPosition('bottom-left', size, MARGIN, VP)).toEqual({
        x: 16,
        y: VP.height - 56 - MARGIN,
      })
    })

    it('places bottom-right inset on both axes', () => {
      expect(cornerPosition('bottom-right', size, MARGIN, VP)).toEqual({
        x: VP.width - 56 - MARGIN,
        y: VP.height - 56 - MARGIN,
      })
    })
  })

  describe('non-square trigger (content-driven size, US-3)', () => {
    const wide: Size = { width: 200, height: 40 }

    it('keeps a wide trigger inset by its own width on the right', () => {
      expect(cornerPosition('bottom-right', wide, MARGIN, VP)).toEqual({
        x: VP.width - 200 - MARGIN,
        y: VP.height - 40 - MARGIN,
      })
    })

    it('keeps a tall trigger inset by its own height at the bottom', () => {
      const tall: Size = { width: 60, height: 300 }
      expect(cornerPosition('bottom-left', tall, MARGIN, VP)).toEqual({
        x: 16,
        y: VP.height - 300 - MARGIN,
      })
    })
  })
})
