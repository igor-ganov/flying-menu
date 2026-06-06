import { describe, expect, it } from 'vitest'
import { attempt } from '../src/fp/attempt'
import { isNone, some } from '../src/fp/option/option'

describe('attempt', () => {
  it('captures a successful result as Some', () => {
    expect(attempt(() => 42)).toStrictEqual(some(42))
  })

  it('captures a throw as None', () => {
    expect(
      isNone(
        attempt(() => {
          throw new Error('boom')
        })
      )
    ).toBe(true)
  })
})
