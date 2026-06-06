import { none, type Option, some } from './option'

/**
 * Lift a type-guard into an {@link Option} factory: `Some` when the guard holds,
 * `None` otherwise. Uses guard-narrowing via `filter` + `reduce` so no `if`,
 * ternary or cast is needed.
 *
 * @param guard - Refinement deciding presence and narrowing the type.
 * @returns A function from a candidate value to `Option<S>`.
 */
export const filterToOption =
  <T, S extends T>(guard: (value: T) => value is S) =>
  (value: T): Option<S> =>
    [value].filter(guard).reduce<Option<S>>((_, narrowed) => some(narrowed), none)
