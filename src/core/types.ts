/** One of the four screen corners the trigger can rest in. */
export type Corner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

/** A point in viewport coordinates (CSS pixels). */
export interface Point {
  readonly x: number
  readonly y: number
}

/** A 2D size in CSS pixels. */
export interface Size {
  readonly width: number
  readonly height: number
}

/** An axis-aligned rectangle; `x`/`y` are the top-left in viewport coordinates. */
export interface Rect extends Point, Size {}

/** The visible viewport extent in CSS pixels. */
export interface Viewport {
  readonly width: number
  readonly height: number
}
