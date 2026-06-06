import { html } from 'lit'
import type { FlyingMenu } from '../flying-menu'
import { applyAria } from './aria'
import { menuKeydown, triggerKeydown } from './keyboard'
import { pointerDown, pointerMove, pointerUp } from './pointer'
import { positionTrigger } from './position'
import { MENU_ID, PART_MENU, PART_TRIGGER } from '../test-ids'

const onSlotChange = (host: FlyingMenu): void => {
  positionTrigger(host)
  applyAria(host)
}

/** The shadow render: a fixed trigger wrapper and a fixed menu wrapper. */
export const template = (host: FlyingMenu) => html`
  <div
    part=${PART_TRIGGER}
    ?data-dragging=${host._dragging}
    @pointerdown=${(e: PointerEvent) => pointerDown(host, e)}
    @pointermove=${(e: PointerEvent) => pointerMove(host, e)}
    @pointerup=${(e: PointerEvent) => pointerUp(host, e)}
    @keydown=${(e: KeyboardEvent) => triggerKeydown(host, e)}
  >
    <slot name="trigger" @slotchange=${() => onSlotChange(host)}></slot>
  </div>
  <div
    id=${MENU_ID}
    part=${PART_MENU}
    ?data-open=${host.open}
    @keydown=${(e: KeyboardEvent) => menuKeydown(host, e)}
  >
    <slot name="menu"></slot>
  </div>
`
