import { none, type Option, some } from './option/option'

/**
 * Run a thunk that may throw, capturing the outcome as an {@link Option}:
 * `Some(result)` on success, `None` when it throws. The effectful boundary that
 * keeps fallible side effects (storage, parsing) out of the pure pipeline.
 *
 * @param thunk - The possibly-throwing computation.
 * @returns `Some` of its result, or `None` on failure.
 */
export const attempt = <T>(thunk: () => T): Option<T> => {
  try {
    return some(thunk())
  } catch {
    return none
  }
}
