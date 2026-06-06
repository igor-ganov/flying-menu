/**
 * Curried boolean selector — pick between two values without a ternary or `if`.
 * A higher-order, point-free building block for expressing binary choice (rule 5).
 *
 * @typeParam T - The selected value type.
 * @param whenTrue - Value returned when the condition holds.
 * @param whenFalse - Value returned otherwise.
 * @returns A function of the condition yielding the chosen value.
 */
export const fromBoolean =
  <T>(whenTrue: T, whenFalse: T) =>
  (condition: boolean): T => {
    switch (condition) {
      case true:
        return whenTrue
      case false:
        return whenFalse
    }
  }
