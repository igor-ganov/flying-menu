/** Present value. */
export interface Some<out T> {
  readonly _tag: 'Some'
  readonly value: T
}

/** Absent value. */
export interface None {
  readonly _tag: 'None'
}

/** A value that may be absent — a zero-cost, tree-shakeable Option ADT. */
export type Option<T> = Some<T> | None

/** Wrap a present value. */
export const some = <T>(value: T): Option<T> => ({ _tag: 'Some', value })

/** The absent value. */
export const none: Option<never> = { _tag: 'None' }

/** Narrow to the present case. */
export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option._tag === 'Some'

/** Narrow to the absent case. */
export const isNone = <T>(option: Option<T>): option is None =>
  option._tag === 'None'
