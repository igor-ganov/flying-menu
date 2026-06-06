import type { Option } from './option'

/**
 * Extract the value from an {@link Option}, falling back to a lazily-computed
 * default when absent. Curried, data-last for pipelines.
 *
 * @param onNone - Produces the fallback value.
 * @returns A function from `Option<A>` to `A`.
 */
export const getOrElse =
  <A>(onNone: () => A) =>
  (option: Option<A>): A => {
    switch (option._tag) {
      case 'Some':
        return option.value
      case 'None':
        return onNone()
    }
  }
