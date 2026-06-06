import type { Size, Viewport } from '../core/types'

/**
 * The visible viewport from the document element's client box, which excludes the
 * scrollbar gutter — so a corner inset is symmetric and never tucks under a
 * vertical scrollbar (`innerWidth` includes the scrollbar width).
 */
export const viewport = (): Viewport => {
  const doc = globalThis.document?.documentElement
  return {
    width: doc?.clientWidth || globalThis.innerWidth,
    height: doc?.clientHeight || globalThis.innerHeight,
  }
}

/** A measured rect reduced to its size. */
export const toSize = (rect: DOMRect): Size => ({
  width: rect.width,
  height: rect.height,
})
