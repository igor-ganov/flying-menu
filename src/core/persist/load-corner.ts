import { attempt } from '../../fp/attempt'
import { flatMap } from '../../fp/option/flat-map'
import { getOrElse } from '../../fp/option/get-or-else'
import { pipe } from '../../fp/pipe'
import { DEFAULT_CORNER } from '../constants'
import type { Corner } from '../types'
import { parseCorner } from './parse-corner'
import type { StoragePort } from './storage-port'

/**
 * Load the persisted corner, defaulting safely. Read → parse → fallback is a
 * single pipeline; a throwing port collapses to {@link DEFAULT_CORNER} via
 * `attempt`, never throwing (AC-5.4).
 *
 * @param port - Storage port.
 * @param key - Storage key.
 * @returns The stored corner or the default.
 */
export const loadCorner = (port: StoragePort, key: string): Corner =>
  pipe(
    attempt(() => port.get(key)),
    flatMap(parseCorner),
    getOrElse(() => DEFAULT_CORNER)
  )
