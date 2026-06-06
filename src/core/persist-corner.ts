import { DEFAULT_CORNER } from './constants'
import type { Corner } from './types'

/** Minimal storage abstraction so persistence is testable and failure-safe. */
export interface StoragePort {
  get(key: string): string | undefined
  set(key: string, value: string): void
}

/** Exhaustive corner lookup; adding a {@link Corner} forces an entry here. */
const CORNER_VALUES: Record<Corner, true> = {
  'top-left': true,
  'top-right': true,
  'bottom-left': true,
  'bottom-right': true,
}

/** Type predicate narrowing a string to {@link Corner} without casting. */
const isCorner = (raw: string): raw is Corner => raw in CORNER_VALUES

/**
 * Narrow an arbitrary string to a {@link Corner}.
 * @param raw - Candidate value.
 * @returns The corner, or `undefined` when not a valid corner.
 */
export const parseCorner = (raw: string | undefined): Corner | undefined => {
  if (raw === undefined) return undefined
  return isCorner(raw) ? raw : undefined
}

/**
 * Load the persisted corner, defaulting safely.
 * @param port - Storage port.
 * @param key - Storage key.
 * @returns The stored corner or {@link DEFAULT_CORNER}; never throws (AC-5.4).
 */
export const loadCorner = (port: StoragePort, key: string): Corner => {
  try {
    return parseCorner(port.get(key)) ?? DEFAULT_CORNER
  } catch {
    return DEFAULT_CORNER
  }
}

/**
 * Persist the corner, swallowing storage failures.
 * @param port - Storage port.
 * @param key - Storage key.
 * @param corner - Corner to persist.
 */
export const saveCorner = (port: StoragePort, key: string, corner: Corner): void => {
  try {
    port.set(key, corner)
  } catch {
    /* storage unavailable — persistence is best-effort */
  }
}

/**
 * Build a {@link StoragePort} backed by `globalThis.localStorage`, degrading to a
 * no-op port when storage is unavailable (private mode, SSR, blocked cookies).
 * @returns A failure-safe storage port.
 */
export const localStoragePort = (): StoragePort => ({
  get: (key) => globalThis.localStorage?.getItem(key) ?? undefined,
  set: (key, value) => globalThis.localStorage?.setItem(key, value),
})
