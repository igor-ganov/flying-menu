import { fromBoolean } from '../../fp/from-boolean'

/**
 * Direction to move focus for a Tab press: backward when Shift is held.
 *
 * @param shiftKey - Whether Shift was held.
 * @returns `-1` for Shift+Tab, otherwise `1`.
 */
export const tabStep = (shiftKey: boolean): number => fromBoolean(-1, 1)(shiftKey)
