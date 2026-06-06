/**
 * Left-to-right function pipeline: `pipe(x, f, g)` is `g(f(x))`. Typed via
 * overloads; the body composes with `reduce` (no loops, no branching). The one
 * place the arrow-function preference yields to declaration overloads.
 */
export function pipe<A>(a: A): A
export function pipe<A, B>(a: A, ab: (a: A) => B): B
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
export function pipe<A, B, C, D>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): D
export function pipe(
  a: unknown,
  ...fns: ReadonlyArray<(x: unknown) => unknown>
): unknown {
  return fns.reduce((acc, fn) => fn(acc), a)
}
