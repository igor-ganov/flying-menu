/**
 * Run one of two effects depending on a condition — a branch-free `if/else` for
 * the imperative shell.
 *
 * @param condition - Selector.
 * @param onTrue - Effect when `condition` is `true`.
 * @param onFalse - Effect when `condition` is `false`.
 */
export const branch = (
  condition: boolean,
  onTrue: () => void,
  onFalse: () => void
): void => {
  switch (condition) {
    case true:
      onTrue()
      break
    case false:
      onFalse()
      break
  }
}
