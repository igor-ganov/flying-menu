import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { firstFocusableAmong, isFocusable } from './a11y/focus'
import {
  DEFAULT_DRAG_THRESHOLD,
  DEFAULT_GAP,
  DEFAULT_MARGIN,
  DEFAULT_STORAGE_KEY,
} from './core/constants'
import { cornerPosition } from './core/corner-position'
import {
  idle,
  onDown,
  onMove,
  onUp,
  wasTap,
  type DragState,
} from './core/drag-machine'
import { menuPosition } from './core/menu-position'
import {
  loadCorner,
  localStoragePort,
  saveCorner,
  type StoragePort,
} from './core/persist-corner'
import { snapToCorner } from './core/snap-to-corner'
import type { Corner, Point, Rect, Size, Viewport } from './core/types'
import { styles } from './flying-menu.styles'
import {
  EVENT_CORNER,
  EVENT_TOGGLE,
  MENU_ID,
  PART_MENU,
  PART_TRIGGER,
  TAG_NAME,
} from './test-ids'

const viewport = (): Viewport => ({
  width: globalThis.innerWidth,
  height: globalThis.innerHeight,
})

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
    if (!this._cornerInitialized && !this.noPersist) {
      this.corner = loadCorner(this._storage, this.storageKey)
    }
    this._cornerInitialized = true
    // The trigger is always on screen, so it must re-anchor on every viewport change,
    // open or not — otherwise it drifts from its corner on resize.
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
      <div id=${MENU_ID} part=${PART_MENU} ?data-open=${this.open}>
        <slot name="menu"></slot>
      </div>
    `
  }

  protected override firstUpdated(): void {
    this._positionTrigger()
    this._applyAria()
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has('corner') || changed.has('margin')) {
      this._positionTrigger()
      if (changed.has('corner')) this._onCornerChanged()
    }
    if (changed.has('open')) this._onOpenChanged()
  }

  // — positioning —

  private _positionTrigger(point?: Point): void {
    const el = this._triggerEl
    if (!el) return
    const pos =
      point ??
      cornerPosition(this.corner, toSize(el.getBoundingClientRect()), this.margin, viewport())
    el.style.left = `${pos.x}px`
    el.style.top = `${pos.y}px`
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
    if (!menuEl || !triggerEl) return
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
  }

  // — pointer drag —

  private readonly _onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) return
    const el = this._triggerEl
    const rect = el.getBoundingClientRect()
    this._drag = onDown(this._drag, {
      pointer: { x: e.clientX, y: e.clientY },
      origin: { x: rect.x, y: rect.y },
    })
    this._dragging = true
    el.setPointerCapture(e.pointerId)
  }

  private readonly _onPointerMove = (e: PointerEvent): void => {
    if (!this._drag.dragging) return
    this._drag = onMove(this._drag, {
      pointer: { x: e.clientX, y: e.clientY },
      threshold: this.dragThreshold,
    })
    this._positionTrigger(this._drag.current)
  }

  private readonly _onPointerUp = (e: PointerEvent): void => {
    if (!this._drag.dragging) return
    const finished = onUp(this._drag)
    this._drag = finished
    this._dragging = false
    if (this._triggerEl.hasPointerCapture(e.pointerId)) {
      this._triggerEl.releasePointerCapture(e.pointerId)
    }
    if (wasTap(finished)) {
      this._positionTrigger() // undo any sub-threshold offset — snap back to the corner
      this.toggle()
      return
    }
    const next = snapToCorner({ x: e.clientX, y: e.clientY }, viewport())
    if (next === this.corner) {
      this._positionTrigger() // same corner: re-anchor immediately (no reactive change to drive it)
    } else {
      this.corner = next // a corner change re-anchors via updated()
    }
  }

  private readonly _onTriggerKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault()
      this.toggle()
    }
  }

  // — open/close —

  private _setOpen(next: boolean): void {
    if (next === this.open) return
    const allowed = this.dispatchEvent(
      new CustomEvent(EVENT_TOGGLE, {
        detail: { open: next },
        bubbles: true,
        composed: true,
        cancelable: true,
      })
    )
    if (!allowed) return
    this.open = next
  }

  private _onOpenChanged(): void {
    this._applyAria()
    if (this.open) this._internals.states.add('open')
    else this._internals.states.delete('open')
    if (this.open) {
      this._positionMenu()
      this._addGlobalListeners()
      this._focusMenu()
    } else {
      this._removeGlobalListeners()
      if (this._restoreFocusOnClose) {
        this._restoreFocusOnClose = false
        this._focusTrigger()
      }
    }
  }

  private _onCornerChanged(): void {
    if (this.open) this._positionMenu()
    this.dispatchEvent(
      new CustomEvent(EVENT_CORNER, {
        detail: { corner: this.corner },
        bubbles: true,
        composed: true,
      })
    )
    if (!this.noPersist) saveCorner(this._storage, this.storageKey, this.corner)
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
    return first instanceof HTMLElement ? first : undefined
  }

  /**
   * Place the menu's ARIA contract on the slotted trigger when it is itself a
   * control; otherwise promote the wrapper to a button. Keeps `aria-expanded`
   * in sync with open state. Avoids redundant ARIA on a roleless wrapper (AC-6.1).
   */
  private _applyAria(): void {
    const slotted = this._slottedTrigger()
    const onSlotted = slotted !== undefined && isFocusable(slotted)
    const target = onSlotted ? slotted : this._triggerEl
    if (!target) return

    if (!onSlotted) {
      target.setAttribute('role', 'button')
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '0')
      this._clearAria(slotted)
    } else {
      this._clearAria(this._triggerEl)
    }

    target.setAttribute('aria-haspopup', 'menu')
    target.setAttribute('aria-controls', MENU_ID)
    target.setAttribute('aria-expanded', String(this.open))
  }

  private _clearAria(el: Element | undefined): void {
    if (!el) return
    for (const attr of ['aria-haspopup', 'aria-controls', 'aria-expanded', 'role']) {
      el.removeAttribute(attr)
    }
  }

  private _focusTrigger(): void {
    ;(this._slottedTrigger() ?? this._triggerEl)?.focus()
  }

  private _focusMenu(): void {
    const menuEl = this._menuEl
    if (!menuEl) return
    const target = firstFocusableAmong(this._assignedElements('menu')) ?? menuEl
    if (target === menuEl && !menuEl.hasAttribute('tabindex')) {
      menuEl.tabIndex = -1
    }
    target.focus()
  }

  // — global listeners (only while open) —

  private readonly _onDocPointerDown = (e: Event): void => {
    if (!e.composedPath().includes(this)) this.closeMenu()
  }

  private readonly _onDocKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'Escape') {
      this._restoreFocusOnClose = true
      this.closeMenu()
    }
  }

  private readonly _onResize = (): void => {
    this._positionTrigger()
    if (this.open) this._positionMenu()
  }

  // Dismissal listeners are open-only; the resize listener is always-on (see connectedCallback).
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
