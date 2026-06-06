import { css } from 'lit'

// Menu motion is the "pop-in" only — position never transitions, so the menu never
// slides from a previous corner. Overridable via ::part(menu) + --flying-menu-transition.
export const menuStyles = css`
  [part='menu'] {
    position: fixed;
    width: max-content;
    height: max-content;
    z-index: var(--flying-menu-z-menu, 999);
    display: none;
    opacity: 0;
    transform: translateY(8px);
    pointer-events: none;
    transition: opacity var(--flying-menu-transition, 200ms ease),
      transform var(--flying-menu-transition, 200ms ease),
      overlay var(--flying-menu-transition, 200ms ease) allow-discrete,
      display var(--flying-menu-transition, 200ms ease) allow-discrete;
  }

  [part='menu'][data-open] {
    display: block;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  @starting-style {
    [part='menu'][data-open] {
      opacity: 0;
      transform: translateY(8px);
    }
  }
`
