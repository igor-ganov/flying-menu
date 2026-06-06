import { describe, expect, it, vi } from 'vitest'
import { isNone, some } from '../src/fp/option/option'
import {
  loadCorner,
  parseCorner,
  saveCorner,
  type StoragePort,
} from '../src/core/persist'

const memoryPort = (initial?: string): StoragePort => {
  let value = initial
  return {
    get: () => value,
    set: (_k, v) => {
      value = v
    },
  }
}

const KEY = 'flying-menu-corner'

describe('parseCorner', () => {
  it('accepts valid corners as Some', () => {
    expect(parseCorner('top-left')).toStrictEqual(some('top-left'))
    expect(parseCorner('bottom-right')).toStrictEqual(some('bottom-right'))
  })

  it('rejects invalid or missing values as None', () => {
    expect(isNone(parseCorner('middle'))).toBe(true)
    expect(isNone(parseCorner(undefined))).toBe(true)
    expect(isNone(parseCorner(''))).toBe(true)
  })
})

describe('loadCorner', () => {
  it('returns the stored corner when valid', () => {
    expect(loadCorner(memoryPort('top-right'), KEY)).toBe('top-right')
  })

  it('defaults to bottom-right when missing', () => {
    expect(loadCorner(memoryPort(), KEY)).toBe('bottom-right')
  })

  it('defaults to bottom-right when invalid', () => {
    expect(loadCorner(memoryPort('nope'), KEY)).toBe('bottom-right')
  })

  it('does not throw when the port throws (AC-5.4)', () => {
    const throwing: StoragePort = {
      get: () => {
        throw new Error('blocked')
      },
      set: () => {
        throw new Error('blocked')
      },
    }
    expect(() => loadCorner(throwing, KEY)).not.toThrow()
    expect(loadCorner(throwing, KEY)).toBe('bottom-right')
  })
})

describe('saveCorner', () => {
  it('round-trips a corner through the port', () => {
    const port = memoryPort()
    saveCorner(port, KEY, 'top-left')
    expect(loadCorner(port, KEY)).toBe('top-left')
  })

  it('swallows port write failures', () => {
    const port: StoragePort = { get: () => undefined, set: vi.fn(() => { throw new Error('x') }) }
    expect(() => saveCorner(port, KEY, 'top-left')).not.toThrow()
  })
})
