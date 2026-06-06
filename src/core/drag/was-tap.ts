import type { DragState } from './drag-state'

/**
 * Whether the completed gesture counts as a tap (no significant movement).
 *
 * @param s - State at or after release.
 * @returns `true` when the gesture never crossed the drag threshold.
 */
export const wasTap = (s: DragState): boolean => !s.moved
