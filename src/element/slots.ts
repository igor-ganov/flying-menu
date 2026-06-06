import type { FlyingMenu } from '../flying-menu'

/** Elements assigned to a named slot, flattened. */
export const assignedElements = (
  host: FlyingMenu,
  slotName: string
): readonly Element[] => {
  const slot = host.renderRoot.querySelector<HTMLSlotElement>(
    `slot[name="${slotName}"]`
  )
  return slot?.assignedElements({ flatten: true }) ?? []
}

/** The slotted trigger element, when one is assigned. */
export const slottedTrigger = (host: FlyingMenu): HTMLElement | undefined => {
  const [first] = assignedElements(host, 'trigger')
  return [first].filter((el): el is HTMLElement => el instanceof HTMLElement)[0]
}
