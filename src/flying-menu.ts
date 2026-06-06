import { LitElement, type PropertyValues } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import {
  DEFAULT_DRAG_THRESHOLD,
  DEFAULT_GAP,
  DEFAULT_MARGIN,
  DEFAULT_STORAGE_KEY,
} from './core/constants'
import type { Corner } from './core/types'
import { createController, type Controller } from './element/controller'
import {
  connect,
  disconnect,
  firstUpdated as onFirstUpdated,
  onUpdated,
} from './element/lifecycle'
import { setOpen } from './element/open'
import { template } from './element/template'
import { styles } from './styles'
import { TAG_NAME } from './test-ids'

/**
 * Headless, draggable, corner-snapping flying menu. Thin framework boundary: it
 * holds reactive state and delegates all behaviour to `./element/*` functions.
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
  @property({ type: Boolean, reflect: true }) public open = false

  /** Resting corner of the trigger. */
  @property({ type: String, reflect: true }) public corner: Corner = 'bottom-right'

  /** Edge inset in pixels. */
  @property({ type: Number }) public margin = DEFAULT_MARGIN

  /** Gap between trigger and menu in pixels. */
  @property({ type: Number }) public gap = DEFAULT_GAP

  /** Tap-vs-drag threshold in pixels (Manhattan). */
  @property({ type: Number, attribute: 'drag-threshold' })
  public dragThreshold = DEFAULT_DRAG_THRESHOLD

  /** `localStorage` key used to persist the corner. */
  @property({ type: String, attribute: 'storage-key' })
  public storageKey = DEFAULT_STORAGE_KEY

  /** Disable persistence entirely. */
  @property({ type: Boolean, attribute: 'no-persist' }) public noPersist = false

  @state() public _dragging = false
  @query('[part="trigger"]') public _triggerEl!: HTMLElement
  @query('[part="menu"]') public _menuEl!: HTMLElement
  public readonly _ctl: Controller = createController(this)

  public override connectedCallback(): void {
    super.connectedCallback()
    connect(this)
  }

  public override disconnectedCallback(): void {
    super.disconnectedCallback()
    disconnect(this)
  }

  /** Open the menu. */
  public openMenu(): void {
    setOpen(this, true)
  }

  /** Close the menu. */
  public closeMenu(): void {
    setOpen(this, false)
  }

  /** Toggle the menu. */
  public toggle(): void {
    setOpen(this, !this.open)
  }

  protected override render() {
    return template(this)
  }

  protected override firstUpdated(): void {
    onFirstUpdated(this)
  }

  protected override updated(changed: PropertyValues<this>): void {
    onUpdated(this, changed)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [TAG_NAME]: FlyingMenu
  }
}
