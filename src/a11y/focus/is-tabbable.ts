/** Whether a `tabindex` attribute value keeps the element in the tab order. */
const tabindexOk = (tabindex: string | null): boolean =>
  tabindex === null || Number(tabindex) >= 0

/**
 * Whether an element is currently tabbable (focusable and not opted out).
 *
 * @param el - Element to test.
 * @returns `true` when enabled and not removed from the tab order.
 */
export const isTabbable = (el: HTMLElement): boolean =>
  !el.hasAttribute('disabled') && tabindexOk(el.getAttribute('tabindex'))
