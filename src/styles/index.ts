import type { CSSResultArray } from 'lit'
import { hostStyles } from './host.styles'
import { menuStyles } from './menu.styles'
import { reducedMotionStyles } from './reduced-motion.styles'
import { triggerStyles } from './trigger.styles'

/**
 * Headless styling: only positioning, layering, visibility and motion — no
 * colours, borders, radii or sizes. Composed from per-concern fragments.
 */
export const styles: CSSResultArray = [
  hostStyles,
  triggerStyles,
  menuStyles,
  reducedMotionStyles,
]
