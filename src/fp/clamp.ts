import { fromBoolean } from './from-boolean'

/**
 * Clamp `value` into `[min, max]`. When the span inverts (the content is larger
 * than the available slot) the bounds pin to `min`.
 *
 * @param value - The value to constrain.
 * @param min - Lower bound.
 * @param max - Upper bound.
 * @returns The constrained value.
 */
export const clamp = (value: number, min: number, max: number): number =>
  fromBoolean(min, Math.min(Math.max(value, min), max))(max < min)
