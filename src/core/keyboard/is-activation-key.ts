/** Keys that activate a button. */
const ACTIVATION_KEYS: Record<string, true> = {
  Enter: true,
  ' ': true,
  Spacebar: true,
}

/**
 * Whether a key event should toggle the trigger (Enter or Space).
 *
 * @param key - `KeyboardEvent.key`.
 * @returns `true` for an activation key.
 */
export const isActivationKey = (key: string): boolean => key in ACTIVATION_KEYS
