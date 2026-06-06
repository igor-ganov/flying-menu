import { describe, expect, it } from 'vitest'
import { idle, onDown, onMove, onUp, wasTap } from '../src/core/drag-machine'

const THRESHOLD = 10
const origin = { x: 100, y: 200 }

const start = (pointer = { x: 50, y: 50 }) => onDown(idle, { pointer, origin })

describe('drag-machine', () => {
  it('starts idle (not dragging, not moved)', () => {
    expect(idle.dragging).toBe(false)
    expect(idle.moved).toBe(false)
  })

  it('marks dragging on pointer down and stores origin', () => {
    const s = start()
    expect(s.dragging).toBe(true)
    expect(s.moved).toBe(false)
    expect(s.current).toEqual(origin)
  })

  it('a release without movement is a tap', () => {
    const s = onUp(start({ x: 50, y: 50 }))
    expect(wasTap(s)).toBe(true)
    expect(s.dragging).toBe(false)
  })

  it('movement below threshold is still a tap', () => {
    let s = start({ x: 50, y: 50 })
    s = onMove(s, { pointer: { x: 55, y: 53 }, threshold: THRESHOLD }) // |5|+|3| = 8
    expect(wasTap(onUp(s))).toBe(true)
  })

  it('movement past threshold is a drag, not a tap', () => {
    let s = start({ x: 50, y: 50 })
    s = onMove(s, { pointer: { x: 58, y: 56 }, threshold: THRESHOLD }) // 8+6 = 14 > 10
    expect(s.moved).toBe(true)
    expect(wasTap(onUp(s))).toBe(false)
  })

  it('updates current as origin + (pointer - start)', () => {
    let s = start({ x: 50, y: 50 })
    s = onMove(s, { pointer: { x: 80, y: 90 }, threshold: THRESHOLD })
    expect(s.current).toEqual({ x: 100 + 30, y: 200 + 40 })
  })

  it('ignores moves when not dragging', () => {
    const s = onMove(idle, { pointer: { x: 999, y: 999 }, threshold: THRESHOLD })
    expect(s).toBe(idle)
  })
})
