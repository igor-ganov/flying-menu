import { describe, expect, it } from 'vitest'
import { clamp } from '../src/fp/clamp'

describe('clamp', () => {
  it('passes a value already inside the range through', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })

  it('raises a value below the minimum', () => {
    expect(clamp(-3, 0, 10)).toBe(0)
  })

  it('lowers a value above the maximum', () => {
    expect(clamp(42, 0, 10)).toBe(10)
  })

  it('pins to the minimum when the span inverts (max < min)', () => {
    expect(clamp(5, 16, 4)).toBe(16)
  })
})
