import { attempt } from '../../fp/attempt'
import type { Corner } from '../types'
import type { StoragePort } from './storage-port'

/**
 * Persist the corner, swallowing storage failures. The write runs through
 * `attempt`, whose `None` outcome is discarded — persistence is best-effort.
 *
 * @param port - Storage port.
 * @param key - Storage key.
 * @param corner - Corner to persist.
 */
export const saveCorner = (port: StoragePort, key: string, corner: Corner): void => {
  attempt(() => {
    port.set(key, corner)
  })
}
