import type { Corner } from './types'

/** Edge inset, in pixels, kept between the trigger/menu and the viewport edge. */
export const DEFAULT_MARGIN = 16

/** Gap, in pixels, between the trigger and the opened menu. */
export const DEFAULT_GAP = 8

/** Minimum Manhattan pointer movement, in pixels, that turns a tap into a drag. */
export const DEFAULT_DRAG_THRESHOLD = 10

/** `localStorage` key used to persist the resting corner. */
export const DEFAULT_STORAGE_KEY = 'flying-menu-corner'

/** Corner used when nothing valid is persisted. */
export const DEFAULT_CORNER: Corner = 'bottom-right'
