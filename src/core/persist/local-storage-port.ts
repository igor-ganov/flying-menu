import { fromNullable } from '../../fp/option/from-nullable'
import { getOrUndefined } from '../../fp/option/get-or-undefined'
import { pipe } from '../../fp/pipe'
import type { StoragePort } from './storage-port'

/**
 * Build a {@link StoragePort} backed by `globalThis.localStorage`, degrading to a
 * no-op when storage is unavailable (private mode, SSR, blocked cookies).
 *
 * @returns A failure-safe storage port.
 */
export const localStoragePort = (): StoragePort => ({
  get: (key) =>
    pipe(fromNullable(globalThis.localStorage?.getItem(key)), getOrUndefined),
  set: (key, value) => {
    globalThis.localStorage?.setItem(key, value)
  },
})
