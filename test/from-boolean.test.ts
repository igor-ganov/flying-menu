import { describe, expect, it } from 'vitest'
import { fromBoolean } from '../src/fp/from-boolean'

describe('fromBoolean', () => {
  const pick = fromBoolean('yes', 'no')

  it('returns the true-value when the condition holds', () => {
    expect(pick(true)).toBe('yes')
  })

  it('returns the false-value otherwise', () => {
    expect(pick(false)).toBe('no')
  })

  it('is curried — the selector is reusable', () => {
    const sign = fromBoolean(1, -1)
    expect(sign(true)).toBe(1)
    expect(sign(false)).toBe(-1)
  })
})
