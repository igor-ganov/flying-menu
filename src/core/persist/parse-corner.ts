import { filterToOption } from '../../fp/option/filter-to-option'
import type { Option } from '../../fp/option/option'
import type { Corner } from '../types'

/** Exhaustive corner lookup; adding a {@link Corner} forces an entry here. */
const CORNER_VALUES: Record<Corner, true> = {
  'top-left': true,
  'top-right': true,
  'bottom-left': true,
  'bottom-right': true,
}

/** Refinement: a defined string that names a {@link Corner}. */
const isCornerValue = (raw: string | undefined): raw is Corner =>
  raw !== undefined && raw in CORNER_VALUES

/**
 * Narrow an arbitrary string to a {@link Corner} as an {@link Option}.
 *
 * @param raw - Candidate value.
 * @returns `Some(corner)` when valid, otherwise `None`.
 */
export const parseCorner = (raw: string | undefined): Option<Corner> =>
  filterToOption(isCornerValue)(raw)
