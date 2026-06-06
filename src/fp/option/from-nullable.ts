import { filterToOption } from './filter-to-option'
import type { Option } from './option'

/** Refinement excluding `null` and `undefined`. */
const present = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined

/**
 * Build an {@link Option} from a nullable value: `None` for `null`/`undefined`,
 * otherwise `Some`.
 *
 * @param value - A possibly-absent value.
 * @returns `Some(value)` when present, else `None`.
 */
export const fromNullable = <T>(value: T | null | undefined): Option<T> =>
  filterToOption(present)(value)
