import { describe, expect, it } from 'vitest'
import { pipe } from '../src/fp/pipe'

describe('pipe', () => {
  it('returns the value unchanged with no functions', () => {
    expect(pipe(5)).toBe(5)
  })

  it('applies functions left to right', () => {
    expect(pipe(2, (n) => n + 3, (n) => n * 4)).toBe(20)
  })

  it('threads types through the chain', () => {
    expect(pipe('  hi  ', (s) => s.trim(), (s) => s.length)).toBe(2)
  })
})
