import { describe, expect, it } from 'vitest'
import { filterToOption } from '../src/fp/option/filter-to-option'
import { flatMap } from '../src/fp/option/flat-map'
import { fromNullable } from '../src/fp/option/from-nullable'
import { getOrElse } from '../src/fp/option/get-or-else'
import { getOrUndefined } from '../src/fp/option/get-or-undefined'
import { map } from '../src/fp/option/map'
import { isNone, isSome, none, some } from '../src/fp/option/option'

describe('Option constructors & guards', () => {
  it('some carries a value and is recognised', () => {
    expect(isSome(some(3))).toBe(true)
    expect(isNone(some(3))).toBe(false)
  })

  it('none is the absent case', () => {
    expect(isNone(none)).toBe(true)
    expect(isSome(none)).toBe(false)
  })
})

describe('map', () => {
  it('transforms a Some', () => {
    expect(map((n: number) => n + 1)(some(1))).toStrictEqual(some(2))
  })
  it('passes None through', () => {
    expect(map((n: number) => n + 1)(none)).toStrictEqual(none)
  })
})

describe('flatMap', () => {
  const half = (n: number) => (n % 2 === 0 ? some(n / 2) : none)
  it('chains on a Some', () => {
    expect(flatMap(half)(some(8))).toStrictEqual(some(4))
  })
  it('shortcuts on a None-producing step', () => {
    expect(isNone(flatMap(half)(some(3)))).toBe(true)
  })
})

describe('getOrElse / getOrUndefined', () => {
  it('unwraps Some', () => {
    expect(getOrElse(() => 0)(some(7))).toBe(7)
    expect(getOrUndefined(some(7))).toBe(7)
  })
  it('falls back on None', () => {
    expect(getOrElse(() => 0)(none)).toBe(0)
    expect(getOrUndefined(none)).toBeUndefined()
  })
})

describe('filterToOption / fromNullable', () => {
  const isStr = (v: unknown): v is string => typeof v === 'string'
  it('keeps values passing the guard', () => {
    expect(filterToOption(isStr)('x')).toStrictEqual(some('x'))
    expect(isNone(filterToOption(isStr)(1))).toBe(true)
  })
  it('fromNullable rejects null/undefined only', () => {
    expect(fromNullable(0)).toStrictEqual(some(0))
    expect(fromNullable('')).toStrictEqual(some(''))
    expect(isNone(fromNullable(null))).toBe(true)
    expect(isNone(fromNullable(undefined))).toBe(true)
  })
})
