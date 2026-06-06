/** Selector matching natively or explicitly focusable elements. */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]',
].join(',')

/** Whether an element is currently tabbable (focusable and not opted out). */
const isTabbable = (el: HTMLElement): boolean => {
  if (el.hasAttribute('disabled')) return false
  const tabindex = el.getAttribute('tabindex')
  return tabindex === null || Number(tabindex) >= 0
}

/** Whether an element is itself tabbable (matches the focusable selector and opted in). */
export const isFocusable = (el: HTMLElement): boolean => el.matches(FOCUSABLE) && isTabbable(el)

/**
 * Find the first tabbable descendant of `root` in DOM order.
 * @param root - Container to search.
 * @returns The first tabbable element, or `undefined` when none exists.
 */
export const firstFocusable = (root: ParentNode): HTMLElement | undefined => {
  const candidates = root.querySelectorAll<HTMLElement>(FOCUSABLE)
  for (const el of candidates) {
    if (isTabbable(el)) return el
  }
  return undefined
}

/**
 * Collect every tabbable element among a list of roots in DOM order, checking
 * each root itself before its descendants. Used to drive keyboard navigation
 * through slotted (light-DOM) menu content.
 * @param roots - Candidate root elements (e.g. a slot's assigned elements).
 * @returns Tabbable elements in order (possibly empty).
 */
export const focusablesAmong = (roots: readonly Element[]): readonly HTMLElement[] => {
  const found: HTMLElement[] = []
  for (const root of roots) {
    if (root instanceof HTMLElement && isFocusable(root)) found.push(root)
    for (const el of root.querySelectorAll<HTMLElement>(FOCUSABLE)) {
      if (isTabbable(el)) found.push(el)
    }
  }
  return found
}

/**
 * Find the first tabbable element among a list of roots.
 * @param roots - Candidate root elements (e.g. a slot's assigned elements).
 * @returns The first tabbable element, or `undefined` when none exists.
 */
export const firstFocusableAmong = (
  roots: readonly Element[]
): HTMLElement | undefined => focusablesAmong(roots)[0]
