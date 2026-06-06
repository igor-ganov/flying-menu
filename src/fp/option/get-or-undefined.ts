import { getOrElse } from './get-or-else'
import type { Option } from './option'

/**
 * Extract the value from an {@link Option}, or `undefined` when absent.
 *
 * @param option - The option to unwrap.
 * @returns The contained value or `undefined`.
 */
export const getOrUndefined = <A>(option: Option<A>): A | undefined =>
  getOrElse<A | undefined>(() => undefined)(option)
