import { describe, expect, it, vi } from 'vitest'
import { branch } from '../src/fp/branch'
import { when } from '../src/fp/when'

describe('when', () => {
  it('runs the effect when true', () => {
    const fn = vi.fn()
    when(true, fn)
    expect(fn).toHaveBeenCalledOnce()
  })
  it('skips the effect when false', () => {
    const fn = vi.fn()
    when(false, fn)
    expect(fn).not.toHaveBeenCalled()
  })
})

describe('branch', () => {
  it('runs onTrue for true', () => {
    const t = vi.fn()
    const f = vi.fn()
    branch(true, t, f)
    expect(t).toHaveBeenCalledOnce()
    expect(f).not.toHaveBeenCalled()
  })
  it('runs onFalse for false', () => {
    const t = vi.fn()
    const f = vi.fn()
    branch(false, t, f)
    expect(f).toHaveBeenCalledOnce()
    expect(t).not.toHaveBeenCalled()
  })
})
