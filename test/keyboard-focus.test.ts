import { describe, expect, it } from 'vitest'
import { indexOfActive } from '../src/core/focus-cycle/index-of-active'
import { nextIndex } from '../src/core/focus-cycle/next-index'
import { tabStep } from '../src/core/focus-cycle/tab-step'
import { isActivationKey } from '../src/core/keyboard/is-activation-key'

describe('isActivationKey', () => {
  it('accepts Enter and Space variants', () => {
    expect(isActivationKey('Enter')).toBe(true)
    expect(isActivationKey(' ')).toBe(true)
    expect(isActivationKey('Spacebar')).toBe(true)
  })
  it('rejects other keys', () => {
    expect(isActivationKey('Tab')).toBe(false)
    expect(isActivationKey('a')).toBe(false)
  })
})

describe('tabStep', () => {
  it('steps backward with Shift, forward without', () => {
    expect(tabStep(true)).toBe(-1)
    expect(tabStep(false)).toBe(1)
  })
})

describe('nextIndex', () => {
  it('wraps forward past the end', () => {
    expect(nextIndex(2, 1, 3)).toBe(0)
  })
  it('wraps backward before the start', () => {
    expect(nextIndex(0, -1, 3)).toBe(2)
  })
  it('starts from the first item when focus is outside (-1)', () => {
    expect(nextIndex(-1, 1, 3)).toBe(0)
  })
})

describe('indexOfActive', () => {
  it('finds the active element', () => {
    const a = document.createElement('a')
    const b = document.createElement('button')
    expect(indexOfActive([a, b], b)).toBe(1)
  })
  it('returns -1 when focus is outside the ring', () => {
    const a = document.createElement('a')
    expect(indexOfActive([a], undefined)).toBe(-1)
  })
})
