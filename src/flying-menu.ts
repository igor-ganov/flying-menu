import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { firstFocusableAmong, focusablesAmong, isFocusable } from './a11y/focus'
import {
  DEFAULT_DRAG_THRESHOLD,
  DEFAULT_GAP,
  DEFAULT_MARGIN,
  DEFAULT_STORAGE_KEY,
} from './core/constants'
import { cornerPosition } from './core/corner-position'
import { idle, onDown, onMove, onUp, wasTap, type DragState } from './core/drag'
import { indexOfActive } from './core/focus-cycle/index-of-active'
import { nextIndex } from './core/focus-cycle/next-index'
import { tabStep } from './core/focus-cycle/tab-step'
import { isActivationKey } from './core/keyboard/is-activation-key'
import { menuPosition } from './core/menu-position'
import { loadCorner, localStoragePort, saveCorner, type StoragePort } from './core/persist'
import { snapToCorner } from './core/snap-to-corner'
import type { Corner, Point, Rect, Size, Viewport } from './core/types'
import { branch } from './fp/branch'
import { when } from './fp/when'
import { styles } from './styles'
import {
  EVENT_CORNER,
  EVENT_TOGGLE,
  MENU_ID,
  PART_MENU,
  PART_TRIGGER,
  TAG_NAME,
} from './test-ids'

// Use the document element's client box, which excludes the scrollbar gutter, so a
// corner inset is symmetric and never tucks under a vertical scrollbar.
const viewport = (): Viewport => {
  const doc = globalThis.document?.documentElement
  return {
    width: doc?.clientWidth || globalThis.innerWidth,
    height: doc?.clientHeight || globalThis.innerHeight,
  }
}

const toSize = (rect: DOMRect): Size => ({ width: rect.width, height: rect.height })

/**
 * Headless, draggable, corner-snapping flying menu.
 *
 * Slots:
 * - `trigger` — the activator the user drags and taps.
 * - `menu` — popup content shown while open.
 *
 * @fires flying-menu-toggle - `{ open: boolean }`, cancelable.
 * @fires flying-menu-corner - `{ corner: Corner }`.
 * @csspart trigger - The fixed-positioned trigger wrapper.
 * @csspart menu - The fixed-positioned menu wrapper.
 */
@customElement(TAG_NAME)
export class FlyingMenu extends LitElement {
  public static override readonly styles = styles

  /** Whether the menu is open. */
  @property({ type: Boolean, reflect: true })
  public open = false

  /** Resting corner of the trigger. */
  @property({ type: String, reflect: true })
  public corner: Corner = 'bottom-right'

  /** Edge inset in pixels. */
  @property({ type: Number })
  public margin = DEFAULT_MARGIN

  /** Gap between trigger and menu in pixels. */
  @property({ type: Number })
  public gap = DEFAULT_GAP

  /** Tap-vs-drag threshold in pixels (Manhattan). */
  @property({ type: Number, attribute: 'drag-threshold' })
  public dragThreshold = DEFAULT_DRAG_THRESHOLD

  /** `localStorage` key used to persist the corner. */
  @property({ type: String, attribute: 'storage-key' })
  public storageKey = DEFAULT_STORAGE_KEY

  /** Disable persistence entirely. */
  @property({ type: Boolean, attribute: 'no-persist' })
  public noPersist = false

  @state() private _dragging = false

  @query('[part="trigger"]') private _triggerEl!: HTMLElement
  @query('[part="menu"]') private _menuEl!: HTMLElement

  private readonly _internals = this.attachInternals()
  private _drag: DragState = idle
  private readonly _storage: StoragePort = localStoragePort()
  private _cornerInitialized = false
  private _restoreFocusOnClose = false

  public override connectedCallback(): void {
    super.connectedCallback()
    when(!this._cornerInitialized && !this.noPersist, () => {
      this.corner = loadCorner(this._storage, this.storageKey)
    })
    this._cornerInitialized = true
    // The trigger is always on screen, so it must re-anchor on every viewport change.
    globalThis.addEventListener('resize', this._onResize)
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback()
    globalThis.removeEventListener('resize', this._onResize)
    this._removeGlobalListeners()
  }

  /** Open the menu. */
  public openMenu(): void {
    this._setOpen(true)
  }

  /** Close the menu. */
  public closeMenu(): void {
    this._setOpen(false)
  }

  /** Toggle the menu. */
  public toggle(): void {
    this._setOpen(!this.open)
  }

  protected override render() {
    return html`
      <div
        part=${PART_TRIGGER}
        ?data-dragging=${this._dragging}
        @pointerdown=${this._onPointerDown}
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @keydown=${this._onTriggerKeydown}
      >
        <slot name="trigger" @slotchange=${this._onTriggerSlotChange}></slot>
      </div>
      <div
        id=${MENU_ID}
        part=${PART_MENU}
        ?data-open=${this.open}
        @keydown=${this._onMenuKeydown}
      >
        <slot name="menu"></slot>
      </div>
    `
  }

  protected override firstUpdated(): void {
    this._positionTrigger()
    this._applyAria()
  }

  protected override updated(changed: PropertyValues<this>): void {
    when(changed.has('corner') || changed.has('margin'), () => {
      this._positionTrigger()
      when(changed.has('corner'), () => this._onCornerChanged())
    })
    when(changed.has('open'), () => this._onOpenChanged())
  }

  // — positioning —

  private _positionTrigger(point?: Point): void {
    const el = this._triggerEl
    when(el != null, () => {
      const pos =
        point ??
        cornerPosition(this.corner, toSize(el.getBoundingClientRect()), this.margin, viewport())
      el.style.left = `${pos.x}px`
      el.style.top = `${pos.y}px`
    })
  }

  /** The trigger's logical resting rect: measured size at its corner anchor. */
  private _triggerAnchorRect(vp: Viewport): Rect {
    const size = toSize(this._triggerEl.getBoundingClientRect())
    const at = cornerPosition(this.corner, size, this.margin, vp)
    return { x: at.x, y: at.y, width: size.width, height: size.height }
  }

  private _positionMenu(): void {
    const menuEl = this._menuEl
    const triggerEl = this._triggerEl
    when(menuEl != null && triggerEl != null, () => {
      const vp = viewport()
      // Anchor to the trigger's resting position, not its live (possibly mid-transition)
      // box, so the menu never anchors to where the trigger is animating away from.
      const pos = menuPosition({
        corner: this.corner,
        triggerRect: this._triggerAnchorRect(vp),
        menuSize: toSize(menuEl.getBoundingClientRect()),
        gap: this.gap,
        margin: this.margin,
        vp,
      })
      menuEl.style.left = `${pos.x}px`
      menuEl.style.top = `${pos.y}px`
    })
  }

  // — pointer drag —

  private readonly _onPointerDown = (e: PointerEvent): void => {
    when(e.button === 0, () => {
      const el = this._triggerEl
      const rect = el.getBoundingClientRect()
      this._drag = onDown(this._drag, {
        pointer: { x: e.clientX, y: e.clientY },
        origin: { x: rect.x, y: rect.y },
      })
      this._dragging = true
      el.setPointerCapture(e.pointerId)
    })
  }

  private readonly _onPointerMove = (e: PointerEvent): void => {
    when(this._drag.dragging, () => {
      this._drag = onMove(this._drag, {
        pointer: { x: e.clientX, y: e.clientY },
        threshold: this.dragThreshold,
      })
      this._positionTrigger(this._drag.current)
    })
  }

  private readonly _onPointerUp = (e: PointerEvent): void => {
    when(this._drag.dragging, () => this._finishDrag(e))
  }

  private _finishDrag(e: PointerEvent): void {
    const finished = onUp(this._drag)
    this._drag = finished
    this._dragging = false
    when(this._triggerEl.hasPointerCapture(e.pointerId), () =>
      this._triggerEl.releasePointerCapture(e.pointerId)
    )
    branch(
      wasTap(finished),
      () => {
        this._positionTrigger() // undo any sub-threshold offset — snap back to the corner
        this.toggle()
      },
      () => this._settleCorner(snapToCorner({ x: e.clientX, y: e.clientY }, viewport()))
    )
  }

  private _settleCorner(next: Corner): void {
    branch(
      next === this.corner,
      () => this._positionTrigger(), // same corner: re-anchor immediately
      () => {
        this.corner = next // a corner change re-anchors via updated()
      }
    )
  }

  private readonly _onTriggerKeydown = (e: KeyboardEvent): void => {
    when(isActivationKey(e.key), () => {
      e.preventDefault()
      this.toggle()
    })
  }

  // — open/close —

  private _setOpen(next: boolean): void {
    when(next !== this.open, () => {
      const allowed = this.dispatchEvent(
        new CustomEvent(EVENT_TOGGLE, {
          detail: { open: next },
          bubbles: true,
          composed: true,
          cancelable: true,
        })
      )
      when(allowed, () => {
        this.open = next
      })
    })
  }

  private _onOpenChanged(): void {
    this._applyAria()
    branch(
      this.open,
      () => this._internals.states.add('open'),
      () => this._internals.states.delete('open')
    )
    branch(
      this.open,
      () => {
        this._positionMenu()
        this._addGlobalListeners()
        this._focusMenu()
      },
      () => this._onClosed()
    )
  }

  private _onClosed(): void {
    this._removeGlobalListeners()
    when(this._restoreFocusOnClose, () => {
      this._restoreFocusOnClose = false
      this._focusTrigger()
    })
  }

  private _onCornerChanged(): void {
    when(this.open, () => this._positionMenu())
    this.dispatchEvent(
      new CustomEvent(EVENT_CORNER, {
        detail: { corner: this.corner },
        bubbles: true,
        composed: true,
      })
    )
    when(!this.noPersist, () => saveCorner(this._storage, this.storageKey, this.corner))
  }

  // — accessibility —

  private _onTriggerSlotChange = (): void => {
    this._positionTrigger()
    this._applyAria()
  }

  private _assignedElements(slotName: string): readonly Element[] {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>(`slot[name="${slotName}"]`)
    return slot?.assignedElements({ flatten: true }) ?? []
  }

  private _slottedTrigger(): HTMLElement | undefined {
    const [first] = this._assignedElements('trigger')
    return [first].filter((el): el is HTMLElement => el instanceof HTMLElement)[0]
  }

  /**
   * Place the menu's ARIA contract on the slotted trigger when it is itself a
   * control; otherwise promote the wrapper to a button. Avoids redundant ARIA on
   * a roleless wrapper (AC-6.1).
   */
  private _applyAria(): void {
    const slotted = this._slottedTrigger()
    branch(
      slotted !== undefined && isFocusable(slotted),
      () => {
        this._clearAria(this._triggerEl)
        this._setMenuAria(slotted)
      },
      () => {
        this._promoteWrapper()
        this._clearAria(slotted)
        this._setMenuAria(this._triggerEl)
      }
    )
  }

  private _promoteWrapper(): void {
    const el = this._triggerEl
    el.setAttribute('role', 'button')
    when(!el.hasAttribute('tabindex'), () => el.setAttribute('tabindex', '0'))
  }

  private _setMenuAria(el: HTMLElement | undefined): void {
    el?.setAttribute('aria-haspopup', 'menu')
    el?.setAttribute('aria-controls', MENU_ID)
    el?.setAttribute('aria-expanded', String(this.open))
  }

  private _clearAria(el: Element | undefined): void {
    for (const attr of ['aria-haspopup', 'aria-controls', 'aria-expanded', 'role']) {
      el?.removeAttribute(attr)
    }
  }

  private _focusTrigger(): void {
    ;(this._slottedTrigger() ?? this._triggerEl)?.focus()
  }

  private _focusMenu(): void {
    const menuEl = this._menuEl
    when(menuEl != null, () => {
      const target = firstFocusableAmong(this._assignedElements('menu')) ?? menuEl
      when(target === menuEl && !menuEl.hasAttribute('tabindex'), () => {
        menuEl.tabIndex = -1
      })
      target.focus()
    })
  }

  /**
   * Keep Tab focus cycling through the menu's focusables while open. Browsers
   * (notably WebKit) do not reliably continue native sequential focus through
   * slotted shadow content, so the menu manages it — a focus trap exited via Escape.
   */
  private readonly _onMenuKeydown = (e: KeyboardEvent): void => {
    when(e.key === 'Tab', () => this._cycleFocus(e))
  }

  private _cycleFocus(e: KeyboardEvent): void {
    const items = focusablesAmong(this._assignedElements('menu'))
    when(items.length > 0, () => {
      e.preventDefault()
      const current = indexOfActive(items, this._deepActiveElement())
      items[nextIndex(current, tabStep(e.shiftKey), items.length)]?.focus()
    })
  }

  private _deepActiveElement(): Element | undefined {
    let active = globalThis.document?.activeElement ?? undefined
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    return active ?? undefined
  }

  // — global listeners (only while open) —

  private readonly _onDocPointerDown = (e: Event): void => {
    when(!e.composedPath().includes(this), () => this.closeMenu())
  }

  private readonly _onDocKeydown = (e: KeyboardEvent): void => {
    when(e.key === 'Escape', () => {
      this._restoreFocusOnClose = true
      this.closeMenu()
    })
  }

  private readonly _onResize = (): void => {
    this._positionTrigger()
    when(this.open, () => this._positionMenu())
  }

  // Dismissal listeners are open-only; the resize listener is always-on (connectedCallback).
  private _addGlobalListeners(): void {
    globalThis.addEventListener('pointerdown', this._onDocPointerDown, true)
    globalThis.addEventListener('keydown', this._onDocKeydown)
  }

  private _removeGlobalListeners(): void {
    globalThis.removeEventListener('pointerdown', this._onDocPointerDown, true)
    globalThis.removeEventListener('keydown', this._onDocKeydown)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: FlyingMenu
  }
}
