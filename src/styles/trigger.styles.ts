import { css } from 'lit'

// `width/height: max-content` keep the box at its true content size regardless of
// position, so geometry never collapses via shrink-to-fit near a viewport edge.
export const triggerStyles = css`
  [part='trigger'] {
    position: fixed;
    width: max-content;
    height: max-content;
    z-index: var(--flying-menu-z-trigger, 1000);
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    transition: left var(--flying-menu-transition, 200ms ease),
      top var(--flying-menu-transition, 200ms ease);
  }

  [part='trigger'][data-dragging] {
    transition: none;
    cursor: grabbing;
  }
`
