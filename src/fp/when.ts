/**
 * Run an effect only when the condition holds — a branch-free guard for the
 * imperative shell (replaces `if (cond) { ... }` without an `if`).
 *
 * @param condition - Whether to run.
 * @param effect - Side effect to run when `condition` is `true`.
 */
export const when = (condition: boolean, effect: () => void): void => {
  switch (condition) {
    case true:
      effect()
      break
    case false:
      break
  }
}
