import type { DragState } from './drag-state'

/**
 * End the drag, leaving the movement record intact for the tap decision.
 *
 * @param s - Current state.
 * @returns The settled drag state.
 */
export const onUp = (s: DragState): DragState => ({ ...s, dragging: false })
